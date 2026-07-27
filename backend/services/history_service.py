from typing import Any

from database import supabase_admin


def save_history(
    user_id: str,
    tool_name: str,
    input_data: Any,
    output_data: Any,
):
    """
    Save a tool result to the authenticated user's history.
    """
    record = {
        "user_id": user_id,
        "tool_name": tool_name,
        "input_data": input_data,
        "output_data": output_data,
    }

    response = (
        supabase_admin
        .table("history")
        .insert(record)
        .execute()
    )

    return response.data


def get_user_history(
    user_id: str,
    limit: int = 20,
):
    """
    Return the latest history records for one user.
    """
    response = (
        supabase_admin
        .table("history")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    return {
        "success": True,
        "data": response.data or [],
    }


def delete_user_history(
    history_id: int,
    user_id: str,
):
    """
    Delete a history record only when it belongs to the given user.
    """
    response = (
        supabase_admin
        .table("history")
        .delete()
        .eq("id", history_id)
        .eq("user_id", user_id)
        .execute()
    )

    return response.data


def get_history_stats(user_id: str):
    """
    Count history records by supported tool name.
    """
    response = (
        supabase_admin
        .table("history")
        .select("tool_name")
        .eq("user_id", user_id)
        .execute()
    )

    stats = {
        "profile": 0,
        "proposal": 0,
        "seo": 0,
        "compare": 0,
    }

    for item in response.data or []:
        tool_name = item.get("tool_name")

        if tool_name in stats:
            stats[tool_name] += 1

    return stats