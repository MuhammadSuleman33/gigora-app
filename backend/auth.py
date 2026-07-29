import logging
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, status

from schemas.auth import SignupRequest, LoginRequest
from database import supabase, supabase_admin


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


def get_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing access token",
        )

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )

    return token.strip()


def get_profile_by_user(auth_user: Any) -> dict:
    """
    Read the user's application profile from the public user table.

    The plan must come from this table, not from Supabase Auth metadata,
    because Stripe updates public.user.plan.
    """
    if not auth_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authenticated user",
        )

    user_id = str(auth_user.id)
    email = str(auth_user.email or "").strip().lower()

    try:
        profile_response = (
            supabase_admin
            .table("user")
            .select("id,name,email,plan")
            .eq("id", user_id)
            .limit(1)
            .execute()
        )

        if not profile_response.data and email:
            profile_response = (
                supabase_admin
                .table("user")
                .select("id,name,email,plan")
                .eq("email", email)
                .limit(1)
                .execute()
            )

        if profile_response.data:
            profile = profile_response.data[0]

            return {
                "id": str(profile["id"]),
                "name": profile.get("name", ""),
                "email": profile.get("email", email),
                "plan": profile.get("plan", "free"),
            }

        metadata = getattr(auth_user, "user_metadata", {}) or {}

        default_profile = {
            "id": user_id,
            "email": email,
            "name": (
                metadata.get("name")
                or email.split("@")[0]
                or "User"
            ),
            "plan": "free",
        }

        upsert_response = (
            supabase_admin
            .table("user")
            .upsert(
                default_profile,
                on_conflict="id",
            )
            .execute()
        )

        if not upsert_response.data:
            logger.error(
                "Profile synchronization returned no data | user_id=%s",
                user_id,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to sync user profile",
            )

        profile = upsert_response.data[0]

        return {
            "id": str(profile["id"]),
            "name": profile.get("name", default_profile["name"]),
            "email": profile.get("email", email),
            "plan": profile.get("plan", "free"),
        }

    except HTTPException:
        raise

    except Exception as error:
        logger.exception(
            "Failed to load user profile | user_id=%s",
            user_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load user profile",
        ) from error


async def get_current_user(
    authorization: str | None = Header(default=None),
) -> dict:
    token = get_bearer_token(authorization)

    try:
        user_response = supabase.auth.get_user(token)
        auth_user = user_response.user

        if not auth_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        return get_profile_by_user(auth_user)

    except HTTPException:
        raise

    except Exception as error:
        logger.exception("Authentication failed")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from error


def get_error_message(
    error: Exception,
    default_status: int = 400,
) -> None:
    error_text = str(error).lower()

    if "email rate limit exceeded" in error_text:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "Signup email rate limit exceeded. "
                "Please wait before trying again or use another email address."
            ),
        )

    duplicate_terms = [
        "duplicate key value violates unique constraint",
        "already registered",
        "duplicate email",
        "user already registered",
        "email already exists",
    ]

    if any(term in error_text for term in duplicate_terms):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Email already in use. "
                "Please log in or use a different email address."
            ),
        )

    if (
        "invalid input syntax for type timestamp with time zone"
        in error_text
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "The Supabase user table is rejecting the email value. "
                "Ensure the user.email column uses text or varchar and "
                "that database triggers insert columns by name."
            ),
        )

    login_error_terms = [
        "invalid login credentials",
        "invalid email or password",
        "invalid password",
        "user not found",
        "invalid email",
    ]

    if (
        default_status == status.HTTP_401_UNAUTHORIZED
        and any(term in error_text for term in login_error_terms)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    logger.error(
        "Authentication operation failed | error=%s",
        error,
    )

    raise HTTPException(
        status_code=default_status,
        detail=(
            "Authentication failed."
            if default_status == status.HTTP_401_UNAUTHORIZED
            else "Signup failed."
        ),
    )


def auth_email_exists(email: str) -> bool:
    """
    Check whether an email exists in Supabase Auth.
    """
    normalized_email = email.strip().lower()

    page = 1
    per_page = 1000

    while True:
        response = supabase_admin.auth.admin.list_users(
            page=page,
            per_page=per_page,
        )

        users = getattr(response, "users", None) or []

        for existing_user in users:
            existing_email = getattr(
                existing_user,
                "email",
                None,
            )

            if (
                existing_email
                and existing_email.strip().lower()
                == normalized_email
            ):
                return True

        if len(users) < per_page:
            break

        page += 1

    return False


@router.post("/signup")
def signup(user: SignupRequest):
    normalized_email = user.email.strip().lower()
    normalized_name = user.name.strip()

    if not normalized_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required.",
        )

    try:
        existing_profile = (
            supabase_admin
            .table("user")
            .select("id")
            .eq("email", normalized_email)
            .limit(1)
            .execute()
        )

        if existing_profile.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This email is already registered. "
                    "Please log in or use another email."
                ),
            )

        if auth_email_exists(normalized_email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This email is already registered. "
                    "Please log in or use another email."
                ),
            )

        response = supabase.auth.sign_up(
            {
                "email": normalized_email,
                "password": user.password,
                "options": {
                    "data": {
                        "name": normalized_name,
                        "plan": "free",
                    },
                },
            }
        )

        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to create account.",
            )

        user_id = str(response.user.id)

        profile_response = (
            supabase_admin
            .table("user")
            .upsert(
                {
                    "id": user_id,
                    "name": normalized_name,
                    "email": normalized_email,
                    "plan": "free",
                },
                on_conflict="id",
            )
            .execute()
        )

        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Account created, but profile setup failed.",
            )

        return {
            "message": "Account created successfully.",
            "access_token": (
                response.session.access_token
                if response.session
                else None
            ),
            "requires_email_confirmation": response.session is None,
            "user": {
                "id": user_id,
                "name": normalized_name,
                "email": normalized_email,
                "plan": "free",
            },
        }

    except HTTPException:
        raise

    except Exception as error:
        get_error_message(error)


@router.post("/login")
def login(user: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password(
            {
                "email": user.email.strip().lower(),
                "password": user.password,
            }
        )

        if not response.user or not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        profile = get_profile_by_user(response.user)

        return {
            "message": "Login successful",
            "access_token": response.session.access_token,
            "user": profile,
        }

    except HTTPException:
        raise

    except Exception as error:
        get_error_message(
            error,
            default_status=status.HTTP_401_UNAUTHORIZED,
        )


@router.get("/me")
async def me(
    current_user: dict = Depends(get_current_user),
):
    return {
        "user": current_user,
    }