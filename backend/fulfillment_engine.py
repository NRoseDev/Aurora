# This file automatically sends orders to print-on-demand fulfillment platforms

def submit_order_to_supplier(customer_details, ordered_items, db_connection):
    """
    Takes an approved purchase from Stripe and dropships it through the supplier API.
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
                "variant_id": item["variant_id"],             # e.g., Black / Large
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
        
        return {
            "status": "success",
            "supplier_order_id": supplier_response["id"],
            "production_status": supplier_response["status"]
        }
        
    except Exception as error:
        return {"status": "error", "message": str(error)}
