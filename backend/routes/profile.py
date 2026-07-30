import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status

from auth import get_current_user
from models.profile import ProfileRequest
from rate_limiter import limiter
from services.ai_service import analyze_profile
from services.usage_service import check_and_increment_usage
from utils.sanitizer import sanitize_text


logger = logging.getLogger(__name__)

router = APIRouter()

PROFILE_RATE_LIMIT = "20/minute"
MAX_PROFILE_TEXT_LENGTH = 5000


@router.post("/")
@limiter.limit(PROFILE_RATE_LIMIT)
def analyze_freelancer_profile(
    request: Request,
    data: ProfileRequest,
    user: dict = Depends(get_current_user),
):
    """Analyze and improve the authenticated user's freelancer profile."""
    profile_text = sanitize_text(
        data.profile_text,
        max_length=MAX_PROFILE_TEXT_LENGTH,
    )

    if not profile_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile text is required.",
        )

    usage = check_and_increment_usage(
        user["id"],
        user["plan"],
    )

    if not usage["allowed"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily request limit reached. Upgrade to Pro.",
        )

    try:
        result = analyze_profile(
            profile_text,
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
            "Profile analysis failed | user_id=%s",
            user.get("id"),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile analysis failed. Please try again.",
        ) from error