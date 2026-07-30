from typing import List

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="User's full name",
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User password",
    )


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="User password",
    )


class ProfileRequest(BaseModel):
    profile_text: str = Field(
        ...,
        min_length=20,
        max_length=5000,
        description="Freelancer profile description",
    )


class ProfileResponse(BaseModel):
    score: int
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]