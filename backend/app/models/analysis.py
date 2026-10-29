import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.db.database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    analysis_name = Column(String(200), nullable=True)
    applicant_reference = Column(String(100), nullable=True)
    input_features = Column(JSON, nullable=False)
    predicted_class = Column(String(50), nullable=False)  # "Good Credit Risk" or "Bad Credit Risk"
    good_risk_probability = Column(Float, nullable=False)
    bad_risk_probability = Column(Float, nullable=False)
    shap_results = Column(JSON, nullable=True)
    counterfactual_results = Column(JSON, nullable=True)
    uncertainty_results = Column(JSON, nullable=True)
    fairness_results = Column(JSON, nullable=True)
    decision_summary = Column(Text, nullable=True)
    model_version = Column(String(50), default="xgboost-v1.0", nullable=False)
    status = Column(String(30), default="completed", nullable=False)  # pending, completed, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="analyses")

    def to_dict(self):
        """Converts analysis record to dictionary representation."""
        def safe_json(val):
            if val is None:
                return None
            if isinstance(val, (dict, list)):
                return val
            if isinstance(val, str):
                try:
                    return json.loads(val)
                except Exception:
                    return val
            return val

        return {
            "id": self.id,
            "user_id": self.user_id,
            "analysis_name": self.analysis_name,
            "applicant_reference": self.applicant_reference,
            "input_features": safe_json(self.input_features) or {},
            "predicted_class": self.predicted_class,
            "good_risk_probability": round(self.good_risk_probability, 4) if self.good_risk_probability is not None else 0.0,
            "bad_risk_probability": round(self.bad_risk_probability, 4) if self.bad_risk_probability is not None else 0.0,
            "shap_results": safe_json(self.shap_results),
            "counterfactual_results": safe_json(self.counterfactual_results),
            "uncertainty_results": safe_json(self.uncertainty_results),
            "fairness_results": safe_json(self.fairness_results),
            "decision_summary": self.decision_summary,
            "model_version": self.model_version,
            "status": self.status,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
