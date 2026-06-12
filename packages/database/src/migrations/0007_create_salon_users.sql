-- Sprint 4: Users & Access
-- Creates salon_users table bridging Supabase Auth users to salon access control.

CREATE TABLE IF NOT EXISTS salon_users (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id       UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  auth_user_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  email          TEXT        NOT NULL,
  role           TEXT        NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MANAGER', 'STAFF')),
  status         TEXT        NOT NULL DEFAULT 'INVITED'
                             CHECK (status IN ('ACTIVE', 'INVITED', 'INACTIVE', 'REVOKED')),
  staff_id       UUID        REFERENCES staff_members(id) ON DELETE SET NULL,
  join_date      DATE,
  invited_at     TIMESTAMPTZ,
  last_login_at  TIMESTAMPTZ,
  avatar_url     TEXT,
  phone          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salon_id, auth_user_id),
  UNIQUE(salon_id, email)
);

CREATE INDEX IF NOT EXISTS salon_users_salon_id_idx     ON salon_users (salon_id);
CREATE INDEX IF NOT EXISTS salon_users_auth_user_id_idx ON salon_users (auth_user_id);
