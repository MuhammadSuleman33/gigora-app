from fastapi import APIRouter, Header, HTTPException
from schemas.auth import SignupRequest, LoginRequest
from database import supabase, supabase_admin

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)



from fastapi import Header, HTTPException
from database import supabase


async def get_current_user(
    authorization: str = Header(None)
):
    print("AUTH HEADER:", authorization)

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Not logged in"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid token format"
        )

    token = authorization.replace("Bearer ", "")

    try:
        print("TOKEN:", token)

        user_resp = supabase.auth.get_user(token)
        print("USER RESPONSE:", user_resp)

        if not user_resp.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        profile = get_profile_by_user(user_resp.user)
        return profile

    except HTTPException:
        raise
    except Exception as e:
        print("ERROR:", e)

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


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


@router.post("/signup")

def signup(user: SignupRequest):
    
    try:
        response = supabase.auth.sign_up(
            {
                "email": user.email,
                "password": user.password,
                "options": {
                    "data": {
                        "name": user.name,
                        "plan": "free",
                    }
                },
            }
        )

        user_id = response.user.id

        client = supabase_admin or supabase
        client.table("user").upsert(
            {
                "id": user_id,
                "name": user.name,
                "email": user.email,
                "plan": "free",
            }
        ).execute()

        return {
            "message": "User registered successfully",
            "user": {
                "id": user_id,
                "name": user.name,
                "email": user.email,
                "plan": "free",
            },
        }

    except Exception as e:
        get_error_message(e)


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
    print("AUTH HEADER:", authorization)

    token = get_bearer_token(authorization)
    print("TOKEN:", token)

    try:
        auth_response = supabase.auth.get_user(token)
        print("AUTH RESPONSE:", auth_response)

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
