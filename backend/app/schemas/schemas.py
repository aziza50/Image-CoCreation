from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    id: int
    email: str
    created_at: datetime


class StyleCreate(BaseModel):
    name: str="default"

class StyleResponse(BaseModel):
    id: int
    user_id: int
    name: str
    vector: list[float] | None
    created_at: datetime

class GenerateRequest(BaseModel):
    style_id: int
    prompt: str = ""
    cfg_scale: float = 7.5
    denoising_strength: float = 0.75
    style_weight: float = 1.0

class GenerateResponse(BaseModel):
    id: int
    style_id: int
    user_id: int
    result_url: str
    params: dict
    reward: int | None
    created_at: datetime

class FeedbackRequest(BaseModel):
    #generation id is to connect feedback to a specific generation result
    generation_id: str
    reward: int

class FeedbackResponse(BaseModel):
    generation_id: str
    reward: int
