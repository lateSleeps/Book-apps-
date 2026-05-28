-- Add price_type column to services table
-- 'fixed'         → price is exact, skip StepServiceDetail
-- 'starting_from' → price varies by options, show StepServiceDetail form

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS price_type text NOT NULL DEFAULT 'fixed'
    CHECK (price_type IN ('fixed', 'starting_from'));

-- Backfill: any service that already has requires_specialist = true → starting_from
UPDATE services
SET price_type = 'starting_from'
WHERE requires_specialist = true;
