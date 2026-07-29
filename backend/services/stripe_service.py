import os
from typing import Any

import stripe
from dotenv import load_dotenv


load_dotenv()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "").strip()
FRONTEND_URL = os.getenv("FRONTEND_URL", "").strip().rstrip("/")
PRICE_ID = os.getenv("STRIPE_PRICE_ID", "").strip()

if not STRIPE_SECRET_KEY:
    raise RuntimeError("STRIPE_SECRET_KEY is missing.")

if not FRONTEND_URL:
    raise RuntimeError("FRONTEND_URL is missing.")

if not PRICE_ID:
    raise RuntimeError("STRIPE_PRICE_ID is missing.")

stripe.api_key = STRIPE_SECRET_KEY


def get_user_value(user: Any, field_name: str) -> str:
    """
    Extract a field from either a dictionary or an object.
    """
    if isinstance(user, dict):
        value = user.get(field_name)
    else:
        value = getattr(user, field_name, None)

    return str(value or "").strip()


def create_checkout_session(user: Any) -> dict:
    """
    Create a Stripe Checkout Session for the Gigora Pro subscription.
    """
    user_id = get_user_value(user, "id")
    user_email = get_user_value(user, "email")

    if not user_id:
        raise ValueError("User ID is missing.")

    if not user_email:
        raise ValueError("User email is missing.")

    session = stripe.checkout.Session.create(
        mode="subscription",

        payment_method_types=["card"],

        line_items=[
            {
                "price": PRICE_ID,
                "quantity": 1,
            }
        ],

        success_url=(
            f"{FRONTEND_URL}/payment-success"
            "?session_id={{CHECKOUT_SESSION_ID}}"
        ),

        cancel_url=(
            f"{FRONTEND_URL}/payment-cancel"
        ),

        customer_email=user_email,

        # Connect Stripe Checkout with your Supabase user.
        client_reference_id=user_id,

        # Metadata available on checkout.session.completed.
        metadata={
            "user_id": user_id,
            "plan": "pro",
        },

        # Metadata also saved on the Stripe Subscription.
        subscription_data={
            "metadata": {
                "user_id": user_id,
                "plan": "pro",
            }
        },
    )

    return {
        "checkout_url": session.url,
        "session_id": session.id,
    }