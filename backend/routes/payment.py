from fastapi import APIRouter, Depends, HTTPException, Request
from dotenv import load_dotenv
import stripe
import os

from database import supabase_admin
from auth import get_current_user
from services.stripe_service import create_checkout_session

load_dotenv()

WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

router = APIRouter(
    prefix="/api/payment",
    tags=["Stripe Payment"]
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

    except Exception as e:
        print("STRIPE ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/success")
def payment_success(session_id: str):
    return {
        "success": True,
        "message": "Payment completed successfully.",
        "session_id": session_id,
    }


@router.get("/cancel")
def payment_cancel():
    return {
        "success": False,
        "message": "Payment was cancelled."
    }

@router.post("/cancel-subscription")
def cancel_subscription(
    current_user=Depends(get_current_user)
):
    try:
        supabase_admin.table("user").update(
            {
                "plan": "free"
            }
        ).eq(
            "id",
            current_user["id"]
        ).execute()

        return {
            "success": True,
            "message": "Subscription cancelled successfully.",
            "plan": "free"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            WEBHOOK_SECRET
        )

    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid payload"
        )

    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=400,
            detail="Invalid signature"
        )

    # Ignore all events except checkout completion
    if event["type"] != "checkout.session.completed":
        return {"received": True}

    session = event["data"]["object"]

    print("=" * 50)
    print("Checkout completed!")
    print("Session ID:", session["id"])

    metadata = session["metadata"]

    user_id = metadata["user_id"]
    plan = metadata["plan"]

    print("User ID:", user_id)
    print("Plan:", plan)

    try:
        response = (
            supabase_admin
            .table("user")   # Change to "user" if your table name is singular
            .update({
                "plan": plan
            })
            .eq("id", user_id)
            .execute()
        )

        print("Supabase Response:")
        print(response)
        print("User upgraded successfully!")

    except Exception as e:
        print("SUPABASE UPDATE ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    return {
        "received": True
    }