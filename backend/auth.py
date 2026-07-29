from fastapi import APIRouter, Header, HTTPException
from schemas.auth import SignupRequest, LoginRequest
from database import supabase, supabase_admin

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

async def get_current_user(
    authorization: str = Header(None),
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Not logged in",
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid token format",
        )

    token = authorization.removeprefix("Bearer ").strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Token is missing",
        )

    try:
        user_resp = supabase.auth.get_user(token)
        auth_user = user_resp.user

        if not auth_user:
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
            )

        profile = get_profile_by_user(auth_user)

        if not profile:
            raise HTTPException(
                status_code=404,
                detail="User profile not found",
            )

        return profile

    except HTTPException:
        raise

    except Exception as error:
        logger.exception("Authentication failed")

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        ) from error

def get_error_message(error, default_status=400):
    error_text = str(error).lower()

    if "email rate limit exceeded" in error_text:
        raise HTTPException(
            status_code=429,
            detail="Signup email rate limit exceeded. Please wait before trying again or use another email address."
        )

    if any(term in error_text for term in [
        "duplicate key value violates unique constraint",
        "already registered",
        "duplicate email",
        "user already registered",
        "email already exists",
    ]):
        raise HTTPException(
            status_code=400,
            detail="Email already in use. Please login or use a different email address."
        )

    if "invalid input syntax for type timestamp with time zone" in error_text:
        raise HTTPException(
            status_code=400,
            detail="Signup failed because the Supabase user table schema is rejecting the email value. Check that the user.email column is a text/varchar field and that any auth trigger inserts columns by name."
        )

    if default_status == 401 and any(term in error_text for term in [
        "invalid login credentials",
        "invalid email or password",
        "invalid password",
        "user not found",
        "invalid email",
    ]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    raise HTTPException(
        status_code=default_status,
        detail=(
            f"Authentication failed: {error_text}"
            if default_status == 401
            else f"Signup failed: {error_text}"
        )
    )


def get_bearer_token(authorization):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing access token")

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid access token")

    return token




def get_profile_by_user(auth_user):
    client = supabase_admin or supabase
    profile_response = client.table("user").select(
        "id,name,email,plan"
    ).eq("id", auth_user.id).limit(1).execute()

    if not profile_response.data:
        profile_response = client.table("user").select(
            "id,name,email,plan"
        ).eq("email", auth_user.email).limit(1).execute()

    if profile_response.data:
        return profile_response.data[0]

    default_profile = {
        "id": auth_user.id,
        "email": auth_user.email,
        "name": getattr(auth_user, "user_metadata", {}).get("name") or auth_user.email.split("@")[0],
        "plan": "free",
    }

    upsert_response = client.table("user").upsert(default_profile).execute()
    if upsert_response.error:
        print("PROFILE UPSERT ERROR:", upsert_response.error)
        raise HTTPException(
            status_code=500,
            detail="Failed to sync auth user to profile table"
        )

    return default_profile


def auth_email_exists(email: str) -> bool:
    """
    Check whether an email already exists in Supabase Auth.
    This function is internal and is not an API endpoint.
    """
    normalized_email = email.strip().lower()

    page = 1
    per_page = 1000

    while True:
        response = supabase_admin.auth.admin.list_users(
            page=page,
            per_page=per_page,
        )

        users = getattr(response, "users", response) or []

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
                status_code=409,
                detail=(
                    "This email is already registered. "
                    "Please log in or use another email."
                ),
            )

        if auth_email_exists(normalized_email):
            raise HTTPException(
                status_code=409,
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
                    }
                },
            }
        )

        if not response.user:
            raise HTTPException(
                status_code=400,
                detail="Unable to create account.",
            )

        user_id = str(response.user.id)

        profile_response = (
            supabase_admin
            .table("user")
            .insert(
                {
                    "id": user_id,
                    "name": normalized_name,
                    "email": normalized_email,
                    "plan": "free",
                }
            )
            .execute()
        )

        if not profile_response.data:
            raise HTTPException(
                status_code=500,
                detail="Account created, but profile setup failed.",
            )

        return {
            "message": "Account created successfully.",
            "access_token": (
                response.session.access_token
                if response.session
                else None
            ),
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
        get_error_message(error)@router.post("/signup")


def signup(user: SignupRequest):
    normalized_email = user.email.strip().lower()
    normalized_name = user.name.strip()

    try:
        # First check the application profile table.
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
                status_code=409,
                detail=(
                    "This email is already registered. "
                    "Please log in or use another email."
                ),
            )

        # Also check Supabase Auth because an Auth account
        # may exist even when the profile row is missing.
        if auth_email_exists(normalized_email):
            raise HTTPException(
                status_code=409,
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
                    }
                },
            }
        )

        if not response.user:
            raise HTTPException(
                status_code=400,
                detail="Unable to create account.",
            )

        user_id = str(response.user.id)

        profile_response = (
            supabase_admin
            .table("user")
            .insert(
                {
                    "id": user_id,
                    "name": normalized_name,
                    "email": normalized_email,
                    "plan": "free",
                }
            )
            .execute()
        )

        if not profile_response.data:
            raise HTTPException(
                status_code=500,
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
                "email": user.email,
                "password": user.password,
            }
        )

        profile = get_profile_by_user(response.user)

        return {
            "message": "Login successful",
            "access_token": response.session.access_token,
            "user": profile,
        }

    except Exception as e:
        get_error_message(e, default_status=401)



@router.get("/me")
def me(authorization: str | None = Header(default=None)):

    token = get_bearer_token(authorization)

    try:
        auth_response = supabase.auth.get_user(token)

        profile = get_profile_by_user(auth_response.user)

        return {
            "user": profile,
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired access token"
        )
