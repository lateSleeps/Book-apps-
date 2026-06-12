-- Sprint 3.2: Service bundles (groups of services sold together at a discount)
CREATE TABLE IF NOT EXISTS service_bundles (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id     UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  description  TEXT        NOT NULL DEFAULT '',
  bundle_price BIGINT      NOT NULL CHECK (bundle_price > 0),
  image_url    TEXT,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_bundles_salon_id_idx ON service_bundles (salon_id);

-- Junction table: which services belong to each bundle
-- ON DELETE CASCADE on both sides:
--   - deleting a bundle removes its items
--   - deleting a service removes it from all bundles (see Risk 1 in PRODUCTS_DOMAIN_READINESS.md)
CREATE TABLE IF NOT EXISTS service_bundle_items (
  bundle_id  UUID NOT NULL REFERENCES service_bundles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (bundle_id, service_id)
);

CREATE INDEX IF NOT EXISTS service_bundle_items_bundle_id_idx ON service_bundle_items (bundle_id);
