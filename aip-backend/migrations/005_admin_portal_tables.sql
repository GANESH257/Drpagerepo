-- Migration 005: Super Admin Portal - new tables and additive changes only (no drops/renames)
-- Requires: doctors, practices, community_posts, community_comments

-- ========== Community moderation ==========
CREATE TABLE IF NOT EXISTS community_post_reports (
    id VARCHAR(255) PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    reported_by_doctor_id VARCHAR(255) NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_community_post_reports_post_id ON community_post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_reports_status ON community_post_reports(status);
CREATE INDEX IF NOT EXISTS idx_community_post_reports_created_at ON community_post_reports(created_at DESC);

CREATE TABLE IF NOT EXISTS community_user_moderation (
    id VARCHAR(255) PRIMARY KEY,
    doctor_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    reason TEXT,
    until TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_community_user_moderation_doctor_id ON community_user_moderation(doctor_id);
CREATE INDEX IF NOT EXISTS idx_community_user_moderation_status ON community_user_moderation(status);

-- ========== Medical data (platform configuration) ==========
CREATE TABLE IF NOT EXISTS insurance_providers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS specialties (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conditions (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treatments (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS condition_treatments (
    condition_id VARCHAR(255) NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
    treatment_id VARCHAR(255) NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
    PRIMARY KEY (condition_id, treatment_id)
);
CREATE INDEX IF NOT EXISTS idx_condition_treatments_condition_id ON condition_treatments(condition_id);
CREATE INDEX IF NOT EXISTS idx_condition_treatments_treatment_id ON condition_treatments(treatment_id);

CREATE TABLE IF NOT EXISTS condition_treatment_suggestions (
    id VARCHAR(255) PRIMARY KEY,
    doctor_id VARCHAR(255) NOT NULL,
    suggestion_type VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    condition_id VARCHAR(255),
    treatment_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_condition_treatment_suggestions_status ON condition_treatment_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_condition_treatment_suggestions_created_at ON condition_treatment_suggestions(created_at DESC);

-- ========== System settings ==========
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_templates (
    id VARCHAR(255) PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    subject VARCHAR(500),
    body TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========== Additive change: doctors.status (active/inactive) ==========
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
