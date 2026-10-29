from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.transactions import router as transactions_router
from app.routes.analytics import router as analytics_router
from app.routes.ai import router as ai_router
from app.routes.forecast import router as forecast_router
from app.routes.risk import router as risk_router
from app.routes.goals import router as goals_router
from app.routes.receipts import router as receipts_router
from app.routes.investments import router as investments_router
from app.routes.settings import router as settings_router

__all__ = [
    "auth_router",
    "dashboard_router",
    "transactions_router",
    "analytics_router",
    "ai_router",
    "forecast_router",
    "risk_router",
    "goals_router",
    "receipts_router",
    "investments_router",
    "settings_router",
]
