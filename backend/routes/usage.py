from fastapi import APIRouter, Depends
from datetime import date
from database import supabase
from auth import get_current_user

router = APIRouter()


@router.get("/")
def get_usage(user=Depends(get_current_user)):
    today = str(date.today())

    result = (
        supabase.table("usage")
        .select("count")
        .eq("user_id", user["id"])
        .eq("date", today)
        .execute()
    )

    used = result.data[0]["count"] if result.data else 0

    limit = 999 if user["plan"] == "pro" else 5

    return {
        "plan": user["plan"],
        "requests_used": used,
        "requests_limit": limit,
        "remaining": limit - used,
    }