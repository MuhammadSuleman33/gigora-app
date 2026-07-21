from fastapi import APIRouter
from fastapi import Depends
from services.history_service import (
    get_user_history,
    delete_history,
    get_history_stats
)
from auth import get_current_user

router = APIRouter()


@router.get("/")
def history(
    current_user=Depends(get_current_user)
):
    return get_user_history(
        current_user["id"]
    )


@router.delete("/{history_id}")
def delete(
    history_id: int,
    current_user=Depends(get_current_user)
):
    return delete_history(
        history_id,
        current_user["id"]
    )


@router.get("/stats")
def stats(
    current_user=Depends(get_current_user)
):
    return get_history_stats(
        current_user["id"]
    )


