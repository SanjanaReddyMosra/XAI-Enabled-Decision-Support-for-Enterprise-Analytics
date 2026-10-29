from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional, Union

# --- Health & General ---
class HealthResponse(BaseModel):
    status: str
    model_loaded: bool = True
    preprocessor_loaded: bool = True
    shap_available: bool = True
    dice_available: bool = True
    mapie_available: bool = True
    dataset_present: bool = True
    models_available: List[str] = ["xgboost"]

# --- Strict Applicant Input Validation Schema ---
class ApplicantData(BaseModel):
    checking_status: str = Field(..., description="Checking account status")
    duration: int = Field(..., ge=1, le=120, description="Duration in months (1-120)")
    credit_history: str = Field(..., description="Past credit history")
    purpose: str = Field(..., description="Purpose of loan")
    credit_amount: float = Field(..., gt=0, le=50000, description="Credit amount in DM (>0)")
    savings_status: str = Field(..., description="Savings account status")
    employment: str = Field(..., description="Present employment duration")
    installment_commitment: int = Field(..., ge=1, le=4, description="Installment rate in % of disposable income (1-4)")
    personal_status: str = Field(..., description="Personal status and sex")
    other_parties: Optional[str] = Field("none", description="Other debtors / guarantors")
    residence_since: int = Field(..., ge=1, le=4, description="Present residence duration (1-4)")
    property_magnitude: str = Field(..., description="Property ownership")
    age: int = Field(..., ge=18, le=120, description="Age in years (18-120)")
    other_payment_plans: Optional[str] = Field("none", description="Other installment plans")
    housing: str = Field(..., description="Housing arrangement")
    existing_credits: int = Field(..., ge=1, le=10, description="Number of existing credits at this bank (1-10)")
    job: str = Field(..., description="Employment / job category")
    num_dependents: int = Field(..., ge=1, le=10, description="Number of people liable for maintenance (1-10)")
    own_telephone: Optional[str] = Field("none", description="Telephone registered (none / yes)")
    foreign_worker: Optional[str] = Field("yes", description="Foreign worker status (yes / no)")

    @field_validator('credit_amount')
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Credit amount must be a positive number greater than 0 DM.")
        return v

    @field_validator('age')
    @classmethod
    def validate_age(cls, v):
        if v < 18:
            raise ValueError("Applicant age must be at least 18 years.")
        return v

# --- Master Analysis Request & Response Schemas ---
class AnalyzeRequest(BaseModel):
    applicant: Optional[ApplicantData] = None
    features: Optional[ApplicantData] = None
    customer_id: Optional[int] = None
    model_name: Optional[str] = "xgboost"
    confidence_level: Optional[float] = 0.90
    analysis_name: Optional[str] = None
    applicant_reference: Optional[str] = None

class PredictionDetail(BaseModel):
    prediction_class: int
    label: str
    probability_good: float
    probability_bad: float
    model_used: str = "XGBoost"

class SHAPFactor(BaseModel):
    feature: str
    feature_value: Any
    shap_value: float
    direction: str  # "Toward Good Risk" or "Toward Bad Risk"
    impact: str     # "increases_risk" or "decreases_risk"

class ExplanationDetail(BaseModel):
    method: str = "SHAP"
    base_value: float
    top_factors: List[SHAPFactor]
    narrative: str

class CounterfactualChange(BaseModel):
    feature: str
    current_value: Any
    counterfactual_value: Any

class CounterfactualAlternative(BaseModel):
    target_prediction: int
    target_label: str
    changes_count: int
    changes: List[CounterfactualChange]
    recourse_features: Dict[str, Any]

class CounterfactualDetail(BaseModel):
    method: str = "DiCE"
    available: bool
    results: List[CounterfactualAlternative]
    disclaimer: str

class UncertaintyDetail(BaseModel):
    method: str = "MAPIE"
    prediction_set: List[str]
    set_size: int
    is_uncertain: bool
    confidence_level: float
    alpha: float
    empirical_coverage: float
    reliability_assessment: str
    guarantee_explanation: str

class FairnessDetail(BaseModel):
    method: str = "Fairlearn"
    sensitive_attribute: str
    demographic_parity_diff: float
    equalized_odds_diff: float
    disparity_detected: bool
    audit_summary: str

class MasterAnalysisResponse(BaseModel):
    success: bool = True
    customer_id: Optional[int] = None
    audit_id: Optional[int] = None
    analysis_id: Optional[int] = None
    created_at: Optional[str] = None
    model_version: Optional[str] = "xgboost-v1.0"
    status: Optional[str] = "completed"
    analysis_name: Optional[str] = None
    applicant_reference: Optional[str] = None
    prediction: PredictionDetail
    explanation: ExplanationDetail
    counterfactuals: CounterfactualDetail
    uncertainty: UncertaintyDetail
    fairness: FairnessDetail
    decision_summary: str

# --- Persistent Analysis Entity Schemas ---
class AnalysisItemResponse(BaseModel):
    id: int
    user_id: int
    analysis_name: Optional[str] = None
    applicant_reference: Optional[str] = None
    input_features: Dict[str, Any]
    predicted_class: str
    good_risk_probability: float
    bad_risk_probability: float
    shap_results: Optional[Any] = None
    counterfactual_results: Optional[Any] = None
    uncertainty_results: Optional[Any] = None
    fairness_results: Optional[Any] = None
    decision_summary: Optional[str] = None
    model_version: str
    status: str
    error_message: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class PaginatedAnalysesResponse(BaseModel):
    items: List[AnalysisItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class AnalysisPatchRequest(BaseModel):
    analysis_name: Optional[str] = Field(None, max_length=200)
    applicant_reference: Optional[str] = Field(None, max_length=100)

class AnalysisStatsResponse(BaseModel):
    total_analyses: int
    good_risk_count: int
    bad_risk_count: int
    recent_analyses: List[Dict[str, Any]]
    model_version: str

# --- Dataset Schemas ---
class DatasetOverview(BaseModel):
    total_rows: int
    total_columns: int
    columns: List[str]
    numerical_columns: List[str]
    categorical_columns: List[str]
    target_column: str
    target_classes: Dict[str, int]
    target_distribution: Dict[str, int]
    preview: List[Dict[str, Any]]

class DatasetStats(BaseModel):
    summary_numerical: Dict[str, Dict[str, float]]
    summary_categorical: Dict[str, Dict[str, int]]
    missing_values: Dict[str, int]
    duplicates_count: int

# --- Data Cleaning Schemas ---
class CleaningStepResult(BaseModel):
    step_name: str
    description: str
    rows_before: int
    rows_after: int
    columns_before: int
    columns_after: int
    details: Dict[str, Any]

class CleaningSummaryResponse(BaseModel):
    steps: List[CleaningStepResult]
    initial_shape: List[int]
    cleaned_shape: List[int]
    total_duplicates_removed: int
    missing_imputed_count: int
    potential_outliers_detected: int

# --- Model Training & Evaluation Schemas ---
class XGBoostTrainRequest(BaseModel):
    n_estimators: Optional[int] = 100
    max_depth: Optional[int] = 5
    learning_rate: Optional[float] = 0.1
    subsample: Optional[float] = 0.8
    tune_hyperparameters: Optional[bool] = False

class CustomerPredictionRequest(BaseModel):
    model_name: Optional[str] = "xgboost"
    customer_id: Optional[int] = None
    features: Optional[Dict[str, Any]] = None
