from typing import List, Dict, Any
from datetime import datetime
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.models import Transaction, FinancialGoal, Investment

class InsightService:
    @staticmethod
    def generate_dynamic_insights(user_id: int, db: Session) -> List[str]:
        transactions = db.query(Transaction).filter(Transaction.user_id == user_id).order_by(Transaction.date.desc()).all()
        goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == user_id).all()
        investments = db.query(Investment).filter(Investment.user_id == user_id).all()

        if not transactions:
            return [
                "Welcome to FinSight AI! Add your initial income and expense transactions to unlock real-time predictive insights.",
                "Set up your financial emergency fund and investment tracking in the sidebar.",
                "Use our AI Transaction Categorization to classify your daily purchases automatically."
            ]

        insights: List[str] = []

        total_income = sum(t.amount for t in transactions if t.type == "Income")
        total_expense = sum(t.amount for t in transactions if t.type == "Expense")

        # 1. Savings Rate Insight
        if total_income > 0:
            savings = total_income - total_expense
            savings_rate = (savings / total_income) * 100
            if savings_rate > 30:
                insights.append(f"Your savings rate is {savings_rate:.0f}%, which comfortably exceeds the recommended 20% benchmark.")
            elif savings_rate > 15:
                insights.append(f"Your savings rate is {savings_rate:.0f}%. You could boost this to 30% by moderating dining out.")
            else:
                insights.append(f"Your current savings rate is {max(0, savings_rate):.0f}%. Increasing your monthly surplus will accelerate goal completion.")

        # 2. Category Breakdown & MoM changes
        monthly_category_expenses = defaultdict(lambda: defaultdict(float))
        for t in transactions:
            if t.type == "Expense":
                try:
                    dt = datetime.strptime(t.date[:10], "%Y-%m-%d")
                    m_key = dt.strftime("%Y-%m")
                except Exception:
                    m_key = "current"
                monthly_category_expenses[m_key][t.category] += t.amount

        sorted_months = sorted(monthly_category_expenses.keys())
        if len(sorted_months) >= 2:
            curr_m = sorted_months[-1]
            prev_m = sorted_months[-2]

            food_curr = monthly_category_expenses[curr_m].get("Food", 0)
            food_prev = monthly_category_expenses[prev_m].get("Food", 0)
            if food_prev > 0:
                food_diff_pct = ((food_curr - food_prev) / food_prev) * 100
                if abs(food_diff_pct) >= 5:
                    dir_str = "increased" if food_diff_pct > 0 else "decreased"
                    insights.append(f"Your food spending {dir_str} by {abs(food_diff_pct):.0f}% compared with last month.")

            trans_curr = monthly_category_expenses[curr_m].get("Transport", 0)
            trans_prev = monthly_category_expenses[prev_m].get("Transport", 0)
            if trans_curr > trans_prev and trans_prev > 0:
                insights.append("Your transportation spending is higher than your recent monthly average.")
        else:
            # Fallback realistic calculated insight from existing transactions
            cat_totals = defaultdict(float)
            for t in transactions:
                if t.type == "Expense":
                    cat_totals[t.category] += t.amount
            if cat_totals:
                top_cat = max(cat_totals.items(), key=lambda x: x[1])
                top_pct = (top_cat[1] / max(1.0, total_expense)) * 100
                insights.append(f"Your largest expenditure category is {top_cat[0]} ({top_pct:.0f}% of total outflow at ₹{top_cat[1]:,.0f}).")

        # 3. Weekend vs Weekday spending pattern
        weekend_spend = 0.0
        weekday_spend = 0.0
        weekend_days = 0
        weekday_days = 0
        for t in transactions:
            if t.type == "Expense":
                try:
                    dt = datetime.strptime(t.date[:10], "%Y-%m-%d")
                    if dt.weekday() >= 5:  # Saturday or Sunday
                        weekend_spend += t.amount
                        weekend_days += 1
                    else:
                        weekday_spend += t.amount
                        weekday_days += 1
                except Exception:
                    pass

        avg_weekend = weekend_spend / max(1, weekend_days)
        avg_weekday = weekday_spend / max(1, weekday_days)
        if avg_weekday > 0:
            diff_ratio = ((avg_weekend - avg_weekday) / avg_weekday) * 100
            if diff_ratio > 10:
                insights.append(f"Your weekend spending is {min(85, diff_ratio):.0f}% higher per transaction than weekday spending.")

        # 4. Emergency fund / investment insight
        if investments:
            tot_invested = sum(i.invested_amount for i in investments)
            tot_curr = sum(i.current_value for i in investments)
            gain = tot_curr - tot_invested
            ret_pct = (gain / tot_invested * 100) if tot_invested > 0 else 0
            if ret_pct > 0:
                insights.append(f"Your investment portfolio shows positive growth with an overall return of +{ret_pct:.1f}%.")

        if len(insights) < 3:
            insights.append("Automating recurring bill payments before the 5th avoids late fee surcharges.")

        return insights[:5]

insight_service = InsightService()
