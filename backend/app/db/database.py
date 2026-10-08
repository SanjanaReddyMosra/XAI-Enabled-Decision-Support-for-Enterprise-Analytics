import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker

# Database configuration: defaults to SQLite for local zero-dependency operation,
# or connects to PostgreSQL if DATABASE_URL environment variable is provided.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend/artifacts/predictions.db")

# For SQLite, check_same_thread=False is needed for multi-threaded FastAPI workers
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class PredictionAuditLog(Base):
    __tablename__ = "prediction_audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    model_version = Column(String(50), default="xgboost-v1.0")
    prediction_class = Column(Integer)
    prediction_label = Column(String(50))
    probability_good = Column(Float)
    probability_bad = Column(Float)
    conformal_set = Column(String(100))
    top_shap_factors = Column(Text)  # JSON serialized
    applicant_metadata = Column(Text)  # Non-sensitive JSON summary

# Create database tables if they do not exist
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print("Database initialization notice:", e)

def log_prediction_to_db(
    prediction_class: int,
    prediction_label: str,
    prob_good: float,
    prob_bad: float,
    conformal_set: list,
    top_shap: list,
    features: dict,
    model_version: str = "xgboost-v1.0"
):
    """Safely logs an inference event to the audit table without sensitive leakage."""
    db = SessionLocal()
    try:
        # Non-sensitive metadata summary
        safe_meta = {
            "duration": features.get("duration"),
            "credit_amount": features.get("credit_amount"),
            "purpose": features.get("purpose"),
            "checking_status": features.get("checking_status"),
            "age": features.get("age")
        }
        
        record = PredictionAuditLog(
            model_version=model_version,
            prediction_class=prediction_class,
            prediction_label=prediction_label,
            probability_good=prob_good,
            probability_bad=prob_bad,
            conformal_set=json.dumps(conformal_set),
            top_shap_factors=json.dumps(top_shap[:4]),
            applicant_metadata=json.dumps(safe_meta)
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record.id
    except Exception as e:
        db.rollback()
        print("Database audit log warning:", e)
        return None
    finally:
        db.close()

def get_recent_prediction_logs(limit: int = 20):
    """Retrieves recent decision audit records."""
    db = SessionLocal()
    try:
        records = db.query(PredictionAuditLog).order_by(PredictionAuditLog.timestamp.desc()).limit(limit).all()
        return [
            {
                "id": r.id,
                "timestamp": r.timestamp.isoformat() if r.timestamp else None,
                "model_version": r.model_version,
                "prediction_class": r.prediction_class,
                "prediction_label": r.prediction_label,
                "probability_good": r.probability_good,
                "probability_bad": r.probability_bad,
                "conformal_set": json.loads(r.conformal_set) if r.conformal_set else [],
                "top_shap_factors": json.loads(r.top_shap_factors) if r.top_shap_factors else [],
                "metadata": json.loads(r.applicant_metadata) if r.applicant_metadata else {}
            }
            for r in records
        ]
    except Exception as e:
        print("Error fetching prediction logs:", e)
        return []
    finally:
        db.close()
