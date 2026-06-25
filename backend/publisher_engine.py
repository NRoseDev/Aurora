# This engine scans the database and automatically publishes due posts to social media

import datetime

def process_publishing_queue(db_connection):
    """
    Finds all 'queued' posts that are scheduled for now or the past, and sends them live.
    """
    try:
        cursor = db_connection.cursor()
        current_time = datetime.datetime.now()
        
        # 1. Grab all posts that are ready to go out right now
        query = """
            SELECT q.queue_id, m.caption, m.media_url, c.platform_name, c.access_token 
            FROM publication_queue q
            JOIN master_content m ON q.content_id = m.content_id
            JOIN connected_channels c ON q.channel_id = c.channel_id
            WHERE q.publishing_status = 'queued' AND q.scheduled_time <= %s;
        """
        cursor.execute(query, (current_time,))
        pending_posts = cursor.fetchall()
        
        for post in pending_posts:
            queue_id, caption, media_url, platform, token = post
            
            # Update status to processing so it doesn't accidentally double-post
            cursor.execute("UPDATE publication_queue SET publishing_status = 'processing' WHERE queue_id = %s;", (queue_id,))
            db_connection.commit()
            
            # --- FUTURE API CALLS LIVE HERE ---
            # This is where Aurora connects directly to TikTok or Meta APIs using the secure token.
            success = True 
            # ----------------------------------
            
            if success:
                cursor.execute("UPDATE publication_queue SET publishing_status = 'published' WHERE queue_id = %s;", (queue_id,))
            else:
                cursor.execute("UPDATE publication_queue SET publishing_status = 'failed', error_message = 'API connection dropped' WHERE queue_id = %s;", (queue_id,))
                
        db_connection.commit()
        cursor.close()
        return {"status": "success", "processed_count": len(pending_posts)}
        
    except Exception as error:
        return {"status": "error", "message": str(error)}
