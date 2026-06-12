# Sprint 1.1.1 — Architecture Cleanup Report

**Date:** 2026-06-12
**Status:** Complete
**tsc --noEmit:** 0 errors

---

## Files Modified

| File                                                                                          | Change                                                                       |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/server/trpc/routers/settings/operational.ts`                                             | Import `ok` from result.ts; replace `{ success: true as const }` with `ok()` |
| `src/features/dashboard/hooks/settings/useOperationalController.ts`                           | Full rewrite — section-based interface, destructured mutateAsync             |
| `src/features/dashboard/components/settings/components/operasional/OperationalPageClient.tsx` | All `ctrl.*` callsites updated to section API                                |
| `src/features/dashboard/hooks/settings/types/BaseSettingsController.ts`                       | Added documentation scoping it to single-save-target domains                 |

---

## Change 1 — Router: consistent use of `ok()`

**Before:**

```typescript
return { success: true as const };
```

**After:**

```typescript
import { ok } from "../../../settings/lib/result";
// ...
return ok();
```

**Why:** `result.ts` was built as the standard mutation return shape. Using it everywhere means client-side handling is uniform. When a future router needs to return `ok(createdItem)` with data, the pattern is already established — not a divergence from some routers that return raw objects.

**Rule for all future routers:**

- No-data mutations: `return ok()`
- Data-returning mutations: `return ok(data)` — TypeScript infers `MutationResult<typeof data>`

---

## Change 2 — Controller: section-based interface

### Before (flat)

```typescript
export interface OperationalController {
  settings: OperationalSettings;
  isLoading: boolean;
  isSavingHours: boolean;
  saveBusinessHours: (hours: BusinessHoursDay[]) => Promise<void>;
  updateBusinessHoursDay: (...) => void;
  addSpecialClosingDate: (...) => void;
  updateSpecialClosingDate: (...) => void;
  removeSpecialClosingDate: (...) => void;
  updateBookingPolicy: (...) => void;
}
```

### After (section-scoped)

```typescript
export interface OperationalController {
  businessHours: {
    data: BusinessHoursDay[];
    isLoading: boolean;
    isSaving: boolean;
    save: (hours: BusinessHoursDay[]) => Promise<void>;
    updateDay: (
      dayOfWeek: DayOfWeek,
      patch: Partial<Omit<BusinessHoursDay, "dayOfWeek">>,
    ) => void;
  };
  specialClosingDates: {
    data: SpecialClosingDate[];
    add: (entry: Omit<SpecialClosingDate, "id">) => void;
    update: (
      id: string,
      patch: Partial<Omit<SpecialClosingDate, "id">>,
    ) => void;
    remove: (id: string) => void;
  };
  bookingPolicy: {
    data: BookingPolicy;
    update: (patch: Partial<BookingPolicy>) => void;
  };
}
```

**Why this is the canonical shape for multi-section domains:**

Each section owns its data, loading state, and mutations. When Sprint 2 connects `bookingPolicy` to the DB, the section gets `isSaving` and `save()` without polluting the top-level interface or creating naming collisions (`isSavingHours` vs `isSavingPolicy` vs `isSavingDates`).

Page component access is explicit about data origin:

```typescript
ctrl.businessHours.data       // not ctrl.settings.businessHours
ctrl.businessHours.isSaving   // not ctrl.isSavingHours
ctrl.businessHours.save(...)  // not ctrl.saveBusinessHours(...)
ctrl.specialClosingDates.data // not ctrl.settings.specialClosingDates
ctrl.bookingPolicy.data       // not ctrl.settings.bookingPolicy
```

---

## Change 3 — Controller: destructured `mutateAsync`

**Before:**

```typescript
const upsertMutation =
  trpc.settings.operational.upsertBusinessHours.useMutation({
    onSuccess: () => {
      void utils.settings.operational.getBusinessHours.invalidate();
    },
  });

const saveBusinessHours = useCallback(
  async (hours) => {
    await upsertMutation.mutateAsync({ hours });
  },
  [upsertMutation], // full mutation object in deps — may not be stable
);
```

**After:**

```typescript
const { mutateAsync: upsertHours, isLoading: isSavingHours } =
  trpc.settings.operational.upsertBusinessHours.useMutation({
    onSuccess: () => {
      void utils.settings.operational.getBusinessHours.invalidate();
    },
  });

const save = useCallback(
  async (hours: BusinessHoursDay[]) => {
    await upsertHours({ hours });
  },
  [upsertHours], // stable mutateAsync reference only
);
```

**Why:** `mutateAsync` is a stable function reference. The full mutation object (`upsertMutation`) includes `isLoading`, `data`, `error`, etc. — these change on every mutation lifecycle event, which can cause unnecessary `useCallback` recomputation. Destructuring takes only what is needed and makes the dependency explicit.

---

## Updated Controller Contract

The full canonical contract for `useOperationalController`:

```typescript
const ctrl = useOperationalController();

// Business hours — DB-backed
ctrl.businessHours.data; // BusinessHoursDay[] (7 rows from DB or defaults)
ctrl.businessHours.isLoading; // true during initial fetch
ctrl.businessHours.isSaving; // true during save mutation
ctrl.businessHours.save(hours); // Promise<void> — throws on failure
ctrl.businessHours.updateDay(dow, patch); // optimistic cache patch, no DB write

// Special closing dates — local mock state (Sprint 2+)
ctrl.specialClosingDates.data; // SpecialClosingDate[]
ctrl.specialClosingDates.add(entry); // void
ctrl.specialClosingDates.update(id, patch); // void
ctrl.specialClosingDates.remove(id); // void

// Booking policy — local mock state (Sprint 2+)
ctrl.bookingPolicy.data; // BookingPolicy
ctrl.bookingPolicy.update(patch); // void
```

When Sprint 2 connects `bookingPolicy` and `specialClosingDates`, the section gains `isSaving` and `save()` without removing or renaming any existing field.

---

## Canonical Pattern for New Multi-Section Controllers

Use this structure for: **Booking App** (payment methods, QRIS, policy, confirmation mode).

```typescript
export interface BookingAppController {
  paymentMethods: {
    data: PaymentMethodSettings;
    isLoading: boolean;
    isSaving: boolean;
    save: (settings: PaymentMethodSettings) => Promise<void>;
  };
  qris: {
    data: QrisSettings;
    isLoading: boolean;
    isSaving: boolean;
    upload: (file: File) => Promise<void>;
    remove: () => Promise<void>;
  };
  policy: {
    data: BookingAppPolicy;
    isLoading: boolean;
    isSaving: boolean;
    save: (policy: BookingAppPolicy) => Promise<void>;
  };
}
```

---

## Canonical Pattern for Single-Save Controllers

Use this structure for: **Brand, Layanan, Tim, Pengguna**.
These extend `BaseSettingsController` and have one mutation per controller.

```typescript
export interface BrandProfileController extends BaseSettingsController {
  profile: BrandProfile; // draft state
  updateField: (patch: Partial<BrandProfile>) => void;
  // isDirty, isSaving, handleSave, handleReset from BaseSettingsController
}
```

When migrating to tRPC:

- `isDirty` — derived: `JSON.stringify(draft) !== JSON.stringify(queryData)`
- `isSaving` — from `useMutation().isLoading`
- `handleSave` — calls `mutateAsync`
- `handleReset` — resets draft to current query data

---

## BaseSettingsController — Updated Scope

`BaseSettingsController` now documents that it applies only to single-save-target domains (Brand, Layanan, Tim, Pengguna). Multi-section domains (Operasional, Booking App) do not extend it — they use the section-scoped pattern.

---

## Typecheck Result

```
npx tsc --noEmit  →  0 errors
```
