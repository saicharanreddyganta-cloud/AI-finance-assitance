from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.models import User, Transaction
from app.schemas.schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from app.utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("", response_model=dict)
def get_transactions(
    search: Optional[str] = None,
    category: Optional[str] = None,
    type: Optional[str] = None,
    sort_by: Optional[str] = "date",
    sort_order: Optional[str] = "desc",
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    # Search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Transaction.description.ilike(search_pattern),
                Transaction.notes.ilike(search_pattern),
                Transaction.category.ilike(search_pattern),
                Transaction.payment_method.ilike(search_pattern)
            )
        )

    # Category filter
    if category and category != "All":
        query = query.filter(Transaction.category == category)

    # Type filter (Income / Expense)
    if type and type != "All":
        query = query.filter(Transaction.type == type)

    # Total count for pagination
    total_count = query.count()

    # Sorting
    if sort_by == "amount":
        query = query.order_by(Transaction.amount.desc() if sort_order == "desc" else Transaction.amount.asc())
    else:
        query = query.order_by(Transaction.date.desc() if sort_order == "desc" else Transaction.date.asc(), Transaction.id.desc())

    # Pagination
    offset = (page - 1) * limit
    items = query.offset(offset).limit(limit).all()

    return {
        "items": [TransactionResponse.from_orm(item) for item in items],
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit
    }

@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    tx_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_tx = Transaction(
        user_id=current_user.id,
        date=tx_data.date,
        description=tx_data.description,
        amount=tx_data.amount,
        type=tx_data.type,
        category=tx_data.category,
        payment_method=tx_data.payment_method,
        notes=tx_data.notes
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx

@router.get("/{tx_id}", response_model=TransactionResponse)
def get_transaction(tx_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.put("/{tx_id}", response_model=TransactionResponse)
def update_transaction(
    tx_id: int,
    tx_update: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_data = tx_update.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(tx, field, val)

    db.commit()
    db.refresh(tx)
    return tx

@router.delete("/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(tx_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(tx)
    db.commit()
    return None
