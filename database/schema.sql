CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- SYSTEM AUTOMATION & COMMISSIONS
    commission_tier_percentage NUMERIC(4,2) DEFAULT 5.00,
    notification_frequency_slider INT DEFAULT 50,

    -- UNIVERSAL ACCESSIBILITY MECHANISMS (App-Wide Toggles)
    input_mode_preference VARCHAR(50) DEFAULT 'standard',
    dyslexia_font_enabled BOOLEAN DEFAULT FALSE,
    text_to_speech_enabled BOOLEAN DEFAULT FALSE,
    assistive_device_profile VARCHAR(100) DEFAULT NULL
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
    view_period VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Constellation Studio Ecosystem Active Segregation Tracks
CREATE TABLE constellation_project_zones (
    zone_allocation_id SERIAL PRIMARY KEY,
    room_id INT REFERENCES incubator_rooms(room_id) ON DELETE CASCADE,
    zone_state VARCHAR(20) DEFAULT 'vault',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- AURORA CREATOR SYSTEMS
-- =========================================================================

-- Daily replenishable creation pool.
-- Kept creations remain counted; rejected/discarded creations can return
-- their slot to the available daily pool.
CREATE TABLE creator_daily_usage (
    usage_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    daily_creation_limit INT NOT NULL DEFAULT 30,
    creations_used INT NOT NULL DEFAULT 0,
    creations_returned INT NOT NULL DEFAULT 0,
    creations_kept INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, usage_date)
);

-- Individual creation attempts and their final disposition.
CREATE TABLE creator_generations (
    generation_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    usage_id INT REFERENCES creator_daily_usage(usage_id) ON DELETE CASCADE,
    generation_type VARCHAR(50) NOT NULL,
    prompt TEXT,
    result_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'generated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    CHECK (status IN ('generated', 'kept', 'rejected', 'discarded'))
);

-- =========================================================================
-- CREATOR IDEAS & INCUBATOR CONTENT
-- =========================================================================

CREATE TABLE creator_ideas (
    idea_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    room_id INT REFERENCES incubator_rooms(room_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'idea',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('idea', 'developing', 'ready', 'published', 'archived'))
);

-- =========================================================================
-- CREATOR INNER CIRCLE & COLLABORATION
-- =========================================================================

CREATE TABLE inner_circle_memberships (
    membership_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    membership_role VARCHAR(50) DEFAULT 'creator',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (user_id)
);

CREATE TABLE inner_circle_connections (
    connection_id SERIAL PRIMARY KEY,
    requester_user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    recipient_user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    connection_status VARCHAR(30) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (connection_status IN ('pending', 'accepted', 'declined', 'blocked')),
    CHECK (requester_user_id <> recipient_user_id)
);

-- =========================================================================
-- CREATOR FLOWS / AUTOMATION FOUNDATION
-- =========================================================================

CREATE TABLE creator_flows (
    flow_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE creator_flow_steps (
    step_id SERIAL PRIMARY KEY,
    flow_id INT REFERENCES creator_flows(flow_id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    step_type VARCHAR(50) NOT NULL,
    configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (flow_id, step_order)
);

-- =========================================================================
-- APPROVALS, WORKFLOW HISTORY & ERROR RECOVERY
-- =========================================================================

CREATE TABLE workflow_approvals (
    approval_id SERIAL PRIMARY KEY,
    flow_id INT REFERENCES creator_flows(flow_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    approval_status VARCHAR(30) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    CHECK (approval_status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE workflow_history (
    history_id SERIAL PRIMARY KEY,
    flow_id INT REFERENCES creator_flows(flow_id) ON DELETE CASCADE,
    step_id INT REFERENCES creator_flow_steps(step_id) ON DELETE SET NULL,
    execution_status VARCHAR(30) NOT NULL,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- =========================================================================
-- AUTOMATION MARKETPLACE FOUNDATION
-- =========================================================================

CREATE TABLE automation_templates (
    template_id SERIAL PRIMARY KEY,
    creator_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    flow_configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
