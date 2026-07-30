from pydantic import BaseModel, Field


class GigRequest(BaseModel):
    title: str = Field(
        ...,
        min_length=5,
        max_length=150,
    )

    description: str = Field(
        ...,
        min_length=20,
        max_length=5000,
    )

    category: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )