# Sprint 2 — Booking App Persistence Report

**Date:** 2026-06-12
**Status:** Complete
**tsc --noEmit:** 0 errors

---

## Files Created

| File                                                             | Purpose                                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| `packages/database/src/migrations/0003_create_bank_accounts.sql` | New table: `bank_accounts` with `salon_id` FK            |
| `src/server/settings/repositories/booking-app.repository.ts`     | DB layer — settings read + all 7 write operations        |
| `src/server/settings/services/booking-app.service.ts`            | Business logic — validation, RepositoryError passthrough |
| `src/server/trpc/routers/settings/booking-app.ts`                | tRPC router — 8 procedures (1 query + 7 mutations)       |

## Files Modified

| File                                                                                         | Change                                                                   |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/server/trpc/routers/settings/_settings.ts`                                              | Registered `bookingApp: bookingAppRouter`                                |
| `src/features/dashboard/hooks/settings/useBookingAppController.ts`                           | Full rewrite — section-based controller, tRPC replacing mock state       |
| `src/features/dashboard/components/settings/components/booking-app/BookingAppPageClient.tsx` | Updated all `ctrl.settings.*` and `ctrl.set*()` callsites to section API |

---

## Migration Requirements

### `0001_alter_salons_brand_booking.sql` — must be applied before go-live

This migration (created Sprint 1.2) adds the `salons` columns that Booking App reads and writes:

```sql
ADD COLUMN IF NOT EXISTS payment_methods    TEXT[]  NOT NULL DEFAULT ARRAY['qris','transfer'],
ADD COLUMN IF NOT EXISTS qris_image_url     TEXT,
ADD COLUMN IF NOT EXISTS confirmation_mode  TEXT    NOT NULL DEFAULT 'auto' CHECK (...),
ADD COLUMN IF NOT EXISTS salon_policy       TEXT;
```

**Verify this ran on the live Supabase instance before Sprint 2 go-live.**

### `0003_create_bank_accounts.sql` — new in Sprint 2

```sql
CREATE TABLE IF NOT EXISTS bank_accounts (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id            UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  bank_name           TEXT        NOT NULL,
  account_number      TEXT        NOT NULL,
  account_holder_name TEXT        NOT NULL,
  is_active           BOOLEAN     NOT NULL DEFAULT true,
  sort_order          INTEGER     NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bank_accounts_salon_id_idx ON bank_accounts(salon_id);
```

---

## Queries Added

### `trpc.settings.bookingApp.getBookingAppSettings`

- Type: `protectedProcedure.query`
- Output: `BookingAppSettings` — full settings object including `bankAccounts[]`
- Implementation: two parallel SELECTs (`salons` booking columns + `bank_accounts`) via `Promise.all`
- Fallback: returns safe defaults if salon row is missing (PGRST116)

---

## Mutations Added

### `trpc.settings.bookingApp.setPaymentMethods`

- Input: `{ methods: PaymentMethod[] }` — min 1 item enforced by Zod + ServiceError
- Output: `ok()`
- Writes: `UPDATE salons SET payment_methods = $1`

### `trpc.settings.bookingApp.setQrisImageUrl`

- Input: `{ url: string | null }` — null or https:// URL (Zod refine)
- Output: `ok()`
- Writes: `UPDATE salons SET qris_image_url = $1`
- Note: blob:/data: URLs are rejected by Zod schema — controller strips them before calling

### `trpc.settings.bookingApp.setConfirmationMode`

- Input: `{ mode: 'auto' | 'manual' }`
- Output: `ok()`
- Writes: `UPDATE salons SET confirmation_mode = $1`

### `trpc.settings.bookingApp.setSalonPolicy`

- Input: `{ policy: string | null }` — max 500 chars (Zod + ServiceError)
- Output: `ok()`
- Writes: `UPDATE salons SET salon_policy = $1`
- Service trims whitespace; empty string → null

### `trpc.settings.bookingApp.addBankAccount`

- Input: `{ bankName, accountNumber, accountHolderName, isActive, sortOrder }`
- Output: `ok(BankAccount)` — returns DB-assigned record with real UUID
- Writes: `INSERT INTO bank_accounts (...)`

### `trpc.settings.bookingApp.updateBankAccount`

- Input: `{ id: UUID, patch: Partial<...> }`
- Output: `ok()`
- Writes: `UPDATE bank_accounts SET ... WHERE id = $1 AND salon_id = $2`
- salonId guard prevents cross-salon updates

### `trpc.settings.bookingApp.removeBankAccount`

- Input: `{ id: UUID }`
- Output: `ok()`
- Writes: `DELETE FROM bank_accounts WHERE id = $1 AND salon_id = $2`
- salonId guard prevents cross-salon deletes

---

## Controller — Section-Based Interface

### Before (flat mock)

```typescript
export interface BookingAppController {
  settings: BookingAppSettings; // one flat object
  auditLog: AuditLogEntry[];
  setPaymentMethod: (method, active) => void;
  setQrisImageUrl: (url, actorId) => void;
  addBankAccount: (account, actorId) => void;
  updateBankAccount: (id, patch, actorId) => void;
  removeBankAccount: (id, actorId) => void;
  setConfirmationMode: (mode) => void;
  setSalonPolicy: (text) => void;
}
```

### After (section-based tRPC)

```typescript
export interface BookingAppController {
  paymentMethods: {
    data: { methods: PaymentMethod[]; qrisImageUrl: string | null };
    isLoading: boolean;
    isSaving: boolean;
    setMethod: (method: PaymentMethod, active: boolean) => void;
    setQrisImageUrl: (url: string | null) => void;
  };
  bankAccounts: {
    data: BankAccount[];
    isLoading: boolean;
    isSaving: boolean;
    add: (account: Omit<BankAccount, "id">) => void;
    update: (id: string, patch: Partial<Omit<BankAccount, "id">>) => void;
    remove: (id: string) => void;
  };
  confirmation: {
    data: ConfirmationMode;
    isLoading: boolean;
    isSaving: boolean;
    save: (mode: ConfirmationMode) => void;
  };
  salonPolicy: {
    data: string | null;
    isLoading: boolean;
    isSaving: boolean;
    save: (text: string | null) => void;
  };
}
```

The `actorId` parameter has been removed from all mutations — actor is derived server-side from
`ctx.salonId` when audit logging is wired in a future sprint.

---

## Page Callsite Changes (BookingAppPageClient.tsx)

`BookingAppPageClient` was updated to use the new section API. Changes are mechanical — no UX change.

| Before                                     | After                                      |
| ------------------------------------------ | ------------------------------------------ |
| `ctrl.settings.confirmationMode`           | `ctrl.confirmation.data`                   |
| `ctrl.settings.salonPolicy`                | `ctrl.salonPolicy.data`                    |
| `ctrl.settings.qrisImageUrl`               | `ctrl.paymentMethods.data.qrisImageUrl`    |
| `ctrl.settings.bankAccounts`               | `ctrl.bankAccounts.data`                   |
| `ctrl.settings.paymentMethods`             | `ctrl.paymentMethods.data.methods`         |
| `ctrl.setPaymentMethod(m, v)`              | `ctrl.paymentMethods.setMethod(m, v)`      |
| `ctrl.setQrisImageUrl(url, actorId)`       | `ctrl.paymentMethods.setQrisImageUrl(url)` |
| `ctrl.addBankAccount(acc, actorId)`        | `ctrl.bankAccounts.add(acc)`               |
| `ctrl.updateBankAccount(id, acc, actorId)` | `ctrl.bankAccounts.update(id, acc)`        |
| `ctrl.removeBankAccount(id, actorId)`      | `ctrl.bankAccounts.remove(id)`             |
| `ctrl.setConfirmationMode(mode)`           | `ctrl.confirmation.save(mode)`             |
| `ctrl.setSalonPolicy(text)`                | `ctrl.salonPolicy.save(text)`              |

Two improvements added to sheets that now have real DB backing:

- Confirmation sheet: `isSaving={ctrl.confirmation.isSaving}` passed to `SettingsSideSheet`
- Policy sheet: `isSaving={ctrl.salonPolicy.isSaving}` passed to `SettingsSideSheet`

---

## End-to-End Flow

### Read (page load)

```
BookingAppPageClient renders
  → useBookingAppController()
    → trpc.settings.bookingApp.getBookingAppSettings.useQuery()
      → bookingAppRouter.getBookingAppSettings
        → bookingAppService.getBookingAppSettings(salonId)
          → Promise.all([
              SELECT payment_methods, qris_image_url, confirmation_mode, salon_policy
                FROM salons WHERE id = salonId,
              SELECT id, bank_name, account_number, account_holder_name, is_active
                FROM bank_accounts WHERE salon_id = salonId ORDER BY sort_order
            ])
          ← BookingAppSettings
      ← BookingAppSettings
    ← settingsFromDb
  → sections hydrate from query data
```

### Write example — toggle payment method

```
Owner clicks QRIS toggle (off)
  → ctrl.paymentMethods.setMethod('qris', false)
    → checks: ['transfer'] — length > 0, ok
    → setPaymentMethodsMutation({ methods: ['transfer'] })
      → bookingAppRouter.setPaymentMethods
        → bookingAppService.setPaymentMethods(salonId, ['transfer']) [validates min 1]
          → bookingAppRepo.setPaymentMethods(salonId, ['transfer'])
            → UPDATE salons SET payment_methods = ['transfer'] WHERE id = salonId
      ← ok()
    → onSuccess: invalidate getBookingAppSettings
      → query refetches → QRIS toggle reflects new DB state
```

### Write example — add bank account

```
Owner fills form → clicks Tambah
  → ctrl.bankAccounts.add({ bankName: 'BCA', accountNumber: '123', accountHolderName: 'Jane', isActive: true })
    → addBankAccountMutation({ ...account, sortOrder: 0 })
      → bookingAppRouter.addBankAccount
        → bookingAppService.addBankAccount(salonId, data, 0) [validates non-empty fields]
          → bookingAppRepo.addBankAccount(salonId, data, 0)
            → INSERT INTO bank_accounts (...) RETURNING ...
          ← BankAccount (with real UUID)
        ← BankAccount
      ← ok(BankAccount)
    → onSuccess: invalidate getBookingAppSettings
      → query refetches → bank account appears in list
```

---

## Deferred: QRIS Image Upload

QRIS image upload is **deferred to Sprint 4**. Two blockers:

1. **`supabaseAdmin` client** — presigned URLs require service_role_key. Not available until Sprint 4.
2. **Supabase Storage bucket** — `qris-images` bucket must exist in Supabase Dashboard.

**Behaviour in Sprint 2:**

- File picker works — local blob: URL preview displays immediately
- `ctrl.paymentMethods.setQrisImageUrl(blobUrl)` silently no-ops (controller checks `url.startsWith('https://')`)
- tRPC `setQrisImageUrl` router additionally validates with Zod `.refine((v) => v.startsWith('https://'))`
- After page refresh, QRIS shows "Belum ada foto" (blob: never persisted)
- Explicit removal (`setQrisImageUrl(null)`) DOES persist to DB — sets `qris_image_url = NULL`

**Sprint 4 wiring:**
When `supabaseAdmin` is available, the upload flow will:

1. Call `trpc.settings.bookingApp.setQrisImageUrl({ url: realHttpsUrl })` after successful Storage upload
2. No controller changes needed — the mutation already accepts https:// URLs

---

## Deferred: Audit Log Persistence

QRIS, bank account, and payment method changes are not persisted to `audit_logs` in Sprint 2.
The `audit.ts` contract is in place (`IAuditLogger` / `NoopAuditLogger`). When `audit_logs` table
is created (Sprint 4 prerequisite), inject `DbAuditLogger` into `booking-app.service.ts` with
zero service logic changes.

`NoopAuditLogger` writes to console only in non-production environments.

---

## Known Limitations

1. **`sort_order` not exposed in `BankAccount` TS interface** — the DB has `sort_order` for future
   drag-to-reorder. Sprint 2 sets it to `bankAccounts.length` on add. If two rapid adds fire before
   the query refetches, they may get the same `sort_order`. Drag-to-reorder (Sprint 3+) will own
   sort_order explicitly with a dedicated mutation.

2. **QRIS upload not persisted** — see Deferred section above.

3. **Audit log not persisted** — `NoopAuditLogger` used for all mutations. See Deferred section.

4. **`updated_at` on bank_accounts** — `updateBankAccount` in the repository manually sets
   `updated_at: new Date().toISOString()`. If a Postgres trigger handles `updated_at`, this
   creates a redundant write (harmless). Verify trigger existence on the live DB and remove the
   manual set if a trigger is confirmed.

5. **Customer app not updated** — customer app does not yet read `payment_methods`, `bank_accounts`,
   or `confirmation_mode` from DB. Owner changes persist correctly but won't affect customer
   checkout until customer app is updated in a separate sprint.

---

## Architecture Compliance

- No direct Supabase access outside `repositories/`
- No `any` types — strict TypeScript throughout (`unknown` cast at Supabase boundary)
- All procedures use `protectedProcedure` — UNAUTHORIZED if salonId absent
- `ok()` / `ok(data)` used consistently from `result.ts`
- `RepositoryError` / `ServiceError` / `toTRPCError()` chain followed exactly
- Section-based controller pattern — canonical per SPRINT1_1_1_CLEANUP_REPORT.md
- `staleTime: 30_000` on the shared query
- No namespace-level invalidation — only `getBookingAppSettings` invalidated per mutation
- No optimistic updates — invalidate and refetch after every mutation
- salonId guard on all bank_account mutations (`.eq('salon_id', salonId)`)

---

## Typecheck Result

```
npx tsc --noEmit  →  0 errors
```
