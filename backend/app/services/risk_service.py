from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import Transaction, Investment, FinancialGoal, UserSettings

class RiskService:
    @staticmethod
    def assess_risk(user_id: int, db: Session) -> Dict[str, Any]:
        transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()
        investments = db.query(Investment).filter(Investment.user_id == user_id).all()
        goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == user_id).all()
        settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()

        # Calculate income and expenses
        total_income = sum(t.amount for t in transactions if t.type == "Income")
        total_expense = sum(t.amount for t in transactions if t.type == "Expense")

        # Fallback realistic defaults if new user without data
        if total_income <= 0:
            total_income = 50000.0
        if total_expense <= 0:
            total_expense = 31500.0

        savings = total_income - total_expense
        savings_rate = (savings / total_income) * 100

        # Discretionary spending: Food, Shopping, Entertainment
        discretionary_categories = {"Food", "Shopping", "Entertainment", "Travel"}
        discretionary_total = sum(t.amount for t in transactions if t.type == "Expense" and t.category in discretionary_categories)
        discretionary_pct = (discretionary_total / total_expense) * 100 if total_expense > 0 else 40.0

        # Debt/EMI estimate: Bills and loans
        debt_total = sum(t.amount for t in transactions if t.type == "Expense" and t.category == "Bills" and any(k in t.description.lower() for k in ["emi", "loan", "card", "credit"]))
        if debt_total == 0:
            # Check general bill ratio
            bills_total = sum(t.amount for t in transactions if t.type == "Expense" and t.category == "Bills")
            debt_pct = (bills_total * 0.4 / total_income) * 100
        else:
            debt_pct = (debt_total / total_income) * 100

        # Total liquid assets / emergency funds
        total_investments = sum(inv.current_value for inv in investments)
        emergency_goals = sum(g.current_amount for g in goals if "emergency" in g.name.lower())
        liquid_buffer = emergency_goals + (total_investments * 0.4) + max(0, savings)
        monthly_burn = total_expense if total_expense > 0 else 30000.0
        emergency_months = round(liquid_buffer / monthly_burn, 1)

        indicators: List[Dict[str, Any]] = []
        score_penalty = 0

        # 1. Spending Risk
        if discretionary_pct > 55:
            spend_level = "High"
            spend_color = "#EF4444"
            spend_reason = f"Discretionary spending represents {discretionary_pct:.1f}% of your monthly expenses."
            spend_metric = f"{discretionary_pct:.1f}% Discretionary Ratio (Safe benchmark < 40%)"
            spend_action = "Trim non-essential dining and e-commerce shopping by ₹3,000 to improve margin."
            score_penalty += 25
        elif discretionary_pct > 38:
            spend_level = "Medium"
            spend_color = "#F59E0B"
            spend_reason = f"Discretionary spending is moderate at {discretionary_pct:.1f}% of total outflow."
            spend_metric = f"{discretionary_pct:.1f}% Discretionary Ratio"
            spend_action = "Review weekly shopping carts and streaming subscriptions for minor optimizations."
            score_penalty += 10
        else:
            spend_level = "Low"
            spend_color = "#10B981"
            spend_reason = "Disciplined allocation between essential needs and lifestyle wants."
            spend_metric = f"{discretionary_pct:.1f}% Discretionary Ratio (Optimal)"
            spend_action = "Maintain your current spending discipline across food and retail categories."

        indicators.append({
            "name": "Spending Risk",
            "level": spend_level,
            "color": spend_color,
            "reason": spend_reason,
            "supporting_metric": spend_metric,
            "suggested_action": spend_action
        })

        # 2. Savings Risk
        if savings_rate < 15:
            sav_level = "High"
            sav_color = "#EF4444"
            sav_reason = f"Current savings rate of {savings_rate:.1f}% falls below the minimum 20% benchmark."
            sav_metric = f"{savings_rate:.1f}% Savings Rate"
            sav_action = "Automate a standing transfer of 10% income into savings immediately on salary day."
            score_penalty += 30
        elif savings_rate < 28:
            sav_level = "Medium"
            sav_color = "#F59E0B"
            sav_reason = f"Savings rate of {savings_rate:.1f}% is healthy but has headroom to reach target 35%."
            sav_metric = f"{savings_rate:.1f}% Savings Rate"
            sav_action = "Gradually scale systematic monthly investments by 5% over the next quarter."
            score_penalty += 12
        else:
            sav_level = "Low"
            sav_color = "#10B981"
            sav_reason = f"Excellent savings discipline. You are saving {savings_rate:.1f}% of gross income."
            sav_metric = f"{savings_rate:.1f}% Savings Rate (Top Quartile)"
            sav_action = "Direct surplus monthly savings into equity index funds or high-yield instruments."

        indicators.append({
            "name": "Savings Risk",
            "level": sav_level,
            "color": sav_color,
            "reason": sav_reason,
            "supporting_metric": sav_metric,
            "suggested_action": sav_action
        })

        # 3. Debt Risk
        if debt_pct > 40:
            debt_level = "High"
            debt_color = "#EF4444"
            debt_reason = f"Debt-to-income ratio ({debt_pct:.1f}%) exceeds recommended 35% safety ceiling."
            debt_metric = f"{debt_pct:.1f}% Debt-to-Income"
            debt_action = "Prioritize clearing high-interest credit card balance using debt avalanche strategy."
            score_penalty += 25
        elif debt_pct > 20:
            debt_level = "Medium"
            debt_color = "#F59E0B"
            debt_reason = f"Moderate debt servicing commitments at {debt_pct:.1f}% of monthly income."
            debt_metric = f"{debt_pct:.1f}% Debt Obligation"
            debt_action = "Avoid taking on new consumer installment loans until existing liabilities decline."
            score_penalty += 10
        else:
            debt_level = "Low"
            debt_color = "#10B981"
            debt_reason = "Estimated EMI and debt burden is well within safe thresholds."
            debt_metric = f"{debt_pct:.1f}% Debt-to-Income (Safe < 30%)"
            debt_action = "Continue paying balances in full each month before due dates."

        indicators.append({
            "name": "Debt Risk",
            "level": debt_level,
            "color": debt_color,
            "reason": debt_reason,
            "supporting_metric": debt_metric,
            "suggested_action": debt_action
        })

        # 4. Emergency Fund Risk
        if emergency_months < 3:
            emg_level = "High" if emergency_months < 1.5 else "Medium"
            emg_color = "#EF4444" if emergency_months < 1.5 else "#F59E0B"
            emg_reason = f"Liquid reserve covers only approximately {emergency_months:.1f} months of expenses."
            emg_metric = f"{emergency_months:.1f} Months Coverage (Target: 6 months)"
            emg_action = "Build emergency buffer to at least 3-6 months of recurring living expenses."
            score_penalty += 20 if emergency_months < 1.5 else 10
        elif emergency_months < 6:
            emg_level = "Medium"
            emg_color = "#F59E0B"
            emg_reason = f"Emergency fund currently covers approximately {emergency_months:.1f} months."
            emg_metric = f"{emergency_months:.1f} Months Coverage"
            emg_action = "Keep steadily contributing ₹2,000 - ₹5,000 monthly toward the 6-month safety net."
            score_penalty += 5
        else:
            emg_level = "Low"
            emg_color = "#10B981"
            emg_reason = f"Strong financial cushion with {emergency_months:.1f} months of living expenses secured."
            emg_metric = f"{emergency_months:.1f} Months Coverage (Secure)"
            emg_action = "Maintain emergency funds in high-yield liquid mutual funds or auto-sweep fixed deposits."

        indicators.append({
            "name": "Emergency Fund Risk",
            "level": emg_level,
            "color": emg_color,
            "reason": emg_reason,
            "supporting_metric": emg_metric,
            "suggested_action": emg_action
        })

        overall_score = max(35, min(95, 100 - score_penalty))
        if overall_score >= 80:
            overall_status = "Healthy – Low Risk"
        elif overall_score >= 60:
            overall_status = "Moderate – Watch List"
        else:
            overall_status = "Vulnerable – High Risk"

        return {
            "overall_score": overall_score,
            "overall_status": overall_status,
            "indicators": indicators,
            "updated_at": datetime.utcnow().strftime("%d %b %Y, %I:%M %p")
        }

risk_service = RiskService()
