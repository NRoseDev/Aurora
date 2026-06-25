# This code handles creating new user accounts in Aurora

def create_user(email, db_connection):
    """
    Saves a new user email to the database.
    """
    try:
        cursor = db_connection.cursor()
        
        # Insert the email into our users table
        query = "INSERT INTO users (email) VALUES (%s) RETURNING user_id;"
        cursor.execute(query, (email,))
        
        # Get the new ID back
        new_user_id = cursor.fetchone()[0]
        db_connection.commit()
        cursor.close()
        
        return {"status": "success", "user_id": new_user_id}
        
    except Exception as error:
        return {"status": "error", "message": str(error)}
