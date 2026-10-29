from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import ForecastResponse
from app.utils.auth_utils import get_current_user
from app.services.forecasting_service import forecasting_service

router = APIRouter(prefix="/api/forecast", tags=["Forecasting"])

@router.get("", response_model=ForecastResponse)
def get_forecast(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = forecasting_service.get_forecast(current_user.id, db)
    return ForecastResponse(
        next_month_expense=result["next_month_expense"],
        expected_savings=result["expected_savings"],
        confidence_score=result["confidence_score"],
        model_used=result["model_used"],
        trend_direction=result["trend_direction"],
        points=result["points"],
        category_forecasts=result.get("category_forecasts", []),
        insights=result["insights"]
    )
