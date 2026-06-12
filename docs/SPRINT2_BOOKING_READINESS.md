# Sprint 2 — Booking App Readiness Review

**Date:** 2026-06-12
**Reviewer:** Architecture review (pre-implementation)
**Input:** SPRINT1_1_BUSINESS_HOURS_REPORT.md, SPRINT1_2_BRAND_REPORT.md,
SPRINT1_3_SERVICES_REPORT.md, SETTINGS_DATABASE_ROLLOUT_PLAN.md

---

## Verdict

**Booking App CAN start Sprint 2 with a partial scope.**

The `salons` column side is migration-ready (covered by 0001 from Sprint 1.2). Three out of six
controller actions are unblocked today. Two blockers exist:

1. `bank_accounts` table does not exist — needs a new migration before bank account CRUD can be wired.
2. QRIS file upload requires `supabaseAdmin` client (not available until Sprint 4) and a live Storage bucket.

These blockers split naturally: implement the unblocked features first (settings + salon policy +
confirmation mode + payment methods), then do bank accounts after the migration, and defer QRIS
upload entirely to Sprint 4.

---

## Classification Summary

| Feature                           | Classification            | Blocker                              |
| --------------------------------- | ------------------------- | ------------------------------------ |
| Read `BookingAppSettings` from DB | **READY NOW**             | none — 0001 already adds the columns |
| `setPaymentMethods`               | **READY NOW**             | none                                 |
| `setConfirmationMode`             | **READY NOW**             | none                                 |
| `setSalonPolicy`                  | **READY NOW**             | none                                 |
| `setQrisImageUrl` (persist URL)   | **READY NOW**             | qris_image_url column exists in 0001 |
| `addBankAccount`                  | **NEEDS MIGRATION FIRST** | `bank_accounts` table missing        |
| `updateBankAccount`               | **NEEDS MIGRATION FIRST** | same                                 |
| `removeBankAccount`               | **NEEDS MIGRATION FIRST** | same                                 |
| QRIS actual file UPLOAD           | **NEEDS STORAGE FIRST**   | supabaseAdmin client + bucket        |
| Audit log DB write                | **NEEDS MIGRATION FIRST** | `audit_logs` table missing           |

---

## 1. Existing `salons` Columns

Migration `0001_alter_salons_brand_booking.sql` (created Sprint 1.2) adds these Booking App
columns to `salons`:

| Column              | Type         | Default                    | Status            |
| ------------------- | ------------ | -------------------------- | ----------------- |
| `payment_methods`   | TEXT[]       | `ARRAY['qris','transfer']` | In migration 0001 |
| `qris_image_url`    | TEXT         | NULL                       | In migration 0001 |
| `confirmation_mode` | TEXT + CHECK | `'auto'`                   | In migration 0001 |
| `salon_policy`      | TEXT         | NULL                       | In migration 0001 |

**All four columns are covered by a migration that already exists.**

**Caveat:** Sprint 1.2 report says to "run before Sprint 1.2 go-live." This implies the migration
file exists but its execution on the live Supabase instance has not been confirmed in code.
**Verify that 0001 has been executed on the live DB before beginning Sprint 2.** If it has not,
all four features above are also blocked until 0001 is run.

---

## 2. Booking App Migration Requirements

### What is already covered

Migration 0001 covers the entire `salons` side of Booking App. No further ALTER TABLE needed.

### What is still missing

**`bank_accounts` table — does not exist.**

Required schema (from audit):

```sql
-- packages/database/src/migrations/0003_create_bank_accounts.sql
CREATE TABLE IF NOT EXISTS bank_accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id            UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  bank_name           TEXT NOT NULL,
  account_number      TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bank_accounts_salon_id_idx ON bank_accounts(salon_id);
```

**`audit_logs` table — does not exist.**

The rollout plan explicitly states: "QRIS operations wajib diaudit — buat `audit_logs` bersamaan."
The `audit.ts` contract file already exists with `IAuditLogger` / `NoopAuditLogger` interface.
`DbAuditLogger` is the real implementation that writes to DB. Without `audit_logs`, only the
noop stub is available.

Required schema:

```sql
-- Include in 0003 or as 0004_create_audit_logs.sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id    UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  actor_id    TEXT NOT NULL,
  action      TEXT NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_salon_id_idx ON audit_logs(salon_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);
```

**Decision to make:** The rollout plan treats `audit_logs` as mandatory for QRIS. For the
non-QRIS features (paymentMethods, confirmationMode, salonPolicy, bankAccounts), `NoopAuditLogger`
is sufficient — these mutations are not financial assets. Sprint 2 can start those features using
`noopAuditLogger` and add `DbAuditLogger` once the table exists.

---

## 3. QRIS Upload Dependencies

QRIS image upload requires two things that do not currently exist:

### 3a. `supabaseAdmin` client

`upload.ts` documents this explicitly:

> "presigned URLs for Supabase Storage require the supabaseAdmin client (service_role_key).
> This will be wired up when Sprint 4 introduces the admin client. Until then, the upload
> mutation stubs exist in the router but return NOT_IMPLEMENTED."

**`supabaseAdmin` is not available until Sprint 4.** QRIS file upload cannot be implemented
in Sprint 2 without pulling Sprint 4 infrastructure forward.

### 3b. `qris-images` bucket

`STORAGE_BUCKETS.qris = 'qris-images'` is defined in `upload.ts`. The bucket name is known.
But the bucket itself must be created in Supabase Dashboard (Storage > Buckets > New bucket).
This is a manual setup step, not a code step. It is independent of `supabaseAdmin` — the
bucket can be created now, before Sprint 4.

### Implication for Sprint 2

**Two paths:**

**Path A — Defer QRIS entirely:**
Do not implement `setQrisImageUrl` in Sprint 2 at all. The column exists, the controller still
holds the mock `qrisImageUrl` value from UI interaction. The real upload ships in Sprint 4
alongside `supabaseAdmin`. This is the lower-risk path.

**Path B — Persist QRIS URL only (no upload):**
Implement `setQrisImageUrl(url)` mutation that writes to `salons.qris_image_url`. Skip the
presigned URL flow. Use the same blob-URL safety check as Brand's logo (blob: → keep existing
DB value). The column can be read and written. Actual file bytes never leave the browser until
Sprint 4. This unblocks owner settings reads but does not ship actual file upload.

**Recommendation: Path A.**
The `qrisImageUrl` field in the settings page is tightly coupled to the upload UX — showing
a preview requires a blob URL which only becomes a real URL after a successful upload. Persisting
a URL without the upload path creates a dead-end user experience. Defer the entire QRIS feature
to Sprint 4 when `supabaseAdmin` is available.

---

## 4. Storage Bucket Requirements

Six buckets are defined in `upload.ts`:

| Bucket name      | Used by             | Sprint                            |
| ---------------- | ------------------- | --------------------------------- |
| `salon-logos`    | Brand logo          | Sprint 4                          |
| `salon-covers`   | Brand cover         | Sprint 4                          |
| `qris-images`    | QRIS payment image  | Sprint 4 (deferred from Sprint 2) |
| `staff-avatars`  | Tim (staff) avatar  | Sprint 4                          |
| `product-images` | Produk add-on image | Sprint 4                          |
| `bundle-covers`  | Paket cover image   | Sprint 4                          |

**For Sprint 2:** None of the buckets are required if QRIS upload is deferred (Path A).
Creating the buckets in Supabase Dashboard can be done now as setup, but they will remain
unused until Sprint 4 wires `supabaseAdmin`.

---

## 5. Bank Account Data Model

The `BankAccount` TypeScript interface (from `booking-app.types.ts`):

```typescript
interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isActive: boolean;
}
```

DB mapping is straightforward:

| TS field            | DB column                  | Notes                            |
| ------------------- | -------------------------- | -------------------------------- |
| `id`                | `id UUID`                  | generated by DB on INSERT        |
| `bankName`          | `bank_name TEXT`           | NOT NULL                         |
| `accountNumber`     | `account_number TEXT`      | NOT NULL                         |
| `accountHolderName` | `account_holder_name TEXT` | NOT NULL                         |
| `isActive`          | `is_active BOOLEAN`        | DEFAULT true                     |
| —                   | `sort_order INTEGER`       | DB-only, not in TS interface yet |
| —                   | `salon_id UUID`            | injected from tRPC context       |

**One gap:** The current `BankAccount` TS interface has no `sortOrder` field. The DB will have
`sort_order` for future drag-to-reorder. Sprint 2 can add `sort_order` to DB without exposing
it in the interface (it will just increment). If the interface needs `sortOrder` added later,
that is a non-breaking UI change.

**Controller interface note:** The current `useBookingAppController` mock has:

```typescript
addBankAccount: (account: Omit<BankAccount, 'id'>, actorId: string) => void;
updateBankAccount: (id, patch, actorId) => void;
removeBankAccount: (id, actorId) => void;
```

The `actorId` parameter exists for the mock's local `appendAudit` call. In the real controller,
`actorId` will still be passed by the UI (it uses `CURRENT_USER_ID = 'owner-001'`), but the
tRPC router will derive actor from `ctx` server-side. The parameter can stay in the interface
signature for zero UI change, but the router input schema does not need it as an input field.

---

## 6. Salon Policy Storage

`salon_policy TEXT` — column is in migration 0001, nullable, no length constraint in DB.

The current controller enforces max 500 chars client-side:

```typescript
if (value !== null && value.length > 500) return;
```

The service layer should add the same validation server-side (max 500 chars) via Zod + ServiceError.

No storage concerns — plain text in a `salons` column. **Fully READY NOW** after 0001 runs.

---

## 7. Audit Log Integration

### Current state

`src/server/settings/lib/audit.ts` defines:

- `IAuditLogger` interface
- `NoopAuditLogger` — console-only, no DB writes
- `noopAuditLogger` singleton — ready to inject into services

### What Sprint 2 needs

The rollout plan marks QRIS audit as mandatory. Bank account mutations (add/edit/remove) are
also in scope for audit per `booking-app.types.ts` (`AuditAction` includes bank*account*\* variants).

**If QRIS is deferred (Path A):** Sprint 2 can use `noopAuditLogger` for bank account mutations
and ship without the `audit_logs` table. The interface is already wired for a clean swap to
`DbAuditLogger` in Sprint 4.

**If QRIS is included (Path B):** `audit_logs` table MUST be created. The rollout plan is explicit:
"QRIS operations wajib diaudit."

### What `DbAuditLogger` needs (for future reference)

When `audit_logs` table is created, `DbAuditLogger` implementation:

```typescript
export class DbAuditLogger implements IAuditLogger {
  async log(entry: AuditEntry): Promise<void> {
    await db.from("audit_logs").insert({
      salon_id: entry.salonId,
      actor_id: entry.actorId,
      action: entry.action,
      metadata: entry.metadata ?? null,
    });
  }
}
```

The `audit.ts` contract means zero changes to any service code when swapping loggers — only
the injection site in the router changes.

---

## 8. Customer App Dependencies

Customer app does NOT currently read Booking App settings from DB. The grep confirms no
references to `payment_methods`, `qris_image_url`, `bank_accounts`, `confirmation_mode`,
or `salon_policy` anywhere in `apps/customer/src`.

**Meaning:** Sprint 2 can implement owner-side persistence without any risk of breaking
the customer booking flow. The customer app is currently hardcoded or reading from a
different source.

**Future coordination required (not a Sprint 2 blocker):**
The customer app will need to be updated to read:

- `payment_methods` → show available payment options at checkout
- `qris_image_url` → display QRIS QR code
- `bank_accounts` → display transfer accounts
- `confirmation_mode` → determine post-booking behavior
- `salon_policy` → pre-booking policy modal

This is a separate sprint of customer app work. It does not block owner dashboard Sprint 2.

---

## Sprint 2 Recommended Sequence

Given the above analysis, this sequence minimises risk and unblocks maximum value:

### Step 1 — Verify migrations (day 0)

- Confirm `0001_alter_salons_brand_booking.sql` has been executed on live DB.
- If not, run it now. All `salons` columns (paymentMethods, confirmationMode, salonPolicy,
  qrisImageUrl) depend on it.
- Confirm `0002_alter_categories_services.sql` has been executed (Sprint 1.3 prerequisite).

### Step 2 — Create `bank_accounts` migration

- Write `0003_create_bank_accounts.sql` (bank_accounts + optional audit_logs).
- Run on live DB.

### Step 3 — Implement Booking App without QRIS upload

**Scope for Sprint 2 implementation:**

- `getBookingAppSettings` query (reads salons + bank_accounts)
- `setPaymentMethods` mutation
- `setConfirmationMode` mutation
- `setSalonPolicy` mutation
- `addBankAccount` / `updateBankAccount` / `removeBankAccount` mutations
- Rewrite `useBookingAppController` to use tRPC (keep interface identical)
- Use `noopAuditLogger` for audit until `audit_logs` table is created

**Deferred to Sprint 4:**

- QRIS image upload (requires `supabaseAdmin`)
- `DbAuditLogger` (requires `audit_logs` table)

### Step 4 — Operasional sisa (Sprint 2, Step 5 per rollout plan)

- `special_closing_dates` + `booking_policies` tables
- Extend `operational.repository.ts`
- Customer app coordination for `slot_interval_minutes`

---

## Blocker Summary

| Blocker                          | Impact                          | Resolution                                                      |
| -------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| Confirm 0001 ran on live DB      | Blocks ALL salons-side features | Manual verification step                                        |
| `bank_accounts` table missing    | Blocks bank account CRUD        | New migration 0003                                              |
| `supabaseAdmin` client missing   | Blocks QRIS file upload         | Deferred to Sprint 4                                            |
| `audit_logs` table missing       | Blocks DbAuditLogger for QRIS   | Acceptable: use NoopAuditLogger for Sprint 2 non-QRIS mutations |
| Customer app not reading from DB | Customer doesn't see changes    | Out of scope for owner dashboard Sprint 2                       |

---

## Controller Interface Preservation

`BookingAppController` interface must remain unchanged (same rule as Sprint 1.2 and 1.3).
`BookingAppPageClient.tsx` uses `ctrl.settings.*` and `ctrl.set*()` directly. Zero UI files
should change.

The `actorId` parameter on QRIS/bank mutations stays in the interface signature. The router
ignores it for non-audit mutations and derives actor server-side for audit-mandatory ones.
