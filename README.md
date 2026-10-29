# XAI-Enabled Decision Support for Enterprise Analytics
### Counterfactual Explanations, Uncertainty, Fairness Audits, Authentication & Persistent History

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0+-EB5424.svg)](https://xgboost.readthedocs.io)
[![SHAP](https://img.shields.io/badge/SHAP-TreeExplainer-blue.svg)](https://shap.readthedocs.io)
[![DiCE](https://img.shields.io/badge/DiCE-Counterfactuals-brightgreen.svg)](https://github.com/interpretml/DiCE)
[![MAPIE](https://img.shields.io/badge/MAPIE-Conformal_Prediction-amber.svg)](https://mapie.readthedocs.io)
[![Fairlearn](https://img.shields.io/badge/Fairlearn-Algorithmic_Fairness-purple.svg)](https://fairlearn.org)

An enterprise-grade, end-to-end Explainable AI (XAI) Decision Support System for credit risk assessment. The application features **real user registration and authentication**, **PostgreSQL / SQLite persistence**, **saved user profiles**, credit-risk prediction using **XGBoost Classifier** on the **UCI Statlog German Credit Data**, accompanied by multidimensional interpretability: **SHAP** feature attribution, **DiCE** actionable counterfactual recourse, **MAPIE** distribution-free conformal uncertainty prediction sets, **Fairlearn** demographic parity/equalized odds audits, and **persistent historical retrieval**.

---

## 🎯 Key Capabilities & System Features

1. **Authentication & User Profile Management**:
   - `/register`: Comprehensive onboarding collecting Personal Info, Professional Info, Account Credentials (with real-time password criteria checklist), and mandatory Terms of Service / Privacy Policy consent.
   - `/login`: Dual identifier authentication via corporate email or username with secure password verification, remember-me duration, and HttpOnly session cookies.
   - `/profile`: View persistent analyst registration records, edit permitted non-sensitive fields, review account creation and last-login timestamps.
   - `/change-password`: Cryptographic password update verifying existing password and setting a 12-round bcrypt hash.
   - `/forgot-password`: Secure access recovery request flow.
   - Route protection: All operational platform pages are protected by `ProtectedRoute`.

2. **Core Decision Support Journey (`POST /api/analyze`)**:
   - Underwriters enter a 20-attribute German Credit applicant profile (or select benchmark presets).
   - Real-time XGBoost inference (discrete outcome + calibrated probabilities).
   - Exact SHAP additive contributions identifying top risk drivers.
   - DiCE-ML actionable counterfactual recourse paths under valid feature bounds.
   - MAPIE conformal prediction set guaranteeing $(1 - \alpha) = 90\%$ marginal coverage.
   - Fairlearn algorithmic fairness audit across sensitive demographic attributes.
   - **Automatic Persistence**: Completed decisions, predictions, explanations, and applicant inputs are saved immediately to PostgreSQL / SQLite and securely associated with the authenticated user ID.

3. **Persistent Analysis History (`/history`)**:
   - Logged-in users can view, filter, sort, and paginate their previously executed decisions.
   - Multi-tenant query isolation: Users access strictly their own saved analyses (unauthorized queries return 404).
   - **Direct Retrieval Without Recalculation**: Clicking **View Details** displays the original saved snapshot (applicant inputs, probabilities, SHAP drivers, DiCE recourse, and MAPIE conformal sets) as originally evaluated.
   - Historical analyses record their original model version (e.g. `xgboost-v1.0`).

4. **Dynamic Dashboard Personalization**:
   - Calculates real statistics from persisted database records: total analyses, good/bad risk counts, recent analyses, and active model version.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies | Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Recharts, Lucide-React, CSS3 | Enterprise dashboard, authentication views, interactive charts, forms, context state |
| **Backend API** | Python 3.11, FastAPI, Pydantic, Uvicorn | RESTful endpoints, JWT authentication, authorization, session management |
| **Database** | PostgreSQL 16 (Production) / SQLite (Zero-dep local fallback) | `users`, `analyses`, and `prediction_audit_logs` persistence |
| **ORM & Migrations** | SQLAlchemy 2.0, Alembic | Declarative data models, connection pooling, automated database migrations |
| **ML Models** | XGBoost Classifier, LightGBM, Scikit-Learn | Stratified 70/15/15 pipeline, asymmetric 5:1 cost optimization |
| **Explainability** | SHAP (`TreeExplainer`) | Local feature attributions & global feature importance ranking |
| **Counterfactuals** | DiCE-ML (`dice_ml.Dice`) | Actionable recourse paths under valid feature domain bounds |
| **Uncertainty** | MAPIE 1.5.0 (`SplitConformalClassifier`) | Distribution-free conformal prediction sets with coverage guarantees |
| **Fairness** | Fairlearn (`MetricFrame`) | Algorithmic audit across personal status/sex, age, and foreign worker |
| **Deployment & Config** | Environment Variables (`.env`) | Dynamic database URLs, cryptographic secrets, and CORS origins |

---

## 🗄️ Database Schema & Relationships

### `users` Table
| Column | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key, Autoincrement |
| `first_name` | String(100) | Mandatory |
| `last_name` | String(100) | Mandatory |
| `date_of_birth` | String(30) | Format YYYY-MM-DD |
| `gender` | String(30) | Male, Female, Other, Prefer not to say |
| `phone` | String(30) | Validated telephone format |
| `email` | String(150) | Unique, Index, Corporate email |
| `organization` | String(150) | Company / Organization name |
| `job_title` | String(150) | Professional title |
| `department` | String(100) | Department name |
| `years_of_experience`| Float | 0 to 70 |
| `username` | String(100) | Unique, Index (3-30 chars) |
| `password_hash` | String(255) | 12-round salted bcrypt hash |
| `role` | String(50) | Default: `user` (never selectable on registration) |
| `is_active` | Boolean | Default: `True` |
| `terms_accepted_at`| DateTime | Timestamp when Terms of Service accepted |
| `created_at` | DateTime | Account creation timestamp |
| `updated_at` | DateTime | Last profile update timestamp |
| `last_login` | DateTime | Updated on every successful authentication |

### `analyses` Table
| Column | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key, Autoincrement |
| `user_id` | Integer | Foreign Key (`users.id`, `ON DELETE CASCADE`), Index |
| `analysis_name` | String(200) | Optional user-defined name |
| `applicant_reference`| String(100)| Optional non-identifying reference |
| `input_features` | JSON / JSONB | Validated applicant features |
| `predicted_class` | String(50) | Good Credit Risk or Bad Credit Risk |
| `good_risk_probability`| Float | Model probability for Good credit risk |
| `bad_risk_probability` | Float | Model probability for Bad credit risk |
| `shap_results` | JSON / JSONB | Saved SHAP local contributions & narrative |
| `counterfactual_results`| JSON / JSONB| Saved DiCE recourse alternatives |
| `uncertainty_results` | JSON / JSONB | Saved MAPIE prediction set & reliability assessment |
| `fairness_results` | JSON / JSONB | Group-level fairness context snapshot |
| `decision_summary` | Text | Unified decision-support narrative |
| `model_version` | String(50) | Model version tag (e.g. `xgboost-v1.0`) |
| `status` | String(30) | `completed`, `pending`, or `failed` |
| `error_message` | Text | Sanitized error state if component fails |
| `created_at` | DateTime | Creation timestamp, Index |
| `updated_at` | DateTime | Modification timestamp |

**Relationship**: One user has many analyses (`User.analyses <-> Analysis.user`).

---

## 🚀 Execution & Setup Guide

### Prerequisites
- Python 3.10+ (Recommended: Python 3.11)
- Node.js 18+ and npm
- PostgreSQL 14+ (or Docker Compose; defaults to SQLite for local development)

### 1. Environment Configuration
Copy `.env.example` to create your environment configuration:
```bash
cp .env.example .env
```
Ensure the following variables are set in `.env`:
```ini
DATABASE_URL=sqlite:///./backend/artifacts/predictions.db
# Or PostgreSQL:
# DATABASE_URL=postgresql://xai_user:xai_secure_pass_2026@localhost:5432/xai_credit_db

JWT_SECRET_KEY=xai-enterprise-secret-key-decision-intelligence-2026-production-grade
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:8000
```

### 2. Database Migrations (Alembic)
To apply database migrations to your configured database:
```bash
alembic upgrade head
```

### 3. Start the FastAPI Backend
```bash
# From repository root:
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive OpenAPI documentation will be accessible at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 4. Start the React Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The application will be live at: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 💾 PostgreSQL Database Backup & Restore Procedures

### Database Backup
To take a full backup of the persistent PostgreSQL database:
```bash
pg_dump -U xai_user -d xai_credit_db -F c -b -v -f xai_credit_backup.dump
```

### Database Restore
To restore from a backup:
```bash
pg_restore -U xai_user -d xai_credit_db -v -c xai_credit_backup.dump
```

---

## 🧪 Comprehensive Automated Verification

### Mandatory 20-Scenario Acceptance Test Suite
Execute the end-to-end verification covering all 20 criteria from Section 15:
```bash
python backend/tests/test_master_e2e.py
```

**Verified Scenarios**:
1. User registration with personal and professional details
2. Duplicate email and username rejection
3. Rejection of weak passwords, invalid emails, password mismatches, and unaccepted terms
4. Verification of 12-round bcrypt password hashing in database
5. User authentication and JWT / cookie session creation
6. Rejection of invalid credentials
7. Rejection of unauthenticated requests to protected endpoints
8. Invalidation of session upon logout
9. Profile view and permitted field update
10. Submission of separate German Credit applicant data
11. Dynamic execution of XGBoost, SHAP, DiCE, and MAPIE models
12. Persistence of completed analysis and user association
13. Retrieval of identical saved analysis upon page reload
14. Preservation of user history across login sessions
15. Preservation of records across application restarts
16. Multi-tenant isolation (User B cannot access User A's analyses; returns 404)
17. Historical analysis returned from database snapshot without silent re-inference
18. Secure analysis deletion according to retention policy
19. Calculation of dashboard statistics from real database records
20. Safe failure handling without inventing fabricated outputs

---

## 📄 License
This platform is developed for enterprise analytics and academic research under the MIT License.
