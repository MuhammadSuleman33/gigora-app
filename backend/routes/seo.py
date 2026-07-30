import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status

from auth import get_current_user
from models.seo import GigRequest
from rate_limiter import limiter
from services.ai_service import optimize_gig
from services.usage_service import check_and_increment_usage
from utils.sanitizer import sanitize_text


logger = logging.getLogger(__name__)

router = APIRouter()

SEO_RATE_LIMIT = "20/minute"

MAX_TITLE_LENGTH = 150
MAX_DESCRIPTION_LENGTH = 5000
MAX_CATEGORY_LENGTH = 100


@router.post("/")
@limiter.limit(SEO_RATE_LIMIT)
def optimize_freelance_gig(
    request: Request,
    data: GigRequest,
    user: dict = Depends(get_current_user),
):
    """Optimize a freelance gig title, description, tags, and SEO score."""
    title = sanitize_text(
        data.title,
        max_length=MAX_TITLE_LENGTH,
    )

    description = sanitize_text(
        data.description,
        max_length=MAX_DESCRIPTION_LENGTH,
    )

    category = sanitize_text(
        data.category,
        max_length=MAX_CATEGORY_LENGTH,
    )

    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gig title is required.",
        )

    if not description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gig description is required.",
        )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gig category is required.",
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
        result = optimize_gig(
            title,
            description,
            category,
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
            "Gig SEO optimization failed | user_id=%s",
            user.get("id"),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gig optimization failed. Please try again.",
        ) from error