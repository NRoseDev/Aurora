CREATE TABLE users ( 
    user_id SERIAL PRIMARY KEY, 
    email VARCHAR(255) UNIQUE NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- SYSTEM AUTOMATION & COMMISSIONS
    commission_tier_percentage NUMERIC(4,2) DEFAULT 5.00, -- Tiered scaling (5%, 8%, 11%)
    notification_frequency_slider INT DEFAULT 50,         -- Notification shield frequency

    -- UNIVERSAL ACCESSIBILITY MECHANISMS (App-Wide Toggles)
    input_mode_preference VARCHAR(50) DEFAULT 'standard', -- 'type', 'speak_to_text', 'asl_camera_input', 'external_switch_device'
    dyslexia_font_enabled BOOLEAN DEFAULT FALSE,         -- Universal Dyslexia font toggle
    text_to_speech_enabled BOOLEAN DEFAULT FALSE,        -- Universal screen reading feedback
    assistive_device_profile VARCHAR(100) DEFAULT NULL   -- External switch hardware key mapping
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

CREATE TABLE incubator_rooms ( 
    room_id SERIAL PRIMARY KEY, 
    name VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 

CREATE TABLE room_collaborators ( 
    id SERIAL PRIMARY KEY, 
    room_id INT REFERENCES incubator_rooms(room_id) ON DELETE CASCADE, 
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE, 
    revenue_share_percentage NUMERIC(5,2) NOT NULL, 
    labor_contribution_details TEXT,
    
    -- DIGITAL LEGAL SAFETY NETS
    nda_signed BOOLEAN DEFAULT FALSE,
    nda_signature_date TIMESTAMP
);

-- =========================================================================
-- SYSTEM UTILITIES & AREA SEGREGATION
-- =========================================================================

-- Built-In Interactive Accounting Ledger Grids
CREATE TABLE sales_accounting_ledger (
    ledger_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    gross_sales NUMERIC(12,2) DEFAULT 0.00,
    cogs NUMERIC(12,2) DEFAULT 0.00, 
    platform_fee_deducted NUMERIC(12,2) DEFAULT 0.00, 
    estimated_sales_tax NUMERIC(12,2) DEFAULT 0.00,
    net_profit NUMERIC(12,2) DEFAULT 0.00,
    view_period VARCHAR(20) NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'yearly'
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Constellation Studio Ecosystem Active Segregation Tracks
CREATE TABLE constellation_project_zones (
    zone_allocation_id SERIAL PRIMARY KEY,
    room_id INT REFERENCES incubator_rooms(room_id) ON DELETE CASCADE,
    zone_state VARCHAR(20) DEFAULT 'vault', -- 'vault', 'overflow', 'ideashelf', 'ideabin'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
