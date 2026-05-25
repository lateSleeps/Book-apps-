# ADR-001: Rara Beauty — System Architecture

**Status:** Proposed  
**Date:** 2026-05-22  
**Deciders:** Owner / Lead Developer  
**Scope:** Kedua aplikasi — `rara-booking` (customer) + `salon-booking-customer` (owner dashboard)

---

## 1. Context & Current State

Saat ini kedua aplikasi berjalan sebagai **frontend-only** dengan semua data di-hardcode. Tidak ada backend, database, atau autentikasi nyata. Data antara owner dashboard dan customer booking app **tidak terhubung sama sekali**.

### Pain Points Sekarang
| Masalah | Dampak |
|---|---|
| Data hardcoded di hooks | Booking customer tidak pernah muncul di dashboard |
| Tidak ada database | Setiap refresh → data hilang |
| Tidak ada auth | Dashboard bisa dibuka siapa saja |
| Tidak ada real-time | Owner tidak tahu ada booking baru masuk |
| Bukti transfer mock | Tidak bisa upload/review foto asli |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET / CDN                           │
└──────────────────┬──────────────────────────┬───────────────────┘
                   │                          │
          ┌────────▼────────┐       ┌─────────▼────────┐
          │  rara-booking   │       │ salon-booking-   │
          │  (Customer PWA) │       │  customer        │
          │  port 3002      │       │  (Owner Dashboard│
          │                 │       │   port 3000)     │
          └────────┬────────┘       └─────────┬────────┘
                   │                          │
                   └──────────┬───────────────┘
                              │  REST API + WebSocket
                   ┌──────────▼────────────┐
                   │     BACKEND API       │
                   │  Next.js Route        │
                   │  Handlers (API layer) │
                   │  or Standalone        │
                   │  Fastify/Express      │
                   └──────────┬────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
  ┌────────▼───────┐ ┌───────▼──────┐ ┌────────▼───────┐
  │  PostgreSQL    │ │   Supabase   │ │   Cloudinary   │
  │  (Prisma ORM)  │ │   Realtime   │ │   (Images)     │
  │                │ │  (Websocket) │ │                │
  └────────────────┘ └──────────────┘ └────────────────┘
```

### Communication Flow
```
Customer booking baru:
rara-booking → POST /api/bookings → DB → Supabase Realtime → salon-booking-customer (badge update)

Owner konfirmasi:
salon-booking-customer → PATCH /api/bookings/:id/confirm → DB → (optional: WhatsApp notif ke customer)

Customer upload bukti:
rara-booking → POST /api/bookings/:id/proof → Cloudinary → DB → Realtime → owner dashboard
```

---

## 3. Tech Stack yang Direkomendasikan

### Frontend (Tetap, tidak berubah)
| Teknologi | Versi | Alasan |
|---|---|---|
| Next.js App Router | 14.2.5 | Sudah jalan, file-based routing bagus |
| TypeScript | 5.3.3 | Type safety sudah ada |
| Tailwind CSS | 3.4.4 | Design system sudah matang |
| Zustand | 4.5.2 | State management ringan, sudah dipakai |
| Zod | 3.23.8 | Validasi form sudah ada |

### Backend (Yang Perlu Ditambahkan)
| Teknologi | Pilihan | Alasan |
|---|---|---|
| **API Layer** | Next.js Route Handlers (di `salon-booking-customer`) | Paling simpel, tidak perlu server terpisah |
| **Database** | PostgreSQL | Relasional, cocok untuk booking system |
| **ORM** | Prisma | Type-safe, migrasi mudah, cocok dengan TypeScript |
| **Auth** | NextAuth.js v5 (hanya owner) | Login Google/Credentials untuk owner |
| **Realtime** | Supabase Realtime | Free tier cukup, mudah setup |
| **Storage** | Supabase Storage | Untuk bukti transfer foto |
| **Notifikasi** | Fonnte / WA Gateway | Kirim notif WA ke customer |

### Deployment
| Service | Untuk |
|---|---|
| Vercel | Deploy kedua Next.js app |
| Supabase | PostgreSQL + Realtime + Storage (semua dalam satu) |
| Cloudflare | CDN untuk aset publik |

> **Catatan**: Supabase bisa menggantikan PostgreSQL + Realtime + Storage sekaligus dalam satu platform, sehingga setup lebih simpel.

---

## 4. Database Schema

```sql
-- ── Salon (multi-tenant ready) ─────────────────────────────────
CREATE TABLE salons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,        -- 'rara-beauty'
  name        TEXT NOT NULL,               -- 'Rara Beauty'
  description TEXT,
  phone       TEXT,
  address     TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Stylists ────────────────────────────────────────────────────
CREATE TABLE stylists (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id     UUID REFERENCES salons(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  specialty    TEXT,
  avatar_color TEXT DEFAULT '#c8ede2',
  is_active    BOOLEAN DEFAULT true
);

-- ── Categories ──────────────────────────────────────────────────
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id    UUID REFERENCES salons(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,              -- 'Hair', 'Nail', 'Face'
  description TEXT,
  icon        TEXT,                       -- emoji
  color       TEXT,                       -- Tailwind class: 'bg-c-peach'
  blob_color  TEXT,                       -- hex: '#f5c4ab'
  sort_order  INTEGER DEFAULT 0
);

-- ── Services ────────────────────────────────────────────────────
CREATE TABLE services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL,           -- dalam Rupiah
  duration    INTEGER NOT NULL,           -- dalam menit
  is_active   BOOLEAN DEFAULT true
);

-- ── Products / Add-ons ──────────────────────────────────────────
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id    UUID REFERENCES salons(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL,
  image_emoji TEXT,
  is_active   BOOLEAN DEFAULT true
);

-- ── Promo Codes ─────────────────────────────────────────────────
CREATE TABLE promo_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id   UUID REFERENCES salons(id) ON DELETE CASCADE,
  code       TEXT UNIQUE NOT NULL,        -- 'RARA10'
  type       TEXT CHECK (type IN ('percent', 'fixed')),
  value      INTEGER NOT NULL,            -- 10 = 10% atau Rp 10.000
  is_active  BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ
);

-- ── Bookings (Online) ───────────────────────────────────────────
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code    TEXT UNIQUE NOT NULL,   -- 'RB-2026-001'
  pin             TEXT NOT NULL,          -- '1234'
  salon_id        UUID REFERENCES salons(id),
  stylist_id      UUID REFERENCES stylists(id),
  service_id      UUID REFERENCES services(id),
  promo_code_id   UUID REFERENCES promo_codes(id),

  -- Customer info
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,

  -- Schedule
  date            DATE NOT NULL,
  time_slot       TEXT NOT NULL,          -- '09:00'

  -- Payment
  payment_type    TEXT CHECK (payment_type IN ('DEPOSIT', 'FULL')),
  payment_status  TEXT CHECK (payment_status IN ('UNPAID', 'DEPOSIT', 'PAID'))
                  DEFAULT 'UNPAID',
  subtotal        INTEGER NOT NULL,
  discount        INTEGER DEFAULT 0,
  total           INTEGER NOT NULL,
  deposit_amount  INTEGER DEFAULT 20000,

  -- Status
  booking_status  TEXT CHECK (booking_status IN (
                    'UPCOMING', 'CONFIRMED', 'IN_PROGRESS', 
                    'COMPLETED', 'CANCELLED', 'NO_SHOW'
                  )) DEFAULT 'UPCOMING',

  -- Meta
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Booking Add-ons ─────────────────────────────────────────────
CREATE TABLE booking_addons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID REFERENCES bookings(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id),
  name        TEXT NOT NULL,              -- snapshot nama saat booking
  price       INTEGER NOT NULL,           -- snapshot harga saat booking
  quantity    INTEGER DEFAULT 1
);

-- ── Payment Proofs ──────────────────────────────────────────────
CREATE TABLE payment_proofs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID REFERENCES bookings(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,             -- Supabase Storage URL
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- ── Walk-in Customers (Manual dari Owner) ───────────────────────
CREATE TABLE walk_ins (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id       UUID REFERENCES salons(id),
  stylist_id     UUID REFERENCES stylists(id),
  service_id     UUID REFERENCES services(id),
  customer_name  TEXT NOT NULL,
  customer_phone TEXT,
  date           DATE NOT NULL,
  time_slot      TEXT NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('UNPAID', 'DEPOSIT', 'PAID'))
                 DEFAULT 'UNPAID',
  visit_status   TEXT CHECK (visit_status IN (
                   'IN_PROGRESS', 'COMPLETED', 'NO_SHOW'
                 )) DEFAULT 'IN_PROGRESS',
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────────────
CREATE INDEX idx_bookings_salon_date ON bookings(salon_id, date);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_walk_ins_salon_date ON walk_ins(salon_id, date);
```

---

## 5. API Structure

Semua API Route berada di `salon-booking-customer` (owner app) karena ini server-side yang aman untuk akses database.

### Public API (dipakai `rara-booking`)
```
GET    /api/salons/[slug]                    → info salon
GET    /api/salons/[slug]/categories         → list kategori
GET    /api/salons/[slug]/services           → list layanan
GET    /api/salons/[slug]/stylists           → list stylist
GET    /api/salons/[slug]/availability       → slot tersedia (date + stylist_id)
GET    /api/salons/[slug]/products           → list produk add-on
POST   /api/salons/[slug]/promo/validate     → validasi kode promo

POST   /api/bookings                         → buat booking baru
GET    /api/bookings/[code]                  → cek status booking (pakai code+PIN)
POST   /api/bookings/[id]/proof              → upload bukti transfer
```

### Owner API (protected, hanya dashboard)
```
GET    /api/dashboard/today                  → semua booking + walk-in hari ini
GET    /api/dashboard/bookings               → list booking (filter: date, status)
PATCH  /api/dashboard/bookings/[id]/confirm  → konfirmasi booking online
PATCH  /api/dashboard/bookings/[id]/payment  → update status pembayaran
PATCH  /api/dashboard/bookings/[id]/status   → update status booking

POST   /api/dashboard/walk-ins               → tambah walk-in baru
PATCH  /api/dashboard/walk-ins/[id]/payment  → update pembayaran walk-in
PATCH  /api/dashboard/walk-ins/[id]/status   → update status walk-in

GET    /api/dashboard/stats                  → statistik (revenue, count, dll)
GET    /api/dashboard/stylists               → performa stylist

POST   /api/auth/[...nextauth]               → NextAuth.js handler
```

### Response Format (Standar)
```typescript
// Success
{ data: T, meta?: { total: number; page: number } }

// Error
{ error: { code: string; message: string; details?: unknown } }
```

---

## 6. Folder Structure (Final)

```
Books apps/
├── salon-booking-customer/          ← OWNER DASHBOARD (port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/                 ← API Routes (backend)
│   │   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   │   ├── salons/[slug]/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── categories/route.ts
│   │   │   │   │   ├── services/route.ts
│   │   │   │   │   ├── stylists/route.ts
│   │   │   │   │   ├── availability/route.ts
│   │   │   │   │   └── products/route.ts
│   │   │   │   ├── bookings/
│   │   │   │   │   ├── route.ts     (POST: create booking)
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── route.ts (GET by code)
│   │   │   │   │       └── proof/route.ts
│   │   │   │   └── dashboard/       ← protected routes
│   │   │   │       ├── today/route.ts
│   │   │   │       ├── bookings/route.ts
│   │   │   │       ├── walk-ins/route.ts
│   │   │   │       └── stats/route.ts
│   │   │   ├── dashboard/           ← UI Pages
│   │   │   │   ├── overview/page.tsx
│   │   │   │   ├── bookings/page.tsx
│   │   │   │   ├── schedule/page.tsx
│   │   │   │   ├── clients/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── login/page.tsx       ← Auth page (belum ada)
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── features/
│   │   │   └── dashboard/
│   │   │       ├── components/      ← UI Components
│   │   │       ├── hooks/           ← Data hooks (ganti ke API calls)
│   │   │       └── types/
│   │   ├── shared/                  ← Shared utils
│   │   └── lib/
│   │       ├── prisma.ts            ← Prisma client singleton
│   │       ├── auth.ts              ← NextAuth config
│   │       └── supabase.ts          ← Supabase client
│   └── prisma/
│       ├── schema.prisma            ← Database schema
│       └── migrations/
│
└── rara-booking/                    ← CUSTOMER APP (port 3002)
    ├── src/
    │   ├── app/
    │   │   ├── book/[slug]/
    │   │   │   ├── steps/           ← 9 step pages
    │   │   │   │   ├── category/
    │   │   │   │   ├── services/
    │   │   │   │   ├── stylist/
    │   │   │   │   ├── time/
    │   │   │   │   ├── addons/
    │   │   │   │   ├── contact/
    │   │   │   │   ├── payment/
    │   │   │   │   ├── confirm/
    │   │   │   │   └── ticket/
    │   │   │   ├── layout.tsx
    │   │   │   └── page.tsx
    │   │   ├── layout.tsx
    │   │   └── page.tsx             ← redirect ke /book/rara-beauty
    │   ├── features/
    │   │   └── booking/
    │   │       ├── components/      ← 14 komponen booking
    │   │       ├── hooks/           ← useBookingStore, useAvailability, dll
    │   │       ├── lib/             ← API client calls ke owner app
    │   │       └── types/
    │   └── shared/
    └── public/images/
```

---

## 7. Component Breakdown

### 🏪 rara-booking (Customer App)

| Layer | Komponen | Fungsi |
|---|---|---|
| **Pages (Steps)** | `category/page.tsx` | Pilih kategori layanan |
| | `services/page.tsx` | Pilih layanan spesifik |
| | `stylist/page.tsx` | Pilih stylist |
| | `time/page.tsx` | Pilih tanggal & jam |
| | `addons/page.tsx` | Tambah produk add-on |
| | `contact/page.tsx` | Input nama & nomor HP |
| | `payment/page.tsx` | Pilih DP/Lunas + upload bukti |
| | `confirm/page.tsx` | Review & konfirmasi |
| | `ticket/page.tsx` | Digital ticket (QR code) |
| **Components** | `CategoryCard` | Card kategori dengan blob color |
| | `ServiceItem` | Item layanan dengan harga & durasi |
| | `StylistCards` | Card stylist dengan avatar |
| | `CalendarView` | Calendar picker dengan DateCell |
| | `TimeSlotPicker` | Grid slot waktu (Pagi/Siang/Sore) |
| | `BookingSummary` | Ringkasan booking + CountdownTimer |
| | `PaymentOptions` | Toggle DP vs Lunas |
| | `ProductUpsell` | Grid produk add-on |
| | `DigitalTicket` | Ticket dengan QR code |
| | `BottomCTA` | Fixed bottom navigation button |
| | `StepHeader` | Header dengan progress indicator |
| | `StepIndicator` | Dots/bar progress |
| | `TicketDivider` | Dashed divider untuk ticket |
| **State** | `useBookingStore` | Zustand store — semua booking state |
| **Lib** | `api.ts` | HTTP client untuk public API |

### 🖥️ salon-booking-customer (Owner Dashboard)

| Layer | Komponen | Fungsi |
|---|---|---|
| **Pages** | `overview/page.tsx` | Dashboard utama (visitor list + stats) |
| | `bookings/page.tsx` | List semua booking |
| | `schedule/page.tsx` | Jadwal per stylist |
| | `clients/page.tsx` | Database pelanggan |
| | `settings/page.tsx` | Pengaturan salon |
| **Components** | `DashboardSidebar` | Navigasi kiri |
| | `DashboardTopbar` | Header + tanggal |
| | `DashboardBreadcrumb` | Breadcrumb halaman |
| | `StatCard` | Kartu statistik (Revenue, Booking, dll) |
| | `TodayPanel` | Panel info hari ini |
| | `BookingStatusBadge` | Badge status warna-warni |
| **Hooks** | `useDashboardData` | Data hari ini (→ akan diganti API call) |
| **API Routes** | Route Handlers | Backend API layer |
| **Lib** | `prisma.ts` | Database client |
| | `auth.ts` | NextAuth setup |
| | `supabase.ts` | Realtime + Storage |

---

## 8. Trade-off Analysis

### Option A: Supabase (Recommended ✅)
| Dimensi | Assessment |
|---|---|
| Complexity | Low — satu platform, semua sudah ada |
| Cost | Free tier 500MB DB, 1GB storage sudah cukup awal |
| Scalability | Medium — cukup untuk ratusan booking/hari |
| Team familiarity | Medium — perlu belajar Supabase SDK |
| Realtime | Built-in, tidak perlu setup tambahan |
| Auth | Built-in, bisa pakai Row Level Security |

**Pros:** Setup cepat, satu dashboard, free tier murah  
**Cons:** Vendor lock-in, tidak bisa custom logic kompleks

### Option B: Self-hosted PostgreSQL + Pusher
| Dimensi | Assessment |
|---|---|
| Complexity | High — perlu manage server sendiri |
| Cost | Lebih mahal (hosting VPS) |
| Scalability | High — fully custom |
| Team familiarity | High — standard PostgreSQL |
| Realtime | Pusher free tier: 200 connections |

**Pros:** Full control, tidak ada vendor lock-in  
**Cons:** Butuh lebih banyak waktu setup & maintenance

---

## 9. Migration Plan (Dari Mock ke Real)

```
Phase 1 — Database & API (2-3 minggu)
  [ ] Setup Supabase project
  [ ] Define Prisma schema + migrasi
  [ ] Buat API Route Handlers di owner app
  [ ] Ganti useDashboardData (hardcoded) → fetch dari API

Phase 2 — Customer App Integration (1-2 minggu)
  [ ] Ganti mock data di rara-booking → fetch dari API
  [ ] POST /api/bookings saat customer konfirmasi
  [ ] Upload bukti transfer ke Supabase Storage

Phase 3 — Realtime & Auth (1 minggu)
  [ ] Setup NextAuth untuk owner login
  [ ] Supabase Realtime → owner dapat notif booking baru
  [ ] Badge count update real-time

Phase 4 — Notifikasi (opsional)
  [ ] Integrasi Fonnte untuk kirim WA ke customer
  [ ] Konfirmasi booking → kirim WA otomatis
```

---

## 10. Consequences

**Jadi lebih mudah:**
- Customer booking → muncul langsung di owner dashboard
- Data tidak hilang saat refresh
- Owner bisa login dengan aman
- Bisa scale ke banyak salon (multi-tenant via `salon_id`)

**Jadi lebih sulit:**
- Perlu manage environment variables (DB URL, API keys)
- Perlu deploy backend (tidak bisa static hosting saja)
- Perlu handle error states dan loading di UI

**Perlu direvisi nanti:**
- `useDashboardData` hook — refactor ke SWR/React Query + API calls
- Semua mock data di `booking/lib/mock-data.ts` → ganti ke API
- Zustand store — tambah persist ke API saat booking selesai

---

## Action Items

1. [ ] Setup Supabase project (database + storage + realtime)
2. [ ] Install Prisma: `npm install prisma @prisma/client`
3. [ ] Buat `prisma/schema.prisma` sesuai schema di atas
4. [ ] Install NextAuth: `npm install next-auth@beta`
5. [ ] Buat API Route Handlers (mulai dari `GET /api/salons/[slug]`)
6. [ ] Update `rara-booking` untuk fetch data dari API (bukan mock)
7. [ ] Update `useDashboardData` untuk fetch dari `GET /api/dashboard/today`
8. [ ] Setup Supabase Realtime channel `bookings:salon_id=...`
9. [ ] Tambah halaman `/login` di owner dashboard
10. [ ] Deploy ke Vercel (kedua app sebagai separate projects)
