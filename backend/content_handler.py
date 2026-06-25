# This code handles uploading videos and scheduling them to your queue

def schedule_content(user_id, caption, media_url, channels, scheduled_time, db_connection):
    """
    Saves a master video post and duplicates it into the queue for each social channel.
    """
    try:
        cursor = db_connection.cursor()
        
        # 1. Save the master video and caption
        master_query = """
            INSERT INTO master_content (user_id, caption, media_url)
            VALUES (%s, %s, %s) RETURNING content_id;
        """
        cursor.execute(master_query, (user_id, caption, media_url))
        content_id = cursor.fetchone()[0]
        
        # 2. Duplicate the post into the queue for every selected channel (TikTok, IG, FB)
        queue_query = """
            INSERT INTO publication_queue (content_id, channel_id, scheduled_time)
            VALUES (%s, %s, %s);
        """
        for channel_id in channels:
            cursor.execute(queue_query, (content_id, channel_id, scheduled_time))
            
        db_connection.commit()
        cursor.close()
        return {"status": "success", "content_id": content_id}
        
    except Exception as error:
        return {"status": "error", "message": str(error)}
