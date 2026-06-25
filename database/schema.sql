CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE connected_channels (
    channel_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    platform_name VARCHAR(50) NOT NULL,
    platform_account_id VARCHAR(255) NOT NULL, 
    access_token TEXT NOT NULL, 
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE master_content (
    content_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255),
    caption TEXT NOT NULL,
    media_url TEXT NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE publication_queue (
    queue_id SERIAL PRIMARY KEY,
    content_id INT REFERENCES master_content(content_id) ON DELETE CASCADE,
    channel_id INT REFERENCES connected_channels(channel_id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP NOT NULL, 
    publishing_status VARCHAR(50) DEFAULT 'queued',
    external_post_id VARCHAR(255), 
    error_message TEXT, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
