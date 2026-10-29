from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, UserSettings
from app.schemas.schemas import UserSettingsResponse, UserSettingsUpdate
from app.utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/settings", tags=["User Settings"])

@router.get("", response_model=UserSettingsResponse)
def get_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("", response_model=UserSettingsResponse)
def update_settings(
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    update_dict = settings_update.dict(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(settings, k, v)

    db.commit()
    db.refresh(settings)
    return settings

@router.put("/profile")
def update_profile(
    full_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not full_name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be blank")
    current_user.full_name = full_name.strip()
    db.commit()
    return {"message": "Profile updated successfully", "full_name": current_user.full_name}
