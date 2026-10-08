import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve
)

def evaluate_model_on_test_set(
    model: Any, 
    X_test: pd.DataFrame, 
    y_test: pd.Series, 
    model_name: str
) -> Dict[str, Any]:
    """
    Evaluates a trained classifier strictly on the held-out test dataset.
    Target convention:
    1 = Good Credit Risk (Positive Class)
    0 = Bad Credit Risk (Negative Class)
    """
    y_pred = model.predict(X_test)
    
    # Predict probabilities for ROC-AUC
    if hasattr(model, "predict_proba"):
        y_proba = model.predict_proba(X_test)[:, 1]
    else:
        y_proba = y_pred

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    
    try:
        auc = float(roc_auc_score(y_test, y_proba))
    except Exception:
        auc = 0.5

    # Confusion matrix: TN, FP, FN, TP
    # In scikit-learn confusion_matrix(y_true, y_pred),
    # index 0 is negative (0 = Bad), index 1 is positive (1 = Good)
    cm = confusion_matrix(y_test, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()

    # ROC Curve
    try:
        fpr_arr, tpr_arr, thresh_arr = roc_curve(y_test, y_proba)
        step = max(1, len(fpr_arr) // 30)
        roc_points = [
            {
                "fpr": float(round(fpr_arr[i], 4)),
                "tpr": float(round(tpr_arr[i], 4)),
                "threshold": float(round(thresh_arr[i], 4)) if np.isfinite(thresh_arr[i]) else 1.0
            }
            for i in range(0, len(fpr_arr), step)
        ]
        if roc_points[-1]["fpr"] != 1.0 or roc_points[-1]["tpr"] != 1.0:
            roc_points.append({"fpr": 1.0, "tpr": 1.0, "threshold": 0.0})
    except Exception:
        roc_points = [{"fpr": 0.0, "tpr": 0.0, "threshold": 1.0}, {"fpr": 1.0, "tpr": 1.0, "threshold": 0.0}]

    # Precision-Recall Curve
    try:
        from sklearn.metrics import precision_recall_curve
        prec_arr, rec_arr, _ = precision_recall_curve(y_test, y_proba)
        pr_step = max(1, len(prec_arr) // 30)
        pr_points = [
            {
                "recall": float(round(rec_arr[i], 4)),
                "precision": float(round(prec_arr[i], 4))
            }
            for i in range(0, len(prec_arr), pr_step)
        ]
    except Exception:
        pr_points = []

    # German Credit Cost Evaluation:
    # 1 = Good Credit Risk, 0 = Bad Credit Risk
    # tn = Actual Bad, Predicted Bad -> Cost 0
    # tp = Actual Good, Predicted Good -> Cost 0
    # fn = Actual Good, Predicted Bad (Bank falsely rejects creditworthy applicant) -> Cost 1
    # fp = Actual Bad, Predicted Good (Bank extends credit to defaulting borrower) -> Cost 5
    cost_actual_good_pred_bad = 1
    cost_actual_bad_pred_good = 5
    total_cost = int(fp) * cost_actual_bad_pred_good + int(fn) * cost_actual_good_pred_bad
    cost_per_applicant = round(total_cost / max(1, len(y_test)), 3)

    return {
        "model_name": model_name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4),
        "total_cost": total_cost,
        "cost_per_applicant": cost_per_applicant,
        "cost_matrix": {
            "actual_good_pred_good": 0,
            "actual_good_pred_bad": cost_actual_good_pred_bad,
            "actual_bad_pred_good": cost_actual_bad_pred_good,
            "actual_bad_pred_bad": 0
        },
        "confusion_matrix": {
            "tp": int(tp),
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn)
        },
        "roc_curve": roc_points,
        "pr_curve": pr_points,
        "test_sample_count": len(y_test)
    }
