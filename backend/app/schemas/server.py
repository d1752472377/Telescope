from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ServerBase(BaseModel):
    name: str
    group: str | None = None
    host: str
    port: int = 22
    username: str
    password: str | None = None
    private_key: str | None = None
    protocol: str = 'ssh'
    notes: str | None = None


class ServerCreate(ServerBase):
    pass


class ServerUpdate(BaseModel):
    name: str | None = None
    group: str | None = None
    host: str | None = None
    port: int | None = None
    username: str | None = None
    password: str | None = None
    private_key: str | None = None
    protocol: str | None = None
    notes: str | None = None


class ServerResponse(BaseModel):
    id: int
    name: str
    group: str | None = None
    host: str
    port: int
    username: str
    protocol: str
    notes: str | None = None
    created_at: datetime
    has_password: bool

    model_config = ConfigDict(from_attributes=True)


class ServerConnectResponse(BaseModel):
    protocol: str
    host: str
    port: int
    username: str
    password: str | None = None
    connect_url: str
