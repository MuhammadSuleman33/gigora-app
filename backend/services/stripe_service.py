import os
import stripe
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

FRONTEND_URL = os.getenv("FRONTEND_URL")
PRICE_ID = os.getenv("STRIPE_PRICE_ID")


def create_checkout_session(user):
    """
    Creates a Stripe Checkout Session for Gigora Pro.
    """

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],

        mode="subscription",

        line_items=[
            {
                "price": PRICE_ID,
                "quantity": 1,
            }
        ],

        success_url=f"{FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",

        cancel_url=f"{FRONTEND_URL}/payment-cancel",

        customer_email=user["email"],

        metadata={
            "user_id": user["id"],
            "plan": "pro",
        },
    )

    return {
        "checkout_url": session.url,
        "session_id": session.id,
    }