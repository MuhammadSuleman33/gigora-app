from fastapi import APIRouter, Depends
from pydantic import BaseModel

from services.ai_compare import compare_and_pick_best
from auth import get_current_user

class CompareRequest(BaseModel):
    job_post: str
    tone: str
    skill: str
    platform: str
    length: str

router = APIRouter(
    prefix="/api/proposal",
    tags=["AI Compare"]
)

@router.post("/compare")
def compare_proposals(
    data: CompareRequest,
    current_user=Depends(get_current_user)
):
    result = compare_and_pick_best(
        job_post=data.job_post,
        tone=data.tone,
        skill=data.skill
    )

    return result

