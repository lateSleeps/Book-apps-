-- Migration 0001: Add Brand and Booking App columns to salons table.
--
-- Brand columns: tagline, cover_image_url, whatsapp, website,
--                instagram, tiktok, facebook, city, maps_url
-- Booking App columns: payment_methods, qris_image_url, confirmation_mode, salon_policy
--
-- Columns already confirmed to exist: name, description, address, phone, email, logo_url
-- Run once. All columns use IF NOT EXISTS to be re-runnable.

ALTER TABLE salons
  -- Brand — identity
  ADD COLUMN IF NOT EXISTS tagline          TEXT        NOT NULL DEFAULT '',
  -- description already exists — skipped
  -- logo_url already exists — skipped
  ADD COLUMN IF NOT EXISTS cover_image_url  TEXT,

  -- Brand — contact
  -- phone already exists — skipped
  -- email already exists — skipped
  ADD COLUMN IF NOT EXISTS whatsapp         TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS website          TEXT        NOT NULL DEFAULT '',

  -- Brand — social
  ADD COLUMN IF NOT EXISTS instagram        TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tiktok           TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook         TEXT        NOT NULL DEFAULT '',

  -- Brand — location
  -- address already exists — skipped
  ADD COLUMN IF NOT EXISTS city             TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS maps_url         TEXT        NOT NULL DEFAULT '',

  -- Booking App — payment
  ADD COLUMN IF NOT EXISTS payment_methods  TEXT[]      NOT NULL DEFAULT ARRAY['qris','transfer'],
  ADD COLUMN IF NOT EXISTS qris_image_url   TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_mode TEXT       NOT NULL DEFAULT 'auto'
    CHECK (confirmation_mode IN ('auto', 'manual')),
  ADD COLUMN IF NOT EXISTS salon_policy     TEXT;
