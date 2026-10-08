import os
import joblib
import numpy as np
import pandas as pd
import lightgbm as lgb
from typing import Dict, Any, Optional

from backend.app.preprocessing.pipeline import get_saved_splits
from backend.app.models.evaluation import evaluate_model_on_test_set

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "models")
LIGHTGBM_MODEL_PATH = os.path.join(MODELS_DIR, "lightgbm_model.joblib")
LIGHTGBM_EVAL_PATH = os.path.join(MODELS_DIR, "lightgbm_eval.joblib")

def train_lightgbm_model(
    n_estimators: int = 100,
    max_depth: int = 5,
    learning_rate: float = 0.1,
    num_leaves: int = 31,
    tune_hyperparameters: bool = False
) -> Dict[str, Any]:
    """
    Trains a LightGBM classifier for credit risk classification:
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
        "num_leaves": num_leaves,
        "random_state": 42,
        "verbose": -1
    }

    if tune_hyperparameters:
        candidates = [
            {"n_estimators": 50, "max_depth": 3, "num_leaves": 15, "learning_rate": 0.05},
            {"n_estimators": 100, "max_depth": 4, "num_leaves": 25, "learning_rate": 0.08},
            {"n_estimators": 120, "max_depth": 5, "num_leaves": 31, "learning_rate": 0.1},
            {"n_estimators": 80, "max_depth": 6, "num_leaves": 40, "learning_rate": 0.05},
        ]
        best_val_score = -1.0
        for cand in candidates:
            cand_model = lgb.LGBMClassifier(
                **cand,
                random_state=42,
                verbose=-1
            )
            cand_model.fit(X_train, y_train)
            val_score = cand_model.score(X_val, y_val)
            if val_score > best_val_score:
                best_val_score = val_score
                best_params.update(cand)

    model = lgb.LGBMClassifier(
        n_estimators=best_params["n_estimators"],
        max_depth=best_params["max_depth"],
        learning_rate=best_params["learning_rate"],
        num_leaves=best_params["num_leaves"],
        random_state=42,
        verbose=-1
    )
    model.fit(X_train, y_train)

    val_accuracy = float(model.score(X_val, y_val))
    test_eval = evaluate_model_on_test_set(model, X_test, y_test, model_name="LightGBM")

    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(model, LIGHTGBM_MODEL_PATH)
    joblib.dump(test_eval, LIGHTGBM_EVAL_PATH)

    return {
        "status": "success",
        "model_name": "LightGBM",
        "message": "LightGBM classifier successfully trained and validated.",
        "best_params": best_params,
        "validation_accuracy": round(val_accuracy, 4),
        "test_metrics": test_eval
    }
