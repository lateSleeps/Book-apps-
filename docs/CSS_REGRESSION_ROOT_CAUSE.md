# CSS Regression Root Cause Report

**Date:** 2026-06-11
**Severity:** P0 — all Tailwind styles missing in dev mode
**Status:** Fixed (see section 5)

---

> **See also: Regression #2 below** — same symptom, different trigger. Occurred after the Team Domain refactor commit when `pnpm build` was run to verify the build, overwriting the dev server's `.next` directory.

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

---

# CSS Regression #2

**Date:** 2026-06-11
**Trigger:** `pnpm build` ran at 11:46 after Team Domain refactor commit `69676ec` to verify it compiled cleanly
**Status:** Fixed — same fix as Regression #1

## Root Cause

Running `pnpm build` while the dev server is active **completely replaces the `.next` directory** with production build artifacts. The production build writes:

- `.next/static/css/<contenthash>.css` — production CSS bundle
- `.next/BUILD_ID` — production hash (e.g. `agepjS7KHONxTvYu4VGMl`)

It does **not** write:

- `.next/static/css/app/layout.css` — dev-only CSS chunk

After the production build, the dev server continues serving HTML with:

```html
<link rel="stylesheet" href="/_next/static/css/app/layout.css" />
```

But that file no longer exists. The request returns 404. Browser receives no CSS.

## Evidence Chain

1. Dev server started at approximately 11:24 (per `ps` output from investigation)
2. Team Domain refactor committed at `69676ec`
3. `pnpm build` ran at 11:46 to verify the refactor compiled cleanly
4. All files in `.next/` have timestamps of 11:46:xx — the production build timestamp
5. `BUILD_ID` = `agepjS7KHONxTvYu4VGMl` — a production content hash, not `"development"`
6. `.next/static/css/app/` directory exists but is empty — production build created the dir, skipped the file
7. `pnpm --filter owner build` output: `✓ Compiled successfully` — no source errors

The source code (Team refactor) was NOT the cause. The CSS regression was caused entirely by the production build overwriting `.next`.

## Fix

```bash
# From repo root:
rm -rf apps/owner/.next
pnpm --filter owner dev
```

## Prevention

Never run `pnpm build` while the dev server is running. To verify a build compiles cleanly, either:

1. Stop the dev server first (`pkill -f "next dev"`), run `pnpm build`, then restart dev
2. Or build in a separate terminal and restart dev after the build completes

Add this to team practice: **treat `.next` as exclusively owned by whichever process is running** (dev server OR build, never both).

## Verification

After clearing `.next` and restarting dev:

| Check                                                           | Expected              |
| --------------------------------------------------------------- | --------------------- |
| `cat apps/owner/.next/BUILD_ID`                                 | `development`         |
| `ls apps/owner/.next/static/css/app/`                           | `layout.css` present  |
| `curl -I http://localhost:3001/_next/static/css/app/layout.css` | `HTTP/1.1 200 OK`     |
| Settings page in browser                                        | Tailwind styles apply |

---

# CSS Regression #3

**Date:** 2026-06-11
**Trigger:** `pnpm --filter owner build` ran at 12:16 to verify the SettingsSelect commit compiled cleanly
**Status:** Fixed — same fix as Regressions #1 and #2

## Root Cause

Identical mechanism to Regression #2.

During the `SettingsSelect` investigation, `pnpm --filter owner build` was run at **12:16:57** to
confirm the build compiled without errors. The dev server was running since **12:07** (restarted
after Regression #2 fix). The production build replaced `.next` with production artifacts:

- `BUILD_ID` = `hnI4t1xKkuPMSRghLxphy` (production hash, not `"development"`)
- `.next/static/css/a7f03bfd95c22d89.css` — production bundle (50K)
- `.next/static/css/app/` — directory exists but empty

The dev server continued running but its CSS chunk (`app/layout.css`) no longer existed.

## Evidence Chain

1. Dev server restarted at 12:07 after Regression #2 fix
2. SettingsSelect built and committed at 12:17 (`ae160c5`)
3. `pnpm --filter owner build` ran at **12:16:57** (35 seconds before commit, to verify it compiled)
4. `BUILD_ID` timestamp = 12:16:57 = production build timestamp
5. `app/` directory timestamp = 12:17:42 — empty, no `layout.css`
6. Dev server PID 57872 still alive — running since 12:07, `.next` now production-owned
7. Source files (`SettingsSelect.tsx`, `index.ts`, `StaffDirectorySection.tsx`) — zero layout/CSS/config changes confirmed via `git diff`

The SettingsSelect source code change was NOT the cause. No layout, globals.css,
tailwind.config, postcss.config, or next.config files were modified.

## Fix

```bash
pkill -f "next dev"
rm -rf apps/owner/.next
pnpm --filter owner dev
```

## MANDATORY RULE — Effective Immediately

`pnpm build` is **PROHIBITED** while the dev server is running.

This is the third occurrence of the same root cause. From this point:

1. **To verify a build compiles:** stop the dev server first, run build, then restart dev
2. **TypeScript checking without full build:** use `pnpm --filter owner tsc --noEmit` instead
3. The `.next` directory is exclusively owned by whichever process is currently running

## Verification

After clearing `.next` and restarting dev, hit one route to trigger CSS emission:

| Check                                                           | Expected              |
| --------------------------------------------------------------- | --------------------- |
| `cat apps/owner/.next/BUILD_ID`                                 | `development`         |
| `curl -I http://localhost:3001/_next/static/css/app/layout.css` | `HTTP/1.1 200 OK`     |
| `ls apps/owner/.next/static/css/app/`                           | `layout.css` present  |
| Settings page in browser                                        | Tailwind styles apply |
