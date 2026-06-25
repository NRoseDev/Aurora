# This code securely stores login tokens for TikTok, Instagram, and Facebook

def link_social_channel(user_id, platform, token, account_id, db_connection):
    """
    Saves a social media login token to the database so Aurora can post later.
    """
    try:
        cursor = db_connection.cursor()
        
        # Save the secure connection details
        query = """
            INSERT INTO connected_channels (user_id, platform_name, access_token, platform_account_id)
            VALUES (%s, %s, %s, %s) RETURNING channel_id;
        """
        cursor.execute(query, (user_id, platform.lower(), token, account_id))
        
        new_channel_id = cursor.fetchone()
        db_connection.commit()
        cursor.close()
        
        return {"status": "success", "channel_id": new_channel_id}
        
    except Exception as error:
        return {"status": "error", "message": str(error)}
