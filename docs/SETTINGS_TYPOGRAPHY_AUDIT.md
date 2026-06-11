# Settings Typography Audit

Date: 2026-06-10

---

## 1. Expected Token

| Token        | Value            | Line-height | Letter-spacing |
| ------------ | ---------------- | ----------- | -------------- |
| `text-ts-fn` | 13px (0.8125rem) | 1.5         | 0              |

Defined in `apps/owner/tailwind.config.ts` line 106, inside `theme.extend.fontSize`.

---

## 2. Actual Computed Style

| Property    | Expected | Actual  |
| ----------- | -------- | ------- |
| font-size   | 13px     | 16px    |
| font-family | DM Sans  | DM Sans |

16px = default browser body font-size. No explicit `font-size` is being set on the button element.

---

## 3. Inheritance Chain

```
<SettingsTabbedCard>
  <SettingsSubNav>
    <button className={cn(
      '... text-ts-fn ...',         ← intended: 13px
      '... text-tx-primary ...'     ← color token
    )}>
      Layanan & Kategori
    </button>
```

`cn()` = `twMerge(clsx(...))` — `tailwind-merge@2.3.0`

---

## 4. Override Source

**File:** `apps/owner/src/shared/lib/cn.ts`

```ts
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`twMerge` v2.3.0 does not have knowledge of custom design tokens.
It treats ALL unknown `text-*` classes as the same class group.

**Proof (node REPL):**

```
twMerge('text-ts-fn text-tx-primary')
→ "text-tx-primary"          // text-ts-fn DROPPED

twMerge('px-s12 py-s6 text-ts-fn transition-colors bg-bg-card font-semibold text-tx-primary shadow-tab')
→ "px-s12 py-s6 transition-colors bg-bg-card font-semibold text-tx-primary shadow-tab"
                               // text-ts-fn DROPPED
```

When both classes are in the same string, `twMerge` sees them as conflicting `text-*` utilities and keeps only the **last** one (`text-tx-primary`).

---

## 5. Root Cause

`twMerge` has no concept of the project's custom token namespaces:

| Prefix      | Intended role    | twMerge sees           |
| ----------- | ---------------- | ---------------------- |
| `text-ts-*` | font-size token  | unknown `text-*` group |
| `text-tx-*` | text-color token | unknown `text-*` group |

Because both prefixes are unregistered, `twMerge` puts them in the same conflict group. The **last** class in the string wins. In `SettingsSubNav`:

```
text-ts-fn ...  text-tx-primary   ← tx-primary is last → ts-fn is dropped
```

Result: no `font-size` is emitted → button inherits `16px` from `body`.

This affects **every** component that passes both a `text-ts-*` size token and a `text-tx-*` color token through `cn()` simultaneously.

---

## 6. Recommended Fix

### Option A — Extend `twMerge` with custom class groups (recommended)

Update `apps/owner/src/shared/lib/cn.ts`:

```ts
import { extendTailwindMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "ts-micro",
            "ts-cap2",
            "ts-cap1",
            "ts-fn",
            "ts-sub",
            "ts-body",
            "ts-head",
            "ts-t3",
            "ts-t2",
            "ts-t1",
            "ts-largeTitle",
          ],
        },
      ],
      "text-color": [{ text: [/^tx-/] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return customTwMerge(clsx(inputs));
}
```

Result:

```
cn('text-ts-fn text-tx-primary')
→ "text-ts-fn text-tx-primary"   // both kept, no conflict
```

### Option B — Avoid `cn()` for the base class string

Pass the size token as a plain string outside of `cn()`, only merge the conditional classes:

```tsx
// Only the conditional part goes through cn(), size token is static
className={`text-ts-fn ${cn('...', active ? '...' : '...')}`}
```

This avoids the conflict entirely because the size token is never passed to `twMerge`.

---

### Impact

Every component in `apps/owner` that uses `cn()` with both `text-ts-*` and `text-tx-*` in the same call has this bug. This includes potentially all cards, buttons, and labels that went through `cn()`.

The recommended fix is **Option A** — it fixes the root cause once in `cn.ts` and covers the entire codebase without touching individual components.
