import os
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from typing import Dict, Any, Optional

from backend.app.preprocessing.pipeline import get_saved_splits
from backend.app.models.evaluation import evaluate_model_on_test_set

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ARTIFACTS_DIR = os.path.join(BACKEND_DIR, "artifacts")
if not os.path.exists(ARTIFACTS_DIR):
    ARTIFACTS_DIR = os.path.join(BACKEND_DIR, "backend", "artifacts")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "models")

# Primary path used by application inference code (xai_service.py)
XGBOOST_MODEL_PATH = os.path.join(ARTIFACTS_DIR, "xgboost_model.joblib")
XGBOOST_EVAL_PATH = os.path.join(MODELS_DIR, "xgboost_eval.joblib")


def train_xgboost_model(
    n_estimators: int = 100,
    max_depth: int = 5,
    learning_rate: float = 0.1,
    subsample: float = 0.8,
    tune_hyperparameters: bool = False
) -> Dict[str, Any]:
    """
    Trains an XGBoost classifier for credit risk classification:
    - Learns parameters on training data (70%)
    - Tunes / validates on validation data (15%)
    - Strictly evaluates final performance on test data (15%)
    """
    splits = get_saved_splits()
    X_train = splits["X_train_trans"]
    y_train = splits["y_train"]
    X_val = splits["X_val_trans"]
    y_val = splits["y_val"]
    X_test = splits["X_test_trans"]
    y_test = splits["y_test"]

    best_params = {
        "n_estimators": n_estimators,
        "max_depth": max_depth,
        "learning_rate": learning_rate,
        "subsample": subsample,
        "eval_metric": "logloss",
        "random_state": 42
    }

    if tune_hyperparameters:
        # Evaluate candidate parameter grids on validation data
        candidates = [
            {"n_estimators": 50, "max_depth": 3, "learning_rate": 0.05, "subsample": 0.8},
            {"n_estimators": 100, "max_depth": 4, "learning_rate": 0.1, "subsample": 0.8},
            {"n_estimators": 150, "max_depth": 5, "learning_rate": 0.08, "subsample": 0.9},
            {"n_estimators": 100, "max_depth": 6, "learning_rate": 0.05, "subsample": 0.85},
        ]
        best_val_score = -1.0
        for cand in candidates:
            cand_model = xgb.XGBClassifier(
                **cand,
                eval_metric="logloss",
                random_state=42
            )
            cand_model.fit(X_train, y_train)
            val_score = cand_model.score(X_val, y_val)
            if val_score > best_val_score:
                best_val_score = val_score
                best_params.update(cand)

    model = xgb.XGBClassifier(
        n_estimators=best_params["n_estimators"],
        max_depth=best_params["max_depth"],
        learning_rate=best_params["learning_rate"],
        subsample=best_params["subsample"],
        eval_metric="logloss",
        random_state=42
    )
    model.fit(X_train, y_train)

    val_accuracy = float(model.score(X_val, y_val))
    test_eval = evaluate_model_on_test_set(model, X_test, y_test, model_name="XGBoost")

    # Persist model to the path actually used by the application's inference code
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    joblib.dump(model, XGBOOST_MODEL_PATH)
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(test_eval, XGBOOST_EVAL_PATH)

    # Refresh in-memory inference artifact cache if loaded
    try:
        from backend.app.services.xai_service import _ARTIFACT_CACHE
        import shap
        _ARTIFACT_CACHE["model"] = model
        _ARTIFACT_CACHE["evaluation"] = test_eval
        _ARTIFACT_CACHE["explainer"] = shap.TreeExplainer(model)
    except Exception:
        pass


    return {
        "status": "success",
        "model_name": "XGBoost",
        "message": "XGBoost classifier successfully trained and validated.",
        "best_params": best_params,
        "validation_accuracy": round(val_accuracy, 4),
        "test_metrics": test_eval
    }
