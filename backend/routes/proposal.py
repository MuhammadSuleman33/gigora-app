import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status

from auth import get_current_user
from models.proposal import ProposalRequest
from rate_limiter import limiter
from services.ai_compare import compare_and_pick_best
from services.ai_service import generate_proposal
from services.plan_service import require_pro
from services.usage_service import check_and_increment_usage
from utils.sanitizer import sanitize_text


logger = logging.getLogger(__name__)

router = APIRouter()

PROPOSAL_RATE_LIMIT = "20/minute"

MAX_JOB_POST_LENGTH = 5000
MAX_TONE_LENGTH = 50
MAX_SKILL_LENGTH = 200
MAX_PLATFORM_LENGTH = 50
MAX_PROPOSAL_LENGTH_VALUE = 20


def sanitize_proposal_input(data: ProposalRequest) -> dict:
    """Sanitize and normalize proposal request fields."""
    return {
        "job_post": sanitize_text(
            data.job_post,
            max_length=MAX_JOB_POST_LENGTH,
        ),
        "tone": sanitize_text(
            data.tone,
            max_length=MAX_TONE_LENGTH,
        ),
        "skill": sanitize_text(
            data.skill,
            max_length=MAX_SKILL_LENGTH,
        ),
        "platform": sanitize_text(
            data.platform,
            max_length=MAX_PLATFORM_LENGTH,
        ),
        "length": sanitize_text(
            data.length,
            max_length=MAX_PROPOSAL_LENGTH_VALUE,
        ),
    }


def validate_proposal_input(cleaned_data: dict) -> None:
    """Validate required proposal fields after sanitization."""
    if not cleaned_data["job_post"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job post is required.",
        )

    if not cleaned_data["skill"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill is required.",
        )


def get_usage_or_raise(user: dict) -> dict:
    """Check usage and reject requests when the daily limit is reached."""
    usage = check_and_increment_usage(
        user["id"],
        user["plan"],
    )

    if not usage["allowed"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily request limit reached. Upgrade to Pro.",
        )

    return usage


@router.post("")
@limiter.limit(PROPOSAL_RATE_LIMIT)
def generate_ai_proposal(
    request: Request,
    data: ProposalRequest,
    user: dict = Depends(get_current_user),
):
    """Generate a personalized proposal for a freelance job post."""
    cleaned_data = sanitize_proposal_input(data)
    validate_proposal_input(cleaned_data)

    usage = get_usage_or_raise(user)

    try:
        result = generate_proposal(
            cleaned_data["job_post"],
            cleaned_data["tone"],
            cleaned_data["skill"],
            cleaned_data["platform"],
            cleaned_data["length"],
            user,
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
            "Proposal generation failed | user_id=%s",
            user.get("id"),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Proposal generation failed. Please try again.",
        ) from error


@router.post("/compare")
@limiter.limit(PROPOSAL_RATE_LIMIT)
def compare_ai_proposals(
    request: Request,
    data: ProposalRequest,
    user: dict = Depends(get_current_user),
):
    """Generate and compare proposals from multiple AI models."""
    cleaned_data = sanitize_proposal_input(data)
    validate_proposal_input(cleaned_data)

    require_pro(user)

    usage = get_usage_or_raise(user)

    try:
        result = compare_and_pick_best(
            job_post=cleaned_data["job_post"],
            tone=cleaned_data["tone"],
            skill=cleaned_data["skill"],
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
            "AI proposal comparison failed | user_id=%s",
            user.get("id"),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI proposal comparison failed. Please try again.",
        ) from error