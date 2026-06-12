# Settings Persistence — Implementation Plan

**Tanggal:** 2026-06-12
**Prerequisite:** Baca `SETTINGS_DATABASE_AUDIT.md` sebelum dokumen ini.
**Scope:** Arsitektur layer lengkap untuk menghubungkan setiap domain Settings V2 ke Supabase. TIDAK ADA kode yang dibuat di dokumen ini. Ini adalah cetak biru implementasi.

---

## Prinsip Arsitektur

```
UI (page/form/client components)
  ↓ panggil hook
Controller Hook (useXxxController)
  ↓ panggil service
Service (business logic, validasi)
  ↓ panggil repository
Repository (Supabase queries)
  ↓ query
Database (Supabase)
```

**Aturan yang tidak boleh dilanggar:**

- Tidak ada import Supabase client di dalam `components/` atau `app/`
- Tidak ada query SQL / `.from()` di dalam hooks atau komponen
- Tidak ada `fetch` atau API call langsung dari JSX
- Setiap layer hanya boleh memanggil layer di bawahnya — tidak boleh skip
- tRPC router hanya berisi thin wrapper — tidak ada business logic

---

## Struktur File Target (Phase 2)

```
apps/owner/src/features/dashboard/
├── types/
│   └── dashboard.types.ts               (sudah ada)
│
└── settings/
    ├── types/                           (sudah ada — brand.types, booking-app.types, dll.)
    │
    ├── repositories/                    (BARU — Phase 2)
    │   ├── brand.repository.ts
    │   ├── services.repository.ts
    │   ├── produk-paket.repository.ts
    │   ├── team.repository.ts
    │   ├── pengguna.repository.ts
    │   ├── operational.repository.ts
    │   └── booking-app.repository.ts
    │
    ├── services/                        (BARU — Phase 2)
    │   ├── brand.service.ts
    │   ├── services.service.ts
    │   ├── produk-paket.service.ts
    │   ├── team.service.ts
    │   ├── pengguna.service.ts
    │   ├── operational.service.ts
    │   └── booking-app.service.ts
    │
    ├── server/                          (BARU — Phase 2)
    │   └── trpc/
    │       ├── brand.router.ts
    │       ├── services.router.ts
    │       ├── produk-paket.router.ts
    │       ├── team.router.ts
    │       ├── pengguna.router.ts
    │       ├── operational.router.ts
    │       └── booking-app.router.ts
    │
    └── hooks/settings/                  (sudah ada — akan di-refactor)
        ├── useBrandProfileController.ts  (Phase 2: replace mock → tRPC calls)
        ├── useServicesController.ts
        ├── useProdukPaketController.ts
        ├── useTeamController.ts
        ├── usePenggunaController.ts
        ├── useOperasionalController.ts
        └── useBookingAppController.ts
```

---

## Migrasi Database

**Format:** Raw SQL (konsisten dengan cara project ini sudah membuat migrasi).
**Lokasi file migrasi:** `packages/database/src/migrations/`
**Konvensi nama:** `NNNN_description.sql` (berurutan)

### Urutan Migrasi

```
0001_alter_salons_brand_booking.sql
0002_alter_categories_services.sql
0003_create_special_closing_dates.sql
0004_create_booking_policies.sql
0005_create_bank_accounts.sql
0006_create_add_on_products.sql
0007_create_service_bundles.sql
0008_create_staff_members.sql
0009_create_staff_relations.sql
0010_create_profiles.sql
0011_create_invitations.sql
```

---

## Detail Per Domain

---

### Domain 1 — Brand & Profil

#### Migration: `0001_alter_salons_brand_booking.sql` (dibagi dengan Booking App)

```sql
ALTER TABLE salons
  ADD COLUMN IF NOT EXISTS tagline          TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description      TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS logo_url         TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url  TEXT,
  ADD COLUMN IF NOT EXISTS phone            TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp         TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS email            TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS website          TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram        TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tiktok           TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook         TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address          TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city             TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS maps_url         TEXT NOT NULL DEFAULT '',
  -- Kolom Booking App (satu migrasi, satu ALTER TABLE)
  ADD COLUMN IF NOT EXISTS payment_methods  TEXT[] NOT NULL DEFAULT ARRAY['qris','transfer'],
  ADD COLUMN IF NOT EXISTS qris_image_url   TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_mode TEXT NOT NULL DEFAULT 'auto'
    CHECK (confirmation_mode IN ('auto', 'manual')),
  ADD COLUMN IF NOT EXISTS salon_policy     TEXT;
```

**Catatan:** `name` di `salons` diasumsikan sudah ada. Jika nama kolom berbeda (mis. `salon_name`), sesuaikan di repository layer — jangan alias di tipe.

#### Repository: `brand.repository.ts`

```typescript
// Fungsi yang perlu ada:
async function getBrandProfile(salonId: string): Promise<BrandProfile>;
async function upsertBrandProfile(
  salonId: string,
  data: BrandProfile,
): Promise<void>;
// File uploads ditangani oleh Supabase Storage, bukan repository ini
// Repository hanya menyimpan URL setelah upload selesai
async function updateLogoUrl(
  salonId: string,
  url: string | null,
): Promise<void>;
async function updateCoverUrl(
  salonId: string,
  url: string | null,
): Promise<void>;
```

#### Service: `brand.service.ts`

```typescript
// Validasi yang perlu ada:
// - salonName tidak boleh kosong
// - email harus format email valid (atau kosong)
// - phone/whatsapp hanya angka + +
// - website harus awali https:// (atau kosong)
// - maps_url harus awali https://maps.google.com atau https://goo.gl (atau kosong)
```

#### tRPC Router: `brand.router.ts`

```typescript
// Procedures:
// getBrandProfile   — query, input: void (salonId dari session)
// upsertBrandProfile — mutation, input: BrandProfile
// uploadLogo        — mutation, input: { fileName, contentType }
//                     → return presigned upload URL (Supabase Storage)
// uploadCover       — mutation, input: { fileName, contentType }
// removeLogo        — mutation, input: void
// removeCover       — mutation, input: void
```

#### Hook Migration (Phase 2 `useBrandProfileController.ts`)

Phase 1: `useState` + mock. Phase 2: ganti dengan `trpc.settings.getBrandProfile.useQuery()` dan `trpc.settings.upsertBrandProfile.useMutation()`. Interface `BrandProfileController` tidak berubah — UI tidak perlu tahu apakah data dari mock atau real DB.

---

### Domain 2 — Layanan

#### Migration: `0002_alter_categories_services.sql`

```sql
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS color      TEXT NOT NULL DEFAULT 'bg-c-peach',
  ADD COLUMN IF NOT EXISTS blob_color TEXT NOT NULL DEFAULT '#f5c4ab',
  ADD COLUMN IF NOT EXISTS icon_name  TEXT NOT NULL DEFAULT 'Scissors',
  ADD COLUMN IF NOT EXISTS is_active  BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS service_flow TEXT NOT NULL DEFAULT 'TREATMENT'
    CHECK (service_flow IN ('STYLING_HAIR','STYLING_COLOUR','STYLING_NAIL','TREATMENT')),
  ADD COLUMN IF NOT EXISTS sort_order   INTEGER NOT NULL DEFAULT 0;

-- Backfill service_flow dari requires_specialist yang sudah ada
-- (Manual review dibutuhkan — otomasi tidak bisa menentukan STYLING_HAIR vs STYLING_COLOUR)
```

**Catatan `service_questions`:** Pertahankan sebagai jsonb di `services`. Tidak perlu tabel `service_questions` terpisah di Phase 2. Alasan: customer app membaca service + questions sekaligus, jsonb menghindari join. Jika ke depan dibutuhkan query per-question, bisa dimigrasi ke tabel terpisah.

#### Repository: `services.repository.ts`

```typescript
async function getCategories(salonId: string): Promise<ServiceCategory[]>;
async function createCategory(
  salonId: string,
  data: Omit<ServiceCategory, "id">,
): Promise<ServiceCategory>;
async function updateCategory(
  id: string,
  data: Partial<ServiceCategory>,
): Promise<void>;
async function deleteCategory(id: string): Promise<void>;
async function reorderCategories(
  updates: Array<{ id: string; sortOrder: number }>,
): Promise<void>;

async function getServices(salonId: string): Promise<ServiceItem[]>;
async function createService(
  salonId: string,
  data: Omit<ServiceItem, "id">,
): Promise<ServiceItem>;
async function updateService(
  id: string,
  data: Partial<ServiceItem>,
): Promise<void>;
async function deleteService(id: string): Promise<void>;
async function reorderServices(
  updates: Array<{ id: string; sortOrder: number }>,
): Promise<void>;
```

#### Service: `services.service.ts`

```typescript
// Validasi:
// - category name unik per salon (check sebelum INSERT/UPDATE)
// - slug auto-generate dari name (slugify) jika tidak disediakan
// - price >= 0
// - duration > 0
// - service_questions[].options wajib ada jika type === 'chips'
// - delete category: reject jika masih ada active services di dalamnya
```

#### tRPC Router: `services.router.ts`

```typescript
// Queries: getServicesDomain (return { categories, services })
// Mutations: createCategory, updateCategory, deleteCategory, reorderCategories,
//            createService, updateService, deleteService, reorderServices
```

---

### Domain 3 — Produk & Paket

#### Migration: `0006_create_add_on_products.sql` + `0007_create_service_bundles.sql`

(Lihat skema lengkap di SETTINGS_DATABASE_AUDIT.md — tidak diulang di sini)

#### Repository: `produk-paket.repository.ts`

```typescript
async function getAddOns(salonId: string): Promise<AddOnProduct[]>;
async function createAddOn(
  salonId: string,
  data: Omit<AddOnProduct, "id">,
): Promise<AddOnProduct>;
async function updateAddOn(
  id: string,
  data: Partial<AddOnProduct>,
): Promise<void>;
async function deleteAddOn(id: string): Promise<void>;

async function getBundles(salonId: string): Promise<ServiceBundle[]>;
async function createBundle(
  salonId: string,
  data: Omit<ServiceBundle, "id">,
): Promise<ServiceBundle>;
async function updateBundle(
  id: string,
  data: Partial<ServiceBundle>,
): Promise<void>;
// updateBundle harus menangani serviceIds dengan DELETE+INSERT pada service_bundle_items
async function deleteBundle(id: string): Promise<void>;
// deleteBundle: CASCADE ke service_bundle_items otomatis via DB constraint
```

#### Service: `produk-paket.service.ts`

```typescript
// Validasi:
// - bundlePrice > 0
// - serviceIds tidak boleh kosong (bundle tanpa servis tidak valid)
// - serviceIds harus valid (semua ID harus ada di services milik salon yang sama)
// - addOn.price >= 0
```

---

### Domain 4 — Tim

#### Migration: `0008_create_staff_members.sql` + `0009_create_staff_relations.sql`

(Lihat skema lengkap di SETTINGS_DATABASE_AUDIT.md)

#### Repository: `team.repository.ts`

```typescript
async function getStaff(salonId: string): Promise<StaffMember[]>;
async function createStaff(
  salonId: string,
  data: Omit<StaffMember, "id">,
): Promise<StaffMember>;
async function updateStaff(
  id: string,
  data: Partial<StaffMember>,
): Promise<void>;
async function deactivateStaff(id: string): Promise<void>;

async function getAssignments(salonId: string): Promise<ServiceAssignment[]>;
async function setAssignments(
  staffId: string,
  serviceIds: string[],
): Promise<void>;
// setAssignments: DELETE WHERE staff_id = staffId, lalu INSERT batch

async function getSchedule(staffId: string): Promise<WeeklySchedule>;
async function upsertSchedule(
  staffId: string,
  days: DaySchedule[],
): Promise<void>;
// upsertSchedule: INSERT ... ON CONFLICT (staff_id, day) DO UPDATE

async function getLeaves(
  staffId: string,
  fromDate: string,
  toDate: string,
): Promise<StaffLeave[]>;
async function addLeave(
  staffId: string,
  data: Omit<StaffLeave, "id" | "staffId">,
): Promise<StaffLeave>;
async function removeLeave(id: string): Promise<void>;
```

#### Service: `team.service.ts`

```typescript
// Validasi:
// - staff phone format valid
// - specialty wajib jika role membutuhkan specialist routing
//   (STYLIST → HAIR_STYLIST, COLORIST → COLORIST, NAIL_ARTIST → NAIL_ARTIST, THERAPIST → THERAPIST)
// - schedule: endTime harus setelah startTime
// - leave: date tidak boleh di masa lalu (untuk add baru)
// - setAssignments: semua serviceIds harus milik salon yang sama
```

#### tRPC Router: `team.router.ts`

```typescript
// Queries: getTeamDomain (return { staff, assignments, schedules, leaves })
// Mutations: createStaff, updateStaff, deactivateStaff,
//            setAssignments, upsertSchedule, addLeave, removeLeave
```

**Dependency penting:** `team.router.ts` dan `services.router.ts` harus diinisialisasi sebelum tRPC context bisa mengambil `staff_service_assignments`. Jangan buat circular import antara `team.service` dan `services.service`.

---

### Domain 5 — Pengguna & Akses

Domain ini membutuhkan integrasi Supabase Auth — berbeda dari domain lain yang hanya butuh database queries.

#### Migration: `0010_create_profiles.sql` + `0011_create_invitations.sql`

```sql
-- profiles: extend Supabase Auth users
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id        UUID NOT NULL REFERENCES salons(id),
  name            TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'STAFF'
    CHECK (role IN ('OWNER','ADMIN','MANAGER','STAFF')),
  status          TEXT NOT NULL DEFAULT 'INVITED'
    CHECK (status IN ('ACTIVE','INVITED','INACTIVE','REVOKED')),
  staff_id        UUID REFERENCES staff_members(id),
  avatar_url      TEXT,
  phone           TEXT,
  invited_at      TIMESTAMPTZ,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security wajib di tabel ini
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: user bisa baca profil sesama dalam satu salon
CREATE POLICY "salon_members_can_read_profiles"
  ON profiles FOR SELECT
  USING (salon_id = (SELECT salon_id FROM profiles WHERE id = auth.uid()));

-- Policy: hanya OWNER yang bisa update role user lain
-- (diimplementasikan di server-side check, bukan RLS — lebih fleksibel)
```

#### Repository: `pengguna.repository.ts`

```typescript
async function getUsers(salonId: string): Promise<User[]>;
// JOIN profiles + auth.users untuk lastLoginAt

async function updateUserRole(userId: string, role: AccessRole): Promise<void>;
async function updateUserStatus(
  userId: string,
  status: UserAccountStatus,
): Promise<void>;

async function getPendingInvites(salonId: string): Promise<Invitation[]>;
async function createInvitation(
  salonId: string,
  data: { email; role; invitedBy },
): Promise<Invitation>;
async function deleteInvitation(id: string): Promise<void>;
```

#### Service: `pengguna.service.ts`

```typescript
// Validasi dan business rules:
// - OWNER tidak bisa diubah rolenya atau dinonaktifkan
// - Hanya ada satu OWNER per salon
// - inviteUser: cek email belum terdaftar di salon yang sama
// - updateRole: caller harus OWNER (checked di tRPC middleware)
// - revokeUser: caller tidak bisa merevoke dirinya sendiri

// Supabase Auth integration:
// - inviteUser → supabase.auth.admin.inviteUserByEmail()
// - revokeUser → supabase.auth.admin.signOut(userId, 'global') (opsional)
```

**Catatan:** Supabase Auth Admin API butuh `service_role_key`, bukan `anon_key`. Panggil ini hanya dari server-side tRPC (never from client). Di tRPC context, gunakan `supabaseAdmin` client yang terpisah dari `supabase` client regular.

#### tRPC Router: `pengguna.router.ts`

```typescript
// Semua procedure ini butuh protectedProcedure (user harus login)
// inviteUser, updateRole, deactivateUser, reactivateUser, revokeUser
// butuh tambahan middleware: requireRole('OWNER')

// Queries: getUsers, getPendingInvites
// Mutations: inviteUser, updateRole, deactivateUser, reactivateUser, revokeUser,
//            cancelInvite, resendInvite
```

---

### Domain 6 — Operasional

Domain ini yang paling siap untuk Phase 2 — `business_hours` sudah ada.

#### Migration: `0003_create_special_closing_dates.sql` + `0004_create_booking_policies.sql`

(Lihat skema lengkap di SETTINGS_DATABASE_AUDIT.md)

#### Repository: `operational.repository.ts`

```typescript
async function getBusinessHours(salonId: string): Promise<BusinessHoursDay[]>;
async function upsertBusinessHours(
  salonId: string,
  hours: BusinessHoursDay[],
): Promise<void>;
// upsertBusinessHours: INSERT 7 rows ON CONFLICT (salon_id, day_of_week) DO UPDATE

async function getSpecialClosingDates(
  salonId: string,
): Promise<SpecialClosingDate[]>;
async function addSpecialClosingDate(
  salonId: string,
  data: Omit<SpecialClosingDate, "id">,
): Promise<SpecialClosingDate>;
async function removeSpecialClosingDate(id: string): Promise<void>;

async function getBookingPolicy(salonId: string): Promise<BookingPolicy>;
async function upsertBookingPolicy(
  salonId: string,
  data: BookingPolicy,
): Promise<void>;
// upsertBookingPolicy: INSERT ON CONFLICT (salon_id) DO UPDATE
```

#### Service: `operational.service.ts`

```typescript
// Validasi:
// - closeTime harus setelah openTime jika isClosed = false
// - setSpecialClosingDate: date tidak boleh duplikat per salon (DB unique constraint juga ada)
// - bookingPolicy: slotIntervalMinutes harus salah satu dari [15, 30, 45, 60]
// - leadTimeHours: 0–24
// - advanceBookingDays: 1–90
// - cancellationWindowHours: 0–48
```

**Domain ini yang direkomendasikan untuk dijadikan pilot Phase 2** — tabel `business_hours` sudah ada, tipe sudah memiliki komentar DB mapping yang lengkap, dan tidak ada dependency ke domain lain.

---

### Domain 7 — Booking App

#### Migration: Kolom `salons` masuk `0001_alter_salons_brand_booking.sql` (sudah dibahas di Domain 1)

#### Migration: `0005_create_bank_accounts.sql`

(Lihat skema lengkap di SETTINGS_DATABASE_AUDIT.md)

#### Repository: `booking-app.repository.ts`

```typescript
async function getBookingAppSettings(
  salonId: string,
): Promise<BookingAppSettings>;
// Ambil kolom payment_methods, qris_image_url, confirmation_mode, salon_policy dari salons
// + SELECT * FROM bank_accounts WHERE salon_id = salonId ORDER BY sort_order

async function setPaymentMethods(
  salonId: string,
  methods: PaymentMethod[],
): Promise<void>;
async function setQrisImageUrl(
  salonId: string,
  url: string | null,
): Promise<void>;
async function setConfirmationMode(
  salonId: string,
  mode: ConfirmationMode,
): Promise<void>;
async function setSalonPolicy(
  salonId: string,
  policy: string | null,
): Promise<void>;

async function addBankAccount(
  salonId: string,
  data: Omit<BankAccount, "id">,
): Promise<BankAccount>;
async function updateBankAccount(
  id: string,
  data: Partial<Omit<BankAccount, "id">>,
): Promise<void>;
async function removeBankAccount(id: string): Promise<void>;
```

#### Service: `booking-app.service.ts`

```typescript
// Validasi:
// - paymentMethods: minimal 1 method aktif (enforced di controller sudah, double-check di service)
// - qrisImageUrl: hanya bisa diset jika 'qris' ada di paymentMethods
// - bankAccounts: hanya bisa ada jika 'transfer' ada di paymentMethods
// - salonPolicy: max 500 karakter, null jika kosong
// - QRIS adalah financial asset: operasi upload/replace/remove harus di-log ke audit trail
```

#### Audit Trail untuk QRIS

`AuditLogEntry` di Phase 1 disimpan in-memory. Di Phase 2, buat tabel `audit_logs`:

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id    UUID NOT NULL REFERENCES salons(id),
  actor_id    UUID NOT NULL REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

QRIS mutations di `booking-app.service.ts` harus memanggil `audit_logs` INSERT setelah setiap operasi sukses.

---

## tRPC Root Router

Semua domain router digabung di satu root:

```typescript
// apps/owner/src/server/trpc/root.ts
export const appRouter = createTRPCRouter({
  settings: createTRPCRouter({
    brand: brandRouter,
    services: servicesRouter,
    produkPaket: produkPaketRouter,
    team: teamRouter,
    pengguna: penggunaRouter,
    operational: operationalRouter,
    bookingApp: bookingAppRouter,
  }),
  // ... router lain (booking management, dll.)
});
```

---

## Supabase Storage Buckets

Upload yang dibutuhkan:

| Bucket           | Akses                   | Konten                                      |
| ---------------- | ----------------------- | ------------------------------------------- |
| `salon-logos`    | Public read, auth write | `logos/{salonId}/{filename}`                |
| `salon-covers`   | Public read, auth write | `covers/{salonId}/{filename}`               |
| `qris-images`    | Public read, auth write | `qris/{salonId}/{filename}`                 |
| `staff-avatars`  | Public read, auth write | `avatars/{salonId}/{staffId}/{filename}`    |
| `product-images` | Public read, auth write | `products/{salonId}/{productId}/{filename}` |
| `bundle-covers`  | Public read, auth write | `bundles/{salonId}/{bundleId}/{filename}`   |

**Aturan upload:** Semua operasi file di controller harus melalui presigned URL dari tRPC (bukan direct upload dari browser dengan anon key). Server validasi file type dan ukuran sebelum membuat presigned URL.

---

## Row Level Security (RLS) Policy

Minimal RLS yang harus ada sebelum Phase 2 go-live:

| Tabel                                                         | Policy                                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `salons`                                                      | Owner hanya bisa baca/tulis salon miliknya sendiri                              |
| `categories`, `services`                                      | Read semua (customer app butuh ini tanpa auth); write hanya auth + salon member |
| `business_hours`, `special_closing_dates`, `booking_policies` | Read semua; write hanya auth + salon member                                     |
| `bank_accounts`, `booking_policies`                           | Read semua; write hanya auth + OWNER/ADMIN                                      |
| `staff_members`                                               | Read semua; write hanya auth + salon member                                     |
| `profiles`                                                    | Read hanya sesama salon; write hanya user itu sendiri atau OWNER                |
| `audit_logs`                                                  | Read hanya salon member; insert hanya server (service_role_key)                 |

---

## Urutan Implementasi yang Direkomendasikan

Setiap step di bawah adalah satu PR tersendiri:

### Step 1 — Setup infrastruktur (no feature yet)

- Inisialisasi Drizzle schema di `packages/database/src/schema/`
- Setup tRPC di apps/owner
- Setup `protectedProcedure` middleware (auth context)
- Setup Supabase Storage buckets

### Step 2 — Pilot: Operasional (business_hours)

- Tabel `business_hours` sudah ada — tidak perlu migrasi
- Implement `operational.repository.ts` → `operational.service.ts` → `operational.router.ts`
- Refactor `useOperasionalController` dari mock ke tRPC calls
- Verifikasi customer app masih berjalan dengan data dari DB

### Step 3 — Brand

- Migrasi `0001` (ALTER salons untuk Brand kolom)
- Implement `brand.repository.ts` → `brand.service.ts` → `brand.router.ts`
- Refactor `useBrandProfileController`

### Step 4 — Layanan

- Migrasi `0002` (ALTER categories + services)
- Implement `services.repository.ts` → `services.service.ts` → `services.router.ts`
- Refactor `useServicesController`

### Step 5 — Booking App

- Migrasi `0001` (sisa kolom salons) + `0005` (bank_accounts)
- Implement `booking-app.repository.ts` → `booking-app.service.ts` → `booking-app.router.ts`
- Refactor `useBookingAppController`

### Step 6 — Tim

- Migrasi `0008` + `0009`
- Implement `team.repository.ts` → `team.service.ts` → `team.router.ts`
- Refactor `useTeamController`

### Step 7 — Produk & Paket

- Migrasi `0006` + `0007`
- Implement `produk-paket.repository.ts` → `produk-paket.service.ts` → `produk-paket.router.ts`
- Refactor `useProdukPaketController`

### Step 8 — Pengguna & Akses (paling kompleks — Supabase Auth terlibat)

- Migrasi `0010` + `0011`
- Implement `pengguna.repository.ts` → `pengguna.service.ts` → `pengguna.router.ts`
- Ganti localStorage auth mock dengan Supabase Auth
- Refactor `usePenggunaController` + `AuthContext`

### Step 9 — Operasional sisa (special_closing_dates + booking_policies)

- Migrasi `0003` + `0004`
- Extend `operational.repository.ts` dan `operational.router.ts`
- Verifikasi customer app membaca `slot_interval_minutes` dari DB (hapus `SESSION_TIMES` hardcode)

---

## Catatan Risiko

| Risiko                                                                            | Mitigation                                                                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `business_hours` kolom mungkin berbeda dari yang diperkirakan                     | Verifikasi schema tabel actual di Supabase Dashboard sebelum menulis repository                              |
| `salons` mungkin punya kolom dengan nama berbeda (mis. `salon_name` bukan `name`) | Audit schema di Supabase Dashboard, jangan asumsikan dari seed.sql saja                                      |
| Customer app membaca banyak data ini — setiap migrasi bisa breaking               | Jalankan customer app smoke test setelah setiap step                                                         |
| Supabase Auth `inviteUserByEmail` membutuhkan konfigurasi email provider          | Setup SMTP/Resend sebelum Step 8                                                                             |
| `packages/database/src/schema/index.ts` adalah placeholder kosong                 | Jangan rely pada Drizzle type inference — definisikan types manual atau generate dari Supabase introspection |
