-- Migration 009 (optional): Add plan_id to doctors for Membership badge display
-- Frontend reads doctor.plan_id / doctor.planId / doctor.membership_plan_id.
-- Either: (A) Backend JOINs memberships when returning doctors, or
--         (B) Add this column and sync from memberships when membership is created/updated.

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS plan_id VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_doctors_plan_id ON doctors(plan_id) WHERE plan_id IS NOT NULL;
