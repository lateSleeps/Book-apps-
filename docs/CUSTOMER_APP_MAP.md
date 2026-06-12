# CUSTOMER APP MAP

> Source of truth for Preview Module design. Last updated: 2026-06-12.

---

## 1. Route Hierarchy

```
apps/customer/src/app/
├── page.tsx                          → Root (redirect or landing — minimal)
├── layout.tsx                        → Global layout, metadata: "Book your salon appointment at Rara Beauty"
├── providers.tsx                     → tRPC + QueryClient providers
├── check-booking/
│   └── page.tsx                      → Cek status booking by phone number
└── book/
    └── [slug]/
        ├── layout.tsx                → Booking shell layout (ReactNode children)
        ├── loading.tsx               → Skeleton (4 placeholder cards)
        ├── error.tsx                 → Error boundary with message prop
        └── page.tsx                  → Main booking controller (step state machine)
            └── _steps/
                ├── StepServices.tsx       → Step 1: Pilih layanan
                ├── StepServiceDetail.tsx  → Step 1b: Pertanyaan layanan (opsional)
                ├── StepStylist.tsx        → Step 2: Pilih stylist + slot waktu
                ├── StepConfirm.tsx        → Step 3: Ringkasan booking
                ├── StepContact.tsx        → Step 4: Data kontak + addon produk
                ├── StepPayment.tsx        → Step 5: Pilih metode + upload bukti
                └── StepTicket.tsx         → Step 6: Tiket konfirmasi (success)
```

---

## 2. Booking Flow (Step State Machine)

```
page.tsx
  └── useState<Step>("services")

"services"
  → StepServices(slug, onNext)
      if service.requires_specialist → "service-detail"
      else                           → "stylist"

"service-detail"
  → StepServiceDetail(onNext, onBack)
      onNext → "stylist"
      onBack → "services"

"stylist"
  → StepStylist(slug, onNext, onBack)
      onNext → "confirm"
      onBack → "services"

"confirm"
  → StepConfirm(onNext, onBack)
      onNext → "contact"
      onBack → "stylist"

"contact"
  → StepContact(onNext)
      onNext → "payment"

"payment"
  → StepPayment(slug, onNext, onBack)
      onNext → "ticket"
      onBack → "contact"

"ticket"
  → StepTicket(onDone)
      onDone → "services"   ← loop back (new booking)
```

---

## 3. Screen Hierarchy (7 Screens + 2 Auxiliary)

| #   | Screen                | File                           | Purpose                                    |
| --- | --------------------- | ------------------------------ | ------------------------------------------ |
| 1   | **StepServices**      | `_steps/StepServices.tsx`      | Browse kategori & pilih layanan            |
| 1b  | **StepServiceDetail** | `_steps/StepServiceDetail.tsx` | Form pertanyaan per layanan (chips + foto) |
| 2   | **StepStylist**       | `_steps/StepStylist.tsx`       | Pilih stylist + tanggal + slot waktu       |
| 3   | **StepConfirm**       | `_steps/StepConfirm.tsx`       | Ringkasan booking + total harga            |
| 4   | **StepContact**       | `_steps/StepContact.tsx`       | Input nama, nomor HP + addon produk        |
| 5   | **StepPayment**       | `_steps/StepPayment.tsx`       | Pilih DEPOSIT/FULL + upload bukti transfer |
| 6   | **StepTicket**        | `_steps/StepTicket.tsx`        | Tiket sukses + confirmation code           |
| A   | **Check Booking**     | `check-booking/page.tsx`       | Cek status booking by nomor HP             |
| B   | **Error**             | `book/[slug]/error.tsx`        | Error boundary page                        |

---

## 4. Components Inventory

### Booking Feature Components (`features/booking/components/`)

| Component                   | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| `StepHeader`                | Header tiap step (judul + progress)        |
| `BottomCTA`                 | Sticky CTA button bawah layar              |
| `BookingSummary`            | Ringkasan layanan, stylist, waktu, harga   |
| `StylistCards`              | Grid card stylist + slot waktu             |
| `PaymentOptions`            | Selector DEPOSIT vs FULL + timer countdown |
| `PaymentTypeSelector`       | Toggle DEPOSIT / LUNAS                     |
| `SelectedServicesIndicator` | Floating indicator layanan terpilih        |
| `LoadingState`              | Spinner/skeleton loading                   |
| `ErrorAlert`                | Inline error message                       |
| `Toast`                     | Toast notification                         |

### Shared UI (`shared/components/ui/`)

- `BottomCTA` (duplicate path: `components/ui/BottomCTA`)

---

## 5. Data Dependencies

### tRPC Routers (via `packages/trpc` atau `src/server/trpc/routers/`)

| Router          | Procedure    | Supabase Query                                                      | Used By                                |
| --------------- | ------------ | ------------------------------------------------------------------- | -------------------------------------- |
| `salons`        | `getBySlug`  | `SELECT * FROM salons WHERE slug = ?`                               | StepServices, StepStylist, StepPayment |
| `services`      | `getBySalon` | `SELECT *, category:categories(*) FROM services WHERE salon_id = ?` | StepServices                           |
| `stylists`      | `getBySalon` | `SELECT * FROM stylists WHERE salon_id = ?`                         | StepStylist                            |
| `businessHours` | `getBySalon` | `SELECT * FROM business_hours WHERE salon_id = ?`                   | StepStylist (date picker)              |
| `bookings`      | `create`     | `INSERT INTO bookings (...)`                                        | StepPayment                            |
| `bookings`      | `getByCode`  | `SELECT ... FROM bookings WHERE confirmation_code = ?`              | check-booking                          |

### Supabase Storage

| Bucket           | Used By     | Purpose                    |
| ---------------- | ----------- | -------------------------- |
| `payment-proofs` | StepPayment | Upload bukti transfer/QRIS |

### State Management: `useBookingStore` (Zustand + persist)

```ts
{
  step: number
  date: string | null
  category: Category | null
  services: Service[]
  stylist: Stylist | null
  timeSlot: TimeSlot | null
  addons: SelectedAddon[]
  paymentType: "DEPOSIT" | "FULL" | null
  proofImageUrl: string | null
  proofImageFile: File | null
  bookingStatus: "DRAFT" | ...
  bookingCode: string | null
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  formAnswers: FormAnswers
  totalPrice: number          // computed
  depositAmount: number       // computed (hardcoded: 20_000)
  totalDuration: number       // computed
  discountAmount: number
}
```

---

## 6. Owner Settings CONSUMED by Customer App

| Setting                       | Supabase Field                       | Where Consumed                                | Notes                                          |
| ----------------------------- | ------------------------------------ | --------------------------------------------- | ---------------------------------------------- |
| Nama salon                    | `salons.name`                        | StepServices header, StepStylist              | ✅ Live                                        |
| Slug                          | `salons.slug`                        | Route `/book/[slug]`                          | ✅ Live                                        |
| Deskripsi salon               | `salons.description`                 | —                                             | Read via `SELECT *` tapi belum ditampilkan     |
| Telepon                       | `salons.phone`                       | —                                             | Read tapi belum ditampilkan                    |
| Layanan (services)            | `services` table                     | StepServices list                             | ✅ Live                                        |
| Kategori layanan              | `categories` table                   | StepServices grouping                         | ✅ Live                                        |
| `service.requires_specialist` | `services.requires_specialist`       | Routing: services → service-detail vs stylist | ✅ Live                                        |
| `service.service_questions`   | `services.service_questions` (JSONB) | StepServiceDetail chips + photo               | ✅ Live                                        |
| `service.price_type`          | `services.price_type`                | StepServices price display ("mulai dari")     | ✅ Live                                        |
| Daftar stylist                | `stylists` table                     | StepStylist cards                             | ✅ Live                                        |
| Nama stylist / role           | `stylists` + `users.full_name`       | StepStylist card display                      | ✅ Live                                        |
| Jam operasional               | `business_hours` table               | StepStylist (date picker, hari buka)          | ✅ Live (via hook, tapi slot waktu masih MOCK) |

---

## 7. Owner Settings NOT CONSUMED (Gap)

| Setting Domain           | Field                                                             | Status                                                     |
| ------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| **Brand / Profil**       | `tagline`, `logo_url`, `cover_image_url`                          | ❌ Kolom BELUM ada di DB (`salons` table)                  |
| **Brand / Profil**       | `whatsapp`, `email`, `website`, `instagram`, `tiktok`, `facebook` | ❌ Kolom BELUM ada di DB                                   |
| **Brand / Profil**       | `address`, `city`, `maps_url`                                     | ❌ Kolom BELUM ada di DB                                   |
| **Booking App Settings** | Metode konfirmasi (auto vs manual)                                | ❌ Tidak ada di customer app                               |
| **Booking App Settings** | Require deposit toggle                                            | ❌ Hardcoded DEPOSIT_AMOUNT = 20.000                       |
| **Booking App Settings** | Deposit amount                                                    | ❌ Hardcoded: Rp 20.000 (tidak dari DB)                    |
| **Booking App Settings** | Payment methods yang diaktifkan (Transfer/QRIS/Cash)              | ❌ PaymentTypeSelector show semua — tidak filter per salon |
| **Booking App Settings** | Pesan selamat datang / banner                                     | ❌ Tidak ada                                               |
| **Booking App Settings** | Warna tema / branding color                                       | ❌ Tidak ada                                               |
| **Operasional**          | Kapasitas per slot / max booking per hari                         | ❌ Tidak ada                                               |
| **Layanan**              | `addon` products                                                  | ⚠️ StepContact menggunakan `useMockData()` — BELUM dari DB |

---

## 8. Hardcoded Data (Not from DB)

| Location                                          | Hardcoded Value                                                                     | Should Come From                           |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------ |
| `StepStylist.tsx:13`                              | `MOCK_SLOTS` — 7 slot waktu tetap (09:00–16:00)                                     | `schedules` table / availability engine    |
| `StepContact.tsx:42`                              | `useMockData().products` — addon produk                                             | `products` table                           |
| `features/booking/constants/booking.constants.ts` | `DEPOSIT_AMOUNT = 20_000`                                                           | `salons.settings.deposit_amount`           |
| `app/layout.tsx:14`                               | `description: 'Book your salon appointment at Rara Beauty'`                         | `salons.description` atau `salons.tagline` |
| `check-booking/page.tsx:142`                      | Teks: "Booking kamu sedang ditinjau salon. Akan dikonfirmasi dalam maksimal 1 hari" | Statis — OK untuk sekarang                 |
| `StepStylist`                                     | `AVATAR_COLORS` array (10 hex)                                                      | Design token (acceptable)                  |

---

## 9. Customer App Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    apps/customer                             │
│                                                             │
│  ROUTES                                                     │
│  ──────                                                     │
│  /                    → landing (minimal)                   │
│  /check-booking       → cek status by HP                   │
│  /book/[slug]         → booking flow (7 steps)              │
│                                                             │
│  STEP STATE MACHINE (page.tsx)                              │
│  ─────────────────────────────                              │
│  services → [service-detail] → stylist → confirm           │
│         → contact → payment → ticket → (reset)             │
│                                                             │
│  STATE: useBookingStore (Zustand + localStorage persist)    │
│                                                             │
│  DATA LAYER                                                 │
│  ──────────                                                 │
│  tRPC (HTTP)  ──→  packages/trpc/routers/                   │
│                      salons.getBySlug                       │
│                      services.getBySalon                    │
│                      stylists.getBySalon                    │
│                      businessHours.getBySalon               │
│                      bookings.create                        │
│                      bookings.getByCode                     │
│                         │                                   │
│                         ▼                                   │
│                    Supabase DB                              │
│                    ─────────                                │
│                    salons (SELECT *)                        │
│                    services + categories                    │
│                    stylists + users                         │
│                    business_hours                           │
│                    bookings (INSERT + SELECT)               │
│                                                             │
│  Supabase Storage: payment-proofs bucket (upload)          │
│                                                             │
│  HARDCODED (not yet from DB)                                │
│  ───────────────────────────                                │
│  • Time slots (MOCK_SLOTS)                                  │
│  • Addon products (useMockData)                             │
│  • Deposit amount (Rp 20.000)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Preview Module — What Must It Render for 1:1 Mirror?

The Preview module (in owner Settings → Booking App domain) must render the **exact same 7 screens** as the real customer app, using owner's own salon data. Here's the minimum required data contract per screen:

### StepServices (Screen 1)

**Data needed:**

- `salon.name` — header
- `services[]` — list layanan (name, price, price_type, duration, category)
- `categories[]` — grouping
- `service.service_questions` — decides if service-detail step appears

**Gap for preview:** salon branding (logo, cover, tagline) NOT yet consumed by real app

### StepServiceDetail (Screen 1b)

**Data needed:**

- `service.service_questions[]` — chip options + photo upload questions

### StepStylist (Screen 2)

**Data needed:**

- `stylists[]` — name, role, specialty, avatar
- Time slots — **CURRENTLY MOCK** → preview can keep MOCK_SLOTS as placeholder
- `business_hours[]` — untuk render hari tersedia

### StepConfirm (Screen 3)

**Data needed:**

- From `useBookingStore`: services, stylist, date, timeSlot, totalPrice, discountAmount

### StepContact (Screen 4)

**Data needed:**

- Input form (name, phone) — no salon data needed
- Addon products — **CURRENTLY MOCK** → preview shows hardcoded products

### StepPayment (Screen 5)

**Data needed:**

- `salon` — for payment instructions (bank account, QRIS)
- `paymentType` (DEPOSIT/FULL)
- `DEPOSIT_AMOUNT = 20_000` (hardcoded)

### StepTicket (Screen 6)

**Data needed:**

- `bookingCode` from store (returned by `bookings.create`)
- Preview: can show dummy code `PREVIEW-XXX`

---

## 11. Answer: What Should Preview Render?

> **Preview must render all 7 booking steps using the owner's own salon data, with these 3 stubs as acceptable placeholders until real features ship:**

| Data                                       | Status                  | Preview Approach              |
| ------------------------------------------ | ----------------------- | ----------------------------- |
| Salon name, services, categories, stylists | ✅ Real (from Supabase) | Fetch live, same as customer  |
| Time slots                                 | ❌ MOCK_SLOTS           | Keep MOCK_SLOTS (09:00–16:00) |
| Addon products                             | ❌ useMockData          | Show first 4 mock products    |
| Deposit amount                             | ❌ Hardcoded Rp 20.000  | Show Rp 20.000                |
| Booking code / confirmation                | N/A in preview          | Show "PREVIEW-0000"           |
| Payment proof upload                       | N/A in preview          | Disable / greyed out          |

**The real gap**: salon branding (logo, cover, tagline, colors, social links, address) exists in the owner's settings but is **not yet rendered anywhere in the customer app** — so preview also cannot show it. This is the primary missing bridge between Settings V2 Brand domain and the customer experience.
