from fastapi import HTTPException


def require_pro(user):
    """
    Restrict a feature to Pro users only.
    """
    if user.get("plan") != "pro":
        raise HTTPException(
            status_code=403,
            detail="This feature is available only for Pro users."
        )