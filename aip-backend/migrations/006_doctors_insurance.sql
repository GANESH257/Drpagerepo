-- Migration: Add insurance JSONB to doctors for accepted insurance plans
-- Run after 003. Safe to run multiple times.

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS insurance JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_doctors_insurance ON doctors USING GIN (insurance) WHERE insurance IS NOT NULL AND jsonb_array_length(insurance) > 0;
