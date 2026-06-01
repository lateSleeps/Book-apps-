-- Migration: Add payment processing columns to bookings table
-- Run in: Supabase Dashboard → SQL Editor

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('cash', 'transfer', 'qris')),
  ADD COLUMN IF NOT EXISTS amount_paid    BIGINT,
  ADD COLUMN IF NOT EXISTS change_amount  BIGINT,
  ADD COLUMN IF NOT EXISTS paid_at        TIMESTAMPTZ;
