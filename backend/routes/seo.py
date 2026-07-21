from fastapi import APIRouter, Depends, HTTPException, Request
from models.seo import GigRequest
from auth import get_current_user
from services.ai_service import optimize_gig
from services.usage_service import check_and_increment_usage
from utils import sanitize_text
from rate_limiter import limiter

router = APIRouter()


@router.post("/")
@limiter.limit("20/minute")
def seo(
    request: Request,
    data: GigRequest,
    user=Depends(get_current_user)
):
    title = sanitize_text(data.title, "Title")
    description = sanitize_text(data.description, "Description")
    category = sanitize_text(data.category, "Category")

    usage = check_and_increment_usage(
        user["id"],
        user["plan"]
    )

    if not usage["allowed"]:
        raise HTTPException(
            status_code=429,
            detail="Daily limit reached. Upgrade to Pro."
        )

    result = optimize_gig(
        title,
        description,
        category,
        user
    )

    return {
        "success": True,
        "data": result,
        "usage": usage
    }