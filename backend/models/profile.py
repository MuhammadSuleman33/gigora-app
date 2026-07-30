from pydantic import BaseModel, Field


class ProfileRequest(BaseModel):
    profile_text: str = Field(
        ...,
        min_length=20,
        max_length=5000,
    )