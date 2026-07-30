import logging
from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException,
    Request,
    status,
)

from database import supabase, supabase_admin
from rate_limiter import limiter
from schemas.auth import LoginRequest, SignupRequest
from utils.sanitizer import sanitize_text


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# -------------------------------------------------
# Configuration
# -------------------------------------------------

MAX_NAME_LENGTH = 100
MAX_EMAIL_LENGTH = 254

SIGNUP_RATE_LIMIT = "3/minute"
LOGIN_RATE_LIMIT = "5/minute"


# -------------------------------------------------
# Input normalization
# -------------------------------------------------

def normalize_email(email: str) -> str:
    """Sanitize and normalize an email address."""
    return sanitize_text(
        email,
        max_length=MAX_EMAIL_LENGTH,
    ).strip().lower()


def normalize_name(name: str) -> str:
    """Sanitize and normalize a user's display name."""
    return sanitize_text(
        name,
        max_length=MAX_NAME_LENGTH,
    ).strip()


# -------------------------------------------------
# Token helpers
# -------------------------------------------------

def get_bearer_token(authorization: str | None) -> str:
    """Extract and validate a Bearer token from the Authorization header."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing access token.",
        )

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token.",
        )

    return token.strip()


# -------------------------------------------------
# User profile helpers
# -------------------------------------------------

def format_profile(
    profile: dict,
    fallback_email: str = "",
    fallback_name: str = "",
) -> dict:
    """Return a consistent and sanitized user profile response."""
    return {
        "id": str(profile["id"]),
        "name": normalize_name(
            profile.get("name") or fallback_name or "User"
        ),
        "email": normalize_email(
            profile.get("email") or fallback_email
        ),
        "plan": profile.get("plan") or "free",
    }


def get_profile_by_user(auth_user: Any) -> dict:
    """
    Load the user's profile from the public user table.

    The subscription plan is read from public.user because Stripe updates
    that table instead of Supabase Auth metadata.
    """
    if not auth_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authenticated user.",
        )

    user_id = str(auth_user.id)
    email = normalize_email(str(auth_user.email or ""))

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
            return format_profile(
                profile_response.data[0],
                fallback_email=email,
            )

        metadata = getattr(auth_user, "user_metadata", {}) or {}

        default_name = normalize_name(
            metadata.get("name")
            or email.split("@")[0]
            or "User"
        )

        default_profile = {
            "id": user_id,
            "name": default_name,
            "email": email,
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
                detail="Failed to synchronize user profile.",
            )

        return format_profile(
            upsert_response.data[0],
            fallback_email=email,
            fallback_name=default_name,
        )

    except HTTPException:
        raise

    except Exception as error:
        logger.exception(
            "Failed to load user profile | user_id=%s",
            user_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load user profile.",
        ) from error


async def get_current_user(
    authorization: str | None = Header(default=None),
) -> dict:
    """Validate the access token and return the current user's profile."""
    token = get_bearer_token(authorization)

    try:
        user_response = supabase.auth.get_user(token)
        auth_user = user_response.user

        if not auth_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token.",
            )

        return get_profile_by_user(auth_user)

    except HTTPException:
        raise

    except Exception as error:
        logger.warning(
            "Authentication failed | error_type=%s",
            type(error).__name__,
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        ) from error


# -------------------------------------------------
# Authentication error handling
# -------------------------------------------------

def raise_auth_error(
    error: Exception,
    default_status: int = status.HTTP_400_BAD_REQUEST,
) -> None:
    """Convert Supabase authentication errors into safe API responses."""
    error_text = str(error).lower()

    if "email rate limit exceeded" in error_text:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "Signup email rate limit exceeded. "
                "Please wait before trying again."
            ),
        )

    duplicate_terms = (
        "duplicate key value violates unique constraint",
        "already registered",
        "duplicate email",
        "user already registered",
        "email already exists",
    )

    if any(term in error_text for term in duplicate_terms):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This email is already registered. "
                "Please log in or use another email address."
            ),
        )

    if "invalid input syntax for type timestamp with time zone" in error_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "The user profile could not be stored because of an "
                "invalid database column configuration."
            ),
        )

    login_error_terms = (
        "invalid login credentials",
        "invalid email or password",
        "invalid password",
        "user not found",
        "invalid email",
    )

    if (
        default_status == status.HTTP_401_UNAUTHORIZED
        and any(term in error_text for term in login_error_terms)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    logger.error(
        "Authentication operation failed | error_type=%s",
        type(error).__name__,
    )

    detail = (
        "Authentication failed."
        if default_status == status.HTTP_401_UNAUTHORIZED
        else "Signup failed."
    )

    raise HTTPException(
        status_code=default_status,
        detail=detail,
    )


# -------------------------------------------------
# Supabase Auth helpers
# -------------------------------------------------

def auth_email_exists(email: str) -> bool:
    """Check whether an email already exists in Supabase Auth."""
    normalized_email = normalize_email(email)

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
                and normalize_email(existing_email) == normalized_email
            ):
                return True

        if len(users) < per_page:
            return False

        page += 1


# -------------------------------------------------
# Routes
# -------------------------------------------------

@router.post("/signup")
@limiter.limit(SIGNUP_RATE_LIMIT)
def signup(
    request: Request,
    user: SignupRequest,
):
    """Create a new Supabase account and application profile."""
    normalized_email = normalize_email(user.email)
    normalized_name = normalize_name(user.name)

    if not normalized_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required.",
        )

    if not normalized_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required.",
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

        if existing_profile.data or auth_email_exists(normalized_email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This email is already registered. "
                    "Please log in or use another email address."
                ),
            )

        auth_response = supabase.auth.sign_up(
            {
                "email": normalized_email,
                # Do not sanitize or modify passwords.
                "password": user.password,
                "options": {
                    "data": {
                        "name": normalized_name,
                        "plan": "free",
                    },
                },
            }
        )

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to create account.",
            )

        user_id = str(auth_response.user.id)

        profile_data = {
            "id": user_id,
            "name": normalized_name,
            "email": normalized_email,
            "plan": "free",
        }

        profile_response = (
            supabase_admin
            .table("user")
            .upsert(
                profile_data,
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
                auth_response.session.access_token
                if auth_response.session
                else None
            ),
            "requires_email_confirmation": (
                auth_response.session is None
            ),
            "user": profile_data,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise_auth_error(error)


@router.post("/login")
@limiter.limit(LOGIN_RATE_LIMIT)
def login(
    request: Request,
    user: LoginRequest,
):
    """Authenticate a user using Supabase email and password."""
    normalized_email = normalize_email(user.email)

    if not normalized_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required.",
        )

    try:
        auth_response = supabase.auth.sign_in_with_password(
            {
                "email": normalized_email,
                # Do not sanitize or modify passwords.
                "password": user.password,
            }
        )

        if not auth_response.user or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        profile = get_profile_by_user(auth_response.user)

        return {
            "message": "Login successful.",
            "access_token": auth_response.session.access_token,
            "user": profile,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise_auth_error(
            error,
            default_status=status.HTTP_401_UNAUTHORIZED,
        )


@router.get("/me")
async def me(
    current_user: dict = Depends(get_current_user),
):
    """Return the authenticated user's current profile."""
    return {
        "user": current_user,
    }