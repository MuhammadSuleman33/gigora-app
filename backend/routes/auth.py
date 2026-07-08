from fastapi import APIRouter, HTTPException
from schemas.auth import SignupRequest, LoginRequest
from database import supabase

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


def get_error_message(error):
    error_text = str(error)

    if "email rate limit exceeded" in error_text.lower():
        raise HTTPException(
            status_code=429,
            detail="Signup email rate limit exceeded. Please wait before trying again or use another email address."
        )

    if "invalid input syntax for type timestamp with time zone" in error_text.lower():
        raise HTTPException(
            status_code=400,
            detail="Signup failed because the Supabase user table schema is rejecting the email value. Check that the user.email column is a text/varchar field and that any auth trigger inserts columns by name."
        )

    raise HTTPException(
        status_code=400,
        detail="Unable to complete signup. Please check your details and try again."
    )


@router.post("/signup")
def signup(user: SignupRequest):
    try:
        response = supabase.auth.sign_up(
            {
                "email": user.email,
                "password": user.password,
            }
        )

        user_id = response.user.id

        supabase.table("user").insert(
            {
                "id": user_id,
                "name": user.name,
                "email": user.email,
                "plan": "free",
            }
        ).execute()

        return {"message": "User registered successfully"}

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

        return {
            "message": "Login successful",
            "access_token": response.session.access_token,
            "user": response.user.email,
        }

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
