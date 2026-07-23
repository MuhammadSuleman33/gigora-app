from fastapi import APIRouter, Depends, HTTPException, Request
from models.proposal import ProposalRequest
from services.ai_service import generate_proposal
from services.usage_service import check_and_increment_usage
from auth import get_current_user
from utils import sanitize_text
from rate_limiter import limiter
from services.ai_compare import compare_and_pick_best
from services.plan_service import require_pro


router = APIRouter()


@router.post("/")
@limiter.limit("20/minute")
def proposal(
    request: Request,
    data: ProposalRequest,
    user=Depends(get_current_user)
):
    job_post = sanitize_text(data.job_post, "Job post")
    tone = sanitize_text(data.tone, "Tone")
    skill = sanitize_text(data.skill, "Skill")
    platform = sanitize_text(data.platform, "Platform")
    length = sanitize_text(data.length, "Length")

    # Check daily usage limit
    usage = check_and_increment_usage(
        user["id"],
        user["plan"]
    )

    if not usage["allowed"]:
        raise HTTPException(
            status_code=429,
            detail="Daily limit reached. Upgrade to Pro."
        )

    # Generate proposal
    result = generate_proposal(
        job_post,
        tone,
        skill,
        platform,
        length,
        user
    )

    return {
        "success": True,
        "data": result,
        "usage": usage
    }

@router.post("/compare")
@limiter.limit("20/minute")
def compare_proposals(
    request: Request,
    data: ProposalRequest,
    user=Depends(get_current_user)
):
    job_post = sanitize_text(data.job_post, "Job post")
    tone = sanitize_text(data.tone, "Tone")
    skill = sanitize_text(data.skill, "Skill")

    # Day 16: AI Comparison is Pro only
    require_pro(user)

    usage = check_and_increment_usage(
        user["id"],
        user["plan"]
    )

    if not usage["allowed"]:
        raise HTTPException(
            status_code=429,
            detail="Daily limit reached. Upgrade to Pro."
        )

    result = compare_and_pick_best(
        job_post=job_post,
        tone=tone,
        skill=skill
    )

    return {
        "success": True,
        "data": result,
        "usage": usage
    }