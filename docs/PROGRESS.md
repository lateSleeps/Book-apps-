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

1. ~~Placeholder pages (addons, recap, activity, help)~~ ✅ **Done**
2. `overview/page.tsx` refactor — **SEDANG DIKERJAKAN** di `feat/clean-overview`
3. `DashboardSidebar.tsx` — bersihkan inline style, token lama
4. `dashboard/layout.tsx`
5. `StatCard.tsx` + `TodayPanel.tsx`
6. `bookings/page.tsx`
7. `clients/page.tsx`
8. `schedule/page.tsx`
9. `settings/page.tsx` + semua section components

## Overview Refactor — Sub-Steps

| Step | Isi                                                                                   | Status  |
| ---- | ------------------------------------------------------------------------------------- | ------- |
| 1    | Shared utils (avatar, greeting, format)                                               | ✅ Done |
| 2    | Constants (booking-status, mock-data)                                                 | ✅ Done |
| 3    | Types (overview.types.ts)                                                             | ✅ Done |
| 4    | Services (booking.service.ts)                                                         | ✅ Done |
| 5    | Hook: use-booking-list + utils                                                        | ✅ Done |
| 6    | Hooks: use-booking-status, detail, promo, payment, walk-in                            | ✅ Done |
| 7    | Controller: use-overview-controller                                                   | ✅ Done |
| 8a   | Dialogs (5 focused components) + StatCardsRow                                         | ✅ Done |
| 8b   | Mobile: MobileBookingCard, List, Sheet                                                | ✅ Done |
| 9    | Organisms: BookingTable, BookingRow, BookingDetailPanel, PaymentSection, WalkInDrawer | 🔜 Next |
| 10   | Slim page.tsx → <200 lines                                                            | 🔜 Next |

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
