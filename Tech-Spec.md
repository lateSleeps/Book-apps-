# Rara Beauty — Full Tech Spec
**Version 1.0** · Salon Customer Booking App · May 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Folder Structure](#4-folder-structure)
5. [Data Model](#5-data-model)
6. [State Management](#6-state-management)
7. [Booking Flow — 9 Steps](#7-booking-flow--9-steps)
8. [Component Specs](#8-component-specs)
9. [API Contracts](#9-api-contracts)
10. [Design System Integration](#10-design-system-integration)
11. [Validation Rules](#11-validation-rules)
12. [Error Handling](#12-error-handling)
13. [Performance](#13-performance)
14. [Deployment](#14-deployment)

---

## 1. Overview

### Product
Rara Beauty Salon — Customer-facing booking web app. Mobile-first (375–430px). Single-salon, single-location. No login required.

### Goals
- Customer dapat booking layanan salon dalam < 3 menit
- Zero konflik jadwal (slot filtering real-time)
- Payment via transfer bank + upload bukti
- Digital ticket sebagai konfirmasi booking

### Out of Scope (v1.0)
- Multi-salon / multi-lokasi
- Login / akun pelanggan
- Reschedule / cancel oleh customer
- Notifikasi push / SMS
- Admin dashboard (terpisah)

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.x |
| Language | TypeScript | 5.3.x |
| Styling | Tailwind CSS | 3.4.x |
| State | Zustand + persist | 4.5.x |
| Date utils | date-fns | 3.3.x |
| QR Code | qrcode.react | 3.1.x |
| Runtime | Node.js | 20 LTS |
| Package manager | npm | 10.x |

### Rationale
- **Next.js App Router** — server components untuk halaman statis (landing), client components untuk booking flow interaktif
- **Zustand** — minimal boilerplate, persist ke localStorage untuk survive refresh
- **Tailwind** — design token langsung di config, tidak perlu CSS custom di setiap komponen
- **Tidak pakai React Query / SWR** — v1.0 pakai mock data, siap swap ke API di v2.0

---

## 3. Architecture

```
Browser (Mobile 375–430px)
    │
    ├── Next.js App Router (SSR/CSR hybrid)
    │       ├── Static pages: layout, landing (SSR)
    │       └── Booking flow: 9 step pages ('use client')
    │
    ├── Zustand Store (client-side)
    │       └── Persisted to localStorage ('booking-storage')
    │
    └── Mock Data Layer (v1.0)
            └── useMockData.ts → swap ke API calls di v2.0
```

### Navigation Pattern
- URL-based step navigation: `/book/rara-beauty` → `/book/rara-beauty/steps/category` → dst.
- `router.push()` untuk maju, `router.back()` untuk mundur
- Guard di step akhir: redirect ke awal jika state tidak valid

---

## 4. Folder Structure

```
salon-booking-customer/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout, font, metadata
│   │   ├── page.tsx                      # Landing / redirect ke booking
│   │   └── book/
│   │       └── rara-beauty/
│   │           ├── layout.tsx            # Booking shell (phone frame)
│   │           ├── page.tsx              # Step 1: Pilih Tanggal
│   │           └── steps/
│   │               ├── category/page.tsx # Step 2: Pilih Kategori
│   │               ├── services/page.tsx # Step 3: Pilih Layanan
│   │               ├── stylist/page.tsx  # Step 4: Pilih Stylist
│   │               ├── time/page.tsx     # Step 5: Pilih Jam
│   │               ├── confirm/page.tsx  # Step 6: Ringkasan + Timer
│   │               ├── addons/page.tsx   # Step 7: Produk Tambahan
│   │               ├── payment/page.tsx  # Step 8: Pembayaran
│   │               └── ticket/page.tsx   # Step 9: Tiket Digital
│   │
│   ├── features/
│   │   └── booking/
│   │       ├── components/
│   │       │   ├── CalendarView.tsx      # Kalender bulanan
│   │       │   ├── CategoryGrid.tsx      # Grid 4 kategori
│   │       │   ├── ServiceList.tsx       # List layanan per kategori
│   │       │   ├── StylistCards.tsx      # Accordion stylist + slot
│   │       │   ├── TimeSlotPicker.tsx    # Chip jam (PAGI/SIANG/SORE)
│   │       │   ├── BookingSummary.tsx    # Ringkasan + countdown
│   │       │   ├── ProductUpsell.tsx     # Produk retail
│   │       │   ├── PaymentOptions.tsx    # Radio deposit/full + QRIS
│   │       │   ├── FileUploader.tsx      # Upload bukti transfer
│   │       │   ├── DigitalTicket.tsx     # QR + PIN + detail
│   │       │   ├── StepIndicator.tsx     # Progress dots
│   │       │   └── NavigationButtons.tsx # CTA bar bawah
│   │       │
│   │       ├── hooks/
│   │       │   ├── useBookingStore.ts    # Zustand store utama
│   │       │   ├── useStepValidation.ts  # Validasi tiap step
│   │       │   ├── useSlotTimer.ts       # Countdown 5 menit
│   │       │   └── useMockData.ts        # Data mock Indonesian
│   │       │
│   │       ├── types/
│   │       │   └── booking.types.ts      # Semua TypeScript types
│   │       │
│   │       └── utils/
│   │           ├── validation.ts         # Validasi file, form
│   │           └── price-calculator.ts   # Hitung total + diskon
│   │
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorMessage.tsx
│   │
│   └── lib/
│       ├── constants.ts                  # DEPOSIT_AMOUNT, MAX_FILE_SIZE, dll
│       └── format.ts                     # formatRupiah, formatDate, dll
```

---

## 5. Data Model

### Types (`booking.types.ts`)

```typescript
// ── Entities ──────────────────────────────────────────

interface Category {
  id: string;           // 'cat-1'
  name: string;         // 'Potong Rambut'
  description: string;
  color: string;        // Tailwind class: 'bg-c-peach'
  blobColor: string;    // Hex untuk blob shape
  icon: string;         // Emoji atau SVG key
}

interface Service {
  id: string;           // 'svc-1'
  categoryId: string;
  name: string;         // 'Potong Rambut Pendek'
  description: string;
  price: number;        // dalam Rupiah: 65000
  duration: number;     // menit: 30
}

interface Stylist {
  id: string;           // 'sty-1'
  name: string;         // 'Dewi'
  specialty: string;    // 'Coloring & Treatment'
  avatarInitials: string; // 'DW'
  avatarColor: string;  // bg color untuk avatar
  bookedSlots: string[]; // ['09:00', '12:00'] — slot yang sudah terisi
}

interface TimeSlot {
  time: string;         // '09:00'
  session: 'PAGI' | 'SIANG' | 'SORE';
  available: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageEmoji: string;
}

// ── Booking State ──────────────────────────────────────

interface SelectedAddon {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

type BookingStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED';
type PaymentType = 'DEPOSIT' | 'FULL';

interface BookingState {
  step: number;
  date: string | null;          // ISO string: '2026-05-20'
  category: Category | null;
  service: Service | null;
  stylist: Stylist | null;
  timeSlot: string | null;      // '14:00'
  addons: SelectedAddon[];
  paymentType: PaymentType | null;
  proofImageUrl: string | null; // object URL untuk preview
  bookingStatus: BookingStatus;
  bookingCode: string | null;   // 'RB-2405-4829'
  pin: string | null;           // '4829'
}
```

### Mock Data (`useMockData.ts`)

```
Categories: 4
  - Potong Rambut (peach)
  - Coloring (blue)
  - Perawatan (mint)
  - Styling (lilac)

Services: 5–6 per kategori, total 21
  Range harga: Rp 50.000 – Rp 200.000
  Range durasi: 20 – 150 menit

Stylists: 4
  - Dewi Rahayu   · Coloring & Highlight
  - Sinta Wulandari · Perawatan & Keratin
  - Rina Kusuma   · Potong & Styling
  - Andi Pratama  · Barbering & Perm

Time slots: 7 per hari
  09:00 · 10:30 · 12:00 · 14:00 · 16:00 · 18:00 · 20:00
  Session mapping:
    PAGI:  09:00, 10:30
    SIANG: 12:00, 14:00
    SORE:  16:00, 18:00, 20:00

Products (upsell): 5
  - Makarizo Shampoo    Rp 45.000
  - L'Oreal Conditioner Rp 55.000
  - Gatsby Pomade       Rp 35.000
  - TRESemmé Serum      Rp 65.000
  - Wella Hair Mask     Rp 75.000

Unavailability: setiap stylist punya 2–3 slot random booked
```

---

## 6. State Management

### Zustand Store (`useBookingStore.ts`)

```typescript
interface BookingStore extends BookingState {
  // Computed
  totalPrice: number;        // service.price + sum(addons)
  depositAmount: number;     // konstanta: Rp 20.000

  // Step navigation
  setStep: (step: number) => void;
  goNext: () => void;
  goBack: () => void;

  // Setters
  setDate: (date: string) => void;
  setCategory: (category: Category) => void;
  setService: (service: Service) => void;
  setStylist: (stylist: Stylist) => void;
  setTimeSlot: (slot: string) => void;
  addAddon: (product: Product) => void;
  removeAddon: (id: string) => void;
  setPaymentType: (type: PaymentType) => void;
  setProofImage: (url: string) => void;

  // Booking actions
  confirmBooking: () => void;   // set status PENDING, generate code+PIN
  completeBooking: () => void;  // set status CONFIRMED
  reset: () => void;
}
```

### Persist Config
```typescript
persist(store, {
  name: 'booking-storage',
  partialize: (state) => ({
    // Exclude File objects — tidak bisa serialize
    ...state,
    proofImageUrl: null,
  }),
})
```

### Step → URL Mapping

| Step | URL | Guard |
|---|---|---|
| 1 | `/book/rara-beauty` | — |
| 2 | `/book/rara-beauty/steps/category` | date != null |
| 3 | `/book/rara-beauty/steps/services` | category != null |
| 4 | `/book/rara-beauty/steps/stylist` | service != null |
| 5 | `/book/rara-beauty/steps/time` | stylist != null |
| 6 | `/book/rara-beauty/steps/confirm` | timeSlot != null |
| 7 | `/book/rara-beauty/steps/addons` | step >= 6 |
| 8 | `/book/rara-beauty/steps/payment` | step >= 7 |
| 9 | `/book/rara-beauty/steps/ticket` | status === 'CONFIRMED' |

---

## 7. Booking Flow — 9 Steps

---

### Step 1 — Pilih Tanggal
**URL:** `/book/rara-beauty`

**UI:**
- Header: "Booking." (32px, bold)
- Kalender bulanan — grid 7 kolom
- Disable: tanggal lampau, hari Senin (libur salon)
- Tap tanggal → highlight dengan warna accent
- Dot indikator: accent = ada slot tersedia

**Logic:**
- `setDate(isoString)` → `goNext()` → push ke `/steps/category`
- Tanggal hari ini boleh dipilih jika jam < 19:00

**Validasi:** Tidak bisa lanjut tanpa pilih tanggal

---

### Step 2 — Pilih Kategori
**URL:** `/book/rara-beauty/steps/category`

**UI:**
- Header: "Layanan." (32px)
- Grid 2×2 — 4 kartu kategori dengan warna pastel
- Setiap kartu: nama, deskripsi, blob shape dekoratif

**Logic:**
- `setCategory(category)` → push ke `/steps/services`
- Tidak perlu tombol konfirmasi — tap langsung navigasi

---

### Step 3 — Pilih Layanan
**URL:** `/book/rara-beauty/steps/services`

**UI:**
- Header: nama kategori yang dipilih
- List vertikal layanan (filtered by categoryId)
- Setiap item: nama, deskripsi, durasi, harga (Rp format)
- Selected state: border accent + teks accent-dark

**Logic:**
- `setService(service)` → aktifkan tombol "Pilih Stylist"
- Tombol CTA disabled sampai ada pilihan

---

### Step 4 — Pilih Stylist
**URL:** `/book/rara-beauty/steps/stylist`

**UI:**
- Header: "Pilih Stylist"
- Chips konteks di atas: tanggal + layanan yang dipilih
- List stylist — accordion
- Tap stylist booked → toast "Stylist penuh di tanggal ini"

**Logic:**
- Stylist unavailable: `opacity-55`, `grayscale`, tidak bisa expand
- Tap stylist available → `setStylist()` → expand accordion → tampil TimeSlotPicker

---

### Step 5 — Pilih Jam
**URL:** `/book/rara-beauty/steps/time`

**UI:**
- Dalam accordion stylist yang dipilih (inline)
- Slot dikelompok: PAGI / SIANG / SORE
- Chip tersedia: bg accent-soft, teks accent-dark
- Chip penuh: opacity-40, strikethrough
- Chip dipilih: bg label (hitam), teks putih

**Logic:**
- Filter slot: `!stylist.bookedSlots.includes(slot.time)`
- `setTimeSlot(time)` → aktifkan tombol "Konfirmasi"
- Tombol "Konfirmasi" push ke `/steps/confirm`

---

### Step 6 — Ringkasan & Konfirmasi
**URL:** `/book/rara-beauty/steps/confirm`

**UI:**
- Header: "Konfirmasi"
- Card ringkasan: tanggal, layanan, stylist, jam, harga
- Countdown timer: `05:00` turun ke `00:00`
- Timer merah saat < 1 menit

**Logic (`useSlotTimer`):**
```
start: 5 * 60 = 300 detik
setiap detik: countdown -= 1
jika 0: reset timeSlot → toast "Slot expired" → push ke /steps/time
```
- Tombol "Lanjut ke Pembayaran" → push ke `/steps/addons`

---

### Step 7 — Produk Tambahan (Upsell)
**URL:** `/book/rara-beauty/steps/addons`

**UI:**
- Header: "Tambahan"
- List 5 produk retail dengan harga
- Tombol "+" untuk tambah, "−" untuk kurang, atau hapus
- Total harga update realtime di CTA bar
- Tombol "Lewati" (ghost) dan "Lanjut" (primary)

**Logic:**
- `addAddon(product)` / `removeAddon(id)` update Zustand
- `totalPrice` = service.price + sum(addon.price × addon.quantity)
- Boleh lewati — tap "Lewati" juga push ke `/steps/payment`

---

### Step 8 — Pembayaran
**URL:** `/book/rara-beauty/steps/payment`

**UI:**
- Header: "Pembayaran"
- Radio buttons:
  - Deposit: Rp 20.000 (recommended)
  - Lunas: total harga
- QRIS placeholder image (static)
- Nominal transfer sesuai pilihan
- FileUploader: drag/tap upload bukti

**FileUploader logic:**
```
Validasi:
  - Format: image/jpeg atau image/png saja
  - Ukuran: max 5MB
  - Jika invalid: tampil ErrorMessage inline

Setelah upload valid:
  - Preview gambar muncul
  - Tombol "Konfirmasi Pembayaran" aktif
```

**Submit:**
- `confirmBooking()` → status = 'PENDING', generate bookingCode + PIN 4 digit
- Push ke `/steps/ticket`

---

### Step 9 — Tiket Digital
**URL:** `/book/rara-beauty/steps/ticket`

**Guard:**
```typescript
if (bookingStatus !== 'CONFIRMED') {
  router.replace('/book/rara-beauty');
  return null;
}
```

> **Catatan:** Di v1.0 (mock), `confirmBooking()` langsung set status ke `CONFIRMED`. Di v2.0 (API), status awal adalah `PENDING` sampai admin approve.

**UI:**
- Header: "Tiket Kamu 🎉"
- QR Code (via `qrcode.react`) — value: bookingCode
- PIN 4 digit besar
- Card detail: nama layanan, stylist, tanggal, jam
- Tombol "Selesai" → `reset()` → push ke `/`

---

## 8. Component Specs

### NavigationButtons
```typescript
interface NavigationButtonsProps {
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  showBack?: boolean;
  onBack?: () => void;
  secondaryLabel?: string;   // untuk "Lewati"
  onSecondary?: () => void;
}
```
- Selalu `position: sticky, bottom: 0`
- Background: `#ffffff` solid
- Padding: `16px 16px 32px`

### StepIndicator
```typescript
interface StepIndicatorProps {
  current: number;  // 1–9
  total: number;    // 9
}
```
- Dot inactive: 6×6px, `--sep`
- Dot active: 20×6px, `--label`
- Transition: 300ms width

### CalendarView
```typescript
interface CalendarViewProps {
  selectedDate: string | null;
  onSelect: (isoDate: string) => void;
  disabledDays?: number[];   // [1] = Senin
}
```

### FileUploader
```typescript
interface FileUploaderProps {
  onUpload: (objectUrl: string) => void;
  onError: (message: string) => void;
  maxSizeMB?: number;        // default: 5
  accept?: string[];         // default: ['image/jpeg', 'image/png']
}
```

---

## 9. API Contracts

> v1.0 menggunakan mock data. Berikut adalah shape API yang akan diimplementasikan di v2.0.

### GET `/api/salons/:slug`
```json
{
  "id": "salon-1",
  "name": "Rara Beauty Salon",
  "address": "Jl. Sudirman No. 12, Jakarta",
  "openDays": [2,3,4,5,6,7],
  "openHours": { "open": "09:00", "close": "20:00" }
}
```

### GET `/api/salons/:slug/categories`
```json
[{ "id": "cat-1", "name": "Potong Rambut", ... }]
```

### GET `/api/salons/:slug/services?categoryId=cat-1`
```json
[{ "id": "svc-1", "name": "Potong Pendek", "price": 65000, ... }]
```

### GET `/api/salons/:slug/stylists?date=2026-05-20&serviceId=svc-1`
```json
[{
  "id": "sty-1",
  "name": "Dewi",
  "available": true,
  "bookedSlots": ["09:00", "12:00"]
}]
```

### POST `/api/bookings`
```json
// Request
{
  "salonId": "salon-1",
  "date": "2026-05-20",
  "serviceId": "svc-1",
  "stylistId": "sty-1",
  "timeSlot": "14:00",
  "addons": [{ "productId": "prod-1", "quantity": 1 }],
  "paymentType": "DEPOSIT",
  "proofImage": "base64string"
}

// Response
{
  "bookingId": "book-abc123",
  "bookingCode": "RB-2405-4829",
  "pin": "4829",
  "status": "PENDING"
}
```

---

## 10. Design System Integration

### Tailwind Config (`tailwind.config.ts`)

```typescript
theme: {
  extend: {
    colors: {
      accent:       '#4a9b7f',
      'accent-dark':'#2d7a5f',
      'accent-soft':'#edf7f3',
      label:        '#111110',
      label2:       '#605f5b',
      label3:       '#a09f9a',
      sep:          '#e8e7e3',
      surface:      '#ffffff',
      bg:           '#f7f7f5',
      'c-peach':    '#fde8dc',
      'c-blue':     '#ddedf8',
      'c-mauve':    '#eddde9',
      'c-yellow':   '#fef3c2',
      'c-mint':     '#d8f3ec',
      'c-lilac':    '#e8e2f8',
    },
    fontFamily: {
      sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      't12': '12px', 't14': '14px', 't16': '16px',
      't18': '18px', 't20': '20px', 't28': '28px', 't32': '32px',
    },
    spacing: {
      's4': '4px',   's8': '8px',   's12': '12px',
      's16': '16px', 's20': '20px', 's24': '24px',
      's32': '32px', 's40': '40px', 's48': '48px',
    },
    borderRadius: {
      'r8': '8px', 'r12': '12px', 'r16': '16px',
      'r20': '20px', 'r24': '24px', 'rF': '9999px',
    },
  },
}
```

### Rules
- **Tidak boleh** pakai arbitrary values (`bg-[#fff]`)
- **Tidak boleh** pakai inline `style={{}}` kecuali nilai dinamis (blob color)
- Semua warna referensi token di atas

---

## 11. Validation Rules

### Per Step

| Step | Rule | Error Message |
|---|---|---|
| 1 | Tanggal wajib dipilih | "Pilih tanggal dulu" |
| 1 | Tidak boleh tanggal lampau | "Tanggal sudah lewat" |
| 2 | Kategori wajib dipilih | — (tap langsung lanjut) |
| 3 | Layanan wajib dipilih | "Pilih layanan dulu" |
| 4 | Stylist tidak boleh booked | "Stylist penuh di tanggal ini" |
| 5 | Slot tidak boleh unavailable | — (chip disabled) |
| 6 | Timer expired | "Slot kadaluarsa, pilih jam lain" |
| 8 | File wajib diupload | "Upload bukti pembayaran" |
| 8 | File > 5MB | "Ukuran file maksimal 5MB" |
| 8 | File bukan JPG/PNG | "Hanya JPG dan PNG yang diterima" |
| 9 | Status !== CONFIRMED | Redirect ke halaman awal |

### File Validation (`validation.ts`)
```typescript
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

function validateProofImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Hanya JPG dan PNG';
  if (file.size > MAX_SIZE) return 'Ukuran file maksimal 5MB';
  return null; // valid
}
```

---

## 12. Error Handling

### Strategi
- **Validasi form:** ErrorMessage component inline di bawah input/uploader
- **Slot expired:** Toast + auto-redirect ke step 5
- **Guard failure:** `router.replace()` ke step yang sesuai
- **JavaScript error:** Error boundary di layout booking

### Error Boundary
```typescript
// src/app/book/rara-beauty/layout.tsx
<ErrorBoundary fallback={<ErrorFallback onReset={reset} />}>
  {children}
</ErrorBoundary>
```

---

## 13. Performance

### Targets
| Metric | Target |
|---|---|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 2.5s |
| Bundle size (initial) | < 150KB gzipped |

### Strategi
- Font preload via `next/font` atau `<link rel="preload">`
- Gambar QRIS: `next/image` dengan `priority`
- Mock data: tidak ada network call → TTI optimal
- `qrcode.react`: lazy import hanya di step 9

---

## 14. Deployment

### Environment
```
Platform:     Vercel (recommended) atau Netlify
Node version: 20 LTS
Build cmd:    npm run build
Output:       .next (Next.js standard)
```

### Environment Variables
```bash
# v1.0 (mock) — tidak ada env vars wajib

# v2.0 (API) — tambahkan:
NEXT_PUBLIC_API_URL=https://api.rarabeauty.id
NEXT_PUBLIC_SALON_SLUG=rara-beauty
```

### Setup Lokal
```bash
git clone <repo>
cd salon-booking-customer
npm install
npm run dev
# → http://localhost:3000/book/rara-beauty
```

### Checklist Pre-Deploy
- [ ] `npm run build` sukses tanpa error
- [ ] `npm run lint` zero warnings
- [ ] TypeScript strict mode — zero `any`
- [ ] Test manual semua 9 step di mobile viewport (375px)
- [ ] Test timer expired di step 6
- [ ] Test file upload validation di step 8
- [ ] Test guard redirect di step 9

---

*Tech Spec · Rara Beauty Salon · v1.0 · May 2026*
