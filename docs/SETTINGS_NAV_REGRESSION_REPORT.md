# Settings Navigation Regression Report

**Date:** 2026-06-12
**Status:** Fixed
**tsc --noEmit:** 0 errors

---

## Classification

**Auth regression** — caused by Sprint 4.5 replacing the `useHasPermission` dummy stub
with a real implementation that returns `false` during auth loading.

---

## Root Cause

`SettingsNavigationPanel.tsx` filters nav items with:

```typescript
const allItems = NAV_GROUPS.flatMap((g) => g.items).filter(
  (item) => permMap[item.permission] !== false,
);
```

`permMap` is populated by 6 calls to `useHasPermission`:

```typescript
const canEditBusiness = useHasPermission(Permission.EDIT_BUSINESS_INFO);
const canManageServices = useHasPermission(Permission.MANAGE_SERVICES);
// ... 4 more
const permMap = {
  [Permission.EDIT_BUSINESS_INFO]: canEditBusiness,
  // ...
};
```

**Before Sprint 4.5:** `useHasPermission` was a dummy stub that always returned `true`.
All 6 permissions evaluated to `true`. Filter: `true !== false` = `true`. All items shown.

**After Sprint 4.5:** `useHasPermission` reads from `AuthContext`. During the auth loading
phase, `currentUser` is `null`. `permission.utils.ts line 14`: `if (!user) return false`.
All 6 permissions evaluate to `false`. Filter: `false !== false` = `false`. All items removed.

The nav container still renders (it is always mounted by the layout), but contains zero
visible items — which matches the observed symptom: "panel container exists but content
is missing."

---

## Render Trace

```
AuthContext mounts
  loading = true, currentUser = null
  supabaseBrowser.auth.getSession() — async, not yet resolved

SettingsNavigationPanel renders
  useHasPermission(Permission.EDIT_BUSINESS_INFO)
    -> useContext(AuthContext).hasPermission(Permission.EDIT_BUSINESS_INFO)
    -> checkPermission(null, 'edit_business_info')  // currentUser is null
    -> return false                                  // permission.utils.ts:14
  permMap[Permission.EDIT_BUSINESS_INFO] = false
  ... same for all 6 permissions ...

  allItems = NAV_GROUPS.flatMap(...).filter(item => permMap[item.permission] !== false)
  // false !== false = false for every item
  // allItems = []   <-- blank panel

  Desktop nav: NAV_GROUPS.map(group => {
    visibleItems = group.items.filter(item => permMap[item.permission] !== false)
    // visibleItems = []
    if (visibleItems.length === 0) return null  // all groups return null
  })
  // Desktop panel: empty
```

After `getSession()` resolves and `setLoading(false)` runs:

- If `currentUser` is populated: real permissions flow in, items appear (late render)
- If `currentUser` is null (no session): items remain empty (ProtectedRoute should redirect)

The regression manifests as a **visible blank state** during the loading window, which can
appear permanent if the session fetch is slow or if the developer is not logged in.

---

## Affected File

`apps/owner/src/features/dashboard/components/settings/SettingsNavigationPanel.tsx`

---

## Fix

Added `isLoading` from `useAuth()` as a guard on both filter calls. While auth is loading,
all items are shown unconditionally (same behavior as the pre-Sprint-4.5 dummy stub).
After loading completes, real permissions apply.

**3 changes total:**

### 1. Import `useAuth` alongside `useHasPermission`

```typescript
// Before
import { useHasPermission } from "@/features/auth/hooks/useAuth";

// After
import { useAuth, useHasPermission } from "@/features/auth/hooks/useAuth";
```

### 2. Read `isLoading` at component top

```typescript
export function SettingsNavigationPanel() {
  const pathname = usePathname();
  const { isLoading } = useAuth(); // <-- added
  // ...
}
```

### 3. Guard both filter calls

```typescript
// Mobile flat list
const allItems = NAV_GROUPS.flatMap((g) => g.items).filter(
  (item) => isLoading || permMap[item.permission] !== false,
);

// Desktop per-group list
const visibleItems = group.items.filter(
  (item) => isLoading || permMap[item.permission] !== false,
);
```

---

## Behavior After Fix

| Auth state                          | Before fix                 | After fix                              |
| ----------------------------------- | -------------------------- | -------------------------------------- |
| `loading = true`                    | Blank panel                | All items shown                        |
| `loading = false, currentUser set`  | Real permissions (correct) | Real permissions (correct)             |
| `loading = false, currentUser null` | Blank panel                | Blank panel (ProtectedRoute redirects) |

---

## Questions from Audit

| Question                                 | Answer                                                        |
| ---------------------------------------- | ------------------------------------------------------------- |
| Is the component mounted?                | Yes — container renders unconditionally from layout           |
| Are nav items generated?                 | No — all filtered out by `permMap[item.permission] !== false` |
| Is a permission gate returning null?     | No PermissionGate wraps the nav; the filter is internal       |
| Is currentUser null after Sprint 4.5?    | Yes, during auth loading phase — this is the trigger          |
| Is there a hydration timing issue?       | Yes — filter runs before async session resolves               |
| Did a conditional render hide the panel? | No — the container renders; only items are filtered           |

---

## Not the cause

- `SettingsLayout` — not involved; panel mounts correctly
- `ProtectedRoute` — not involved; regression is in item filtering, not route access
- `AuthContext` — behaves correctly; `loading = true` during session fetch is expected
- `ROLE_PERMISSIONS_MAP` — not the issue; never reached when `currentUser` is null
