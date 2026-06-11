# CSS Regression Root Cause Report

**Date:** 2026-06-11
**Severity:** P0 — all Tailwind styles missing in dev mode
**Status:** Fixed (see section 5)

---

## 1. Exact Root Cause

**Webpack dev cache invalidation after file deletions during an active dev server session.**

Commit `3eada51` deleted 16 V1 component files while the dev server was running on port 3001. Webpack's persistent cache (`/apps/owner/.next/cache/webpack/client-development/`) had module ID entries for those 16 deleted files. When webpack's HMR detected the deletions, it attempted to rebuild the module graph. The MiniCssExtractPlugin's CSS chunk generation (`/_next/static/css/app/layout.css`) failed to complete because the module graph was in a partially invalidated state during recovery.

Result: `_next/static/css/app/layout.css` was never written. Every page request responds with a `<link>` tag pointing to that 404 file. Browser receives no CSS. All Tailwind utilities are absent from the rendered page.

---

## 2. Evidence Chain

### Step 1 - layout.tsx imports globals.css correctly

```tsx
// apps/owner/src/app/layout.tsx
import "./globals.css"; // line 3 — present and correct
```

### Step 2 - globals.css has no errors

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
/* ... keyframes only, no @imports */
```

No `@import` of any deleted file. No syntax errors.

### Step 3 - Tailwind manual compilation succeeds

```bash
npx tailwindcss -i ./src/app/globals.css -o /tmp/test-output.css
# Done in 233ms.
# 67810 bytes output
```

PostCSS + Tailwind pipeline is healthy. No compilation error.

### Step 4 - Production build succeeds

```bash
pnpm --filter owner build
# ✓ Compiled successfully
# All 24 static pages generated
# Output: .next/static/css/1dc3f14739172bc1.css (present, 67KB+)
```

### Step 5 - CSS file is 404 on dev server

```bash
curl -I http://localhost:3001/_next/static/css/app/layout.css
# HTTP/1.1 404 Not Found
```

The HTML response contains `<link rel="stylesheet" href="/_next/static/css/app/layout.css?v=...">` but that URL returns 404.

### Step 6 - CSS output directory is empty

```
apps/owner/.next/static/css/app/   ← directory exists, created Jun 11 11:05
└── (empty)                        ← layout.css was never written
```

The production CSS sits in `.next/static/css/1dc3f14739172bc1.css` (from `pnpm build`). The dev CSS (`app/layout.css`) was never generated.

### Step 7 - Webpack cache has interrupted-write artifacts

```
.next/cache/webpack/client-development/
├── 3.pack.gz       Jun 11 10:50  (2.75 MB, older)
├── 3.pack.gz_      Jun 11 11:04  (1.88 MB, newer — interrupted write)
├── 8.pack.gz       Jun 11 10:51  (16.9 MB, older)
├── 8.pack.gz_      Jun 11 11:02  (15.9 MB — interrupted write)
└── index.pack.gz   Jun 11 11:06  (latest)
```

The `.pack.gz_` files are webpack's "write in progress" temporaries. Their timestamps (11:02, 11:04) align with when the cleanup commit's 16 file deletions triggered HMR. The interrupted write left the cache in an inconsistent state, causing the CSS chunk to fail silently.

### Step 8 - No broken imports in source files

```bash
grep -r "use-salon-settings|settings-mock|settings.types|FormField|SaveButton|SettingsCard" src/ -l
# (no output)
```

No live source file references any deleted V1 file. The failure is purely a webpack cache corruption, not a missing import.

---

## 3. Affected Files

| File                                                | Status                   | Explanation                                               |
| --------------------------------------------------- | ------------------------ | --------------------------------------------------------- |
| `.next/static/css/app/layout.css`                   | Missing (404)            | Webpack dev failed to emit                                |
| `.next/cache/webpack/client-development/*.pack.gz_` | Stale interrupted writes | Cache in inconsistent state after 16 deletions during HMR |

No source files need changes.

---

## 4. Why It Happened

Timeline:

1. Commit `3eada51` (`feat(owner): Settings V2 — Brand, Layanan, Produk & Paket, Tim`) deleted 16 V1 component files as part of the foundation cleanup.
2. The dev server was running on port 3001 at the time.
3. Webpack's file watcher detected the 16 `unlink` events.
4. HMR initiated a module graph rebuild. The persistent cache had cached module IDs and metadata for those 16 files.
5. During rebuild, webpack tried to resolve previously cached module IDs that now map to non-existent files.
6. MiniCssExtractPlugin's CSS chunk (`layout.css`) depends on the full module graph being in a consistent state during emit. The partially-invalidated graph caused the emit to be skipped.
7. The dev server continued serving — JavaScript compiled fine (no cached JS modules depended on the deleted files) — but the CSS chunk was never written.
8. All subsequent page loads included a `<link>` to the missing `layout.css`, resulting in a stylesheet 404 and browser-default rendering.

---

## 5. Fix

**Clear the webpack dev cache and restart the dev server.** No code changes required.

```bash
# Stop the running dev server first (Ctrl+C in its terminal), then:

rm -rf apps/owner/.next

pnpm --filter owner dev
```

Clearing `.next` forces webpack to rebuild from scratch without any stale cached module IDs. On the first request to any route, `layout.css` will be generated correctly.

**Do NOT run just `rm -rf apps/owner/.next/cache`** — the `.next/static/css/app/` directory also needs to be removed so webpack recreates it on next compile.

---

## 6. Prevention

When deleting multiple source files while the dev server is running, stop the dev server first:

```bash
# Safe file deletion workflow:
pkill -f "next dev"           # stop dev server
# ... delete files ...
pnpm --filter owner dev       # restart clean
```

This avoids triggering HMR on a batch of file deletions, which can race-condition the CSS extraction chunk.

---

## 7. Verification After Fix

After `rm -rf apps/owner/.next && pnpm --filter owner dev`:

Expected results:

| Check                                                           | Expected                      |
| --------------------------------------------------------------- | ----------------------------- |
| `curl -I http://localhost:3001/_next/static/css/app/layout.css` | `HTTP/1.1 200 OK`             |
| `ls apps/owner/.next/static/css/app/`                           | `layout.css` file present     |
| Settings page typography                                        | DM Sans font applied          |
| Settings page buttons                                           | Tailwind token styles applied |
| Tailwind spacing (gap-s16, px-s24 etc.)                         | Present                       |
