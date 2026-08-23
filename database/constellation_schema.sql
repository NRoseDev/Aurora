-- Database structures for the Constellation Side of Aurora

-- 1. CONSTELLATION PROJECT MASTER
CREATE TABLE constellation_projects (
    project_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    nda_status VARCHAR(50) DEFAULT 'PENDING_AI_QUESTIONNAIRE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. THE VAULT ZONE
CREATE TABLE the_vault (
    vault_id SERIAL PRIMARY KEY,
    project_id INT REFERENCES constellation_projects(project_id) ON DELETE CASCADE,
    encrypted_core_concept TEXT NOT NULL,
    legal_nda_document_url TEXT NOT NULL,
    last_locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. OVERFLOW ZONE
CREATE TABLE overflow (
    overflow_id SERIAL PRIMARY KEY,
    project_id INT REFERENCES constellation_projects(project_id) ON DELETE CASCADE,
    active_task_name VARCHAR(255) NOT NULL,
    development_notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. IDEASHELF ZONE
CREATE TABLE idea_shelf (
    shelf_id SERIAL PRIMARY KEY,
    project_id INT REFERENCES constellation_projects(project_id) ON DELETE CASCADE,
    paused_reason TEXT,
    llm_context_snapshot TEXT,
    shelved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. IDEABIN ZONE
CREATE TABLE idea_bin (
    bin_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    raw_discarded_data TEXT NOT NULL,
    original_source_context VARCHAR(100),
    trashed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
