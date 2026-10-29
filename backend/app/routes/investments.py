from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Investment
from app.schemas.schemas import InvestmentCreate, InvestmentUpdate, InvestmentResponse
from app.utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/investments", tags=["Investments"])

ASSET_COLORS = {
    "Mutual Fund": "#3B82F6", # Blue
    "Stock": "#10B981",       # Emerald
    "FD": "#F59E0B",          # Amber
    "Gold": "#EAB308",        # Yellow
    "Others": "#8B5CF6"       # Purple
}

@router.get("")
def get_investments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).order_by(Investment.current_value.desc()).all()

    total_invested = sum(i.invested_amount for i in investments)
    total_current = sum(i.current_value for i in investments)
    total_gain = total_current - total_invested
    total_return_pct = round((total_gain / max(1.0, total_invested)) * 100, 2) if total_invested > 0 else 0.0

    # Build response items with calculated metrics
    items = []
    allocation_map: Dict[str, float] = {}

    for inv in investments:
        gain = inv.current_value - inv.invested_amount
        ret = round((gain / max(1.0, inv.invested_amount)) * 100, 2) if inv.invested_amount > 0 else 0.0
        allocation_map[inv.type] = allocation_map.get(inv.type, 0.0) + inv.current_value

        items.append(InvestmentResponse(
            id=inv.id,
            user_id=inv.user_id,
            name=inv.name,
            type=inv.type,
            invested_amount=inv.invested_amount,
            current_value=inv.current_value,
            purchase_date=inv.purchase_date,
            notes=inv.notes,
            gain_loss=round(gain, 2),
            return_percentage=ret,
            updated_at=inv.updated_at
        ))

    # Allocation donut data
    allocation = []
    for asset_type, val in allocation_map.items():
        allocation.append({
            "name": asset_type,
            "value": round(val, 2),
            "percentage": round((val / max(1.0, total_current)) * 100, 1),
            "color": ASSET_COLORS.get(asset_type, "#64748B")
        })

    return {
        "total_invested": round(total_invested, 2),
        "current_value": round(total_current, 2),
        "total_gain": round(total_gain, 2),
        "return_percentage": total_return_pct,
        "items": items,
        "allocation": allocation
    }

@router.post("", response_model=InvestmentResponse, status_code=status.HTTP_201_CREATED)
def create_investment(
    inv_data: InvestmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_inv = Investment(
        user_id=current_user.id,
        name=inv_data.name,
        type=inv_data.type,
        invested_amount=inv_data.invested_amount,
        current_value=inv_data.current_value,
        purchase_date=inv_data.purchase_date,
        notes=inv_data.notes
    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)

    gain = new_inv.current_value - new_inv.invested_amount
    ret = round((gain / max(1.0, new_inv.invested_amount)) * 100, 2)
    return InvestmentResponse(
        id=new_inv.id,
        user_id=new_inv.user_id,
        name=new_inv.name,
        type=new_inv.type,
        invested_amount=new_inv.invested_amount,
        current_value=new_inv.current_value,
        purchase_date=new_inv.purchase_date,
        notes=new_inv.notes,
        gain_loss=gain,
        return_percentage=ret,
        updated_at=new_inv.updated_at
    )

@router.put("/{inv_id}", response_model=InvestmentResponse)
def update_investment(
    inv_id: int,
    inv_data: InvestmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Investment).filter(
        Investment.id == inv_id,
        Investment.user_id == current_user.id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investment not found")

    update_dict = inv_data.dict(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(inv, k, v)

    db.commit()
    db.refresh(inv)

    gain = inv.current_value - inv.invested_amount
    ret = round((gain / max(1.0, inv.invested_amount)) * 100, 2)
    return InvestmentResponse(
        id=inv.id,
        user_id=inv.user_id,
        name=inv.name,
        type=inv.type,
        invested_amount=inv.invested_amount,
        current_value=inv.current_value,
        purchase_date=inv.purchase_date,
        notes=inv.notes,
        gain_loss=gain,
        return_percentage=ret,
        updated_at=inv.updated_at
    )

@router.delete("/{inv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investment(inv_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    inv = db.query(Investment).filter(
        Investment.id == inv_id,
        Investment.user_id == current_user.id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investment not found")

    db.delete(inv)
    db.commit()
    return None
