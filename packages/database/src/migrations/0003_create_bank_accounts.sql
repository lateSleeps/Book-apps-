-- Migration 0003: Create bank_accounts table.
--
-- Stores bank transfer accounts for a salon.
-- Referenced by Booking App settings (Settings > Booking App > Transfer Bank).
--
-- Prerequisites:
--   0001_alter_salons_brand_booking.sql must be applied first (salons.payment_methods etc.)
--
-- Customer app reads bank_accounts to display transfer payment options at checkout.
-- Read-all public access is acceptable (bank account numbers are not sensitive).
-- Write access must be restricted to OWNER/ADMIN (enforced via protectedProcedure).

CREATE TABLE IF NOT EXISTS bank_accounts (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id            UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  bank_name           TEXT        NOT NULL,
  account_number      TEXT        NOT NULL,
  account_holder_name TEXT        NOT NULL,
  is_active           BOOLEAN     NOT NULL DEFAULT true,
  sort_order          INTEGER     NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bank_accounts_salon_id_idx ON bank_accounts(salon_id);
