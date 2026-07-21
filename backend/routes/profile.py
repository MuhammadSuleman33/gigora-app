from fastapi import APIRouter, Depends, HTTPException, Request
from models.profile import ProfileRequest
from services.ai_service import analyze_profile
from services.usage_service import check_and_increment_usage
from auth import get_current_user
from utils import sanitize_text
from rate_limiter import limiter

router = APIRouter()


@router.post("/")
@limiter.limit("20/minute")
def profile(
    request: Request,
    data: ProfileRequest,
    user=Depends(get_current_user)
):
    profile_text = sanitize_text(data.profile_text, "Profile text")

    usage = check_and_increment_usage(
        user["id"],
        user["plan"]
    )

    if not usage["allowed"]:
        raise HTTPException(
            status_code=429,
            detail="Daily limit reached. Upgrade to Pro."
        )

    result = analyze_profile(
        profile_text,
        user
    )

    return {
        "success": True,
        "data": result,
        "usage": usage
    }