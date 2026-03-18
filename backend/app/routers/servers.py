from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.server import Server
from app.schemas.server import ServerConnectResponse, ServerCreate, ServerResponse, ServerUpdate
from app.services.crypto import decrypt, encrypt

router = APIRouter()


def serialize_server(server: Server) -> ServerResponse:
    return ServerResponse(
        id=server.id,
        name=server.name,
        group=server.group,
        host=server.host,
        port=server.port,
        username=server.username,
        protocol=server.protocol,
        notes=server.notes,
        created_at=server.created_at,
        has_password=bool(server.password),
    )


def get_server_or_404(server_id: int, db: Session) -> Server:
    server = db.query(Server).filter(Server.id == server_id, Server.owner_id == 1).first()
    if not server:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Server not found')
    return server


@router.get('', response_model=list[ServerResponse])
def list_servers(
    group: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[ServerResponse]:
    query = db.query(Server).filter(Server.owner_id == 1)
    if group:
        query = query.filter(Server.group == group)
    servers = query.order_by(Server.created_at.desc()).all()
    return [serialize_server(server) for server in servers]


@router.get('/{server_id}', response_model=ServerResponse)
def get_server(server_id: int, db: Session = Depends(get_db)) -> ServerResponse:
    server = get_server_or_404(server_id, db)
    return serialize_server(server)


@router.get('/{server_id}/connect-url', response_model=ServerConnectResponse)
def get_server_connect_url(server_id: int, db: Session = Depends(get_db)) -> ServerConnectResponse:
    server = get_server_or_404(server_id, db)
    password = decrypt(server.password)
    query = urlencode(
        {
            'protocol': server.protocol,
            'host': server.host,
            'port': server.port,
            'user': server.username,
            'pass': password or '',
        }
    )

    return ServerConnectResponse(
        protocol=server.protocol,
        host=server.host,
        port=server.port,
        username=server.username,
        password=password,
        connect_url=f'telescope://connect?{query}',
    )


@router.post('', response_model=ServerResponse, status_code=status.HTTP_201_CREATED)
def create_server(payload: ServerCreate, db: Session = Depends(get_db)) -> ServerResponse:
    server = Server(
        name=payload.name,
        group=payload.group,
        host=payload.host,
        port=payload.port,
        username=payload.username,
        password=encrypt(payload.password),
        private_key=encrypt(payload.private_key),
        protocol=payload.protocol,
        notes=payload.notes,
        owner_id=1,
    )
    db.add(server)
    db.commit()
    db.refresh(server)
    return serialize_server(server)


@router.put('/{server_id}', response_model=ServerResponse)
def update_server(server_id: int, payload: ServerUpdate, db: Session = Depends(get_db)) -> ServerResponse:
    server = get_server_or_404(server_id, db)

    updates = payload.model_dump(exclude_unset=True)
    if 'password' in updates:
        updates['password'] = encrypt(updates['password'])
    if 'private_key' in updates:
        updates['private_key'] = encrypt(updates['private_key'])

    for field, value in updates.items():
        setattr(server, field, value)

    db.commit()
    db.refresh(server)
    return serialize_server(server)


@router.delete('/{server_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_server(server_id: int, db: Session = Depends(get_db)) -> None:
    server = get_server_or_404(server_id, db)

    db.delete(server)
    db.commit()
