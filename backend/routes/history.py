from fastapi import APIRouter, Depends, HTTPException, status

from auth import get_current_user
from services.history_service import (
    delete_user_history,
    get_history_stats,
    get_user_history,
)

router = APIRouter()


@router.get("")
def history(current_user=Depends(get_current_user)):
    """
    Return the authenticated user's latest history records.

    Final endpoint:
    GET /api/history
    """
    try:
        return get_user_history(current_user["id"])
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load history.",
        ) from exc


# Keep the static route before /{history_id}
@router.get("/stats")
def stats(current_user=Depends(get_current_user)):
    """
    Return history totals for the authenticated user.

    Final endpoint:
    GET /api/history/stats
    """
    try:
        return get_history_stats(current_user["id"])
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load history statistics.",
        ) from exc


@router.delete("/{history_id}")
def delete(
    history_id: int,
    current_user=Depends(get_current_user),
):
    """
    Delete one history record belonging to the authenticated user.
    """
    try:
        deleted_record = delete_user_history(
            history_id=history_id,
            user_id=current_user["id"],
        )

        if not deleted_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="History record not found.",
            )

        return {
            "success": True,
            "message": "History record deleted successfully.",
            "data": deleted_record,
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete history record.",
        ) from exc