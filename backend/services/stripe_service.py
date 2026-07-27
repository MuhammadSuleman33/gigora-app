import os

import stripe
from dotenv import load_dotenv


load_dotenv()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "").rstrip("/")
PRICE_ID = os.getenv("STRIPE_PRICE_ID")

if not STRIPE_SECRET_KEY:
    raise RuntimeError("STRIPE_SECRET_KEY is missing.")

if not FRONTEND_URL:
    raise RuntimeError("FRONTEND_URL is missing.")

if not PRICE_ID:
    raise RuntimeError("STRIPE_PRICE_ID is missing.")

stripe.api_key = STRIPE_SECRET_KEY


def create_checkout_session(user):
    """
    Create a Stripe Checkout Session for Gigora Pro.
    """

    user_id = str(user.get("id", "")).strip()
    user_email = str(user.get("email", "")).strip()

    if not user_id:
        raise ValueError("User ID is missing.")

    if not user_email:
        raise ValueError("User email is missing.")

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="subscription",

        line_items=[
            {
                "price": PRICE_ID,
                "quantity": 1,
            }
        ],

        success_url=(
            f"{FRONTEND_URL}/payment-success"
            "?session_id={CHECKOUT_SESSION_ID}"
        ),

        cancel_url=f"{FRONTEND_URL}/payment-cancel",

        customer_email=user_email,

        client_reference_id=user_id,

        metadata={
            "user_id": user_id,
            "plan": "pro",
        },

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