-- Migration: NPI, profile_status, and badges_awards for two-phase activation
-- Run after 001 and 002. Safe to run multiple times (IF NOT EXISTS / DO blocks).

-- doctors: NPI (10-digit, unique), profile_status, badges_awards JSONB
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS npi VARCHAR(10) UNIQUE;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS profile_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS badges_awards JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_doctors_npi ON doctors(npi) WHERE npi IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_doctors_profile_status ON doctors(profile_status);

-- practices.status already VARCHAR; ensure 'pending_profile' is a valid value (no schema change needed)
-- board_certifications and hospital_privileges remain JSONB; app will use shape [{ name, imageUrl?, year? }]
