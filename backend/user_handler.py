# This code handles creating new user accounts in Aurora
def create_user(email, db_connection):
    """
    Saves a new user email to the database with baseline accessibility and tier settings.
    """
    try:
        cursor = db_connection.cursor()
        # Insert the email into our users table with feature extensions
        query = """
            INSERT INTO users (
                email, 
                commission_tier_percentage, 
                notification_frequency_slider, 
                input_mode_preference, 
                dyslexia_font_enabled, 
                text_to_speech_enabled
            ) VALUES (%s, 5.00, 50, 'standard', FALSE, FALSE) 
            RETURNING user_id;
        """
        cursor.execute(query, (email,))
        # Get the new ID back
        new_user_id = cursor.fetchone()[0]
        db_connection.commit()
        cursor.close()
        return {"status": "success", "user_id": new_user_id}
    except Exception as error:
        return {"status": "error", "message": str(error)}
