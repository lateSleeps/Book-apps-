# Settings Persistence Architecture Audit

**Tanggal:** 2026-06-12
**Scope:** 7 domain Settings V2 — Brand, Layanan, Produk & Paket, Tim, Pengguna & Akses, Operasional, Booking App
**Tujuan:** Memetakan setiap fitur dari mock in-memory ke tabel Supabase nyata. Read-only audit — tidak ada kode yang dibuat, tidak ada migrasi.

---

## Metodologi

Untuk setiap domain, audit mencakup:

1. **Current source of truth** — data sekarang disimpan di mana
2. **Mock ownership** — hook mana yang memegang state
3. **Required tables** — tabel apa yang dibutuhkan (ada atau tidak)
4. **Existing Supabase tables** — tabel yang sudah ada (diverifikasi dari SQL files)
5. **Missing tables** — tabel yang belum ada
6. **Missing relations** — foreign key yang belum ada
7. **Required mutations** — operasi tulis yang dibutuhkan
8. **Required queries** — operasi baca yang dibutuhkan
9. **Customer app dependencies** — fitur mana di apps/customer yang membaca data ini
10. **Owner app dependencies** — fitur mana di apps/owner yang membaca data ini

---

## Tabel yang Sudah Ada (Diverifikasi)

Dari `seed.sql`, `add-payment-columns.sql`, `add-price-type.sql`, `migrate-service-questions.sql`, `add_settlement_proof_url.sql`:

| Tabel            | Kolom yang Dikonfirmasi                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `salons`         | id (UUID) — implisit dari FK di semua tabel lain                                                                                                             |
| `categories`     | id, salon_id, name, slug, description, created_at, updated_at                                                                                                |
| `services`       | id, salon_id, category_id, name, description, price, duration, is_active, created_at, updated_at, price_type, requires_specialist, service_questions (jsonb) |
| `bookings`       | id (implisit), payment_method, amount_paid, change_amount, paid_at, settlement_proof_url, payment_proof_url (implisit)                                       |
| `business_hours` | salon_id, day_of_week (INTEGER 0-6), is_closed (BOOLEAN), open_time (TIME), close_time (TIME) — dikonfirmasi dari komentar di `operational.types.ts`         |

**Schema Drizzle:** `packages/database/src/schema/index.ts` adalah placeholder kosong — tidak ada definisi Drizzle schema. Semua tabel dibuat via raw SQL.

---

## Domain 1 — Brand & Profil

### Current Source of Truth

`useBrandProfileController.ts` — in-memory mock state. Data direset setiap refresh halaman.

### Mock Ownership

`useBrandProfileController` → `BrandProfile` interface dari `brand.types.ts`

### Required Tables

| Field                  | Tabel Target | Kolom             |
| ---------------------- | ------------ | ----------------- |
| `identity.salonName`   | `salons`     | `name`            |
| `identity.tagline`     | `salons`     | `tagline`         |
| `identity.description` | `salons`     | `description`     |
| `media.logoUrl`        | `salons`     | `logo_url`        |
| `media.coverImageUrl`  | `salons`     | `cover_image_url` |
| `contact.phone`        | `salons`     | `phone`           |
| `contact.whatsapp`     | `salons`     | `whatsapp`        |
| `contact.email`        | `salons`     | `email`           |
| `contact.website`      | `salons`     | `website`         |
| `social.instagram`     | `salons`     | `instagram`       |
| `social.tiktok`        | `salons`     | `tiktok`          |
| `social.facebook`      | `salons`     | `facebook`        |
| `location.address`     | `salons`     | `address`         |
| `location.city`        | `salons`     | `city`            |
| `location.mapsUrl`     | `salons`     | `maps_url`        |

### Existing Supabase Tables

`salons` — ada, tapi kolom spesifik di atas belum diverifikasi ada semua. Kemungkinan besar `name` ada. Kolom-kolom seperti `tagline`, `whatsapp`, `tiktok`, `maps_url` perlu diverifikasi atau ditambah.

### Missing Tables

Tidak ada — semua data Brand masuk ke `salons`. Tidak butuh tabel baru.

### Missing Relations

Tidak ada — `salons` sudah menjadi root entity.

### Required Mutations

- `upsertBrandProfile(salonId, data: BrandProfile)` — satu UPDATE ke baris `salons`
- `uploadLogo(salonId, file)` → Supabase Storage → update `salons.logo_url`
- `uploadCover(salonId, file)` → Supabase Storage → update `salons.cover_image_url`

### Required Queries

- `getBrandProfile(salonId)` → SELECT dari `salons` WHERE id = salonId

### Customer App Dependencies

**Tinggi.** Customer app menampilkan:

- `salonName`, `tagline`, `description` di header booking page
- `logoUrl`, `coverImageUrl` di hero section
- `phone`, `whatsapp` di contact section
- `address`, `city`, `mapsUrl` di lokasi section
- `instagram` di social links

Semua data ini dibaca setiap kali customer membuka `/book/[slug]`.

### Owner App Dependencies

Settings > Brand. Hanya halaman edit — tidak ada tampilan lain di owner dashboard yang membaca Brand secara langsung.

---

## Domain 2 — Layanan (Kategori & Servis)

### Current Source of Truth

`useServicesController.ts` — in-memory mock state dengan seed data manual.

### Mock Ownership

`useServicesController` → `ServicesDomain` interface (berisi `categories: ServiceCategory[]` dan `services: ServiceItem[]`)

### Required Tables

| Type              | Tabel Target                                                                       |
| ----------------- | ---------------------------------------------------------------------------------- |
| `ServiceCategory` | `categories`                                                                       |
| `ServiceItem`     | `services`                                                                         |
| `ServiceQuestion` | dalam `services.service_questions` (jsonb) ATAU tabel `service_questions` terpisah |

### Existing Supabase Tables

- `categories` — **ada**. Kolom yang ada: id, salon_id, name, slug, description, created_at, updated_at.
- `services` — **ada**. Kolom yang ada: id, salon_id, category_id, name, description, price, duration, is_active, price_type, requires_specialist, service_questions (jsonb), created_at, updated_at.

### Missing Tables

`categories` kurang kolom:

| Field di `ServiceCategory` | Kolom di `categories` | Status        |
| -------------------------- | --------------------- | ------------- |
| `id`                       | `id`                  | Ada           |
| `name`                     | `name`                | Ada           |
| `description`              | `description`         | Ada           |
| `slug`                     | `slug`                | Ada           |
| `color`                    | `color`               | **Belum ada** |
| `blobColor`                | `blob_color`          | **Belum ada** |
| `iconName`                 | `icon_name`           | **Belum ada** |
| `isActive`                 | `is_active`           | **Belum ada** |
| `sortOrder`                | `sort_order`          | **Belum ada** |

`services` kurang kolom:

| Field di `ServiceItem` | Kolom di `services` | Status        |
| ---------------------- | ------------------- | ------------- |
| `serviceFlow`          | `service_flow`      | **Belum ada** |
| `sortOrder`            | `sort_order`        | **Belum ada** |

`ServiceQuestion` saat ini di `services.service_questions` sebagai jsonb. Ini bisa dipertahankan untuk Phase 2 (sederhana, cukup untuk filter/display) ATAU dipindah ke tabel `service_questions` terpisah (lebih query-able). Keputusan ini ada di Implementation Plan.

### Missing Relations

Tidak ada relasi baru. FK `category_id` di `services` sudah ada (terlihat dari seed.sql).

### Required Mutations

- `createCategory(salonId, data)` — INSERT ke `categories`
- `updateCategory(categoryId, data)` — UPDATE `categories`
- `deleteCategory(categoryId)` — DELETE (atau set `is_active = false`)
- `reorderCategories(salonId, orderedIds)` — UPDATE `sort_order` batch
- `createService(salonId, data)` — INSERT ke `services`
- `updateService(serviceId, data)` — UPDATE `services`
- `deleteService(serviceId)` — DELETE (atau set `is_active = false`)
- `reorderServices(categoryId, orderedIds)` — UPDATE `sort_order` batch

### Required Queries

- `getCategories(salonId)` → SELECT dari `categories` WHERE salon_id = salonId ORDER BY sort_order
- `getServices(salonId)` → SELECT dari `services` WHERE salon_id = salonId ORDER BY category_id, sort_order
- `getServicesByCategory(categoryId)` → SELECT dari `services` WHERE category_id = categoryId

### Customer App Dependencies

**Sangat tinggi.** Customer app membaca `categories` dan `services` untuk:

- Menampilkan daftar kategori di step pilih layanan
- Filter services per kategori
- Menampilkan harga, durasi, deskripsi di service card
- Routing flow (berdasarkan `service_flow` / `requires_specialist`)
- Menampilkan service questions di consultation step

### Owner App Dependencies

Settings > Layanan. Juga dibaca oleh `TeamPageClient` (untuk service assignment picker).

---

## Domain 3 — Produk & Paket

### Current Source of Truth

`useProdukPaketController.ts` — in-memory mock state.

### Mock Ownership

`useProdukPaketController` → `AddOnProduct[]` dan `ServiceBundle[]` dari `services.types.ts`

### Required Tables

| Type                       | Tabel Target                                        |
| -------------------------- | --------------------------------------------------- |
| `AddOnProduct`             | `add_on_products` — **belum ada**                   |
| `ServiceBundle`            | `service_bundles` — **belum ada**                   |
| `ServiceBundle.serviceIds` | `service_bundle_items` (join table) — **belum ada** |

### Existing Supabase Tables

Tidak ada. Domain ini sepenuhnya baru — tidak ada tabel yang bisa dipetakan.

### Missing Tables

**`add_on_products`** (baru):

```
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
salon_id      UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE
name          TEXT NOT NULL
description   TEXT NOT NULL DEFAULT ''
price         BIGINT NOT NULL
image_url     TEXT
is_active     BOOLEAN NOT NULL DEFAULT true
sort_order    INTEGER NOT NULL DEFAULT 0
created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
```

**`service_bundles`** (baru):

```
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
salon_id      UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE
name          TEXT NOT NULL
description   TEXT NOT NULL DEFAULT ''
bundle_price  BIGINT NOT NULL
image_url     TEXT
is_active     BOOLEAN NOT NULL DEFAULT true
sort_order    INTEGER NOT NULL DEFAULT 0
created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
```

**`service_bundle_items`** (join table, baru):

```
bundle_id     UUID NOT NULL REFERENCES service_bundles(id) ON DELETE CASCADE
service_id    UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE
PRIMARY KEY (bundle_id, service_id)
```

### Missing Relations

`service_bundles.salon_id` → `salons.id`
`add_on_products.salon_id` → `salons.id`
`service_bundle_items.bundle_id` → `service_bundles.id`
`service_bundle_items.service_id` → `services.id`

### Required Mutations

- `createAddOn(salonId, data)` / `updateAddOn(id, data)` / `deleteAddOn(id)`
- `createBundle(salonId, data)` — INSERT ke `service_bundles` + INSERT ke `service_bundle_items` (batch)
- `updateBundle(id, data)` — UPDATE `service_bundles` + DELETE+INSERT `service_bundle_items`
- `deleteBundle(id)` — CASCADE hapus `service_bundle_items` otomatis

### Required Queries

- `getAddOns(salonId)` → SELECT dari `add_on_products`
- `getBundles(salonId)` → SELECT dari `service_bundles` JOIN `service_bundle_items` JOIN `services`

### Customer App Dependencies

**Medium.** Customer app perlu menampilkan add-ons di step checkout (belum diimplementasi di customer app). Bundle bisa ditampilkan sebagai pilihan layanan di step pertama.

### Owner App Dependencies

Settings > Produk & Paket. Tidak ada halaman lain di owner yang membaca ini saat ini.

---

## Domain 4 — Tim (Staff)

### Current Source of Truth

`useTeamController.ts` — in-memory mock state.

### Mock Ownership

`useTeamController` → `TeamDomain` interface (berisi staff, assignments, schedules, leaves)

### Required Tables

| Type                             | Tabel Target                                |
| -------------------------------- | ------------------------------------------- |
| `StaffMember`                    | `staff_members` — **belum ada**             |
| `ServiceAssignment`              | `staff_service_assignments` — **belum ada** |
| `WeeklySchedule` / `DaySchedule` | `staff_schedules` — **belum ada**           |
| `StaffLeave`                     | `staff_leaves` — **belum ada**              |

### Existing Supabase Tables

Tidak ada tabel `staff_members` atau sejenisnya yang terlihat di SQL files. Domain ini sepenuhnya baru.

### Missing Tables

**`staff_members`** (baru):

```
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
salon_id      UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE
full_name     TEXT NOT NULL
phone         TEXT NOT NULL DEFAULT ''
role          TEXT NOT NULL CHECK (role IN ('MANAGER','STYLIST','COLORIST','NAIL_ARTIST','THERAPIST','RECEPTIONIST'))
specialty     TEXT CHECK (specialty IN ('HAIR_STYLIST','COLORIST','NAIL_ARTIST','THERAPIST'))
avatar_url    TEXT
avatar_color  TEXT NOT NULL DEFAULT '#94a3b8'
is_active     BOOLEAN NOT NULL DEFAULT true
created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
```

**`staff_service_assignments`** (join table, baru):

```
staff_id      UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE
service_id    UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE
PRIMARY KEY (staff_id, service_id)
```

**`staff_schedules`** (baru — satu baris per staff per hari):

```
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
staff_id      UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE
day           TEXT NOT NULL CHECK (day IN ('MON','TUE','WED','THU','FRI','SAT','SUN'))
enabled       BOOLEAN NOT NULL DEFAULT true
start_time    TIME
end_time      TIME
UNIQUE (staff_id, day)
```

**`staff_leaves`** (baru):

```
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
staff_id      UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE
type          TEXT NOT NULL CHECK (type IN ('LEAVE','SICK','HOLIDAY','UNAVAILABLE'))
date          DATE NOT NULL
note          TEXT NOT NULL DEFAULT ''
created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
```

### Missing Relations

Semua di atas belum ada.

**Catatan penting:** `User.staffId` di `auth.types.ts` sudah ada sebagai FK pointer ke `staff_members.id`. Ini berarti tabel `staff_members` harus ada sebelum relasi ini bisa di-enforce di Supabase Auth / `profiles` table.

### Required Mutations

- `createStaff(salonId, data)` / `updateStaff(id, data)` / `deactivateStaff(id)`
- `setServiceAssignments(staffId, serviceIds)` — DELETE existing + INSERT baru (replace-all)
- `upsertSchedule(staffId, days: DaySchedule[])` — UPSERT batch ke `staff_schedules`
- `addLeave(staffId, data)` / `removeLeave(leaveId)`

### Required Queries

- `getStaff(salonId)` → SELECT dari `staff_members` WHERE is_active = true
- `getAssignments(salonId)` → SELECT dari `staff_service_assignments` WHERE staff_id IN (...)
- `getSchedule(staffId)` → SELECT dari `staff_schedules`
- `getLeaves(staffId, dateRange)` → SELECT dari `staff_leaves`

### Customer App Dependencies

**Tinggi.** Customer app menggunakan staff untuk:

- Menampilkan daftar stylist yang bisa dipilih per service
- Filtering slot berdasarkan jadwal stylist (`staff_schedules`)
- Menampilkan nama + foto stylist di confirmation screen

### Owner App Dependencies

Settings > Tim. Juga dibaca oleh `useServicesController` dan `TeamPageClient` untuk service assignment picker.

---

## Domain 5 — Pengguna & Akses

### Current Source of Truth

`usePenggunaController.ts` — in-memory mock state dengan SEED_USERS hardcoded.

### Mock Ownership

`usePenggunaController` → `User[]` dari `auth.types.ts`

### Required Tables

`User` interface memetakan ke dua entitas Supabase yang berbeda:

1. **Supabase Auth** (`auth.users`) — email, password, UUID identity
2. **`profiles`** atau **`salon_users`** — role, status, salonId, staffId, dll.

### Existing Supabase Tables

Supabase Auth (`auth.users`) sudah ada secara built-in. Tabel `profiles` atau `salon_users` belum terlihat di SQL files — kemungkinan ada tapi belum terekspos.

Kemungkinan besar ada tabel `profiles` (konvensi Supabase standard) yang di-join dengan `auth.users`.

### Missing Tables / Kolom

Tabel `profiles` (atau `salon_users`) perlu kolom:

```
id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
salon_id      UUID NOT NULL REFERENCES salons(id)
name          TEXT NOT NULL
role          TEXT NOT NULL CHECK (role IN ('OWNER','ADMIN','MANAGER','STAFF'))
status        TEXT NOT NULL DEFAULT 'INVITED' CHECK (status IN ('ACTIVE','INVITED','INACTIVE','REVOKED'))
staff_id      UUID REFERENCES staff_members(id)  -- link ke tim
avatar_url    TEXT
phone         TEXT
invited_at    TIMESTAMPTZ
last_login_at TIMESTAMPTZ
created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
```

Tabel `invitations` (untuk pending invites, sebelum user create account):

```
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
salon_id      UUID NOT NULL REFERENCES salons(id)
email         TEXT NOT NULL
role          TEXT NOT NULL CHECK (role IN ('ADMIN','MANAGER','STAFF'))
token         TEXT NOT NULL UNIQUE
invited_by    UUID NOT NULL REFERENCES auth.users(id)
invited_at    TIMESTAMPTZ NOT NULL DEFAULT now()
expires_at    TIMESTAMPTZ NOT NULL
accepted_at   TIMESTAMPTZ
```

### Missing Relations

`profiles.staff_id` → `staff_members.id` — butuh `staff_members` ada dulu (dependency dari Domain 4)

### Required Mutations

- `inviteUser(salonId, email, role)` → Supabase Auth `inviteUserByEmail` + INSERT `invitations`
- `updateUserRole(userId, role)` → UPDATE `profiles`
- `deactivateUser(userId)` → UPDATE `profiles` SET status = 'INACTIVE'
- `reactivateUser(userId)` → UPDATE `profiles` SET status = 'ACTIVE'
- `revokeUser(userId)` → UPDATE `profiles` SET status = 'REVOKED' + Supabase Auth signOut
- `cancelInvite(invitationId)` → DELETE dari `invitations`

### Required Queries

- `getUsers(salonId)` → SELECT dari `profiles` WHERE salon_id = salonId
- `getPendingInvites(salonId)` → SELECT dari `invitations` WHERE salon_id AND accepted_at IS NULL

### Customer App Dependencies

**Tidak ada.** Customer tidak melihat siapa owner atau staffnya dari perspektif akses/role. Nama stylist dibaca dari `staff_members`, bukan dari `profiles`.

### Owner App Dependencies

Settings > Pengguna & Akses. AuthContext membaca `profiles` untuk current user saat login.

---

## Domain 6 — Operasional

### Current Source of Truth

`useOperationalController.ts` — in-memory mock state dengan DEFAULT_BUSINESS_HOURS.

### Mock Ownership

`useOperasionalController` → `OperationalSettings` interface dari `operational.types.ts`

### Required Tables

| Type                 | Tabel Target                            |
| -------------------- | --------------------------------------- |
| `BusinessHoursDay`   | `business_hours` — **sudah ada**        |
| `SpecialClosingDate` | `special_closing_dates` — **belum ada** |
| `BookingPolicy`      | `booking_policies` — **belum ada**      |

### Existing Supabase Tables

`business_hours` — **ada**. Kolom dikonfirmasi dari komentar di `operational.types.ts`: salon_id, day_of_week, is_closed, open_time, close_time.

### Missing Tables

**`special_closing_dates`** (baru — disebutkan di `operational.types.ts` sebagai "Phase 2 - does not yet exist"):

```
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
salon_id    UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE
date        DATE NOT NULL
label       TEXT NOT NULL DEFAULT 'Hari Libur'
created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
UNIQUE (salon_id, date)
```

**`booking_policies`** (baru — disebutkan di `operational.types.ts` sebagai "Phase 2 - does not yet exist"):

```
id                          UUID PRIMARY KEY DEFAULT gen_random_uuid()
salon_id                    UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE
slot_interval_minutes       SMALLINT NOT NULL DEFAULT 30
lead_time_hours             SMALLINT NOT NULL DEFAULT 2
advance_booking_days        SMALLINT NOT NULL DEFAULT 30
cancellation_window_hours   SMALLINT NOT NULL DEFAULT 2
updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
UNIQUE (salon_id)  -- one policy per salon
```

### Missing Relations

`special_closing_dates.salon_id` → `salons.id`
`booking_policies.salon_id` → `salons.id`

### Required Mutations

- `upsertBusinessHours(salonId, days: BusinessHoursDay[])` — UPSERT batch (7 rows) ke `business_hours`
- `addSpecialClosingDate(salonId, data)` → INSERT ke `special_closing_dates`
- `removeSpecialClosingDate(id)` → DELETE dari `special_closing_dates`
- `upsertBookingPolicy(salonId, data: BookingPolicy)` → UPSERT ke `booking_policies`

### Required Queries

- `getBusinessHours(salonId)` → SELECT dari `business_hours` WHERE salon_id ORDER BY day_of_week ASC
- `getSpecialClosingDates(salonId)` → SELECT dari `special_closing_dates` WHERE salon_id ORDER BY date ASC
- `getBookingPolicy(salonId)` → SELECT dari `booking_policies` WHERE salon_id

### Customer App Dependencies

**Sangat tinggi.** Customer app membaca semua data Operasional untuk:

- `business_hours` → menentukan hari apa salon buka (kalender booking)
- `special_closing_dates` → menonaktifkan tanggal tertentu di kalender
- `booking_policies.slot_interval_minutes` → menggantikan `SESSION_TIMES` hardcode di customer app
- `booking_policies.lead_time_hours` → disabling slot yang terlalu dekat
- `booking_policies.advance_booking_days` → batasan tanggal maksimal di kalender

### Owner App Dependencies

Settings > Operasional.

---

## Domain 7 — Booking App

### Current Source of Truth

`useBookingAppController.ts` — in-memory mock state dengan `DEFAULT_BOOKING_APP_SETTINGS`.

### Mock Ownership

`useBookingAppController` → `BookingAppSettings` interface dari `booking-app.types.ts`

### Required Tables

| Field                    | Tabel Target                                |
| ------------------------ | ------------------------------------------- |
| `paymentMethods` (array) | `salons` — sebagai `payment_methods TEXT[]` |
| `qrisImageUrl`           | `salons` — sebagai `qris_image_url TEXT`    |
| `bankAccounts`           | `bank_accounts` — **tabel baru**            |
| `confirmationMode`       | `salons` — sebagai `confirmation_mode TEXT` |
| `salonPolicy`            | `salons` — sebagai `salon_policy TEXT`      |

### Existing Supabase Tables

`salons` — ada. Kolom-kolom spesifik di atas (`payment_methods`, `qris_image_url`, dll.) belum ada.

### Missing Tables

**`bank_accounts`** (baru):

```
id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
salon_id            UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE
bank_name           TEXT NOT NULL
account_number      TEXT NOT NULL
account_holder_name TEXT NOT NULL
is_active           BOOLEAN NOT NULL DEFAULT true
sort_order          INTEGER NOT NULL DEFAULT 0
created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
```

**Kolom baru di `salons`** (ALTER TABLE, bukan tabel baru):

```sql
ALTER TABLE salons
  ADD COLUMN IF NOT EXISTS payment_methods    TEXT[] NOT NULL DEFAULT ARRAY['qris','transfer'],
  ADD COLUMN IF NOT EXISTS qris_image_url     TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_mode  TEXT NOT NULL DEFAULT 'auto'
    CHECK (confirmation_mode IN ('auto', 'manual')),
  ADD COLUMN IF NOT EXISTS salon_policy       TEXT;
```

### Missing Relations

`bank_accounts.salon_id` → `salons.id`

### Required Mutations

- `setPaymentMethods(salonId, methods: PaymentMethod[])` → UPDATE `salons`
- `uploadQrisImage(salonId, file)` → Supabase Storage → UPDATE `salons.qris_image_url`
- `removeQrisImage(salonId)` → UPDATE `salons` SET qris_image_url = NULL + Storage delete
- `addBankAccount(salonId, data)` → INSERT ke `bank_accounts`
- `updateBankAccount(id, data)` → UPDATE `bank_accounts`
- `removeBankAccount(id)` → DELETE dari `bank_accounts`
- `setConfirmationMode(salonId, mode)` → UPDATE `salons`
- `setSalonPolicy(salonId, policy)` → UPDATE `salons`

### Required Queries

- `getBookingAppSettings(salonId)` → SELECT dari `salons` (kolom payment_methods, qris_image_url, confirmation_mode, salon_policy) + SELECT `bank_accounts` WHERE salon_id

### Customer App Dependencies

**Sangat tinggi.** Customer app membaca:

- `payment_methods` → menampilkan metode pembayaran yang tersedia di checkout
- `qris_image_url` → menampilkan QR code di step pembayaran QRIS
- `bank_accounts` → menampilkan rekening tujuan transfer
- `confirmation_mode` → menentukan apakah booking langsung konfirmasi atau perlu approval owner
- `salon_policy` → menampilkan kebijakan salon sebelum customer konfirmasi booking

### Owner App Dependencies

Settings > Booking App. Juga digunakan oleh halaman manajemen booking saat owner memproses pembayaran.

---

## Ringkasan Gap Analysis

| Domain           | Tabel Ada                          | Tabel Kurang | Kolom Kurang          | Kompleksitas |
| ---------------- | ---------------------------------- | ------------ | --------------------- | ------------ |
| Brand            | `salons` (parsial)                 | 0            | ~10 kolom di `salons` | Rendah       |
| Layanan          | `categories`, `services` (parsial) | 0            | 5 kolom di 2 tabel    | Rendah       |
| Produk & Paket   | 0                                  | 3 tabel baru | -                     | Sedang       |
| Tim              | 0                                  | 4 tabel baru | -                     | Tinggi       |
| Pengguna & Akses | `auth.users` (Supabase)            | 1-2 tabel    | ~8 kolom              | Tinggi       |
| Operasional      | `business_hours`                   | 2 tabel baru | 0                     | Sedang       |
| Booking App      | `salons` (parsial)                 | 1 tabel baru | 4 kolom di `salons`   | Sedang       |

**Total tabel baru yang dibutuhkan:** 10
**Total kolom baru di tabel yang sudah ada:** ~17
**Domain yang bisa langsung dikoneksi tanpa migrasi besar:** Operasional (business_hours sudah ada)

---

## Urutan Migrasi yang Direkomendasikan

Urutan ini meminimalkan dependency conflicts:

1. **ALTER `salons`** — tambah semua kolom baru (Brand + Booking App)
2. **ALTER `categories` dan `services`** — tambah kolom yang kurang (Layanan)
3. **CREATE `special_closing_dates`** — tidak ada dependency baru
4. **CREATE `booking_policies`** — tidak ada dependency baru
5. **CREATE `bank_accounts`** — bergantung pada `salons`
6. **CREATE `add_on_products`** — bergantung pada `salons`
7. **CREATE `service_bundles`** + **`service_bundle_items`** — bergantung pada `salons` dan `services`
8. **CREATE `staff_members`** — bergantung pada `salons`
9. **CREATE `staff_service_assignments`** — bergantung pada `staff_members` dan `services`
10. **CREATE `staff_schedules`** — bergantung pada `staff_members`
11. **CREATE `staff_leaves`** — bergantung pada `staff_members`
12. **CREATE/ALTER `profiles`** (atau `salon_users`) — bergantung pada `salons`, opsional bergantung pada `staff_members`
13. **CREATE `invitations`** — bergantung pada `salons` dan `auth.users`
