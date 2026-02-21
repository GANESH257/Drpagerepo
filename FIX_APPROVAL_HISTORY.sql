-- Quick fix: Add missing columns to approval_history table
-- Run this in your Cloud SQL SQL editor

-- Add performed_by if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approval_history' AND column_name = 'performed_by') THEN
        ALTER TABLE approval_history ADD COLUMN performed_by VARCHAR(255) NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approval_history' AND column_name = 'performed_by_type') THEN
        ALTER TABLE approval_history ADD COLUMN performed_by_type VARCHAR(50) NOT NULL DEFAULT 'admin';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approval_history' AND column_name = 'notes') THEN
        ALTER TABLE approval_history ADD COLUMN notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approval_history' AND column_name = 'created_at') THEN
        ALTER TABLE approval_history ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'approval_history'
ORDER BY ordinal_position;
