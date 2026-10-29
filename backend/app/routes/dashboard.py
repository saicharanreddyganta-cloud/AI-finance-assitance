from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from collections import defaultdict
from app.database import get_db
from app.models.models import User, Transaction
from app.schemas.schemas import DashboardSummaryResponse, CategorySpending, CashFlowPoint, TransactionResponse
from app.utils.auth_utils import get_current_user
from app.services.insight_service import insight_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

CATEGORY_COLORS = {
    "Food": "#F59E0B",          # Amber
    "Shopping": "#EC4899",      # Pink
    "Transport": "#3B82F6",     # Blue
    "Bills": "#8B5CF6",         # Purple
    "Entertainment": "#6366F1", # Indigo
    "Healthcare": "#10B981",    # Emerald
    "Education": "#14B8A6",     # Teal
    "Travel": "#0EA5E9",        # Sky
    "Other": "#64748B",         # Slate
    "Investment": "#A855F7"     # Violet
}

@router.get("", response_model=DashboardSummaryResponse)
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Greeting based on current hour
    hour = datetime.now().hour
    if hour < 12:
        period = "Good morning"
    elif hour < 17:
        period = "Good afternoon"
    else:
        period = "Good evening"

    first_name = current_user.full_name.split()[0] if current_user.full_name else "User"
    greeting = f"{period}, {first_name} 👋"

    # All user transactions ordered by date
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.date.desc()).all()

    # Group by month
    monthly_data = defaultdict(lambda: {"income": 0.0, "expense": 0.0, "categories": defaultdict(float)})
    for t in transactions:
        try:
            m_key = t.date[:7]  # YYYY-MM
        except Exception:
            m_key = "2026-06"
        
        if t.type == "Income":
            monthly_data[m_key]["income"] += t.amount
        else:
            monthly_data[m_key]["expense"] += t.amount
            monthly_data[m_key]["categories"][t.category] += t.amount

    sorted_months = sorted(monthly_data.keys())
    if sorted_months:
        curr_m = sorted_months[-1]
        prev_m = sorted_months[-2] if len(sorted_months) >= 2 else None
        
        curr_inc = monthly_data[curr_m]["income"]
        curr_exp = monthly_data[curr_m]["expense"]
        prev_inc = monthly_data[prev_m]["income"] if prev_m else curr_inc
        prev_exp = monthly_data[prev_m]["expense"] if prev_m else curr_exp
    else:
        curr_inc, curr_exp, prev_inc, prev_exp = 50000.0, 31500.0, 50000.0, 30500.0
        curr_m = "2026-06"

    curr_sav = curr_inc - curr_exp
    prev_sav = prev_inc - prev_exp
    balance = curr_sav  # Current month's retained balance

    # Calculate MoM percentage changes
    inc_change_pct = round(((curr_inc - prev_inc) / max(1.0, prev_inc)) * 100, 1) if prev_inc > 0 else 0.0
    exp_change_pct = round(((curr_exp - prev_exp) / max(1.0, prev_exp)) * 100, 1) if prev_exp > 0 else 0.0
    sav_change_pct = round(((curr_sav - prev_sav) / max(1.0, abs(prev_sav))) * 100, 1) if prev_sav != 0 else 0.0
    bal_change_pct = sav_change_pct

    # Spending by Category for current month
    curr_categories = monthly_data[curr_m]["categories"] if sorted_months else {}
    spending_by_category = []
    total_cat_exp = sum(curr_categories.values()) if curr_categories else curr_exp
    
    # Ensure known categories are present or populated
    for cat_name, amt in sorted(curr_categories.items(), key=lambda x: x[1], reverse=True):
        spending_by_category.append(CategorySpending(
            category=cat_name,
            amount=round(amt, 2),
            percentage=round((amt / max(1.0, total_cat_exp)) * 100, 1),
            color=CATEGORY_COLORS.get(cat_name, "#64748B")
        ))

    if not spending_by_category:
        # Default distribution for clean preview
        default_cats = [
            ("Food", 8200.0, 26.0),
            ("Shopping", 5670.0, 18.0),
            ("Transport", 3780.0, 12.0),
            ("Bills", 2150.0, 6.8),
            ("Entertainment", 2930.0, 9.3),
            ("Others", 8770.0, 27.9),
        ]
        for name, amt, pct in default_cats:
            spending_by_category.append(CategorySpending(
                category=name,
                amount=amt,
                percentage=pct,
                color=CATEGORY_COLORS.get(name, "#64748B")
            ))

    # Cash Flow Trend Line Chart (Last 6 Months: Jan, Feb, Mar, Apr, May, Jun)
    cash_flow_trend = []
    for m in sorted_months[-6:]:
        try:
            m_label = datetime.strptime(m, "%Y-%m").strftime("%B")
        except Exception:
            m_label = m
        d = monthly_data[m]
        cash_flow_trend.append(CashFlowPoint(
            month=m_label,
            income=d["income"],
            expense=d["expense"],
            savings=d["income"] - d["expense"]
        ))

    if not cash_flow_trend:
        sample_months = [("January", 50000, 29000), ("February", 50000, 31200), ("March", 50000, 30500), ("April", 50000, 30100), ("May", 50000, 32100), ("June", 50000, 31500)]
        for sm, inc, exp in sample_months:
            cash_flow_trend.append(CashFlowPoint(month=sm, income=inc, expense=exp, savings=inc - exp))

    # Recent Transactions (top 5)
    recent = transactions[:6]
    recent_transactions = [TransactionResponse.from_orm(t) for t in recent]

    # Dynamic Insights
    insights = insight_service.generate_dynamic_insights(current_user.id, db)

    return DashboardSummaryResponse(
        user_name=current_user.full_name,
        greeting=greeting,
        total_income=curr_inc,
        total_expenses=curr_exp,
        savings=curr_sav,
        current_balance=balance,
        income_change_pct=inc_change_pct,
        expense_change_pct=exp_change_pct,
        savings_change_pct=sav_change_pct,
        balance_change_pct=bal_change_pct,
        spending_by_category=spending_by_category,
        cash_flow_trend=cash_flow_trend,
        recent_transactions=recent_transactions,
        insights=insights
    )
