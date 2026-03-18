from datetime import datetime

from pydantic import BaseModel, ConfigDict


class VPNBase(BaseModel):
    name: str
    provider: str | None = None
    server_address: str
    username: str | None = None
    password: str | None = None
    client: str | None = None
    notes: str | None = None


class VPNCreate(VPNBase):
    pass


class VPNUpdate(BaseModel):
    name: str | None = None
    provider: str | None = None
    server_address: str | None = None
    username: str | None = None
    password: str | None = None
    client: str | None = None
    notes: str | None = None


class VPNResponse(VPNBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
