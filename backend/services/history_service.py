from database import supabase


def save_history(
    user_id,
    tool_name,
    input_data,
    output_data
):
    data = {
        "user_id": user_id,
        "tool_name": tool_name,
        "input_data": input_data,
        "output_data": output_data
    }

    return (
        supabase.table("history")
        .insert(data)
        .execute()
    )


def get_user_history(user_id):
    return (
        supabase.table("history")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )

def delete_history(
    history_id,
    user_id
):
    return (
        supabase.table("history")
        .delete()
        .eq("id", history_id)
        .eq("user_id", user_id)
        .execute()
    )

def get_history_stats(user_id):
    records = (
        supabase.table("history")
        .select("tool_name")
        .eq("user_id", user_id)
        .execute()
    )

    history = records.data

    stats = {
        "profile": 0,
        "proposal": 0,
        "seo": 0
    }

    for item in history:
        tool = item["tool_name"]

        if tool in stats:
            stats[tool] += 1

    return stats

