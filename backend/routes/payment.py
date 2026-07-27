import logging
import os

import stripe
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request, status

from auth import get_current_user
from database import supabase_admin
from services.stripe_service import create_checkout_session


load_dotenv()

logger = logging.getLogger(__name__)

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

if not STRIPE_SECRET_KEY:
    raise RuntimeError("STRIPE_SECRET_KEY is missing.")

stripe.api_key = STRIPE_SECRET_KEY


router = APIRouter(
    prefix="/api/payment",
    tags=["Stripe Payment"],
)


@router.post("/create-checkout-session")
def checkout(current_user=Depends(get_current_user)):
    try:
        session = create_checkout_session(current_user)

        return {
            "success": True,
            "checkout_url": session["checkout_url"],
            "session_id": session["session_id"],
        }

    except HTTPException:
        raise

    except Exception as error:
        logger.exception(
            "Stripe checkout session creation failed for user %s",
            current_user.get("id"),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create checkout session.",
        ) from error


@router.get("/success")
def payment_success(session_id: str):
    """
    This endpoint confirms the redirect only.

    The user's plan is upgraded by the Stripe webhook,
    not by this success endpoint.
    """
    try:
        session = stripe.checkout.Session.retrieve(session_id)

    except stripe.error.StripeError as error:
        logger.exception(
            "Unable to retrieve Stripe session %s",
            session_id,
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to verify the payment session.",
        ) from error

    return {
        "success": session.get("payment_status") == "paid",
        "message": (
            "Payment completed successfully."
            if session.get("payment_status") == "paid"
            else "Payment has not been completed."
        ),
        "session_id": session.get("id"),
        "payment_status": session.get("payment_status"),
    }


@router.get("/cancel")
def payment_cancel():
    return {
        "success": False,
        "message": "Payment was cancelled.",
    }


@router.post("/cancel-subscription")
def cancel_subscription(
    current_user=Depends(get_current_user),
):
    """
    This changes the local Gigora plan to free.

    It does not cancel an active Stripe subscription.
    """
    try:
        response = (
            supabase_admin
            .table("user")
            .update({"plan": "free"})
            .eq("id", current_user["id"])
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found.",
            )

        return {
            "success": True,
            "message": "Plan changed to Free successfully.",
            "plan": "free",
        }

    except HTTPException:
        raise

    except Exception as error:
        logger.exception(
            "Failed to downgrade user %s",
            current_user.get("id"),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to change the subscription plan.",
        ) from error


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Receive Stripe webhook events and upgrade the user
    after a successfully paid Checkout Session.
    """
    if not STRIPE_WEBHOOK_SECRET:
        logger.error("STRIPE_WEBHOOK_SECRET is missing.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe webhook is not configured.",
        )

    payload = await request.body()
    signature = request.headers.get("stripe-signature")

    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature.",
        )

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=STRIPE_WEBHOOK_SECRET,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook payload.",
        ) from error

    except stripe.error.SignatureVerificationError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature.",
        ) from error

    # Ignore events that do not complete Checkout.
    if event["type"] != "checkout.session.completed":
        return {
            "received": True,
            "handled": False,
        }

    session = event["data"]["object"]

    payment_status = session.get("payment_status")

    if payment_status != "paid":
        logger.warning(
            "Checkout Session %s completed but payment status is %s",
            session.get("id"),
            payment_status,
        )

        return {
            "received": True,
            "handled": False,
            "reason": "Payment is not marked as paid.",
        }

    metadata = session.get("metadata") or {}

    user_id = (
        metadata.get("user_id")
        or session.get("client_reference_id")
    )

    plan = metadata.get("plan", "pro").lower()

    if not user_id:
        logger.error(
            "No user_id found in Checkout Session %s",
            session.get("id"),
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID is missing from Checkout Session.",
        )

    if plan != "pro":
        logger.error(
            "Invalid plan '%s' in Checkout Session %s",
            plan,
            session.get("id"),
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment plan.",
        )

    try:
        response = (
            supabase_admin
            .table("user")
            .update({"plan": "pro"})
            .eq("id", user_id)
            .execute()
        )

    except Exception as error:
        logger.exception(
            "Supabase upgrade failed for user %s",
            user_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to upgrade the user account.",
        ) from error

    if not response.data:
        logger.error(
            "No Supabase user matched ID %s",
            user_id,
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )

    logger.info(
        "User %s upgraded to Pro through Stripe Session %s",
        user_id,
        session.get("id"),
    )

    return {
        "received": True,
        "handled": True,
        "user_id": user_id,
        "plan": "pro",
    }