# Firalink Owner — Design System

> Dokumen ini adalah **sumber kebenaran tunggal** untuk UI owner dashboard.
> Dibuat berdasarkan audit menyeluruh `apps/owner/src/app/dashboard/overview/page.tsx`.
> Setiap sesi baru harus membaca dokumen ini sebelum membuat atau memodifikasi UI.

---

## Daftar Isi

1. [Foundasi: Design Tokens](#1-foundasi-design-tokens)
2. [Atomic Design: Atoms](#2-atoms)
3. [Atomic Design: Molecules](#3-molecules)
4. [Atomic Design: Organisms](#4-organisms)
5. [Layout & Spacing System](#5-layout--spacing-system)
6. [Aturan Wajib](#6-aturan-wajib)
7. [Referensi File](#7-referensi-file)

---

## 1. Foundasi: Design Tokens

### 1.1 Warna

Semua token warna ada di `apps/owner/tailwind.config.ts` dan `apps/owner/src/shared/lib/tokens.ts`.

#### Background

| Token        | Hex       | Dipakai di                             |
| ------------ | --------- | -------------------------------------- |
| `bg-page`    | `#F2F2F7` | Background halaman (iOS system gray 6) |
| `bg-card`    | `#FFFFFF` | Stat cards, table panel, drawer        |
| `bg-surface` | `#fafaf8` | Expanded detail panel, hover state     |
| `bg-header`  | `#F7F7F8` | Table header row                       |
| `bg-control` | `#F2F2F7` | Segmented tab container, icon buttons  |
| `bg-input`   | `#F9F9FB` | Secondary button bg                    |

#### Text

| Token            | Hex       | Dipakai di                                     |
| ---------------- | --------- | ---------------------------------------------- |
| `text-primary`   | `#1C1C1E` | Judul, nilai angka, nama customer (iOS label)  |
| `text-secondary` | `#8E8E93` | Label uppercase, placeholder, count (iOS gray) |
| `text-body`      | `#1a1a1a` | Body text, phone number, service name          |
| `text-subtle`    | `#555555` | Deskripsi sekunder                             |
| `text-muted`     | `#C7C7CC` | Disabled, placeholder extreme                  |

#### Border & Divider

| Token           | Hex       | Dipakai di                      |
| --------------- | --------- | ------------------------------- |
| `border-card`   | `#E5E5EA` | Border stat cards, input, modal |
| `border-row`    | `#F2F2F7` | Separator antar row             |
| `border-detail` | `#f0f0f0` | Border dalam expanded detail    |

#### Status Booking

| Status      | Text Color | Background | Token prefix         |
| ----------- | ---------- | ---------- | -------------------- |
| UPCOMING    | `#d97706`  | `#fffbeb`  | `status-upcoming`    |
| CONFIRMED   | `#2563eb`  | `#eff6ff`  | `status-confirmed`   |
| IN_PROGRESS | `#16a34a`  | `#f0fdf4`  | `status-in-progress` |
| COMPLETED   | `#9ca3af`  | `#f9fafb`  | `status-completed`   |
| CANCELLED   | `#ef4444`  | `#fef2f2`  | `status-cancelled`   |
| NO_SHOW     | `#9ca3af`  | `#f9fafb`  | `status-no-show`     |

Badge dot notifikasi UPCOMING: `#f59e0b` (amber, animate-badge-shake)

#### Status Pembayaran

| Status               | Color     | Token             |
| -------------------- | --------- | ----------------- |
| PAID (Lunas)         | `#34C759` | `payment-paid`    |
| DEPOSIT (DP)         | `#FF9500` | `payment-deposit` |
| UNPAID (Belum Bayar) | `#8E8E93` | `payment-unpaid`  |

#### Tipe Kunjungan Badge

| Tipe    | Text      | Background |
| ------- | --------- | ---------- |
| WALK_IN | `#856404` | `#FEF3C7`  |
| BOOKING | `#1565C0` | `#DBEAFE`  |

#### Stat Card Accent Icons

| Card             | Icon Color           |
| ---------------- | -------------------- |
| Pendapatan       | `#007AFF` (iOS blue) |
| Booking Hari Ini | `#007AFF`            |
| Selesai          | `#34C759`            |
| Pembatalan       | `#FF3B30` (iOS red)  |

#### Action Colors

| Aksi                                | Color     |
| ----------------------------------- | --------- |
| Primary button (Konfirmasi, Simpan) | `#2563eb` |
| Danger (Tolak, Hapus)               | `#ef4444` |
| WA button                           | `#25d366` |

---

### 1.2 Tipografi

Font: **DM Sans** (sudah di tailwind.config.ts)

| Token                     | Size | Weight                    | Dipakai di                                    |
| ------------------------- | ---- | ------------------------- | --------------------------------------------- |
| `ts-cap2` / `text-[11px]` | 11px | 600, uppercase, ls:0.07em | Eyebrow label (CARD TITLE, LAYANAN, NOMOR HP) |
| `ts-fn` / `text-[13px]`   | 13px | 400–600                   | Table text, badge text, tab label             |
| `text-[0.875rem]`         | 14px | 400–500                   | Body text, phone number                       |
| `text-[18px]`             | 18px | 700                       | Drawer header title                           |
| `text-[36px]`             | 36px | 700                       | Stat card numbers                             |

**Eyebrow style** (dipakai di label section dalam detail panel):

```
font-size: 11px
font-weight: 600
text-transform: uppercase
letter-spacing: 0.05–0.07em
color: #8E8E93
```

---

### 1.3 Spacing

Token yang sudah ada di tailwind.config.ts:

```
s4=4px  s8=8px  s12=12px  s16=16px
s20=20px  s24=24px  s32=32px  s40=40px  s48=48px
```

Pola yang dipakai di overview:

- Card padding: `20px` (s20)
- Table header padding: `16px 20px`
- Row padding: `14px 20px`
- Detail panel: `px-6 pb-5` (24px 20px)
- Drawer padding: `20px 24px`
- Gap antar komponen: `s4`, `s8`, `s12`

---

### 1.4 Border Radius

Token yang sudah ada:

```
r8=8px  r12=12px  r14=14px  r16=16px
r20=20px  r24=24px  r32=32px  rF=9999px
```

Mapping ke komponen:
| Komponen | Radius |
|----------|--------|
| Stat cards | 20px (r20) |
| Table container | 16px (r16) |
| Drawer / Dialog | 20px (r20) |
| Input / Textarea | 10px |
| Tab button aktif | 10px |
| Booking status badge | 6px |
| Avatar | 10px (bukan circle) |
| Visitor type badge | rF (pill) |
| Payment method button | 10px |
| Konfirmasi/Tolak button | 10px |

---

### 1.5 Shadows

| Token           | Value                          | Dipakai di                   |
| --------------- | ------------------------------ | ---------------------------- |
| `shadow-card`   | `0 2px 8px rgba(0,0,0,0.06)`   | Stat cards, table panel      |
| `shadow-drawer` | `-8px 0 48px rgba(0,0,0,0.18)` | Walk-in drawer               |
| `shadow-dialog` | `0 24px 64px rgba(0,0,0,0.18)` | Confirmation modal, WA notif |
| `shadow-tab`    | `0 1px 4px rgba(0,0,0,0.1)`    | Tab button aktif             |
| `shadow-hover`  | (hover:shadow-lg)              | Card hover state             |

---

## 2. Atoms

Atom = komponen paling kecil, tidak bisa dipecah lagi.

### `<Eyebrow>` — Section label uppercase

```
Props: children, className?
Style: 11px, weight 600, uppercase, ls 0.07em, color text-secondary
Dipakai di: semua section label dalam detail panel (NOMOR HP, LAYANAN, dll)
```

### `<Avatar>` — Inisial nama dengan warna

```
Props: name, size (sm=32px, md=40px, lg=48px)
Style: borderRadius 10px (bukan circle), bg dari avatarColor(name)
Fungsi: avatarColor() dan getInitials() → pindah ke shared/lib/avatar.ts
```

### `<BookingStatusBadge>` — Status booking

```
Props: status: BookingStatus
Variants: upcoming | confirmed | in-progress | completed | cancelled | no-show
Style: rounded-[6px], px-2 py-0.5, text-[11px] font-semibold
```

### `<PaymentStatusBadge>` — Status pembayaran

```
Props: status: 'PAID' | 'DEPOSIT' | 'UNPAID', showDot?
Style: dot 7px + text 13px, inline-flex
```

### `<VisitorTypeBadge>` — Walk-in vs Booking

```
Props: type: 'WALK_IN' | 'BOOKING'
Style: pill (rF), px-2 py-0.5, text-[11px] font-semibold
```

### `<Skeleton>` — Loading placeholder

```
Variants: SkeletonRow (full row), SkeletonButtonPair (dua tombol)
Animation: skeleton-shimmer (sudah di globals.css)
```

### `<NotifDot>` — Badge notifikasi orange di avatar

```
Props: visible, count?
Style: 14x14px, bg #f59e0b, absolute top-right, animate-badge-shake
```

---

## 3. Molecules

Molecule = kombinasi 2+ atom.

### `<StatCard>` — Kartu statistik

```
Props: title, value, icon, accentColor, trend?
Layout: flex column, justify-between
Top: eyebrow (title) + icon (26px duotone phosphor)
Bottom: value (36px bold)
Container: bg-card, border border-card, r20, p-s20, shadow-card, hover:-translate-y-1
```

### `<SegmentedTabs>` — Filter tab (Semua/Booking/Walk-in/Selesai)

```
Props: tabs[], activeTab, onChange, counts
Container: bg-control, r12, p-1
Tab aktif: bg-white, r-[10px], shadow-tab, text-primary weight 600
Tab nonaktif: transparent, text-secondary weight 400
Badge: animate-badge-shake, bg-[#f59e0b]
```

### `<SearchBar>` — Input cari pelanggan

```
Props: value, onChange, placeholder
Style: MagnifyingGlassIcon + input, border border-card, r-[10px]
Width: fixed atau flex
```

### `<BookingRowCollapsed>` — Satu baris booking (collapsed)

```
Props: booking, isExpanded, onToggle
Grid: 2fr 1fr 2fr 1.5fr 1fr 1.2fr (Pelanggan/Status/Layanan/Stylist/Waktu/Tipe)
Click: toggle expand
Chevron: animasi rotate saat expanded
Hapus button: merah, muncul di hover
Skeleton loading state saat loadingBookingId
```

### `<PaymentMethodSelector>` — Cash / Transfer / QRIS

```
Props: value, onChange
Style: 3 pills, border, font-semibold
Active: bg-primary (#1C1C1E), text-white
Inactive: bg-transparent, text-secondary
```

### `<ProofImageUpload>` — Upload bukti pembayaran

```
Props: url?, onUpload, label
States: empty (dashed border) | has-image (preview) | uploading (spinner)
```

---

## 4. Organisms

Organism = kombinasi molecules + atoms membentuk section utuh.

### `<StatCardsRow>`

```
4 StatCard: Pendapatan (revenue) | Booking Hari Ini | Selesai | Pembatalan
Layout: grid 4 kolom, responsive
```

### `<BookingTableHeader>`

```
Kiri: SegmentedTabs
Kanan: SearchBar + SortButton + AddButton (dropdown Walk-in/Booking)
```

### `<BookingTable>`

```
Container: bg-card, r16, shadow-card
Header row: bg-header, grid 6 kolom, eyebrow labels
Body: list BookingRowCollapsed → masing-masing bisa expand ke BookingDetailPanel
Empty state: "Tidak ada pengunjung"
```

### `<BookingDetailPanel>` — Panel expand 3 kolom

```
Layout: grid 3 kolom (Kontak | Layanan | Product Add-on)
Col 1 (Kontak):
  - Nomor HP + Chat WA button
  - Bukti pembayaran (upload/preview)
  - Tombol Konfirmasi + Tolak (skeleton saat loading)
Col 2 (Layanan):
  - Service saat ini + edit (search dropdown)
  - Tambah layanan
  - Catatan terapis (jika treatment)
Col 3 (Product Add-on):
  - List add-ons + remove
  - Tambah add-on button
  - Promo code input
Bawah (full width): PaymentSection
```

### `<PaymentSection>` — Bagian pembayaran

```
Layout: 2 kolom (Status Pembayaran | Input Pembayaran)
Kiri:
  - Progress bar (paid amount / total)
  - Rp amount terbayar + sisa
  - Bukti pelunasan (upload jika ada deposit)
Kanan:
  - PaymentMethodSelector
  - Input jumlah diterima
  - Kembalian (jika CASH)
  - Tombol Selesaikan + Proses
```

### `<WalkInDrawer>` — Slide-out panel kanan

```
Trigger: tombol "+" → dropdown Walk-in / Booking Online
Container: fixed right-0, maxWidth 28rem, h-full, r20, shadow-drawer
Header: eyebrow "Tambah Kunjungan" + judul Walk-in
Body (form):
  - Nama customer (input)
  - Nomor HP (input, optional)
  - Pilih layanan (search + list per stylist)
  - Waktu otomatis (now)
  - Barcode scanner toggle
Footer: CTA button (disabled jika form belum lengkap)
```

### `<ConfirmationDialogs>` (3 dialogs dalam 1 file)

```
1. ConfirmPaymentDialog — konfirmasi selesaikan dengan payment details
2. DeclineDialog — tolak booking + WA notif
3. DeleteDialog — hapus booking dengan nama customer
Semua: fixed center, backdrop blur, r20, shadow-dialog, max-w-[22rem]
```

### `<WANotifDialog>` — Popup setelah konfirmasi

```
Props: customerName, previewMessage, waLink
Layout: icon ✅ + judul + preview pesan hijau + Kirim WA / Lewati
```

### `<MobileDetailPanel>` — Panel detail mobile (bottom sheet / right slide)

```
Trigger: tap baris di mobile
Container: fixed bottom-0 right-0, full height, max-w-sm, z-50
Backdrop: bg-black/20
Content: header (nama + close) + semua detail yang sama dengan desktop
```

---

## 5. Layout & Spacing System

### Page Layout

```
Sidebar (200px, fixed) | Main content (flex-1, overflow-y-auto)
Background: bg-page (#F2F2F7)
Main padding: px-4 py-5 (mobile) → px-6 py-7 (sm) → px-8 py-10 (md)
Gap antar section: gap-5 → gap-7 → gap-10
```

### Responsive Breakpoints

```
mobile: < 768px  → stack layout, bottom sheet detail
tablet: 768–1023px → 2 col detail, adjusted spacing
desktop: ≥ 1024px → full 3 col detail, table view
```

---

## 6. Aturan Wajib

### ✅ DO

- Gunakan token Tailwind yang sudah ada (`s8`, `r12`, `ts-fn`, dll)
- Untuk warna status dan payment, gunakan konstanta dari `shared/lib/tokens.ts`
- Setiap komponen baru: props typed dengan TypeScript, tidak ada `any`
- Komponen baru ikut struktur `features/dashboard/components/[section]/ComponentName.tsx`
- Setiap hook ikut struktur `features/dashboard/hooks/[section]/use-name.ts`

### ❌ DON'T

- Jangan tulis inline `style={{ color: '#8E8E93' }}` — gunakan token
- Jangan duplikasi logic `avatarColor()`, `getInitials()`, `getGreeting()` — import dari `shared/lib/`
- Jangan taruh mock data / konstanta dalam komponen halaman
- Jangan buat komponen baru tanpa cek apakah sudah ada di `shared/components/ui/`
- Jangan ubah UI/behavior saat refactor — focus hanya pindahkan kode

---

## 7. Referensi File

| File                                                         | Isi                                                                         |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `apps/owner/tailwind.config.ts`                              | Semua design tokens (color, typography, spacing, radius, shadow, animation) |
| `apps/owner/src/app/globals.css`                             | skeleton-shimmer, badge-shake animation, scrollbar hide                     |
| `apps/owner/src/shared/lib/tokens.ts`                        | JS constants untuk status colors, payment colors, avatar colors             |
| `apps/owner/src/shared/lib/avatar.ts`                        | `avatarColor()`, `getInitials()`                                            |
| `apps/owner/src/shared/lib/format.ts`                        | `formatRupiah()`, `formatCompactRupiah()`                                   |
| `apps/owner/src/shared/components/ui/`                       | Button, Input, Card, dll yang sudah ada                                     |
| `apps/owner/src/features/dashboard/types/dashboard.types.ts` | DashboardBooking, BookingStatus, PaymentStatus types                        |
| `docs/design-system/tokens.md`                               | Referensi lengkap semua token dengan nilai aktual                           |
| `docs/design-system/components.md`                           | Inventaris komponen + status implementasi                                   |
| `.claude/plans/overview-refactor.md`                         | Plan refactor step-by-step                                                  |
