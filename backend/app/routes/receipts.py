import os
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Receipt, Transaction
from app.schemas.schemas import ReceiptResponse, ReceiptConfirmRequest
from app.utils.auth_utils import get_current_user
from app.services.receipt_service import receipt_service

router = APIRouter(prefix="/api/receipts", tags=["Receipt Scanner"])

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[ReceiptResponse])
def get_user_receipts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    receipts = db.query(Receipt).filter(
        Receipt.user_id == current_user.id
    ).order_by(Receipt.created_at.desc()).all()

    results = []
    for r in receipts:
        try:
            items = json.loads(r.items_json) if r.items_json else []
        except Exception:
            items = []
        results.append(ReceiptResponse(
            id=r.id,
            filename=r.filename,
            merchant=r.merchant,
            date=r.date,
            amount=r.amount,
            category=r.category,
            tax=r.tax,
            items=items,
            status=r.status,
            raw_text=r.raw_text,
            created_at=r.created_at
        ))
    return results

@router.post("/upload", response_model=ReceiptResponse)
async def upload_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    filename = file.filename or "receipt.jpg"
    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{filename}")

    # Save uploaded file
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    # Process with OCR service
    extracted = receipt_service.extract_from_image_or_file(file_path, filename)

    new_receipt = Receipt(
        user_id=current_user.id,
        filename=filename,
        merchant=extracted["merchant"],
        date=extracted["date"],
        amount=extracted["amount"],
        category=extracted["category"],
        tax=extracted["tax"],
        items_json=json.dumps(extracted["items"]),
        status="Pending",
        raw_text=extracted.get("raw_text", "")
    )
    db.add(new_receipt)
    db.commit()
    db.refresh(new_receipt)

    return ReceiptResponse(
        id=new_receipt.id,
        filename=new_receipt.filename,
        merchant=new_receipt.merchant,
        date=new_receipt.date,
        amount=new_receipt.amount,
        category=new_receipt.category,
        tax=new_receipt.tax,
        items=extracted["items"],
        status=new_receipt.status,
        raw_text=new_receipt.raw_text,
        created_at=new_receipt.created_at
    )

@router.post("/confirm")
def confirm_receipt(
    req: ReceiptConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    receipt = db.query(Receipt).filter(
        Receipt.id == req.receipt_id,
        Receipt.user_id == current_user.id
    ).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    # Update receipt
    receipt.merchant = req.merchant
    receipt.date = req.date
    receipt.amount = req.amount
    receipt.category = req.category
    receipt.status = "Confirmed"

    # Automatically create the corresponding Transaction in user ledger
    desc = f"{req.merchant} (Receipt #{receipt.id})"
    new_tx = Transaction(
        user_id=current_user.id,
        date=req.date,
        description=desc,
        amount=req.amount,
        type="Expense",
        category=req.category,
        payment_method=req.payment_method,
        notes=req.notes or f"Verified and created automatically from uploaded receipt #{receipt.id}"
    )
    db.add(new_tx)
    db.commit()

    return {
        "message": "Receipt confirmed and transaction created successfully!",
        "transaction_id": new_tx.id,
        "receipt_id": receipt.id
    }
