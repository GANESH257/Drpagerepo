-- Migration 007: Referrals table (doctor-to-doctor referrals)
-- Requires: doctors table

CREATE TABLE IF NOT EXISTS referrals (
    id VARCHAR(255) PRIMARY KEY,
    from_doctor_id VARCHAR(255) NOT NULL,
    to_doctor_id VARCHAR(255) NOT NULL,
    patient_name_or_initials VARCHAR(500) NOT NULL,
    patient_age INT,
    patient_sex VARCHAR(50),
    patient_phone VARCHAR(100),
    condition_summary TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'considering',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    attended_at TIMESTAMP,
    FOREIGN KEY (from_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (to_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_referrals_from_doctor_id ON referrals(from_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_to_doctor_id ON referrals(to_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);
