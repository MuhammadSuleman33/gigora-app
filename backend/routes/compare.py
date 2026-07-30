import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from auth import get_current_user
from rate_limiter import limiter
from services.ai_compare import compare_and_pick_best
from services.plan_service import require_pro
from services.usage_service import check_and_increment_usage
from utils.sanitizer import sanitize_text


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/proposal",
    tags=["AI Compare"],
)

COMPARE_RATE_LIMIT = "20/minute"

MAX_JOB_POST_LENGTH = 5000
MAX_TONE_LENGTH = 50
MAX_SKILL_LENGTH = 200


class CompareRequest(BaseModel):
    job_post: str
    tone: str
    skill: str
    platform: str
    length: str


@router.post("/compare")
@limiter.limit(COMPARE_RATE_LIMIT)
def compare_proposals(
    request: Request,
    data: CompareRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate proposals using multiple AI models and return the best one."""

    job_post = sanitize_text(
        data.job_post,
        max_length=MAX_JOB_POST_LENGTH,
    )

    tone = sanitize_text(
        data.tone,
        max_length=MAX_TONE_LENGTH,
    )

    skill = sanitize_text(
        data.skill,
        max_length=MAX_SKILL_LENGTH,
    )

    if not job_post:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job post is required.",
        )

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill is required.",
        )

    # AI Compare is a Pro feature
    require_pro(current_user)

    usage = check_and_increment_usage(
        current_user["id"],
        current_user["plan"],
    )

    if not usage["allowed"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily request limit reached. Upgrade to Pro.",
        )

    try:
        result = compare_and_pick_best(
            job_post=job_post,
            tone=tone,
            skill=skill,
        )

        return {
            "success": True,
            "data": result,
            "usage": usage,
        }

    except HTTPException:
        raise

    except Exception as error:
        logger.exception(
            "AI Compare failed | user_id=%s",
            current_user.get("id"),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI comparison failed. Please try again.",
        ) from error