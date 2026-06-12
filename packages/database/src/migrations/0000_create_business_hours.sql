-- Migration: 0000_create_business_hours
--
-- Documents and idempotently establishes the business_hours table and the
-- UNIQUE(salon_id, day_of_week) constraint required by operational.repository.ts
-- upsertBusinessHours(), which calls:
--   .upsert(rows, { onConflict: 'salon_id,day_of_week' })
--
-- This file is safe to run on a DB that already has the table (IF NOT EXISTS /
-- DO $$ conditional guards). On a fresh DB it creates the table from scratch.

CREATE TABLE IF NOT EXISTS business_hours (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id     UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  day_of_week  SMALLINT    NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_closed    BOOLEAN     NOT NULL DEFAULT false,
  open_time    TIME,
  close_time   TIME,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add UNIQUE constraint if it does not already exist.
-- The name matches what Postgres auto-generates so it is idempotent across envs.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conname = 'business_hours_salon_id_day_of_week_key'
  ) THEN
    ALTER TABLE business_hours
      ADD CONSTRAINT business_hours_salon_id_day_of_week_key
      UNIQUE (salon_id, day_of_week);
  END IF;
END;
$$;

-- Index for fast per-salon lookups (covered by the UNIQUE constraint above,
-- but explicit for clarity in query plans).
CREATE INDEX IF NOT EXISTS business_hours_salon_id_idx ON business_hours (salon_id);
