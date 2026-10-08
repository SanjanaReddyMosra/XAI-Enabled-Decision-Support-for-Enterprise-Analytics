# XAI-Enabled Decision Support for Enterprise Analytics
### Counterfactual Explanations, Uncertainty, and Fairness Audits

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0+-EB5424.svg)](https://xgboost.readthedocs.io)
[![SHAP](https://img.shields.io/badge/SHAP-TreeExplainer-blue.svg)](https://shap.readthedocs.io)
[![DiCE](https://img.shields.io/badge/DiCE-Counterfactuals-brightgreen.svg)](https://github.com/interpretml/DiCE)
[![MAPIE](https://img.shields.io/badge/MAPIE-Conformal_Prediction-amber.svg)](https://mapie.readthedocs.io)
[![Fairlearn](https://img.shields.io/badge/Fairlearn-Algorithmic_Fairness-purple.svg)](https://fairlearn.org)

An enterprise-grade, end-to-end Explainable AI (XAI) Decision Support System for credit risk assessment. The platform evaluates borrower creditworthiness using an **XGBoost Classifier** trained on the **UCI Statlog German Credit Data**, accompanied by multidimensional interpretability: **SHAP** feature attribution, **DiCE** actionable counterfactual recourse, **MAPIE** distribution-free conformal uncertainty prediction sets, and **Fairlearn** demographic parity/equalized odds audits.

---

## 🎯 Core User Journey

1. **Borrower Ingestion**: Underwriters enter a 20-attribute German Credit profile across structured sections (Credit Profile, Financial Profile, Personal Profile, Asset/Housing, Other Credit Information) or select quick benchmark presets.
2. **Single-Click Execution (`POST /api/analyze`)**: In a single round-trip, the Python / FastAPI backend executes:
   - Request schema validation via Pydantic
   - Preprocessing with fitted `CreditPreprocessor` (zero data leakage)
   - Real-time XGBoost inference (discrete class + calibrated probabilities)
   - SHAP TreeExplainer additive decomposition
   - DiCE-ML counterfactual recourse generation
   - MAPIE split conformal classification prediction sets
   - Fairlearn algorithmic fairness disparity comparison
   - Persistent decision logging to PostgreSQL / SQLite
3. **Enterprise Visualization**: The React frontend progressively renders a decision hierarchy:
   - **Model Decision**: Classification outcome with probability distribution bar
   - **Why?**: SHAP attribution chart detailing top drivers increasing/decreasing risk
   - **What If?**: DiCE recourse table highlighting minimum perturbations to flip decisions
   - **How Certain?**: MAPIE conformal prediction set guaranteeing $(1 - \alpha) = 90\%$ marginal coverage
   - **Fairness Context**: Demographic parity and equalized odds disparity metrics
   - **Executive Synthesis**: Underwriting decision-support summary

---

## 🏗️ Architecture & Technologies

| Layer | Technologies | Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Recharts, Lucide-React, CSS3 Design System | Light enterprise interface, interactive charts, forms, context state |
| **Backend API** | Python, FastAPI, Pydantic, Uvicorn | RESTful endpoints, asynchronous orchestration, schema enforcement |
| **ML Models** | XGBoost Classifier, LightGBM, Scikit-Learn | Stratified 70/15/15 pipeline, asymmetric 5:1 cost optimization |
| **Explainability** | SHAP (`TreeExplainer`) | Local feature attributions & global feature importance ranking |
| **Counterfactuals** | DiCE-ML (`dice_ml.Dice`) | Actionable recourse paths under valid feature domain bounds |
| **Uncertainty** | MAPIE 1.5.0 (`SplitConformalClassifier`) | Distribution-free conformal prediction sets with coverage guarantees |
| **Fairness** | Fairlearn (`MetricFrame`) | Algorithmic audit across personal status/sex, age, and foreign worker |
| **Audit Persistence**| SQLAlchemy, PostgreSQL / SQLite | Inference logging, model versioning, non-sensitive audit history |

---

## 📊 Dataset & Modeling Details

- **Dataset**: Original UCI Statlog German Credit dataset (`1,000` instances, 20 features: 7 numerical, 13 categorical).
- **Target Encoding**: `1 = Good Credit Risk`, `0 = Bad Credit Risk`.
- **Partitioning**: Stratified 70% Train (`700`), 15% Validation (`150`), 15% Test (`150`) with `random_state=42`. Preprocessing fitted strictly on training data to eliminate data leakage.
- **Model Performance**:
  - Test Accuracy: `76.7%`
  - Test ROC-AUC: `0.8226`
  - Test F1-Score: `0.849`
  - Asymmetric Cost: `119 DM` (penalizing false approvals at 5:1 vs. false rejections at 1:1)
- **Conformal Calibration**:
  - Nominal Confidence: `90.0%`
  - Empirical Test Coverage: `91.3%`
  - Average Prediction Set Size: `1.373`

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone the Repository
```bash
git clone https://github.com/SanjanaReddyMosra/XAI-Enabled-Decision-Support-for-Enterprise-Analytics.git
cd XAI-Enabled-Decision-Support-for-Enterprise-Analytics
```

### 2. Backend Setup
```bash
# Create and activate virtual environment (optional)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Frontend Setup
```bash
# In a separate terminal:
cd frontend
npm install
npm run dev
```
The React enterprise application will be live at: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🧪 Automated Testing

### Backend Unit & Integration Tests
```bash
python backend/tests/test_pipeline.py
```
Validates:
- UCI dataset loading and structure
- Data cleaning and preprocessing pipeline (no leakage)
- Prediction consistency and probability complementarity
- SHAP attribution generation
- DiCE recourse perturbations
- MAPIE conformal set coverage guarantees
- Fairlearn MetricFrame calculation
- Single-click `/api/analyze` master orchestration

### End-to-End Live Verification
```bash
python test_e2e_verify.py
```

---

## 📂 Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application & master routes
│   │   ├── db/
│   │   │   └── database.py             # SQLAlchemy audit log layer
│   │   ├── models/
│   │   │   ├── evaluation.py           # Confusion matrix & asymmetric cost calculation
│   │   │   ├── model_loader.py         # Model artifact loader
│   │   │   └── train_xgboost.py        # XGBoost training routine
│   │   ├── preprocessing/
│   │   │   ├── cleaning.py             # 8-step cleaning pipeline
│   │   │   └── pipeline.py             # ColumnTransformer preprocessor
│   │   ├── schemas/
│   │   │   └── schemas.py              # Pydantic request/response schemas
│   │   └── services/
│   │       ├── dataset_service.py      # Dataset overview, EDA, & sample generator
│   │       └── xai_service.py          # SHAP, DiCE, MAPIE, & Fairlearn orchestrator
│   ├── artifacts/                      # Pretrained models, preprocessors, & calibration data
│   │   ├── xgboost_model.joblib
│   │   ├── preprocessing_pipeline.joblib
│   │   ├── mapie_model.joblib
│   │   ├── splits_data.joblib
│   │   ├── feature_metadata.json
│   │   ├── model_metadata.json
│   │   ├── evaluation_results.json
│   │   └── fairness_reports.json
│   ├── scripts/
│   │   └── train.py                    # Independent training & calibration pipeline
│   └── tests/
│       └── test_pipeline.py            # Automated test suite
├── data/
│   ├── raw/
│   │   ├── german.data                 # Original UCI Statlog German Credit Data
│   │   └── german.doc                  # Dataset attribute documentation
│   └── processed/
├── frontend/
│   ├── src/
│   │   ├── components/                 # Layout, headers, badges, state indicators
│   │   ├── context/
│   │   │   └── PredictionContext.jsx   # Shared analysis state & active customer
│   │   ├── pages/                      # 14 enterprise analytics views
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PredictionPage.jsx      # Primary underwriting form & decision output
│   │   │   ├── ShapPage.jsx            # Local & global feature attributions
│   │   │   ├── CounterfactualPage.jsx  # DiCE actionable recourse
│   │   │   ├── UncertaintyPage.jsx     # MAPIE conformal prediction sets
│   │   │   ├── FairnessPage.jsx        # Fairlearn disparity audits
│   │   │   ├── DatasetPage.jsx
│   │   │   ├── DataQualityPage.jsx
│   │   │   ├── VisualizationPage.jsx
│   │   │   ├── TrainingPage.jsx
│   │   │   ├── EvaluationPage.jsx
│   │   │   ├── ModelComparisonPage.jsx
│   │   │   ├── ArchitecturePage.jsx
│   │   │   └── AboutPage.jsx
│   │   ├── services/
│   │   │   └── api.js                  # Axios client
│   │   ├── App.jsx
│   │   ├── index.css                   # Enterprise light design tokens
│   │   └── router.jsx
│   ├── package.json
│   └── vite.config.js
├── models/                             # Benchmark model artifacts
├── requirements.txt                    # Python dependencies
├── test_e2e_verify.py                  # Live end-to-end verification script
└── README.md
```

---

## 🔒 Security & Underwriting Policy

- All inputs are strictly sanitized and bound by domain ranges through Pydantic.
- Preprocessing and calibration data splits are isolated to prevent data leakage.
- Database audit logs strip sensitive identification parameters and only persist decision telemetry.
- DiCE counterfactuals enforce realistic feature mutability boundaries (e.g. non-decreasing age, valid categorical domains).
- MAPIE conformal sets provide rigorous finite-sample coverage guarantees, distinguishing high-confidence decisions from ambiguous cases requiring manual underwriter review.

---

## 📄 License
This project is developed for academic and enterprise research under the MIT License.
