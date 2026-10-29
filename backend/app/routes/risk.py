from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import RiskAssessmentResponse
from app.utils.auth_utils import get_current_user
from app.services.risk_service import risk_service

router = APIRouter(prefix="/api/risk", tags=["Risk Center"])

@router.get("", response_model=RiskAssessmentResponse)
def get_risk_assessment(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = risk_service.assess_risk(current_user.id, db)
    return RiskAssessmentResponse(**result)
