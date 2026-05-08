from pydantic import BaseModel
from datetime import datetime

class Profiles(BaseModel):
    id: int
    created_at: datetime
    onboarded: bool


class UserStyle(BaseModel):
    id: int
    created_at: datetime
    style: dict
    genre: dict
    artist: dict

