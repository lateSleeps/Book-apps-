-- ============================================================
-- Migration: Add requires_specialist + service_questions to services
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE services ADD COLUMN IF NOT EXISTS requires_specialist boolean DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_questions jsonb DEFAULT '[]'::jsonb;

-- Update "Haircut & Blow Dry" (the full-service haircut) with specialist flag + sample questions
-- Adjust the name match if your seed used a different name
UPDATE services
SET
  requires_specialist = true,
  service_questions = '[
    {
      "id": "q1",
      "question": "Panjang rambut saat ini",
      "type": "chips",
      "required": true,
      "options": ["Pendek (< 10 cm)", "Medium (10–25 cm)", "Panjang (> 25 cm)"]
    },
    {
      "id": "q2",
      "question": "Preferensi potongan",
      "type": "chips",
      "required": false,
      "options": ["Layer", "Blunt Cut", "Thinning", "Bob", "Undercut", "Bebas / Terserah"]
    },
    {
      "id": "q3",
      "question": "Foto referensi",
      "type": "photo",
      "required": false,
      "options": []
    }
  ]'::jsonb
WHERE name = 'Haircut & Blow Dry'
  AND salon_id = '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

-- Verify
SELECT id, name, requires_specialist, service_questions
FROM services
WHERE salon_id = '5cdb0848-1b43-44f6-be29-b2ead49ff65a'
ORDER BY name;
