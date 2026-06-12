-- Migration 0002: Add missing columns to categories and services tables.
--
-- categories: color, blob_color, icon (matches customer app column name), is_active, sort_order
-- services:   service_flow, sort_order
--
-- All columns are additive with safe defaults. No data transform required.
-- service_flow default 'TREATMENT' is safe but may need manual backfill for
-- styling services. Owner should review each service via Settings > Layanan
-- after running this migration.
--
-- IMPORTANT: Customer app reads `icon` (not `icon_name`) from categories.
-- The column is named `icon` here to match the existing customer app query.

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS color      TEXT        NOT NULL DEFAULT 'bg-c-peach',
  ADD COLUMN IF NOT EXISTS blob_color TEXT        NOT NULL DEFAULT '#f5c4ab',
  ADD COLUMN IF NOT EXISTS icon       TEXT        NOT NULL DEFAULT 'Scissors',
  ADD COLUMN IF NOT EXISTS is_active  BOOLEAN     NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER     NOT NULL DEFAULT 0;

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS service_flow TEXT NOT NULL DEFAULT 'TREATMENT'
    CHECK (service_flow IN ('STYLING_HAIR','STYLING_COLOUR','STYLING_NAIL','TREATMENT')),
  ADD COLUMN IF NOT EXISTS sort_order   INTEGER NOT NULL DEFAULT 0;

-- Note: service_questions jsonb column is assumed to already exist.
-- If not: ALTER TABLE services ADD COLUMN IF NOT EXISTS service_questions JSONB NOT NULL DEFAULT '[]'::jsonb;
