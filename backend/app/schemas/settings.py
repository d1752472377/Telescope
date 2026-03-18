from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SettingsUpdate(BaseModel):
    api_base_url: str | None = None
    agent_download_url: str | None = None
    release_channel: str | None = None
    token: str | None = None


class SettingsResponse(BaseModel):
    id: int
    api_base_url: str | None = None
    agent_download_url: str | None = None
    release_channel: str | None = None
    token: str | None = None
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
