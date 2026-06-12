-- Sprint 3.2: Add-on products for a salon (shampoo, serum, etc.)
CREATE TABLE IF NOT EXISTS add_on_products (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id    UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  price       BIGINT      NOT NULL DEFAULT 0 CHECK (price >= 0),
  image_url   TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS add_on_products_salon_id_idx ON add_on_products (salon_id);
