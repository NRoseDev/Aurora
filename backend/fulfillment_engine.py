# This file automatically sends orders to print-on-demand fulfillment platforms
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
        if fee_percentage > 11.00:
            fee_percentage = 11.00
            
        platform_cut = round(gross_sale * (fee_percentage / 100.0), 2)
        
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
                "creator_wallet_profit_deposit": creator_net_profit
            }
        }
    except Exception as error:
        return {"status": "error", "message": str(error)}
