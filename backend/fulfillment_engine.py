# This file automatically sends orders to print-on-demand fulfillment platforms

# =========================================================================
# NICHOLE'S MONEY RULE (set by Nichole, 2026-10-05)
# Built for the user, in plain words:
# - During the free 33 days, a user keeps ALL of their profit up to $333.
# - Once their profit in the free days goes above $333, Aurora takes a
#   small 3% — and only on the part above $333, never on the first $333.
# - After the free 33 days, users are on paid tiers based on their usage
#   and sales, and the normal tier percentage applies.
# =========================================================================
FREE_TRIAL_DAYS = 33
FREE_PROFIT_KEEP = 333.00
TRIAL_FEE_PERCENTAGE = 3.00


def calculate_platform_fee(gross_sale, manufacturing_cost, in_free_trial,
                           profit_before_this_sale=0.0, tier_percentage=5.00):
    """Work out Aurora's cut for one sale. Returns (fee, rule_name).

    The 3% in the free days is taken on PROFIT above $333, because the
    rule is that the user keeps their profit — the fee never touches
    the first $333 of profit, and never touches the cost of making
    the item.
    """
    profit_this_sale = max(0.0, float(gross_sale) - float(manufacturing_cost))

    if in_free_trial:
        profit_above_free_amount = (
            float(profit_before_this_sale) + profit_this_sale - FREE_PROFIT_KEEP
        )
        profit_above_free_amount = max(0.0, min(profit_above_free_amount, profit_this_sale))
        fee = round(profit_above_free_amount * (TRIAL_FEE_PERCENTAGE / 100.0), 2)
        return fee, "free_33_days_first_333_kept_then_3_percent_on_profit_above"

    fee_percentage = float(tier_percentage)
    if fee_percentage > 11.00:
        fee_percentage = 11.00
    fee = round(float(gross_sale) * (fee_percentage / 100.0), 2)
    return fee, "paid_tier_percentage"


def _user_in_free_trial(customer_details, db_connection, user_id):
    """Best-effort: is this user still in their free 33 days?

    The order can say so directly ('in_free_trial'). Otherwise we look
    at their subscription: status 'trialing' means yes. If we cannot
    tell, we treat them as still in the free days — when in doubt, the
    rule that favours the user wins.
    """
    if "in_free_trial" in customer_details:
        return bool(customer_details["in_free_trial"])
    try:
        cursor = db_connection.cursor()
        cursor.execute(
            "SELECT status FROM user_subscriptions WHERE user_id = %s ORDER BY created_at DESC LIMIT 1;",
            (user_id,),
        )
        row = cursor.fetchone()
        cursor.close()
        if row:
            return str(row[0]).lower() == "trialing"
    except Exception:
        pass
    return True

def submit_order_to_supplier(customer_details, ordered_items, db_connection):
    """
    Takes an approved purchase from Stripe and dropships it through the supplier API.
    Splits multi-vendor payment routing, separating manufacturing costs from net profits.
    """
    try:
        # 1. Package the order details for the factory API
        shipping_payload = {
            "shipping_name": customer_details["name"],
            "address_line1": customer_details["address_line1"],
            "city": customer_details["city"],
            "state": customer_details["state"],
            "zip": customer_details["zip_code"],
            "country": customer_details["country"]
        }
        
        # 2. Add the dynamic items that our AI auto-resized
        items_payload = []
        for item in ordered_items:
            items_payload.append({
                "product_blueprint_id": item["blueprint_id"], # e.g., Classic T-Shirt
                "variant_id": item["variant_id"], # e.g., Black / Large
                "print_area_artwork_url": item["ai_output_url"] # Link to the upscaled image
            })
            
        # Complete mock API request payload
        api_order_request = {
            "external_id": customer_details["order_id"],
            "line_items": items_payload,
            "shipment_carrier": "STANDARD",
            "recipient": shipping_payload
        }
        
        # --- FUTURE API CALLS LIVE HERE ---
        # This sends the payload to Printify/Printful production lines.
        supplier_response = {
            "id": "ord_mock_98765",
            "status": "pending_production",
            "estimated_shipping_cost_cents": 450 
        }
        # ----------------------------------

        # =========================================================================
        # NEW EXTENSION: HANDS-FREE AUTOMATED VENDOR SPLITS ROUTING
        # =========================================================================
        gross_sale = float(customer_details.get("total_sale_amount", 0.00))
        manufacturing_cost = float(supplier_response["estimated_shipping_cost_cents"]) / 100.0
        
        # Query user's current commission tier percentage to isolate platform fee cut
        user_id = customer_details.get("user_id")
        cursor = db_connection.cursor()
        cursor.execute("SELECT commission_tier_percentage FROM users WHERE user_id = %s;", (user_id,))
        result = cursor.fetchone()
        cursor.close()
        
        fee_percentage = float(result[0]) if result else 5.00

        # Nichole's money rule (see top of file): in the free 33 days the
        # user keeps their first $333 of profit; only profit above that
        # is charged, at 3%. After the free days, the tier % applies.
        in_free_trial = _user_in_free_trial(customer_details, db_connection, user_id)
        profit_before = float(customer_details.get("profit_before_this_sale", 0.0))
        platform_cut, rule_applied = calculate_platform_fee(
            gross_sale,
            manufacturing_cost,
            in_free_trial,
            profit_before_this_sale=profit_before,
            tier_percentage=fee_percentage,
        )

        # Calculate leftover revenue clean for instant creator wallet deposit payout
        creator_net_profit = round(gross_sale - manufacturing_cost - platform_cut, 2)
        if creator_net_profit < 0:
            creator_net_profit = 0.00

        return {
            "status": "success",
            "supplier_order_id": supplier_response["id"],
            "production_status": supplier_response["status"],
            "financial_routing_split": {
                "gross_sale_captured": gross_sale,
                "factory_cost_isolated": manufacturing_cost,
                "platform_commission_deducted": platform_cut,
                "creator_wallet_profit_deposit": creator_net_profit,
                "rule_applied": rule_applied,
                "in_free_trial": in_free_trial
            }
        }
    except Exception as error:
        return {"status": "error", "message": str(error)}
