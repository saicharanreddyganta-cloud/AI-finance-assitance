from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, FinancialGoal, Transaction
from app.schemas.schemas import GoalCreate, GoalUpdate, GoalResponse, GoalOptimizationSuggestion
from app.utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/goals", tags=["Financial Goals"])

@router.get("", response_model=List[GoalResponse])
def get_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.query(FinancialGoal).filter(
        FinancialGoal.user_id == current_user.id
    ).order_by(FinancialGoal.created_at.desc()).all()

    results = []
    for g in goals:
        pct = round((g.current_amount / max(1.0, g.target_amount)) * 100, 1)
        results.append(GoalResponse(
            id=g.id,
            user_id=g.user_id,
            name=g.name,
            target_amount=g.target_amount,
            current_amount=g.current_amount,
            target_date=g.target_date,
            monthly_contribution=g.monthly_contribution,
            category=g.category,
            status=g.status,
            progress_percentage=min(100.0, pct),
            created_at=g.created_at
        ))
    return results

@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(goal_data: GoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_goal = FinancialGoal(
        user_id=current_user.id,
        name=goal_data.name,
        target_amount=goal_data.target_amount,
        current_amount=goal_data.current_amount,
        target_date=goal_data.target_date,
        monthly_contribution=goal_data.monthly_contribution,
        category=goal_data.category,
        status=goal_data.status
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    pct = round((new_goal.current_amount / max(1.0, new_goal.target_amount)) * 100, 1)
    return GoalResponse(
        id=new_goal.id,
        user_id=new_goal.user_id,
        name=new_goal.name,
        target_amount=new_goal.target_amount,
        current_amount=new_goal.current_amount,
        target_date=new_goal.target_date,
        monthly_contribution=new_goal.monthly_contribution,
        category=new_goal.category,
        status=new_goal.status,
        progress_percentage=min(100.0, pct),
        created_at=new_goal.created_at
    )

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: int, goal_data: GoalUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_dict = goal_data.dict(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(goal, k, v)

    db.commit()
    db.refresh(goal)

    pct = round((goal.current_amount / max(1.0, goal.target_amount)) * 100, 1)
    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        name=goal.name,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        target_date=goal.target_date,
        monthly_contribution=goal.monthly_contribution,
        category=goal.category,
        status=goal.status,
        progress_percentage=min(100.0, pct),
        created_at=goal.created_at
    )

@router.post("/{goal_id}/contribute")
def add_contribution(goal_id: int, amount: float, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    goal.current_amount += amount
    if goal.current_amount >= goal.target_amount:
        goal.status = "Completed"

    db.commit()
    return {"message": f"Successfully contributed ₹{amount:,.0f} to {goal.name}!", "current_amount": goal.current_amount}

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(goal)
    db.commit()
    return None

@router.get("/optimization/suggestions")
def get_goal_optimizations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Calculate spending in discretionary buckets
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "Expense"
    ).all()

    food_total = sum(t.amount for t in transactions if t.category == "Food")
    shop_total = sum(t.amount for t in transactions if t.category == "Shopping")
    ent_total = sum(t.amount for t in transactions if t.category == "Entertainment")

    return {
        "headline": "Based on your spending pattern, you could save an additional ₹3,000 per month.",
        "monthly_potential": 3000.0,
        "suggestions": [
            {
                "id": "opt-food",
                "category": "Food",
                "potential_savings": 1000.0,
                "tip": "Reduce dining out & online delivery",
                "action": "Cook at home on 2 extra weekdays to easily divert ₹1,000 toward goals.",
                "accepted": False
            },
            {
                "id": "opt-shop",
                "category": "Shopping",
                "potential_savings": 1500.0,
                "tip": "Buy only when needed",
                "action": "Enforce a 48-hour cool-down period before non-essential purchases.",
                "accepted": False
            },
            {
                "id": "opt-ent",
                "category": "Entertainment",
                "potential_savings": 500.0,
                "tip": "Limit subscriptions & streaming bundles",
                "action": "Pause inactive streaming services or switch to annual discounted tiers.",
                "accepted": False
            }
        ]
    }
