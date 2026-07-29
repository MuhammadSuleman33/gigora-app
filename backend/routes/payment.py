import json
import logging
import os
from typing import Any

import stripe
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request, status

from auth import get_current_user
from database import supabase_admin
from services.stripe_service import create_checkout_session


load_dotenv()

logger = logging.getLogger(__name__)

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "").strip()
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()

if not STRIPE_SECRET_KEY:
    raise RuntimeError("STRIPE_SECRET_KEY is missing.")

stripe.api_key = STRIPE_SECRET_KEY


router = APIRouter(
    prefix="/api/payment",
    tags=["Stripe Payment"],
)


def get_user_id(current_user: Any) -> str | None:
    """
    Extract the authenticated user's ID from a dictionary,
    Pydantic model, or Supabase object.
    """
    if isinstance(current_user, dict):
        user_id = current_user.get("id")
    else:
        user_id = getattr(current_user, "id", None)

    return str(user_id) if user_id else None


def stripe_object_to_dict(stripe_object: Any) -> dict:
    """
    Convert a Stripe SDK object into a standard Python dictionary.
    """
    if stripe_object is None:
        return {}

    if isinstance(stripe_object, dict):
        return stripe_object

    if hasattr(stripe_object, "to_dict_recursive"):
        return stripe_object.to_dict_recursive()

    try:
        return dict(stripe_object)
    except (TypeError, ValueError):
        return {}


def upgrade_user_to_pro(user_id: str, session_id: str | None = None) -> dict:
    """
    Update the user's plan in the public user table.

    This function is safe to call more than once because setting the
    same plan value repeatedly does not create duplicate subscriptions.
    """
    try:
        response = (
            supabase_admin
            .table("user")
            .update({"plan": "pro"})
            .eq("id", str(user_id))
            .execute()
        )

    except Exception as error:
        logger.exception(
            "Supabase plan update failed | user_id=%s | session_id=%s",
            user_id,
            session_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to upgrade the user account.",
        ) from error

    if not response.data:
        logger.error(
            "No Supabase user matched the Stripe user ID | "
            "user_id=%s | session_id=%s",
            user_id,
            session_id,
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )

    logger.info(
        "User upgraded to Pro | user_id=%s | session_id=%s",
        user_id,
        session_id,
    )

    return response.data[0]


@router.post("/create-checkout-session")
def checkout(current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

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
            "Stripe Checkout Session creation failed | user_id=%s",
            user_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create checkout session.",
        ) from error


@router.get("/success")
def payment_success(session_id: str):
    """
    Confirm the Stripe payment and synchronize the user's Pro plan.

    The webhook remains the main payment handler. This endpoint also
    updates Supabase as a fallback when the webhook is delayed.
    """
    session_id = session_id.strip()

    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stripe Checkout Session ID is required.",
        )

    if not session_id.startswith(("cs_test_", "cs_live_")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Stripe Checkout Session ID.",
        )

    try:
        stripe_session = stripe.checkout.Session.retrieve(session_id)
        session = stripe_object_to_dict(stripe_session)

    except stripe.error.StripeError as error:
        logger.warning(
            "Unable to retrieve Stripe session | session_id=%s | error=%s",
            session_id,
            error,
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to verify the payment session.",
        ) from error

    payment_status = session.get("payment_status")
    is_paid = payment_status == "paid"

    metadata = session.get("metadata") or {}

    if not isinstance(metadata, dict):
        metadata = stripe_object_to_dict(metadata)

    user_id = (
        metadata.get("user_id")
        or session.get("client_reference_id")
    )

    plan = str(metadata.get("plan") or "pro").strip().lower()

    updated_user = None

    if is_paid:
        if not user_id:
            logger.error(
                "Paid Stripe session has no user ID | session_id=%s",
                session_id,
            )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID is missing from the payment session.",
            )

        if plan != "pro":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment plan.",
            )

        updated_user = upgrade_user_to_pro(
            user_id=str(user_id),
            session_id=session_id,
        )

    return {
        "success": is_paid,
        "message": (
            "Payment completed successfully and your account is now Pro."
            if is_paid
            else "Payment has not been completed."
        ),
        "session_id": session.get("id"),
        "payment_status": payment_status,
        "plan": (
            updated_user.get("plan", "pro")
            if updated_user
            else None
        ),
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
    Change the local Gigora plan to Free.

    This does not cancel an active recurring Stripe subscription.
    """
    user_id = get_user_id(current_user)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    try:
        response = (
            supabase_admin
            .table("user")
            .update({"plan": "free"})
            .eq("id", user_id)
            .execute()
        )

    except Exception as error:
        logger.exception(
            "Failed to downgrade user | user_id=%s",
            user_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to change the subscription plan.",
        ) from error

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )

    logger.info(
        "User changed to Free plan | user_id=%s",
        user_id,
    )

    return {
        "success": True,
        "message": "Plan changed to Free successfully.",
        "plan": "free",
    }

@router.post("/webhook")
async def stripe_webhook(request: Request):
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
        # Verify Stripe signature.
        stripe.Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=STRIPE_WEBHOOK_SECRET,
        )

        # Parse into normal Python dictionaries.
        event = json.loads(payload.decode("utf-8"))

    except ValueError as error:
        logger.warning("Invalid Stripe webhook payload.")

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook payload.",
        ) from error

    except stripe.error.SignatureVerificationError as error:
        logger.warning("Invalid Stripe webhook signature.")

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature.",
        ) from error

    logger.info("NEW STRIPE WEBHOOK CODE IS RUNNING")

    event_type = event.get("type")
    event_id = event.get("id")

    logger.info(
        "Stripe webhook received | event_id=%s | event_type=%s",
        event_id,
        event_type,
    )

    supported_events = {
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
    }

    if event_type not in supported_events:
        return {
            "received": True,
            "handled": False,
            "event_type": event_type,
        }

    data = event.get("data", {})
    session = data.get("object", {})

    if not isinstance(session, dict):
        logger.error(
            "Stripe session is not a dictionary | type=%s",
            type(session).__name__,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid Stripe session format.",
        )

    session_id = session.get("id")
    payment_status = session.get("payment_status")

    if payment_status != "paid":
        logger.warning(
            "Checkout Session is not paid | "
            "session_id=%s | payment_status=%s",
            session_id,
            payment_status,
        )

        return {
            "received": True,
            "handled": False,
            "reason": "Payment is not marked as paid.",
        }

    metadata = session.get("metadata") or {}

    if not isinstance(metadata, dict):
        metadata = {}

    user_id = (
        metadata.get("user_id")
        or session.get("client_reference_id")
    )

    plan = str(metadata.get("plan") or "pro").strip().lower()

    if not user_id:
        logger.error(
            "User ID missing from Stripe session | session_id=%s",
            session_id,
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID is missing from Checkout Session.",
        )

    if plan != "pro":
        logger.error(
            "Invalid plan in Stripe metadata | "
            "plan=%s | session_id=%s",
            plan,
            session_id,
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
            .eq("id", str(user_id))
            .execute()
        )

    except Exception as error:
        logger.exception(
            "Supabase upgrade failed | user_id=%s",
            user_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to upgrade the user account.",
        ) from error

    if not response.data:
        logger.error(
            "No user matched in Supabase | user_id=%s",
            user_id,
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )

    logger.info(
        "User upgraded to Pro | user_id=%s | session_id=%s",
        user_id,
        session_id,
    )

    return {
        "received": True,
        "handled": True,
        "user_id": str(user_id),
        "plan": "pro",
    }