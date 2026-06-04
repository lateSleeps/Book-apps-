# Firalink — Claude Code Instructions

## ⚠️ BACA INI DULU SEBELUM MELAKUKAN APAPUN

Sebelum membuat atau memodifikasi UI apapun di `apps/owner`, **wajib baca**:

1. `docs/design-system/DESIGN_SYSTEM.md` — atomic design system, token mapping, aturan wajib
2. `docs/design-system/tokens.md` — semua nilai token aktual (warna, tipografi, spacing)
3. `docs/design-system/components.md` — inventaris komponen (✅ sudah ada / 🔨 perlu dibuat / ⚠️ perlu refactor)

## Project: Firalink (ex Rara Beauty)

SaaS booking salon. Owner mendaftar → setup salon → dapat link booking → customer bisa booking.

## Monorepo Structure

```
apps/owner/     → Dashboard owner (focus utama)
apps/customer/  → Halaman booking customer (jangan disentuh kecuali diminta)
packages/       → Shared: types, utils, hooks, database, mock-data
```

## Apps/Owner — Aturan

- Design system: `docs/design-system/DESIGN_SYSTEM.md`
- Tailwind tokens: `apps/owner/tailwind.config.ts`
- Shared lib: `apps/owner/src/shared/lib/`
- Shared components: `apps/owner/src/shared/components/ui/`
- Dashboard features: `apps/owner/src/features/dashboard/`
- Types: `apps/owner/src/features/dashboard/types/dashboard.types.ts`

## Aturan Coding

1. **Tidak ada inline `style={{}}`** — gunakan Tailwind tokens
2. **Tidak ada magic color hex** — gunakan token dari `shared/lib/tokens.ts`
3. **Cek komponen yang sudah ada** di `shared/components/ui/` sebelum membuat baru
4. **Setiap komponen TypeScript strict** — tidak ada `any`
5. **Saat refactor**: hanya pindahkan kode, jangan ubah behavior/UI

## State Saat Ini (Juni 2026)

- `overview/page.tsx` masih 5.791 baris monolith → sedang di-refactor
- Auth masih mock (localStorage) → belum Supabase Auth
- CI/CD workflows ada tapi belum sepenuhnya diverifikasi
- Refactor plan: `.claude/plans/overview-refactor.md`

## Scope Rule

- Owner dashboard (`/dashboard/*`) → **aktif dikerjakan**
- Customer booking flow (`/book/[slug]`) → **JANGAN disentuh**
