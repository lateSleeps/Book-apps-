-- Migration: add settlement_proof_url to bookings
-- Run this in Supabase SQL editor

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS settlement_proof_url TEXT;

COMMENT ON COLUMN bookings.settlement_proof_url IS 'Bukti pelunasan oleh customer saat melunasi sisa tagihan di salon (berbeda dengan payment_proof_url yang merupakan bukti DP dari app customer)';
