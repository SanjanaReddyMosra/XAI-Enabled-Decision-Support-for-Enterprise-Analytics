import os
import joblib
from typing import Dict, Any, List, Optional

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "models")
XGBOOST_MODEL_PATH = os.path.join(MODELS_DIR, "xgboost_model.joblib")
XGBOOST_EVAL_PATH = os.path.join(MODELS_DIR, "xgboost_eval.joblib")
LIGHTGBM_MODEL_PATH = os.path.join(MODELS_DIR, "lightgbm_model.joblib")
LIGHTGBM_EVAL_PATH = os.path.join(MODELS_DIR, "lightgbm_eval.joblib")

def get_available_models() -> List[str]:
    """Returns list of models that have been trained and persisted."""
    models = []
    if os.path.exists(XGBOOST_MODEL_PATH):
        models.append("xgboost")
    if os.path.exists(LIGHTGBM_MODEL_PATH):
        models.append("lightgbm")
    return models

def load_trained_model(model_name: str = "xgboost"):
    """Loads specified trained model from disk."""
    name = model_name.lower().strip()
    if name == "xgboost":
        if not os.path.exists(XGBOOST_MODEL_PATH):
            raise FileNotFoundError("XGBoost model has not been trained yet. Please train XGBoost first.")
        return joblib.load(XGBOOST_MODEL_PATH)
    elif name == "lightgbm":
        if not os.path.exists(LIGHTGBM_MODEL_PATH):
            raise FileNotFoundError("LightGBM model has not been trained yet. Please train LightGBM first.")
        return joblib.load(LIGHTGBM_MODEL_PATH)
    else:
        raise ValueError(f"Unknown model name '{model_name}'. Supported models: 'xgboost', 'lightgbm'")

def load_model_evaluation(model_name: str = "xgboost") -> Dict[str, Any]:
    """Loads held-out test evaluation results for specified model."""
    name = model_name.lower().strip()
    if name == "xgboost":
        if not os.path.exists(XGBOOST_EVAL_PATH):
            raise FileNotFoundError("XGBoost evaluation metrics not found. Train XGBoost first.")
        return joblib.load(XGBOOST_EVAL_PATH)
    elif name == "lightgbm":
        if not os.path.exists(LIGHTGBM_EVAL_PATH):
            raise FileNotFoundError("LightGBM evaluation metrics not found. Train LightGBM first.")
        return joblib.load(LIGHTGBM_EVAL_PATH)
    else:
        raise ValueError(f"Unknown model name '{model_name}'.")

def get_multi_model_comparison() -> Dict[str, Any]:
    """Returns comparative metrics between XGBoost and LightGBM if available."""
    comparison = []
    available = get_available_models()
    for m in available:
        eval_data = load_model_evaluation(m)
        comparison.append({
            "model_name": eval_data["model_name"],
            "accuracy": eval_data["accuracy"],
            "precision": eval_data["precision"],
            "recall": eval_data["recall"],
            "f1_score": eval_data["f1_score"],
            "roc_auc": eval_data["roc_auc"],
            "tp": eval_data["confusion_matrix"]["tp"],
            "tn": eval_data["confusion_matrix"]["tn"],
            "fp": eval_data["confusion_matrix"]["fp"],
            "fn": eval_data["confusion_matrix"]["fn"]
        })
    return {
        "available_models": available,
        "comparison": comparison
    }
