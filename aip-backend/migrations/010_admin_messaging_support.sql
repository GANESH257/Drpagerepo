-- Migration 010: Admin messaging support
-- Allows admin users (no doctor profile) to participate in message threads
-- using participant_type = 'admin' in thread_participants.
--
-- SAFE TO RUN: All operations are IF NOT EXISTS / DO NOTHING / conditional.

-- =====================================================================
-- Step 1: Ensure message tables exist (in case this is a fresh deploy)
-- NOTE: No FOREIGN KEY on participant_id — admin IDs are not in doctors.
-- =====================================================================

CREATE TABLE IF NOT EXISTS message_threads (
    id          VARCHAR(255) PRIMARY KEY,
    type        VARCHAR(50)  NOT NULL DEFAULT 'direct',
    practice_id VARCHAR(255),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS thread_participants (
    id               SERIAL       PRIMARY KEY,
    thread_id        VARCHAR(255) NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
    participant_id   VARCHAR(255) NOT NULL,
    participant_type VARCHAR(50)  NOT NULL DEFAULT 'doctor',
    joined_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE(thread_id, participant_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id          VARCHAR(255) PRIMARY KEY,
    thread_id   VARCHAR(255) NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id   VARCHAR(255) NOT NULL,
    sender_type VARCHAR(50)  NOT NULL DEFAULT 'doctor',
    sender_name VARCHAR(500),
    content     TEXT         NOT NULL,
    attachments JSONB,
    read        BOOLEAN      DEFAULT false,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    edited_at   TIMESTAMP
);

-- =====================================================================
-- Step 2: Drop any FK constraint on thread_participants.participant_id
-- (It may reference doctors.id, blocking admin participant inserts)
-- This block is a no-op if no such constraint exists.
-- =====================================================================

DO $$
DECLARE
    v_constraint_name TEXT;
BEGIN
    SELECT tc.constraint_name INTO v_constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema   = kcu.table_schema
    WHERE tc.table_name      = 'thread_participants'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name    = 'participant_id'
    LIMIT 1;

    IF v_constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE thread_participants DROP CONSTRAINT ' || quote_ident(v_constraint_name);
        RAISE NOTICE 'Dropped FK constraint "%" on thread_participants.participant_id — admin IDs can now be inserted.', v_constraint_name;
    ELSE
        RAISE NOTICE 'No FK constraint on thread_participants.participant_id — no action needed.';
    END IF;
END $$;

-- =====================================================================
-- Step 3: Add indexes for efficient lookups by participant / sender
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_thread_participants_participant_id
    ON thread_participants(participant_id);

CREATE INDEX IF NOT EXISTS idx_thread_participants_type
    ON thread_participants(participant_type);

CREATE INDEX IF NOT EXISTS idx_thread_participants_thread_id
    ON thread_participants(thread_id);

CREATE INDEX IF NOT EXISTS idx_messages_thread_id
    ON messages(thread_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id
    ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
    ON messages(created_at ASC);
