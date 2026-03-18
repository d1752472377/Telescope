from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.vpn import VPN
from app.schemas.vpn import VPNCreate, VPNResponse, VPNUpdate
from app.services.crypto import encrypt

router = APIRouter()


@router.get('', response_model=list[VPNResponse])
def list_vpns(db: Session = Depends(get_db)) -> list[VPN]:
    return db.query(VPN).filter(VPN.owner_id == 1).order_by(VPN.created_at.desc()).all()


@router.get('/{vpn_id}', response_model=VPNResponse)
def get_vpn(vpn_id: int, db: Session = Depends(get_db)) -> VPN:
    vpn = db.query(VPN).filter(VPN.id == vpn_id, VPN.owner_id == 1).first()
    if not vpn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='VPN not found')
    return vpn


@router.post('', response_model=VPNResponse, status_code=status.HTTP_201_CREATED)
def create_vpn(payload: VPNCreate, db: Session = Depends(get_db)) -> VPN:
    vpn = VPN(
        name=payload.name,
        provider=payload.provider,
        server_address=payload.server_address,
        username=payload.username,
        password=encrypt(payload.password),
        client=payload.client,
        notes=payload.notes,
        owner_id=1,
    )
    db.add(vpn)
    db.commit()
    db.refresh(vpn)
    return vpn


@router.put('/{vpn_id}', response_model=VPNResponse)
def update_vpn(vpn_id: int, payload: VPNUpdate, db: Session = Depends(get_db)) -> VPN:
    vpn = db.query(VPN).filter(VPN.id == vpn_id, VPN.owner_id == 1).first()
    if not vpn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='VPN not found')

    updates = payload.model_dump(exclude_unset=True)
    if 'password' in updates:
        updates['password'] = encrypt(updates['password'])

    for field, value in updates.items():
        setattr(vpn, field, value)

    db.commit()
    db.refresh(vpn)
    return vpn


@router.delete('/{vpn_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_vpn(vpn_id: int, db: Session = Depends(get_db)) -> None:
    vpn = db.query(VPN).filter(VPN.id == vpn_id, VPN.owner_id == 1).first()
    if not vpn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='VPN not found')

    db.delete(vpn)
    db.commit()
