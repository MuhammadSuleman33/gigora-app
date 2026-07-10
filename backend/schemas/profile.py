from pydantic import BaseModel
from typing import List


class ProfileRequest(BaseModel):
    profile_text: str


class ProfileResponse(BaseModel):
    score: int
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]