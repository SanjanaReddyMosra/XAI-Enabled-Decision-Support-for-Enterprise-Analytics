import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve, precision_recall_curve
)
from mapie.classification import SplitConformalClassifier
import shap
import dice_ml
from fairlearn.metrics import (
    MetricFrame, selection_rate, true_positive_rate, false_positive_rate,
    demographic_parity_difference, equalized_odds_difference
)

# Setup paths
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, PROJECT_ROOT)

DATA_PATH = os.path.join(PROJECT_ROOT, "data", "german_credit.csv")
RAW_DATA_PATH = os.path.join(PROJECT_ROOT, "..", "Dataset", "german.data")
ARTIFACTS_DIR = os.path.join(PROJECT_ROOT, "backend", "artifacts")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

print("=" * 60)
print("XAI DECISION SUPPORT SYSTEM: TRAINING & ARTIFACT PIPELINE")
print("=" * 60)

# 1. Load Dataset
if os.path.exists(DATA_PATH):
    print(f"Loading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
elif os.path.exists(RAW_DATA_PATH):
    print(f"Loading raw dataset from: {RAW_DATA_PATH}")
    col_names = [
        "checking_status", "duration", "credit_history", "purpose", "credit_amount",
        "savings_status", "employment", "installment_commitment", "personal_status",
        "other_parties", "residence_since", "property_magnitude", "age",
        "other_payment_plans", "housing", "existing_credits", "job",
        "num_dependents", "own_telephone", "foreign_worker", "class"
    ]
    df = pd.read_csv(RAW_DATA_PATH, sep=" ", header=None, names=col_names)
else:
    raise FileNotFoundError("German Credit dataset not found.")

print(f"Dataset shape: {df.shape}")

# 2. Target Normalization (0 = Bad Credit Risk, 1 = Good Credit Risk)
target_col = "class"
if set(df[target_col].unique()) == {1, 2}:
    # In original UCI format: 1 = Good, 2 = Bad
    df[target_col] = df[target_col].map({1: 1, 2: 0})
elif "good" in [str(x).lower() for x in df[target_col].unique()]:
    df[target_col] = df[target_col].astype(str).str.strip().str.lower().map({"good": 1, "bad": 0})
else:
    df[target_col] = df[target_col].astype(int)

print(f"Target distribution (1=Good, 0=Bad): {df[target_col].value_counts().to_dict()}")

# 3. Identify Numerical & Categorical Features
feature_cols = [c for c in df.columns if c != target_col]
numerical_cols = df[feature_cols].select_dtypes(include=["int64", "float64", "int32", "float32"]).columns.tolist()
categorical_cols = df[feature_cols].select_dtypes(include=["object", "category", "bool"]).columns.tolist()

print(f"Features: {len(feature_cols)} total ({len(numerical_cols)} numerical, {len(categorical_cols)} categorical)")

# 4. Strict Stratified 70% Train, 15% Validation, 15% Test Split (Random State: 42)
X = df.drop(columns=[target_col])
y = df[target_col]

X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.30, random_state=42, stratify=y
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
)

print(f"Splits: Train={len(X_train)} (70%), Val={len(X_val)} (15%), Test={len(X_test)} (15%)")

# 5. Build and Fit Preprocessing Pipeline (STRICTLY on Training Data Only)
import re
num_transformer = StandardScaler()
cat_transformer = OneHotEncoder(handle_unknown="ignore", sparse_output=False)

column_transformer = ColumnTransformer(
    transformers=[
        ("num", num_transformer, numerical_cols),
        ("cat", cat_transformer, categorical_cols),
    ],
    remainder="drop",
    verbose_feature_names_out=False
)

column_transformer.fit(X_train)
raw_feature_names = list(column_transformer.get_feature_names_out())
# Sanitize feature names for XGBoost / LightGBM compatibility
transformed_feature_names = [
    re.sub(r'[\[\]<>]', '_', name).replace('__', '_').strip('_') for name in raw_feature_names
]

def transform_df(ct, data_df, feature_names):
    arr = ct.transform(data_df)
    return pd.DataFrame(arr, columns=feature_names, index=data_df.index)

X_train_trans = transform_df(column_transformer, X_train, transformed_feature_names)
X_val_trans = transform_df(column_transformer, X_val, transformed_feature_names)
X_test_trans = transform_df(column_transformer, X_test, transformed_feature_names)

print(f"Transformed features: {len(transformed_feature_names)}")

# 6. Train XGBoost Model with Validation Evaluation
print("Training XGBoost Classifier...")
best_params = {
    "n_estimators": 100,
    "max_depth": 5,
    "learning_rate": 0.1,
    "subsample": 0.8,
    "eval_metric": "logloss",
    "random_state": 42
}

model = xgb.XGBClassifier(**best_params)
model.fit(X_train_trans, y_train)

val_accuracy = float(model.score(X_val_trans, y_val))
print(f"Validation Accuracy: {val_accuracy:.4f}")

# 7. MAPIE Conformal Uncertainty Calibration (on 15% Validation Set)
print("Calibrating MAPIE Split Conformal Classifier...")
mapie = SplitConformalClassifier(estimator=model, confidence_level=0.90, prefit=True)
mapie.conformalize(X_val_trans, y_val)

# Test empirical coverage on held-out test data
pt_preds, test_pss = mapie.predict_set(X_test_trans)
y_test_arr = y_test.values
covered_cnt = 0
set_sizes = []
for i in range(len(y_test_arr)):
    true_label = y_test_arr[i]
    is_cov = bool(test_pss[i, true_label, 0]) if test_pss.ndim == 3 else bool(test_pss[i, true_label])
    if is_cov:
        covered_cnt += 1
    s_size = int(np.sum(test_pss[i, :, 0])) if test_pss.ndim == 3 else int(np.sum(test_pss[i, :]))
    set_sizes.append(s_size)

emp_coverage = round(covered_cnt / len(y_test_arr), 4)
avg_set_size = round(float(np.mean(set_sizes)), 3)
print(f"MAPIE Empirical Test Coverage at 90%: {emp_coverage * 100:.1f}%, Avg Set Size: {avg_set_size}")

# 8. Evaluate on Unseen 15% Held-Out Test Set
print("Evaluating on Held-Out Test Set...")
y_test_pred = model.predict(X_test_trans)
y_test_proba = model.predict_proba(X_test_trans)[:, 1]

test_acc = float(accuracy_score(y_test, y_test_pred))
test_prec = float(precision_score(y_test, y_test_pred, zero_division=0))
test_rec = float(recall_score(y_test, y_test_pred, zero_division=0))
test_f1 = float(f1_score(y_test, y_test_pred, zero_division=0))
test_auc = float(roc_auc_score(y_test, y_test_proba))

# Confusion Matrix: tn, fp, fn, tp (0 = Bad, 1 = Good)
cm = confusion_matrix(y_test, y_test_pred, labels=[0, 1])
tn, fp, fn, tp = cm.ravel()

# German Credit Asymmetric Cost Matrix:
# Actual Bad predicted Good (fp) -> 5 DM cost
# Actual Good predicted Bad (fn) -> 1 DM cost
cost_actual_good_pred_bad = 1
cost_actual_bad_pred_good = 5
total_cost = int(fp) * cost_actual_bad_pred_good + int(fn) * cost_actual_good_pred_bad
cost_per_applicant = round(total_cost / len(y_test), 3)

# ROC & PR Curves
fpr_arr, tpr_arr, thresh_arr = roc_curve(y_test, y_test_proba)
step = max(1, len(fpr_arr) // 30)
roc_curve_points = [
    {"fpr": round(float(fpr_arr[i]), 4), "tpr": round(float(tpr_arr[i]), 4), "threshold": round(float(thresh_arr[i]), 4) if np.isfinite(thresh_arr[i]) else 1.0}
    for i in range(0, len(fpr_arr), step)
]
if roc_curve_points[-1]["fpr"] != 1.0:
    roc_curve_points.append({"fpr": 1.0, "tpr": 1.0, "threshold": 0.0})

prec_arr, rec_arr, _ = precision_recall_curve(y_test, y_test_proba)
pr_step = max(1, len(prec_arr) // 30)
pr_curve_points = [
    {"recall": round(float(rec_arr[i]), 4), "precision": round(float(prec_arr[i]), 4)}
    for i in range(0, len(prec_arr), pr_step)
]

evaluation_results = {
    "model_name": "XGBoost",
    "accuracy": round(test_acc, 4),
    "precision": round(test_prec, 4),
    "recall": round(test_rec, 4),
    "f1_score": round(test_f1, 4),
    "roc_auc": round(test_auc, 4),
    "total_cost": total_cost,
    "cost_per_applicant": cost_per_applicant,
    "confusion_matrix": {"tp": int(tp), "tn": int(tn), "fp": int(fp), "fn": int(fn)},
    "cost_matrix": {
        "actual_good_pred_good": 0,
        "actual_good_pred_bad": cost_actual_good_pred_bad,
        "actual_bad_pred_good": cost_actual_bad_pred_good,
        "actual_bad_pred_bad": 0
    },
    "roc_curve": roc_curve_points,
    "pr_curve": pr_curve_points,
    "test_sample_count": len(y_test)
}
print(f"Test Accuracy: {test_acc:.4f}, ROC-AUC: {test_auc:.4f}, Cost: {total_cost} DM")

# 9. Configure SHAP TreeExplainer & Global Feature Importance
print("Configuring SHAP TreeExplainer...")
explainer = shap.TreeExplainer(model)
sample_test_shap = explainer.shap_values(X_test_trans.head(50))
if isinstance(sample_test_shap, list):
    sample_test_shap = sample_test_shap[1]
mean_abs_shap = np.mean(np.abs(sample_test_shap), axis=0)
global_shap_items = [
    {"feature": feat.replace("_", " "), "mean_abs_shap": round(float(imp), 4)}
    for feat, imp in zip(transformed_feature_names, mean_abs_shap)
]
global_shap_items.sort(key=lambda x: x["mean_abs_shap"], reverse=True)

# 10. Configure DiCE Metadata
print("Configuring DiCE Data Interface...")
dice_metadata = {
    "continuous_features": numerical_cols,
    "categorical_features": categorical_cols,
    "outcome_name": "class",
    "feature_ranges": {
        col: {"min": float(df[col].min()), "max": float(df[col].max())}
        for col in numerical_cols
    },
    "categorical_levels": {
        col: [str(x) for x in df[col].unique()]
        for col in categorical_cols
    }
}

# 11. Fairlearn Fairness Audit on Test Data
print("Auditing Fairness across Demographic Groups...")
def get_group_fairness(sens_series, name):
    mf = MetricFrame(
        metrics={
            "accuracy": accuracy_score,
            "selection_rate": selection_rate,
            "precision": lambda yt, yp: float(precision_score(yt, yp, zero_division=0)),
            "recall": lambda yt, yp: float(recall_score(yt, yp, zero_division=0)),
            "tpr": lambda yt, yp: float(true_positive_rate(yt, yp)),
            "fpr": lambda yt, yp: float(false_positive_rate(yt, yp))
        },
        y_true=y_test,
        y_pred=y_test_pred,
        sensitive_features=sens_series
    )
    dp_diff = float(round(demographic_parity_difference(y_test, y_test_pred, sensitive_features=sens_series), 4))
    eq_diff = float(round(equalized_odds_difference(y_test, y_test_pred, sensitive_features=sens_series), 4))
    groups = []
    for grp, row in mf.by_group.iterrows():
        cnt = int((sens_series == grp).sum())
        groups.append({
            "group": str(grp),
            "sample_count": cnt,
            "selection_rate": round(float(row["selection_rate"]), 4),
            "accuracy": round(float(row["accuracy"]), 4),
            "precision": round(float(row["precision"]), 4),
            "recall": round(float(row["recall"]), 4),
            "tpr": round(float(row["tpr"]), 4),
            "fpr": round(float(row["fpr"]), 4)
        })
    return {
        "sensitive_attribute": name,
        "demographic_parity_difference": dp_diff,
        "equalized_odds_difference": eq_diff,
        "disparity_detected": bool(dp_diff > 0.10 or eq_diff > 0.10),
        "groups": groups
    }

fairness_personal_status = get_group_fairness(X_test["personal_status"].astype(str), "personal_status")
age_group_series = pd.cut(X_test["age"], bins=[0, 25, 100], labels=["Age <= 25", "Age > 25"]).astype(str)
fairness_age = get_group_fairness(age_group_series, "age_group")
fairness_foreign = get_group_fairness(X_test["foreign_worker"].astype(str), "foreign_worker")

fairness_reports = {
    "personal_status": fairness_personal_status,
    "age_group": fairness_age,
    "foreign_worker": fairness_foreign
}

# 12. Save All Artifacts to backend/artifacts/ and models/
print("Persisting trained artifacts...")

# XGBoost Model
joblib.dump(model, os.path.join(ARTIFACTS_DIR, "xgboost_model.joblib"))
joblib.dump(model, os.path.join(MODELS_DIR, "xgboost_model.joblib"))

# Preprocessing Pipeline
preprocessor_bundle = {
    "column_transformer": column_transformer,
    "numerical_cols": numerical_cols,
    "categorical_cols": categorical_cols,
    "feature_names_in": feature_cols,
    "transformed_feature_names": transformed_feature_names
}
joblib.dump(preprocessor_bundle, os.path.join(ARTIFACTS_DIR, "preprocessing_pipeline.joblib"))

# Feature Metadata
feature_metadata = {
    "numerical_columns": numerical_cols,
    "categorical_columns": categorical_cols,
    "original_features": feature_cols,
    "transformed_feature_names": transformed_feature_names,
    "target_column": target_col,
    "target_mapping": {"0": "Bad Credit Risk", "1": "Good Credit Risk"},
    "feature_ranges": dice_metadata["feature_ranges"],
    "categorical_levels": dice_metadata["categorical_levels"]
}
with open(os.path.join(ARTIFACTS_DIR, "feature_metadata.json"), "w") as f:
    json.dump(feature_metadata, f, indent=2)

# Model Metadata
model_metadata = {
    "model_name": "XGBoost Classifier",
    "algorithm": "XGBClassifier",
    "best_parameters": best_params,
    "random_state": 42,
    "training_samples": len(X_train),
    "validation_samples": len(X_val),
    "test_samples": len(X_test),
    "original_feature_count": len(feature_cols),
    "transformed_feature_count": len(transformed_feature_names),
    "validation_accuracy": val_accuracy,
    "global_shap_importance": global_shap_items[:15]
}
with open(os.path.join(ARTIFACTS_DIR, "model_metadata.json"), "w") as f:
    json.dump(model_metadata, f, indent=2)

# DiCE Model Data
with open(os.path.join(ARTIFACTS_DIR, "dice_model_data.json"), "w") as f:
    json.dump(dice_metadata, f, indent=2)

# MAPIE Model
joblib.dump(mapie, os.path.join(ARTIFACTS_DIR, "mapie_model.joblib"))

# Evaluation Results
with open(os.path.join(ARTIFACTS_DIR, "evaluation_results.json"), "w") as f:
    json.dump(evaluation_results, f, indent=2)

# Save Splits Bundle for persistent testing
splits_bundle = {
    "X_train_raw": X_train,
    "X_val_raw": X_val,
    "X_test_raw": X_test,
    "X_train_trans": X_train_trans,
    "X_val_trans": X_val_trans,
    "X_test_trans": X_test_trans,
    "y_train": y_train,
    "y_val": y_val,
    "y_test": y_test,
    "raw_df": df
}
joblib.dump(splits_bundle, os.path.join(ARTIFACTS_DIR, "splits_data.joblib"))
joblib.dump(splits_bundle, os.path.join(MODELS_DIR, "data_splits.joblib"))

# Save Fairness Reports
with open(os.path.join(ARTIFACTS_DIR, "fairness_reports.json"), "w") as f:
    json.dump(fairness_reports, f, indent=2)

print("=" * 60)
print("TRAINING & ARTIFACT PERSISTENCE COMPLETE!")
print(f"Artifacts saved in: {ARTIFACTS_DIR}")
print("=" * 60)
