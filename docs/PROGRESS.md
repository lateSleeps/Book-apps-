# Firalink — Progress & Status

> Update dokumen ini setiap sesi. Baca ini di awal sesi baru untuk tahu kondisi terkini.

---

## Status Proyek: Owner App Cleanup

**Goal:** Bersihkan owner app satu halaman per halaman sebelum pivot ke Firalink SaaS.
**Workflow:** Feature branch → PR → merge ke main (jangan push langsung ke main)

---

## Halaman Owner App

| Halaman            | Route                 | File                | Token Lama     | Struktur                | Status                |
| ------------------ | --------------------- | ------------------- | -------------- | ----------------------- | --------------------- |
| Dashboard/Overview | `/dashboard/overview` | `overview/page.tsx` | ❌ Belum clean | ❌ 5.791 baris monolith | 🔜 Antrian            |
| Riwayat Transaksi  | `/dashboard/bookings` | `bookings/page.tsx` | ❌ Belum dicek | ❌ Belum dicek          | 🔜 Antrian            |
| Jadwal             | `/dashboard/schedule` | `schedule/page.tsx` | ❌ Belum dicek | ❌ Belum dicek          | 🔜 Antrian            |
| Pelanggan          | `/dashboard/clients`  | `clients/page.tsx`  | ❌ Belum dicek | ❌ Belum dicek          | 🔜 Antrian            |
| Produk Add-on      | `/dashboard/addons`   | `addons/page.tsx`   | ✅ Token baru  | ✅ Placeholder          | ✅ Done (placeholder) |
| Rekap              | `/dashboard/recap`    | `recap/page.tsx`    | ✅ Token baru  | ✅ Placeholder          | ✅ Done (placeholder) |
| Aktivitas          | `/dashboard/activity` | `activity/page.tsx` | ✅ Token baru  | ✅ Placeholder          | ✅ Done (placeholder) |
| Bantuan            | `/dashboard/help`     | `help/page.tsx`     | ✅ Token baru  | ✅ Placeholder          | ✅ Done (placeholder) |
| Pengaturan         | `/dashboard/settings` | `settings/page.tsx` | ❌ Belum dicek | ❌ Belum dicek          | 🔜 Antrian            |

## Komponen Shared (Owner App)

| Komponen          | File                                                         | Token Lama                 | Status     |
| ----------------- | ------------------------------------------------------------ | -------------------------- | ---------- |
| Sidebar           | `features/dashboard/components/sidebar/DashboardSidebar.tsx` | ❌ Ada inline style        | 🔜 Antrian |
| Layout            | `app/dashboard/layout.tsx`                                   | ❌ Belum dicek             | 🔜 Antrian |
| StatCard          | `features/dashboard/components/stat-card/StatCard.tsx`       | ❌ `bg-surface border-sep` | 🔜 Antrian |
| TodayPanel        | `features/dashboard/components/today-panel/TodayPanel.tsx`   | ❌ `label3 sep c-mint`     | 🔜 Antrian |
| Settings sections | `features/dashboard/components/settings/`                    | ❌ Belum dicek             | 🔜 Antrian |

---

## Urutan Pengerjaan (Disepakati)

1. ~~Placeholder pages (addons, recap, activity, help)~~ ✅ **Done — PR #?**
2. `DashboardSidebar.tsx` — bersihkan inline style, token lama
3. `dashboard/layout.tsx`
4. `StatCard.tsx` + `TodayPanel.tsx`
5. `bookings/page.tsx`
6. `clients/page.tsx`
7. `schedule/page.tsx`
8. `settings/page.tsx` + semua section components
9. `overview/page.tsx` — terakhir, terbesar

---

## Setelah Owner App Bersih

- [ ] Hapus token lama dari `tailwind.config.ts` (`accent`, `label`, `label2`, `label3`, `sep`, dll)
- [ ] Set up CI/CD dengan benar
- [ ] Mulai customer app cleanup
- [ ] Landing page + Auth (Supabase)

---

## Design System

- Docs: `docs/design-system/DESIGN_SYSTEM.md`
- Tokens: `docs/design-system/tokens.md`
- Components: `docs/design-system/components.md`
- Tailwind tokens: `apps/owner/tailwind.config.ts`
- JS constants: `apps/owner/src/shared/lib/tokens.ts`

**Token lama (JANGAN dipakai di kode baru):**
`accent`, `label`, `label2`, `label3`, `sep`, `surface`, `bg`, `c-peach`, `c-blue`, `c-mauve`, `c-mint`, `c-lilac`, `c-salmon`, `bg-ticket`

**Token baru (PAKAI ini):**
`bg-page`, `bg-card`, `bg-surface`, `tx-primary`, `tx-secondary`, `tx-subtle`, `bd-card`, `bd-row`, `st-upcoming`, dll — lihat `docs/design-system/tokens.md`

---

## Git Workflow

```
main (protected — jangan push langsung)
  └── feat/[nama]  →  PR  →  merge ke main
```

Branch aktif: `feat/placeholder-pages`

---

## Catatan Penting

- Customer app (`apps/customer/`) **JANGAN disentuh** sampai owner app selesai
- Auth masih mock (localStorage) — real Supabase Auth belum dikerjakan
- `overview/page.tsx` masih 5.791 baris — refactor plan ada di `.claude/plans/overview-refactor.md`
