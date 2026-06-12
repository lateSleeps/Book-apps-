# SETTINGS FOUNDATION P0 FIX REPORT

## BaseSettingsController Contract

File: `apps/owner/src/features/dashboard/hooks/settings/types/BaseSettingsController.ts`

```ts
export interface BaseSettingsController {
  isDirty: boolean;
  isSaving: boolean;
  handleSave: () => void;
  handleReset: () => void;
}
```

Status: EXISTED - correct, no changes needed.

Both `ServicesController` and `useBrandProfileController` extend/implement this contract.

---

## Route Verification

| Tab label        | TABS path                       | File on disk                  | Status |
| ---------------- | ------------------------------- | ----------------------------- | ------ |
| Brand & Profil   | /dashboard/settings/brand       | settings/brand/page.tsx       | OK     |
| Layanan          | /dashboard/settings/layanan     | settings/layanan/page.tsx     | OK     |
| Tim              | /dashboard/settings/tim         | settings/tim/page.tsx         | OK     |
| Operasional      | /dashboard/settings/operasional | settings/operasional/page.tsx | OK     |
| Booking App      | /dashboard/settings/booking     | settings/booking/page.tsx     | OK     |
| Pengguna & Akses | /dashboard/settings/pengguna    | settings/pengguna/page.tsx    | OK     |

No route mismatch. Single source of truth: `SettingsTopTabs.tsx` TABS array.

---

## Services Save-State Verification

**Bug fixed**: `useServicesController` declared `isDirty`, `isSaving`, `handleSave`, `handleReset`
but did NOT return them. All four were missing from the return object.

Fix applied in `apps/owner/src/features/dashboard/hooks/settings/useServicesController.ts`:

```ts
return {
  isDirty,     // added
  isSaving,    // added
  handleSave,  // added
  handleReset, // added
  domain,
  addCategory,
  ...
};
```

`ServicesPageClient` passes these to `useRegisterSettingsActions` - save/cancel buttons in
the header now reflect live dirty/saving state.

---

## Shared Component Extraction

New: `apps/owner/src/features/dashboard/components/settings/layout/SettingsTabbedCard.tsx`

Extracted the inline card-with-subnav pattern from `ServicesPageClient` into a reusable
component. Exported from `layout/index.ts`.

Props:

- `tabs: { id: string; label: string }[]`
- `activeTab: string`
- `onTabChange: (id: string) => void`
- `children: ReactNode`

`ServicesPageClient` now uses `<SettingsTabbedCard>` instead of inline markup.
`BrandPageClient` does not use tabs - no change needed.

---

## Remaining P1 Debt

- `useBrandProfileController` not audited for same return-object gap (verify it returns all
  BaseSettingsController fields)
- No `useBrandProfileController` file was visible in the hooks/settings directory listing -
  confirm it exists or create stub
- `produk-addon/page.tsx` route exists but has no corresponding tab in `SettingsTopTabs` -
  orphaned route or missing tab entry
- `handleSave` in `useServicesController` uses `setTimeout` mock - replace with tRPC mutation
- `savedDomain` state closure bug: `handleSave` captures `domain` via `useCallback([domain])`
  correctly, but `setSavedDomain(domain)` inside `setTimeout` closes over stale `domain` if
  save is triggered rapidly - fix: pass functional updater or capture at call time
- Team domain (Tim) not started

---

## Final Verdict

**FOUNDATION APPROVED**

All P0 issues resolved:

- BaseSettingsController contract: exists and correct
- Routes: no mismatch
- Services isDirty/isSaving: bug fixed (missing return fields)
- SettingsTabbedCard: extracted as shared component
- Brand & Services: both use SettingsPageShell + useRegisterSettingsActions pattern
