from datetime import date
from database import supabase_admin


def check_and_increment_usage(user_id: str, plan: str):
    today = str(date.today())

    # Unlimited requests for Pro users
    if plan.lower() == "pro":
        return {
            "allowed": True,
            "used": 0,
            "remaining": "Unlimited",
        }

    limit = 5

    try:
        result = (
            supabase_admin.table("usage")
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
                supabase_admin.table("usage")
                .update({"count": used})
                .eq("id", result.data[0]["id"])
                .execute()
            )
        else:
            (
                supabase_admin.table("usage")
                .insert(
                    {
                        "user_id": user_id,
                        "date": today,
                        "count": used,
                    }
                )
                .execute()
            )

        return {
            "allowed": True,
            "used": used,
            "remaining": limit - used,
        }

    except Exception as e:
        print(f"Usage Service Error: {e}")

        return {
            "allowed": False,
            "used": 0,
            "remaining": 0,
            "error": str(e),
        }