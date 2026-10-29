from typing import Dict, Any, List
from collections import defaultdict
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import Transaction
from app.ml.forecasting_model import forecaster

class ForecastingService:
    @staticmethod
    def get_forecast(user_id: int, db: Session) -> Dict[str, Any]:
        transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id
        ).order_by(Transaction.date.asc()).all()

        if not transactions:
            return forecaster._default_forecast()

        # Group by YYYY-MM
        monthly_map = defaultdict(lambda: {"income": 0.0, "expense": 0.0, "categories": defaultdict(float)})

        for t in transactions:
            # Parse date YYYY-MM-DD
            try:
                dt = datetime.strptime(t.date[:10], "%Y-%m-%d")
                month_key = dt.strftime("%b %Y")
            except Exception:
                month_key = "Recent"

            if t.type == "Income":
                monthly_map[month_key]["income"] += t.amount
            else:
                monthly_map[month_key]["expense"] += t.amount
                monthly_map[month_key]["categories"][t.category] += t.amount

        # Build list of chronological months
        monthly_data = []
        for m_key, data in monthly_map.items():
            monthly_data.append({
                "month": m_key,
                "income": data["income"] if data["income"] > 0 else 50000.0,
                "expense": data["expense"]
            })

        # If data has fewer than 2 months, provide baseline combined with current
        if len(monthly_data) < 2:
            return forecaster._default_forecast()

        forecast_result = forecaster.forecast_cash_flow(monthly_data)

        # Calculate category forecasts
        category_forecasts = []
        last_month_categories = list(monthly_map.values())[-1]["categories"]
        for cat, curr_val in sorted(last_month_categories.items(), key=lambda x: x[1], reverse=True)[:6]:
            # Simple trend projection for category
            pred_val = round(curr_val * (forecast_result["next_month_expense"] / max(1.0, monthly_data[-1]["expense"])), 2)
            pct = round(((pred_val - curr_val) / max(1.0, curr_val)) * 100, 1)
            category_forecasts.append({
                "category": cat,
                "current_month": curr_val,
                "predicted_next_month": pred_val,
                "change_pct": pct
            })

        forecast_result["category_forecasts"] = category_forecasts
        return forecast_result

forecasting_service = ForecastingService()
