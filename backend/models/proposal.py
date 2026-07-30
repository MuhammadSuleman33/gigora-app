from typing import Literal

from pydantic import BaseModel, Field


class ProposalRequest(BaseModel):
    job_post: str = Field(
        ...,
        min_length=20,
        max_length=5000,
    )

    tone: Literal[
        "professional",
        "friendly",
        "confident",
        "persuasive",
    ] = "professional"

    skill: str = Field(
        ...,
        min_length=2,
        max_length=200,
    )

    platform: Literal[
        "Upwork",
        "Fiverr",
        "Freelancer",
        "Other",
    ] = "Upwork"

    length: Literal[
        "short",
        "medium",
        "long",
    ] = "medium"