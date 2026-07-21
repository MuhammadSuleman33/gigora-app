from datetime import date
from database import supabase


def check_and_increment_usage(user_id: str, plan: str):
    today = str(date.today())

    limit = 999 if plan == "pro" else 5

    result = (
        supabase.table("usage")
        .select("id,count")
        .eq("user_id", user_id)
        .eq("date", today)
        .execute()
    )

    used = 0

    if result.data:
        used = result.data[0]["count"]

    if used >= limit:
        return {
            "allowed": False,
            "used": used,
            "remaining": 0,
        }

    used += 1

    if result.data:
        (
            supabase.table("usage")
            .update({"count": used})
            .eq("id", result.data[0]["id"])
            .execute()
        )
    else:
        (
            supabase.table("usage")
            .insert({
                "user_id": user_id,
                "date": today,
                "count": used,
            })
            .execute()
        )

    return {
        "allowed": True,
        "used": used,
        "remaining": limit - used,
    }