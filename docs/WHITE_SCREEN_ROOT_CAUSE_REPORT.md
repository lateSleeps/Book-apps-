# White Screen Root Cause Report

**Date:** 2026-06-11
**Verdict:** ✅ No runtime regression — white screen was a stale dev server issue

---

## 1. Exact Runtime Error

None from `src/`. The only console message found:

```
Warning: Extra attributes from the server: data-demoway-document-id
  at body → at html → at RootLayout
```

Source: `webpack-internal:///.../next/dist/client/app-index.js`

This is a **browser extension** (Demoway) injecting a DOM attribute that causes a hydration warning. It is not from application code and does not cause a white screen.

---

## 2. File / Line Number

Not applicable — no application error found.

---

## 3. Root Cause

The white screen was caused by the **dev server being unreachable**, not a runtime error in the app.

Timeline:

1. Dev server was previously running on port 3003 (old session)
2. Port 3003 went down (process killed between sessions)
3. Browser tab still pointed to `localhost:3003` → `ERR_CONNECTION_REFUSED` → blank page
4. After restarting the dev server on port 3001 and navigating to `localhost:3001`, all pages render correctly

No code change introduced a runtime regression.

---

## 4. Fix Applied

Restarted dev server:

```bash
pkill -f "next dev"
pnpm --filter owner dev  # starts on :3001
```

---

## 5. Page Verification

All three settings domains tested after server restart:

| Page           | URL                                | Renders?                         | Console errors from src/? |
| -------------- | ---------------------------------- | -------------------------------- | ------------------------- |
| Brand & Profil | `/dashboard/settings/brand`        | ✅ Full content visible          | ✅ None                   |
| Layanan        | `/dashboard/settings/layanan`      | ✅ Categories + services visible | ✅ None                   |
| Produk & Paket | `/dashboard/settings/produk-paket` | ✅ Addon cards visible           | ✅ None                   |

Sample content confirmed rendering on `/dashboard/settings/layanan`:

- Category cards: Hair, Colour & Treatment, Face & Lashes, Massage, Nail
- "Tambah Kategori" button visible
- Service counts correct (2 layanan under Hair, 2 under Colour & Treatment)

Sample content confirmed on `/dashboard/settings/produk-paket`:

- Makarizo Shampoo — Rp 45.000
- L'Oreal Conditioner — Rp 55.000
- TRESemmé Serum — Rp 65.000

---

## 6. Build Status

```
pnpm --filter owner build
✓ Compiled successfully
✓ Generating static pages (24/24)
```

Zero Type errors. Zero missing module errors.
