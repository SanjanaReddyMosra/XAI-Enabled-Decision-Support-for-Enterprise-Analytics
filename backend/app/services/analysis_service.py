import math
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import or_, desc, asc, cast, String
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.analysis import Analysis
from backend.app.schemas.schemas import AnalysisPatchRequest

def save_analysis(
    db: Session,
    user_id: int,
    features: Dict[str, Any],
    master_result: Dict[str, Any],
    analysis_name: Optional[str] = None,
    applicant_reference: Optional[str] = None,
    model_name: str = "xgboost"
) -> Analysis:
    """
    Persists a complete, authentic credit risk decision analysis into the PostgreSQL/SQLite database,
    securely associated with the authenticated user ID.
    """
    pred = master_result.get("prediction", {})
    shap_data = master_result.get("explanation")
    cf_data = master_result.get("counterfactuals")
    uncert_data = master_result.get("uncertainty")
    fairness_data = master_result.get("fairness")
    decision_summary = master_result.get("decision_summary", "")

    record = Analysis(
        user_id=user_id,
        analysis_name=analysis_name.strip() if analysis_name else f"Analysis #{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
        applicant_reference=applicant_reference.strip() if applicant_reference else None,
        input_features=features,
        predicted_class=pred.get("label", "Unknown"),
        good_risk_probability=pred.get("probability_good", 0.0),
        bad_risk_probability=pred.get("probability_bad", 0.0),
        shap_results=shap_data,
        counterfactual_results=cf_data,
        uncertainty_results=uncert_data,
        fairness_results=fairness_data,
        decision_summary=decision_summary,
        model_version=f"{model_name}-v1.0",
        status="completed",
        error_message=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_user_analyses(
    db: Session,
    user_id: int,
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    predicted_class: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    sort_by: str = "newest"
) -> Dict[str, Any]:
    """
    Retrieves paginated historical analyses belonging strictly to the authenticated user.
    Enforces authorization check at database query level.
    """
    query = db.query(Analysis).filter(Analysis.user_id == user_id)

    # Search filter (name, reference, or numeric ID)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Analysis.analysis_name.ilike(term),
                Analysis.applicant_reference.ilike(term),
                cast(Analysis.id, String).ilike(term)
            )
        )

    # Filter by predicted class
    if predicted_class and predicted_class.strip() and predicted_class.lower() != "all":
        query = query.filter(Analysis.predicted_class.ilike(f"%{predicted_class.strip()}%"))

    # Date range filters
    if start_date:
        try:
            sd = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            query = query.filter(Analysis.created_at >= sd)
        except Exception:
            pass

    if end_date:
        try:
            ed = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            query = query.filter(Analysis.created_at <= ed)
        except Exception:
            pass

    # Total count for pagination
    total = query.count()
    total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1

    # Sorting
    if sort_by == "oldest":
        query = query.order_by(asc(Analysis.created_at))
    else:
        query = query.order_by(desc(Analysis.created_at))

    # Pagination slice
    offset = max(0, (page - 1) * page_size)
    records = query.offset(offset).limit(page_size).all()

    return {
        "items": [r.to_dict() for r in records],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

def get_analysis_by_id(db: Session, user_id: int, analysis_id: int) -> Analysis:
    """
    Retrieves a single analysis owned by the user.
    Prevents horizontal privilege escalation by returning 404 if not owned.
    """
    record = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == user_id
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found or access denied."
        )

    return record

def update_analysis_metadata(
    db: Session,
    user_id: int,
    analysis_id: int,
    patch_req: AnalysisPatchRequest
) -> Analysis:
    """Updates permitted metadata such as analysis_name or applicant_reference."""
    record = get_analysis_by_id(db, user_id, analysis_id)

    if patch_req.analysis_name is not None:
        record.analysis_name = patch_req.analysis_name.strip()
    if patch_req.applicant_reference is not None:
        record.applicant_reference = patch_req.applicant_reference.strip()

    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record

def delete_user_analysis(db: Session, user_id: int, analysis_id: int) -> bool:
    """Deletes an analysis owned by the authenticated user."""
    record = get_analysis_by_id(db, user_id, analysis_id)
    db.delete(record)
    db.commit()
    return True

def get_user_dashboard_stats(db: Session, user_id: int) -> Dict[str, Any]:
    """Calculates personalized summary statistics from persisted database records."""
    user_analyses = db.query(Analysis).filter(Analysis.user_id == user_id)
    total = user_analyses.count()
    good_count = user_analyses.filter(Analysis.predicted_class.ilike("%good%")).count()
    bad_count = user_analyses.filter(Analysis.predicted_class.ilike("%bad%")).count()

    recent = user_analyses.order_by(desc(Analysis.created_at)).limit(5).all()

    return {
        "total_analyses": total,
        "good_risk_count": good_count,
        "bad_risk_count": bad_count,
        "recent_analyses": [
            {
                "id": r.id,
                "analysis_name": r.analysis_name,
                "predicted_class": r.predicted_class,
                "good_risk_probability": r.good_risk_probability,
                "bad_risk_probability": r.bad_risk_probability,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in recent
        ],
        "model_version": "xgboost-v1.0"
    }
