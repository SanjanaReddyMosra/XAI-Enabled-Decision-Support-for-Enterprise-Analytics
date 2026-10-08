import os
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional

from backend.app.schemas.schemas import (
    HealthResponse,
    AnalyzeRequest,
    MasterAnalysisResponse,
    CustomerPredictionRequest,
    XGBoostTrainRequest
)
from backend.app.services.dataset_service import (
    get_dataset_overview,
    get_dataset_stats,
    get_data_quality_report,
    get_visualizations_data,
    get_sample_customers
)
from backend.app.services.xai_service import (
    execute_master_analysis,
    predict_single_applicant,
    get_shap_analysis,
    get_dice_counterfactuals,
    get_mapie_uncertainty,
    get_fairness_audit,
    _ARTIFACT_CACHE
)
from backend.app.models.model_loader import (
    get_available_models,
    load_model_evaluation,
    get_multi_model_comparison
)
from backend.app.models.train_xgboost import train_xgboost_model

app = FastAPI(
    title="XAI Decision Intelligence API",
    description="Enterprise Analytics & Explainable AI Backend for Credit Risk Decision Support",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite dev server default ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    model_loaded = _ARTIFACT_CACHE["model"] is not None
    prep_loaded = _ARTIFACT_CACHE["preprocessor"] is not None
    shap_ready = _ARTIFACT_CACHE["explainer"] is not None
    dice_ready = _ARTIFACT_CACHE["dice_exp"] is not None
    mapie_ready = _ARTIFACT_CACHE["mapie"] is not None

    return {
        "status": "healthy",
        "model_loaded": model_loaded,
        "preprocessor_loaded": prep_loaded,
        "shap_available": shap_ready,
        "dice_available": dice_ready,
        "mapie_available": mapie_ready,
        "dataset_present": True,
        "models_available": ["xgboost", "lightgbm"]
    }

# ====================================================================
# MASTER USER JOURNEY API: POST /api/analyze
# Executes: Validate -> Transform -> XGBoost -> SHAP -> DiCE -> MAPIE
# ====================================================================
@app.post("/api/analyze", response_model=MasterAnalysisResponse)
def analyze_applicant(payload: AnalyzeRequest):
    """
    Primary End-to-End Decision Support Endpoint.
    Validates input and dynamically executes XGBoost prediction, SHAP attribution,
    DiCE counterfactuals, MAPIE conformal sets, and fairness auditing in one request.
    """
    applicant_obj = payload.applicant or payload.features
    
    # If customer_id provided without explicit fields, load from test set
    if applicant_obj is None and payload.customer_id is not None:
        splits = _ARTIFACT_CACHE.get("splits")
        if splits and "X_test_raw" in splits:
            test_df = splits["X_test_raw"]
            if payload.customer_id in test_df.index:
                applicant_dict = test_df.loc[payload.customer_id].to_dict()
            else:
                applicant_dict = test_df.iloc[payload.customer_id % len(test_df)].to_dict()
        else:
            raise HTTPException(status_code=400, detail="Applicant features required.")
    elif applicant_obj is not None:
        applicant_dict = applicant_obj.model_dump()
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": "Missing applicant data", "message": "Please provide complete credit applicant profile."}
        )

    try:
        result = execute_master_analysis(
            features=applicant_dict,
            customer_id=payload.customer_id,
            model_name=payload.model_name or "xgboost",
            confidence_level=payload.confidence_level or 0.90
        )
        return result
    except Exception as e:
        print("Analysis error:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Inference failure", "message": str(e)}
        )

# ====================================================================
# INDIVIDUAL SPECIALIZED ENDPOINTS
# ====================================================================

@app.get("/api/dataset")
def dataset_overview():
    try:
        return get_dataset_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dataset/stats")
def dataset_stats():
    try:
        return get_dataset_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dataset/quality")
def data_quality():
    try:
        return get_data_quality_report()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dataset/visualizations")
def dataset_visualizations():
    try:
        return get_visualizations_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/customers/sample")
def sample_customers(count: int = Query(10, ge=1, le=50)):
    try:
        return get_sample_customers(count=count)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model/info")
def model_info(model_name: str = Query("xgboost")):
    try:
        splits = _ARTIFACT_CACHE["splits"]
        prep_bundle = _ARTIFACT_CACHE["preprocessor"]
        return {
            "model": "XGBoost Classifier",
            "model_identifier": model_name.lower(),
            "dataset": "UCI Statlog German Credit Data",
            "random_state": 42,
            "training_samples": len(splits["X_train_raw"]),
            "validation_samples": len(splits["X_val_raw"]),
            "test_samples": len(splits["X_test_raw"]),
            "original_features": len(prep_bundle["feature_names_in"]),
            "transformed_features": len(prep_bundle["transformed_feature_names"]),
            "transformed_feature_names": prep_bundle["transformed_feature_names"],
            "split_ratio": "70% Train / 15% Validation / 15% Testing (Stratified)",
            "available_models": ["xgboost", "lightgbm"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/model/train")
def train_model(payload: XGBoostTrainRequest):
    try:
        res = train_xgboost_model(
            n_estimators=payload.n_estimators or 100,
            max_depth=payload.max_depth or 5,
            learning_rate=payload.learning_rate or 0.1,
            subsample=payload.subsample or 0.8,
            tune_hyperparameters=payload.tune_hyperparameters or False
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/evaluation")
def evaluation_metrics(model_name: str = Query("xgboost")):
    try:
        if model_name.lower() == "xgboost" and _ARTIFACT_CACHE["evaluation"] is not None:
            return _ARTIFACT_CACHE["evaluation"]
        return load_model_evaluation(model_name=model_name)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/model-comparison")
def model_comparison():
    try:
        return get_multi_model_comparison()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict")
def predict(payload: CustomerPredictionRequest):
    try:
        features = payload.features
        if not features and payload.customer_id is not None:
            splits = _ARTIFACT_CACHE["splits"]
            test_df = splits["X_test_raw"]
            features = test_df.loc[payload.customer_id].to_dict() if payload.customer_id in test_df.index else test_df.iloc[0].to_dict()
        
        if not features:
            raise HTTPException(status_code=400, detail="Missing borrower features.")

        return predict_single_applicant(
            features=features,
            model_name=payload.model_name or "xgboost",
            customer_id=payload.customer_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/explain/shap")
def explain_shap(payload: CustomerPredictionRequest):
    try:
        features = payload.features
        if not features and payload.customer_id is not None:
            splits = _ARTIFACT_CACHE["splits"]
            test_df = splits["X_test_raw"]
            features = test_df.loc[payload.customer_id].to_dict() if payload.customer_id in test_df.index else test_df.iloc[0].to_dict()

        if not features:
            raise HTTPException(status_code=400, detail="Missing borrower features.")

        return get_shap_analysis(
            features=features,
            model_name=payload.model_name or "xgboost",
            customer_id=payload.customer_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/explain/counterfactual")
def explain_counterfactual(payload: CustomerPredictionRequest):
    try:
        features = payload.features
        if not features and payload.customer_id is not None:
            splits = _ARTIFACT_CACHE["splits"]
            test_df = splits["X_test_raw"]
            features = test_df.loc[payload.customer_id].to_dict() if payload.customer_id in test_df.index else test_df.iloc[0].to_dict()

        if not features:
            raise HTTPException(status_code=400, detail="Missing borrower features.")

        return get_dice_counterfactuals(
            features=features,
            total_cfs=3,
            model_name=payload.model_name or "xgboost",
            customer_id=payload.customer_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/uncertainty")
def explain_uncertainty(payload: CustomerPredictionRequest, confidence_level: float = Query(0.90, ge=0.50, le=0.99)):
    try:
        features = payload.features
        if not features and payload.customer_id is not None:
            splits = _ARTIFACT_CACHE["splits"]
            test_df = splits["X_test_raw"]
            features = test_df.loc[payload.customer_id].to_dict() if payload.customer_id in test_df.index else test_df.iloc[0].to_dict()

        if not features:
            raise HTTPException(status_code=400, detail="Missing borrower features.")

        return get_mapie_uncertainty(
            features=features,
            confidence_level=confidence_level,
            model_name=payload.model_name or "xgboost",
            customer_id=payload.customer_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/fairness")
def audit_fairness(sensitive_attribute: str = Query("personal_status"), model_name: str = Query("xgboost")):
    try:
        return get_fairness_audit(sensitive_attribute=sensitive_attribute, model_name=model_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard-summary")
def dashboard_summary():
    try:
        eval_metrics = _ARTIFACT_CACHE["evaluation"] or load_model_evaluation("xgboost")
        splits = _ARTIFACT_CACHE["splits"]
        total_records = len(splits["raw_df"])
        test_samples = len(splits["X_test_raw"])

        fairness = get_fairness_audit("personal_status", model_name="xgboost")
        sample_feat = splits["X_test_raw"].iloc[1].to_dict()
        pred_sample = predict_single_applicant(sample_feat, model_name="xgboost", customer_id=int(splits["X_test_raw"].index[1]))

        return {
            "model_name": "XGBoost Classifier",
            "dataset_name": "UCI Statlog German Credit Data",
            "total_records": total_records,
            "test_sample_count": test_samples,
            "accuracy": eval_metrics["accuracy"],
            "roc_auc": eval_metrics["roc_auc"],
            "precision": eval_metrics["precision"],
            "recall": eval_metrics["recall"],
            "f1_score": eval_metrics["f1_score"],
            "total_cost": eval_metrics["total_cost"],
            "fairness_status": "Disparity Flagged" if fairness["disparity_detected"] else "Within Tolerance",
            "fairness_attribute": fairness["sensitive_attribute"],
            "demographic_parity_diff": fairness["demographic_parity_difference"],
            "default_prediction": pred_sample
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/predictions/history")
def get_prediction_history(limit: int = Query(20, ge=1, le=100)):
    """Returns persistent audit log of decisions saved to database."""
    try:
        from backend.app.db.database import get_recent_prediction_logs
        return get_recent_prediction_logs(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

