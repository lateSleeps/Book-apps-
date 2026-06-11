# Form Control Consistency Audit

**Date:** 2026-06-11
**Scope:** Settings — Add/Edit Staff form (Role, Spesialisasi selects)
**Status:** Fixed

---

## 1. Root Cause

The `Role` and `Spesialisasi` fields in the Staff form used raw `<select>` elements with
manually-written, incorrect class strings. No shared component existed for select controls.

The values deviated from the established `SettingsInput` / `SettingsTextarea` sizing contract
on every measurable dimension.

---

## 2. Before vs After

| Property      | SettingsInput (correct)         | Old `<select>` (wrong)         | SettingsSelect (fixed)             |
| ------------- | ------------------------------- | ------------------------------ | ---------------------------------- |
| padding-x     | `px-s16` (1rem)                 | `px-s12` (0.75rem) ❌          | `pl-s16 pr-s32` ✅                 |
| padding-y     | `py-s12` (0.75rem)              | `py-s8` (0.5rem) ❌            | `py-s12` ✅                        |
| border-radius | `rounded-r10`                   | `rounded-r10` ✅               | `rounded-r10` ✅                   |
| border        | `border border-bd-card`         | `border border-bd-card` ✅     | `border border-bd-card` ✅         |
| bg            | `bg-bg-input`                   | `bg-bg-input` ✅               | `bg-bg-input` ✅                   |
| font size     | `text-ts-fn`                    | `text-ts-fn` ✅                | `text-ts-fn` ✅                    |
| text color    | `text-tx-primary`               | `text-tx-primary` ✅           | `text-tx-primary` ✅               |
| focus border  | `focus:border-tx-secondary`     | none ❌                        | `focus:border-tx-secondary` ✅     |
| focus ring    | `ring-1 ring-tx-secondary`      | `ring-2 ring-tx-primary/20` ❌ | `ring-1 ring-tx-secondary` ✅      |
| transition    | `transition-colors`             | none ❌                        | `transition-colors` ✅             |
| disabled      | `opacity-50 cursor-not-allowed` | none ❌                        | `opacity-50 cursor-not-allowed` ✅ |
| chevron       | —                               | browser default ❌             | CaretDown 14px at `right-s12` ✅   |

---

## 3. Shared Field Sizing Contract

All Settings form controls (Input, Textarea, Select) share this base:

```
rounded-r10
border border-bd-card
bg-bg-input
px-s16 py-s12
text-ts-fn text-tx-primary
focus:border-tx-secondary focus:outline-none focus:ring-1 focus:ring-tx-secondary
transition-colors
disabled:cursor-not-allowed disabled:opacity-50
```

Select-specific additions:

```
appearance-none        — suppresses browser-native chevron
pl-s16 pr-s32          — left matches input; right reserves chevron space
CaretDown (14px)       — absolute right-s12, pointer-events-none, text-tx-muted
```

---

## 4. Affected Components

| Component               | File                                      | Change                                             |
| ----------------------- | ----------------------------------------- | -------------------------------------------------- |
| `SettingsSelect` (new)  | `shared/SettingsSelect.tsx`               | Created                                            |
| `shared/index.ts`       | `shared/index.ts`                         | Export added                                       |
| `StaffDirectorySection` | `team/sections/StaffDirectorySection.tsx` | Inline `<select>` replaced with `<SettingsSelect>` |

---

## 5. Chevron Implementation

```tsx
// appearance-none hides browser chevron on all platforms
// CaretDown is positioned absolute inside a relative wrapper div
// pointer-events-none ensures clicks pass through to the <select>

<div className="relative">
  <select className="... appearance-none pl-s16 pr-s32 py-s12 ...">
    {children}
  </select>
  <CaretDown
    size={14}
    weight="bold"
    className="pointer-events-none absolute right-s12 top-1/2 -translate-y-1/2 text-tx-muted"
    aria-hidden
  />
</div>
```

Visual result:

```
[ field text                          v ]
                                    ^-- right-s12 from edge
                          ^-- text ends at pr-s32 (2rem) from edge
```

---

## 6. Files NOT Modified

- `SettingsInput.tsx` — unchanged
- `SettingsTextarea.tsx` — unchanged
- All other form fields outside the Staff form
- Customer app — untouched

---

## 7. Build Verification

```
pnpm --filter owner build
✓ Compiled successfully
✓ Generating static pages (24/24)
```

Zero TypeScript errors. Zero ESLint errors.
