-- Delete duplicate salon: 4d0de2a8-b965-4802-85f1-db9ae703da8e
-- Run in Supabase SQL Editor

DO $$
DECLARE
  dup_salon_id uuid := '4d0de2a8-b965-4802-85f1-db9ae703da8e';
BEGIN
  -- 1. Delete stylists (via user cascade or direct)
  DELETE FROM stylists WHERE salon_id = dup_salon_id;

  -- 2. Delete services
  DELETE FROM services WHERE salon_id = dup_salon_id;

  -- 3. Delete categories
  DELETE FROM categories WHERE salon_id = dup_salon_id;

  -- 4. Delete bookings if any
  DELETE FROM bookings WHERE salon_id = dup_salon_id;

  -- 5. Delete the salon itself
  DELETE FROM salons WHERE id = dup_salon_id;

  RAISE NOTICE 'Done. Deleted salon %', dup_salon_id;
END $$;
