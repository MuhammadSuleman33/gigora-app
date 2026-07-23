Stripe integration setup

1. Install Python deps:

   pip install -r requirements.txt

2. Copy `.env.example` to `.env` and set values for:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_URL`

3. Run the FastAPI backend and ensure `backend/routes/payment.py` is reachable.

4. (Optional) Use the Stripe CLI to forward webhooks during development:

   stripe listen --forward-to localhost:8000/api/payment/webhook

5. Verify checkout flow from the frontend and confirm webhook events are received.
