from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.settings import Settings
from app.schemas.settings import SettingsResponse, SettingsUpdate

router = APIRouter()


def get_or_create_settings(db: Session) -> Settings:
    settings = db.query(Settings).filter(Settings.owner_id == 1).first()
    if settings:
        return settings

    settings = Settings(owner_id=1)
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


@router.get('', response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)) -> Settings:
    return get_or_create_settings(db)


@router.put('', response_model=SettingsResponse)
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)) -> Settings:
    settings = get_or_create_settings(db)

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings
