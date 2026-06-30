import psycopg2
from psycopg2.extras import RealDictCursor

def create_incubator_room(conn, name, collaborators):
    """
    Creates a room and assigns collaborators with their revenue share percentages.
    collaborators format: [{'user_id': 1, 'revenue_share': 50.0, 'labor_details': 'Frontend Development'}]
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        try:
            # 1. Insert the new incubator room
            cur.execute(
                "INSERT INTO incubator_rooms (name) VALUES (%s) RETURNING room_id;",
                (name,)
            )
            room_id = cur.fetchone()['room_id']
            
            # 2. Insert each collaborator tied to this room
            for member in collaborators:
                cur.execute(
                    """INSERT INTO room_collaborators 
                    (room_id, user_id, revenue_share_percentage, labor_contribution_details) 
                    VALUES (%s, %s, %s, %s);""",
                    (room_id, member['user_id'], member['revenue_share'], member['labor_details'])
                )
            
            conn.commit()
            return {"status": "success", "room_id": room_id}
        except Exception as e:
            conn.rollback()
            return {"status": "error", "message": str(e)}
