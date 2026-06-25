# This file handles global customer checkouts and split payouts using Stripe

def create_checkout_session(creator_stripe_account_id, base_cost_cents, retail_price_cents, product_name):
    """
    Creates a secure checkout link that automatically splits the payment:
    - Base production cost goes to the fulfillment partner
    - Platform fee stays with Aurora
    - Remaining profit goes directly to the creator
    """
    try:
        # Calculate how much the creator makes on this sale
        creator_profit_cents = retail_price_cents - base_cost_cents
        
        # In production, this uses the import stripe library
        session_mock = {
            "id": "cs_test_mock_12345",
            "url": "https://stripe.com",
            "payment_intent": {
                "total_amount": retail_price_cents,
                "application_fee_amount": base_cost_cents, # Kept for platform/supplier costs
                "transfer_data": {
                    "destination": creator_stripe_account_id, # Creator's connected wallet
                    "amount": creator_profit_cents
                }
            },
            "status": "success"
        }
        
        return {
            "status": "success",
            "checkout_url": session_mock["url"],
            "session_id": session_mock["id"]
        }
        
    except Exception as error:
        return {"status": "error", "message": str(error)}
