-- ============================================================
-- RARA BEAUTY SEED: Categories + Services
-- Salon: 5cdb0848-1b43-44f6-be29-b2ead49ff65a
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

DO $$
DECLARE
  salon_id  UUID := '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

  cat_hair    UUID;
  cat_colour  UUID;
  cat_face    UUID;
  cat_massage UUID;
  cat_nail    UUID;
BEGIN

  -- ── CATEGORIES ────────────────────────────────────────────

  INSERT INTO categories (salon_id, name, slug, description, created_at, updated_at)
  VALUES (salon_id, 'Hair', 'hair', 'Haircut, wash, styling & braiding', now(), now())
  ON CONFLICT (salon_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_hair;

  INSERT INTO categories (salon_id, name, slug, description, created_at, updated_at)
  VALUES (salon_id, 'Colour & Treatment', 'colour-treatment', 'Colouring, keratin & hair spa', now(), now())
  ON CONFLICT (salon_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_colour;

  INSERT INTO categories (salon_id, name, slug, description, created_at, updated_at)
  VALUES (salon_id, 'Face & Lashes', 'face-lashes', 'Facial, make up & lash extensions', now(), now())
  ON CONFLICT (salon_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_face;

  INSERT INTO categories (salon_id, name, slug, description, created_at, updated_at)
  VALUES (salon_id, 'Massage', 'massage', 'Full body, reflexology & scrub', now(), now())
  ON CONFLICT (salon_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_massage;

  INSERT INTO categories (salon_id, name, slug, description, created_at, updated_at)
  VALUES (salon_id, 'Nail', 'nail', 'Manicure, pedicure & nail art', now(), now())
  ON CONFLICT (salon_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_nail;

  -- ── SERVICES: Hair ─────────────────────────────────────────

  INSERT INTO services (salon_id, category_id, name, description, price, duration, is_active, created_at, updated_at)
  VALUES
    (salon_id, cat_hair, 'Haircut & Blow Dry',    'Wash, cut & blow dry sesuai bentuk wajah',                   8500000,  60,  true, now(), now()),
    (salon_id, cat_hair, 'Haircut (Tanpa Cuci)',   'Potong rambut tanpa keramas',                                6000000,  45,  true, now(), now()),
    (salon_id, cat_hair, 'Cuci & Blow Dry',        'Keramas dengan produk premium + blow dry & styling',         5000000,  45,  true, now(), now()),
    (salon_id, cat_hair, 'Smoothing / Rebonding',  'Pelurusan rambut tahan lama dengan formula Japan',          25000000, 180, true, now(), now()),
    (salon_id, cat_hair, 'Creambath',              'Perawatan rambut dengan pijat kepala & masker protein',     10000000,  60, true, now(), now())
  ON CONFLICT DO NOTHING;

  -- ── SERVICES: Colour & Treatment ───────────────────────────

  INSERT INTO services (salon_id, category_id, name, description, price, duration, is_active, created_at, updated_at)
  VALUES
    (salon_id, cat_colour, 'Global Colour',        'Pewarnaan seluruh rambut, harga mulai dari panjang pendek',  20000000, 120, true, now(), now()),
    (salon_id, cat_colour, 'Highlight / Balayage', 'Highlight partial atau full, teknik balayage & ombre',       30000000, 180, true, now(), now()),
    (salon_id, cat_colour, 'Keratin Treatment',    'Melembutkan & meluruskan rambut dengan protein keratin',     35000000, 240, true, now(), now()),
    (salon_id, cat_colour, 'Hair Spa',             'Perawatan intensif dengan masker keratin & steam',           15000000,  90, true, now(), now())
  ON CONFLICT DO NOTHING;

  -- ── SERVICES: Face & Lashes ────────────────────────────────

  INSERT INTO services (salon_id, category_id, name, description, price, duration, is_active, created_at, updated_at)
  VALUES
    (salon_id, cat_face, 'Basic Facial',          'Pembersihan wajah mendalam + ekstraksi & masker',            12000000,  60, true, now(), now()),
    (salon_id, cat_face, 'Lash Lift & Tint',      'Melentikkan bulu mata + pewarnaan tahan 6–8 minggu',         15000000,  90, true, now(), now()),
    (salon_id, cat_face, 'Eyelash Extension',     'Sambung bulu mata natural / volume / mega volume',           25000000, 120, true, now(), now()),
    (salon_id, cat_face, 'Make Up Natural',        'Riasan sehari-hari atau acara casual',                       20000000,  60, true, now(), now()),
    (salon_id, cat_face, 'Make Up Full Glam',      'Riasan penuh untuk pesta, wisuda & pernikahan',              35000000,  90, true, now(), now())
  ON CONFLICT DO NOTHING;

  -- ── SERVICES: Massage ──────────────────────────────────────

  INSERT INTO services (salon_id, category_id, name, description, price, duration, is_active, created_at, updated_at)
  VALUES
    (salon_id, cat_massage, 'Swedish Massage 60 min',   'Pijat relaksasi seluruh tubuh dengan teknik Swedish',    12000000,  60, true, now(), now()),
    (salon_id, cat_massage, 'Deep Tissue 90 min',       'Pijat intensif untuk otot tegang & nyeri punggung',     18000000,  90, true, now(), now()),
    (salon_id, cat_massage, 'Refleksi Kaki 45 min',     'Pijat titik tekan telapak kaki & betis',                  8000000,  45, true, now(), now()),
    (salon_id, cat_massage, 'Lulur & Body Scrub',       'Eksfoliasi + pijat dengan lulur tradisional Indonesia', 20000000, 120, true, now(), now())
  ON CONFLICT DO NOTHING;

  -- ── SERVICES: Nail ─────────────────────────────────────────

  INSERT INTO services (salon_id, category_id, name, description, price, duration, is_active, created_at, updated_at)
  VALUES
    (salon_id, cat_nail, 'Manicure Basic',        'Perawatan kuku tangan + cat kuku reguler',                    6000000,  45, true, now(), now()),
    (salon_id, cat_nail, 'Pedicure Basic',        'Perawatan kuku kaki + cat kuku reguler',                      7000000,  60, true, now(), now()),
    (salon_id, cat_nail, 'Gel Manicure',          'Cat gel tahan 2–3 minggu tanpa chip',                        12000000,  60, true, now(), now()),
    (salon_id, cat_nail, 'Nail Art',              'Desain custom: ombre, chrome, 3D, hand-painted',             18000000,  90, true, now(), now()),
    (salon_id, cat_nail, 'Nail Extension (Acrylic/Gel)', 'Perpanjangan kuku akrilik atau gel, panjang sesuai request', 25000000, 120, true, now(), now())
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed complete. Categories and services inserted for salon %', salon_id;
END $$;
