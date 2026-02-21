-- Migration: Ensure approval_requests table has all required columns
-- This migration ensures the table supports all approval types and statuses

-- Create approval_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS approval_requests (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    requested_by_type VARCHAR(50) NOT NULL DEFAULT 'applicant',
    practice_id VARCHAR(255),
    target_doctor_id VARCHAR(255),
    payload JSONB NOT NULL,
    admin_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    practice_admin_status VARCHAR(50),
    admin_notes TEXT,
    practice_admin_notes TEXT,
    admin_reviewed_at TIMESTAMP,
    practice_admin_reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    rejected_by VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_approval_requests_type ON approval_requests(type);
CREATE INDEX IF NOT EXISTS idx_approval_requests_admin_status ON approval_requests(admin_status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_practice_admin_status ON approval_requests(practice_admin_status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_practice_id ON approval_requests(practice_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by ON approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_requests_created_at ON approval_requests(created_at DESC);

-- Create approval_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS approval_history (
    id VARCHAR(255) PRIMARY KEY,
    approval_request_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    performed_by_type VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id) ON DELETE CASCADE
);

-- Create indexes for approval_history
CREATE INDEX IF NOT EXISTS idx_approval_history_request_id ON approval_history(approval_request_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_created_at ON approval_history(created_at DESC);

-- Ensure practice_locations table exists (for location approval types)
CREATE TABLE IF NOT EXISTS practice_locations (
    id VARCHAR(255) PRIMARY KEY,
    practice_id VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    phone VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_practice_locations_practice_id ON practice_locations(practice_id);

-- Ensure practice_services table exists (for services approval types)
CREATE TABLE IF NOT EXISTS practice_services (
    practice_id VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    PRIMARY KEY (practice_id, service),
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_practice_services_practice_id ON practice_services(practice_id);

-- Ensure practice_insurance table exists (for insurance approval types)
CREATE TABLE IF NOT EXISTS practice_insurance (
    id VARCHAR(255) PRIMARY KEY,
    practice_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    UNIQUE(practice_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_practice_insurance_practice_id ON practice_insurance(practice_id);

-- Ensure practice_specialties table exists
CREATE TABLE IF NOT EXISTS practice_specialties (
    practice_id VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    PRIMARY KEY (practice_id, specialty),
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_practice_specialties_practice_id ON practice_specialties(practice_id);

-- Ensure practice_roles table exists (for doctor role management)
CREATE TABLE IF NOT EXISTS practice_roles (
    practice_id VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'doctor',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (practice_id, doctor_id),
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_practice_roles_practice_id ON practice_roles(practice_id);
CREATE INDEX IF NOT EXISTS idx_practice_roles_doctor_id ON practice_roles(doctor_id);
CREATE INDEX IF NOT EXISTS idx_practice_roles_role ON practice_roles(role);

-- Add any missing columns to approval_requests (if table already exists)
DO $$ 
BEGIN
    -- Add practice_admin_status if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approval_requests' AND column_name = 'practice_admin_status') THEN
        ALTER TABLE approval_requests ADD COLUMN practice_admin_status VARCHAR(50);
    END IF;

    -- Add practice_admin_notes if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approval_requests' AND column_name = 'practice_admin_notes') THEN
        ALTER TABLE approval_requests ADD COLUMN practice_admin_notes TEXT;
    END IF;

    -- Add practice_admin_reviewed_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approval_requests' AND column_name = 'practice_admin_reviewed_at') THEN
        ALTER TABLE approval_requests ADD COLUMN practice_admin_reviewed_at TIMESTAMP;
    END IF;

    -- Add admin_reviewed_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approval_requests' AND column_name = 'admin_reviewed_at') THEN
        ALTER TABLE approval_requests ADD COLUMN admin_reviewed_at TIMESTAMP;
    END IF;
END $$;

-- Add any missing columns to approval_history (if table already exists)
DO $$ 
BEGIN
    -- Add performed_by if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approval_history' AND column_name = 'performed_by') THEN
        ALTER TABLE approval_history ADD COLUMN performed_by VARCHAR(255) NOT NULL DEFAULT '';
    END IF;

    -- Add performed_by_type if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approval_history' AND column_name = 'performed_by_type') THEN
        ALTER TABLE approval_history ADD COLUMN performed_by_type VARCHAR(50) NOT NULL DEFAULT 'admin';
    END IF;

    -- Add notes if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approval_history' AND column_name = 'notes') THEN
        ALTER TABLE approval_history ADD COLUMN notes TEXT;
    END IF;

    -- Add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approval_history' AND column_name = 'created_at') THEN
        ALTER TABLE approval_history ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
    END IF;
END $$;
