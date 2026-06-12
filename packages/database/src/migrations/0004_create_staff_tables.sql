-- ── Sprint 3.1 — Team Domain ─────────────────────────────────────────────────
-- Creates 4 tables in dependency order:
--   1. staff_members           — one row per staff per salon
--   2. staff_service_assignments — one row per staff, stores serviceIds[]
--   3. staff_schedules         — seven rows per staff (one per weekday)
--   4. staff_leaves            — many rows per staff

-- ── 1. staff_members ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS staff_members (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id         UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  full_name        TEXT        NOT NULL,
  phone            TEXT        NOT NULL DEFAULT '',
  role             TEXT        NOT NULL
                               CHECK (role IN ('MANAGER','STYLIST','COLORIST','NAIL_ARTIST','THERAPIST','RECEPTIONIST')),
  specialty        TEXT        CHECK (specialty IN ('HAIR_STYLIST','COLORIST','NAIL_ARTIST','THERAPIST')),
  avatar_url       TEXT,
  avatar_color     TEXT        NOT NULL DEFAULT '#e8e8e8',
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  sort_order       INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_members_salon_id_idx ON staff_members(salon_id);

-- ── 2. staff_service_assignments ─────────────────────────────────────────────
-- One row per staff member. service_ids stores an array of services.id values.
-- UNIQUE(staff_id) enforced — one assignment record per staff.

CREATE TABLE IF NOT EXISTS staff_service_assignments (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id         UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_id         UUID        NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  service_ids      TEXT[]      NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id)
);

CREATE INDEX IF NOT EXISTS staff_service_assignments_salon_id_idx ON staff_service_assignments(salon_id);
CREATE INDEX IF NOT EXISTS staff_service_assignments_staff_id_idx ON staff_service_assignments(staff_id);

-- ── 3. staff_schedules ───────────────────────────────────────────────────────
-- Seven rows per staff member (one per weekday).
-- UNIQUE(staff_id, day) enables INSERT ON CONFLICT DO UPDATE (upsert).

CREATE TABLE IF NOT EXISTS staff_schedules (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id         UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_id         UUID        NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  day              TEXT        NOT NULL
                               CHECK (day IN ('MON','TUE','WED','THU','FRI','SAT','SUN')),
  enabled          BOOLEAN     NOT NULL DEFAULT true,
  start_time       TEXT        NOT NULL DEFAULT '09:00',
  end_time         TEXT        NOT NULL DEFAULT '18:00',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, day)
);

CREATE INDEX IF NOT EXISTS staff_schedules_salon_id_idx ON staff_schedules(salon_id);
CREATE INDEX IF NOT EXISTS staff_schedules_staff_id_idx ON staff_schedules(staff_id);

-- ── 4. staff_leaves ──────────────────────────────────────────────────────────
-- Unbounded history. No uniqueness on (staff_id, date) — multiple types per day allowed.

CREATE TABLE IF NOT EXISTS staff_leaves (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id         UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_id         UUID        NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  type             TEXT        NOT NULL
                               CHECK (type IN ('LEAVE','SICK','HOLIDAY','UNAVAILABLE')),
  date             DATE        NOT NULL,
  note             TEXT        NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_leaves_salon_id_idx ON staff_leaves(salon_id);
CREATE INDEX IF NOT EXISTS staff_leaves_staff_id_idx ON staff_leaves(staff_id);
CREATE INDEX IF NOT EXISTS staff_leaves_date_idx ON staff_leaves(date);
