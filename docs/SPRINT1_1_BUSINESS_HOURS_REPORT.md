# Sprint 1.1 — Business Hours Report

## Status: COMPLETE

---

## Files Created

| File                                                         | Purpose                                                                 |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `src/server/settings/repositories/operational.repository.ts` | DB layer — `getBusinessHours`, `upsertBusinessHours` via Supabase       |
| `src/server/settings/services/operational.service.ts`        | Business logic — validation, DEFAULT_BUSINESS_HOURS fallback            |
| `src/server/trpc/routers/settings/operational.ts`            | tRPC router — `getBusinessHours` query + `upsertBusinessHours` mutation |
| `src/server/trpc/routers/settings/_settings.ts`              | Settings namespace router — `settings.operational.*`                    |

## Files Modified

| File                                                                                          | Change                                                                                                                  |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/features/auth/mocks/auth-mock.ts`                                                        | All 4 mock users: `salonId` changed from `'salon-001'` to `'5cdb0848-1b43-44f6-be29-b2ead49ff65a'` (real Supabase UUID) |
| `src/server/trpc/routers/_app.ts`                                                             | Added `settings: settingsRouter` to app router                                                                          |
| `src/features/dashboard/hooks/settings/useOperationalController.ts`                           | Full rewrite — tRPC query + mutation replacing local useState for business hours                                        |
| `src/features/dashboard/components/settings/components/operasional/OperationalPageClient.tsx` | `handleHoursSave` converted to async; `isSaving={ctrl.isSavingHours}` added to SettingsSideSheet                        |

---

## Queries Added

### `trpc.settings.operational.getBusinessHours`

- Type: `protectedProcedure.query`
- Input: none (salonId from context)
- Output: `BusinessHoursDay[]` (7 items, or DEFAULT_BUSINESS_HOURS if no DB rows)

## Mutations Added

### `trpc.settings.operational.upsertBusinessHours`

- Type: `protectedProcedure.mutation`
- Input: `{ hours: BusinessHoursDay[] }` — must be exactly 7 items
- Output: `{ success: true }`
- Validation: service layer rejects open days with missing times or closeTime <= openTime

---

## End-to-End Flow

```
OperationalPageClient
  → handleHoursSave()             [async, catches and shows toast on error]
    → ctrl.saveBusinessHours(draftHours)
      → upsertMutation.mutateAsync({ hours })
        → tRPC: settings.operational.upsertBusinessHours
          → operationalService.upsertBusinessHours(salonId, hours)  [validates]
            → operationalRepo.upsertBusinessHours(salonId, hours)   [UPSERT to DB]
          ← void
        ← { success: true }
      ← resolves
    ← resolves
  → showToast('Jam operasional disimpan.')
  → setSheet(null)
  → onSuccess: utils.settings.operational.getBusinessHours.invalidate()
    → query refetches from DB
```

---

## Architecture Compliance

- No direct Supabase access outside `repositories/`
- No `any` types — strict TypeScript throughout
- tRPC context provides `salonId` via `x-salon-id` header (set by `trpc-provider.tsx`)
- `protectedProcedure` enforces salon context — throws UNAUTHORIZED if header absent
- `SettingsSideSheet` disables save button and shows "Menyimpan..." during mutation

---

## Known Limitations

1. **`booking_policies` and `special_closing_dates`** — still local mock state; will be connected in Sprint 2.
2. **Unique constraint required** — `business_hours` table must have `UNIQUE (salon_id, day_of_week)` for upsert to work. If missing, the upsert will insert duplicates.
3. **Postgres TIME trimming** — repository trims `"HH:MM:SS"` to `"HH:mm"` with `.slice(0, 5)`. If DB column type changes, re-validate.
4. **No optimistic update on save** — query is invalidated after mutation completes; UI briefly shows cached values until refetch.

---

## Typecheck Result

```
npx tsc --noEmit  →  0 errors
```
