# Design System Merge Fix Report

Date: 2026-06-10

---

## Problem

Buttons in `SettingsSubNav` rendered at 16px (browser default) instead of 13px (`text-ts-fn` token).

Root className string:

```
shrink-0 whitespace-nowrap rounded-r10 px-s12 py-s6 text-ts-fn transition-colors
bg-bg-card font-semibold text-tx-primary shadow-tab
```

After passing through `cn()` (which calls `twMerge`):

```
shrink-0 whitespace-nowrap rounded-r10 px-s12 py-s6 transition-colors
bg-bg-card font-semibold text-tx-primary shadow-tab
```

`text-ts-fn` was silently dropped.

---

## Root Cause

`tailwind-merge` v2 classifies all unrecognised `text-*` classes into a single
built-in `text-color` group via an `isAny` validator function that matches
every string. Because `text-ts-fn` (font-size token) and `text-tx-primary`
(color token) were both unknown to tailwind-merge, they ended up in the same
conflict group. Last one wins — `text-tx-primary` survived, `text-ts-fn` was
dropped.

```js
// Default tailwind-merge config (simplified)
'text-color': [{ text: [isAny] }]  // isAny() always returns true
```

### Why `extend` didn't fix it

Adding to the `font-size` group via `extend.classGroups['font-size']` registers
the `ts-*` pattern as a font-size member, but it does NOT remove them from
`text-color`. A class that matches multiple groups is assigned by tailwind-merge
to the LAST matching group in the config. The built-in `text-color` group (with
`isAny`) appears after `font-size` in the default config, so `text-ts-fn` was
still being classified as a color — and still dropped.

### Why regex patterns alone don't fix it

Regex validators in tailwind-merge class groups work for MEMBERSHIP detection
(is this class in this group?) but NOT for conflict detection between two
classes in the same group. When two classes match the same regex, tailwind-merge
cannot determine they are the same "property" and leaves both classes intact.
Only explicit string entries trigger the conflict/deduplication logic.

---

## Fix

**File:** `apps/owner/src/shared/lib/cn.ts`

Use `override.classGroups` to REPLACE both `font-size` and `text-color` groups
with explicit string enumerations of all known project tokens:

```ts
const twMerge = extendTailwindMerge({
  override: {
    classGroups: {
      'font-size': [{ text: [
        // DS type scale
        'ts-micro', 'ts-cap2', 'ts-cap1', 'ts-fn', 'ts-fn-tight',
        'ts-sub', 'ts-body', 'ts-head', 'ts-t3', 'ts-t2', 'ts-t1',
        'ts-hero', 'ts-t14',
        // Legacy numeric aliases
        't12', 't13', 't14', 't16', 't18', 't20', 't24', 't28', 't32',
        // Standard Tailwind sizes
        'xs', 'sm', 'base', 'lg', 'xl', '2xl', ...
      ] }],
      'text-color': [{ text: [
        'tx-primary', 'tx-secondary', 'tx-muted', /* ... all tx-* */
        'st-upcoming', 'st-confirmed', /* ... all st-* */
        'py-paid', 'py-deposit', /* ... all py-* */
        'vt-walkin-text', 'vt-booking-text',
        'ac-primary', 'ac-danger', /* ... all ac-* */
        'inherit', 'current', 'transparent', 'black', 'white',
      ] }],
    },
  },
});
```

Key constraints that make this work:

1. `override` (not `extend`) — replaces the group entirely, eliminating `isAny`
2. Explicit strings (not regexes) — required for conflict detection between
   same-prefix tokens (e.g. `tx-primary` vs `tx-secondary`)
3. Both groups overridden — because `isAny` in the default `text-color` group
   would still claim font-size tokens even after overriding `font-size`

---

## Verification (node REPL)

```
twMerge('text-ts-fn text-tx-primary')
→ 'text-ts-fn text-tx-primary'         // both survive ✓

twMerge('text-ts-cap1 text-st-in-progress')
→ 'text-ts-cap1 text-st-in-progress'   // both survive ✓

twMerge('text-tx-primary text-tx-secondary')
→ 'text-tx-secondary'                  // last wins ✓

twMerge('text-ts-fn text-ts-cap1')
→ 'text-ts-cap1'                       // last wins ✓

twMerge('shrink-0 whitespace-nowrap rounded-r10 px-s12 py-s6 text-ts-fn transition-colors bg-bg-card font-semibold text-tx-primary shadow-tab')
→ 'shrink-0 whitespace-nowrap rounded-r10 px-s12 py-s6 text-ts-fn transition-colors bg-bg-card font-semibold text-tx-primary shadow-tab'
//                                      ↑ text-ts-fn survives ✓
```

---

## Scope of Impact

This fix applies to the entire `apps/owner` codebase. Every component that
passes both a `text-ts-*` token and a `text-tx-*` token through `cn()` was
silently losing the font-size token. The fix is applied once in `cn.ts` with
no changes required in individual components.

---

## Maintenance Note

When adding new Design System color or font-size tokens to `tailwind.config.ts`,
also add the token name string to the appropriate group in `cn.ts`. The two
files must stay in sync for conflict detection to work correctly.
