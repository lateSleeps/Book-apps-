# Customer Experience V2 — Redesign Plan

Branch: `feature/customer-experience-v2`
Baseline commit: `9cd1a70`

---

## Current Customer Journey

1. Owner shares booking link → customer opens `/book/[slug]`
2. Customer lands on **StepServices** — pilih layanan
3. (Optional) **StepServiceDetail** — detail layanan
4. **StepStylist** — pilih stylist
5. **StepConfirm** — ringkasan booking
6. **StepContact** — isi data diri
7. **StepPayment** — pilih metode bayar
8. **StepTicket** — konfirmasi & tiket

---

## Problems Identified

- Layout `max-w-[480px]` terlalu sempit di mobile, terlalu narrow di desktop
- Tidak ada persistent header dengan info salon (nama, foto, jam buka)
- Step navigation tidak jelas — user tidak tahu sudah di tahap mana
- Tidak ada back button yang konsisten di semua step
- StepServices tidak menampilkan harga dan durasi layanan secara prominent
- StepStylist tidak menampilkan ketersediaan stylist secara real-time
- StepPayment tidak ringkas — informasi terlalu padat
- StepTicket tidak shareable — tidak ada tombol simpan / share

---

## Redesign Goals

- Pengalaman booking yang terasa cepat dan ringan (< 3 menit)
- Step progress indicator yang selalu visible
- Salon header yang persistent di semua step
- Typography dan spacing yang konsisten dengan design system owner
- Mobile-first tapi nyaman di desktop
- Transisi antar step yang smooth

---

## IA V2

```
/book/[slug]
├── Layout (persistent)
│   ├── Salon Header (nama, foto cover, rating)
│   └── Step Progress Bar
│
├── Step 1: Services
│   ├── Category tabs
│   ├── Service card (nama, harga, durasi, foto)
│   └── CTA: Pilih Layanan
│
├── Step 2: Stylist
│   ├── "Siapapun" option
│   ├── Stylist card (nama, foto, spesialisasi)
│   └── CTA: Pilih Stylist
│
├── Step 3: DateTime
│   ├── Calendar (swipeable)
│   ├── Time slot grid
│   └── CTA: Pilih Waktu
│
├── Step 4: Contact
│   ├── Nama, No HP, Catatan
│   └── CTA: Konfirmasi
│
├── Step 5: Payment
│   ├── Ringkasan booking
│   ├── Pilih metode bayar
│   └── CTA: Bayar / Pesan
│
└── Step 6: Ticket
    ├── QR Code / Booking ID
    ├── Detail booking
    └── Actions: Simpan, Share, Kembali ke Beranda
```

---

## Screens To Revamp

| Screen        | File                      | Priority |
| ------------- | ------------------------- | -------- |
| StepServices  | `_steps/StepServices.tsx` | P0       |
| StepStylist   | `_steps/StepStylist.tsx`  | P0       |
| StepConfirm   | `_steps/StepConfirm.tsx`  | P0       |
| StepContact   | `_steps/StepContact.tsx`  | P1       |
| StepPayment   | `_steps/StepPayment.tsx`  | P1       |
| StepTicket    | `_steps/StepTicket.tsx`   | P1       |
| Layout        | `layout.tsx`              | P0       |
| Page (router) | `page.tsx`                | P1       |

---

## Non Goals

- Tidak mengubah backend / tRPC routers
- Tidak mengubah database schema
- Tidak menambah step baru di luar yang sudah ada
- Tidak mengubah owner dashboard (`apps/owner`)
- Tidak mengubah package shared tanpa kebutuhan yang jelas

---

## Rollback Strategy

Jika revamp menyebabkan regresi:

```bash
# Kembali ke baseline sebelum redesign
git checkout feat/settings-v2-brand-services

# Atau revert specific commit
git revert <commit-hash>
```

Baseline aman di: `feat/settings-v2-brand-services` @ commit `9cd1a70`
