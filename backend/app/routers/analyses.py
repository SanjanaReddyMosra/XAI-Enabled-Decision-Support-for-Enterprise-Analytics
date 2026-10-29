from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.auth.dependencies import get_db, get_current_user, get_optional_current_user
from backend.app.auth.models import User
from backend.app.schemas.schemas import (
    AnalyzeRequest,
    MasterAnalysisResponse,
    AnalysisItemResponse,
    PaginatedAnalysesResponse,
    AnalysisPatchRequest,
    AnalysisStatsResponse
)
from backend.app.services.xai_service import (
    execute_master_analysis,
    _ARTIFACT_CACHE
)
from backend.app.services.analysis_service import (
    save_analysis,
    get_user_analyses,
    get_analysis_by_id,
    update_analysis_metadata,
    delete_user_analysis,
    get_user_dashboard_stats
)

analyses_router = APIRouter(prefix="/api/analyses", tags=["Analysis History"])

@analyses_router.get("", response_model=PaginatedAnalysesResponse)
def list_analyses(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    predicted_class: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    sort_by: str = Query("newest", pattern="^(newest|oldest)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the authenticated user's persistent credit risk analysis history.
    Strictly isolated to current user's records.
    """
    result = get_user_analyses(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        search=search,
        predicted_class=predicted_class,
        start_date=start_date,
        end_date=end_date,
        sort_by=sort_by
    )
    return result

@analyses_router.get("/stats/summary", response_model=AnalysisStatsResponse)
def user_analysis_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculates personalized decision statistics from saved database records."""
    stats = get_user_dashboard_stats(db, current_user.id)
    return stats

@analyses_router.get("/{analysis_id}", response_model=AnalysisItemResponse)
def get_analysis_detail(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves one owned analysis record.
    Returns the exact original saved result without recalculation.
    Returns 404 if the record does not exist or belongs to another user.
    """
    record = get_analysis_by_id(db, current_user.id, analysis_id)
    return record.to_dict()

@analyses_router.patch("/{analysis_id}", response_model=AnalysisItemResponse)
def update_analysis(
    analysis_id: int,
    payload: AnalysisPatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates permitted metadata (analysis_name, applicant_reference) for an owned analysis."""
    record = update_analysis_metadata(db, current_user.id, analysis_id, payload)
    return record.to_dict()

@analyses_router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes an owned analysis according to data retention policy."""
    delete_user_analysis(db, current_user.id, analysis_id)
    return {
        "success": True,
        "message": f"Analysis #{analysis_id} deleted successfully."
    }
