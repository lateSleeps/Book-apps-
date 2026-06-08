# Phase 5.2 - Customer App Contract Audit

> Status: AUDIT ONLY. No code. No forms. No migration.
> Date: 2026-06-08

---

## STEP 1 - Customer App Inventory

Every data field rendered by `apps/customer`, organized by booking step.

---

### Salon Info (displayed in layout / all steps)

| Field         | Source today                                    | Notes                                 |
| ------------- | ----------------------------------------------- | ------------------------------------- |
| `name`        | `site.config.ts` hardcoded                      | "Rara Beauty Jakarta"                 |
| `description` | `site.config.ts` hardcoded                      |                                       |
| `slug`        | `site.config.ts` hardcoded + URL param `[slug]` | BUG: constant = "rara-beauty-jakarta" |
| `address`     | `site.config.ts` hardcoded                      |                                       |
| `phone`       | `site.config.ts` hardcoded                      |                                       |
| `openDays`    | `site.config.ts` hardcoded                      | e.g. "Senin - Sabtu"                  |
| `openHours`   | `site.config.ts` hardcoded                      | e.g. "09:00 - 20:00"                  |

---

### Step 1 - Pilih Layanan (Services)

| Field                         | Source today                                    |
| ----------------------------- | ----------------------------------------------- |
| Category `name`               | `use-mock-data.ts` hardcoded                    |
| Category `color`              | `use-mock-data.ts` hardcoded (e.g. "#fef9c3")   |
| Category `blobColor`          | `use-mock-data.ts` hardcoded                    |
| Category `icon`               | `use-mock-data.ts` hardcoded (emoji)            |
| Category `isActive`           | `use-mock-data.ts` hardcoded                    |
| Service `name`                | `use-mock-data.ts` hardcoded                    |
| Service `description`         | `use-mock-data.ts` hardcoded                    |
| Service `price`               | `use-mock-data.ts` hardcoded                    |
| Service `duration`            | `use-mock-data.ts` hardcoded (minutes)          |
| Service `price_type`          | `use-mock-data.ts` hardcoded ("fixed" / "from") |
| Service `requires_specialist` | `use-mock-data.ts` hardcoded (bool)             |
| Service `isActive`            | `use-mock-data.ts` hardcoded                    |

---

### Step 2 - Service Detail / Questions

| Field                             | Source today                           |
| --------------------------------- | -------------------------------------- |
| Service `service_questions` array | `use-mock-data.ts` hardcoded           |
| Question `id`                     | hardcoded                              |
| Question `label`                  | hardcoded                              |
| Question `type`                   | hardcoded ("text" / "chips" / "photo") |
| Question `options`                | hardcoded (for chips type)             |
| Question `required`               | hardcoded                              |

---

### Step 3 - Pilih Stylist & Waktu

| Field                    | Source today                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------ |
| Stylist `name`           | `use-mock-data.ts` + `useStylists` hook maps `raw.name / full_name / user.full_name` |
| Stylist `specialty`      | mapped from `raw.role / user.role / raw.specialty / raw.title`                       |
| Stylist `avatarInitials` | derived from name (first 2 words) or `raw.avatar_initials / raw.initials`            |
| Stylist `avatarColor`    | `raw.color / raw.avatar_color` or auto-assigned from `AVATAR_COLORS[]` array         |
| Stylist `bookedSlots`    | `raw.booked_slots`                                                                   |
| Stylist `isActive`       | `use-mock-data.ts` hardcoded                                                         |
| Time slots               | `MOCK_SLOTS` hardcoded array in `StepStylist.tsx`                                    |
| Slot `time`              | hardcoded                                                                            |
| Slot `session`           | hardcoded ("PAGI" / "SIANG" / "SORE")                                                |
| Slot `available`         | hardcoded (all true)                                                                 |

---

### Step 4 - Konfirmasi

| Field                                     | Source today          |
| ----------------------------------------- | --------------------- |
| Selected services (name, price, duration) | booking store         |
| Selected stylist (name)                   | booking store         |
| Selected date                             | booking store         |
| Selected time slot                        | booking store         |
| Total price                               | calculated in store   |
| Discount amount                           | booking store (promo) |
| Addons list                               | booking store         |

---

### Step 5 - Kontak

| Field                                                          | Source today             |
| -------------------------------------------------------------- | ------------------------ |
| `customerName`                                                 | user input               |
| `customerPhone`                                                | user input               |
| `customerEmail`                                                | user input (optional)    |
| Product add-ons displayed: `name`, `description`, `imageEmoji` | `useMockData().products` |
| Product add-on `price`                                         | `use-mock-data.ts`       |
| Product add-on `category`                                      | `use-mock-data.ts`       |

---

### Step 6 - Pembayaran

| Field                           | Source today                                                       |
| ------------------------------- | ------------------------------------------------------------------ |
| `DEPOSIT_AMOUNT`                | hardcoded `20_000` in `constants.ts`                               |
| Payment method: QRIS / Transfer | `PaymentTypeSelector` - hardcoded options                          |
| QRIS image                      | `QRISDisplay` component - source unknown (likely hardcoded/static) |
| Bank account info               | old `ProfileSection` had `bankAccount` field                       |
| `proofImageUrl`                 | uploaded to Supabase Storage bucket `payment-proofs`               |
| `SLOT_RESERVATION_SECONDS`      | hardcoded `300` in `constants.ts`                                  |

---

### Step 7 - Tiket

| Field                                | Source today                                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `bookingCode`                        | generated in store, prefix from `BOOKING_CODE_PREFIX` (hardcoded "RB", but router uses "BK" - BUG) |
| `pin`                                | generated in store                                                                                 |
| Salon name                           | from store / site.config                                                                           |
| Booking date, time, service, stylist | from booking store                                                                                 |
| Confirmation timeout text            | hardcoded "maksimal 1 jam" in `StepTicket.tsx`                                                     |

---

## STEP 2 - Source-of-Truth Ownership Matrix

Which Settings domain owns each field that drives the customer app.

| Customer App Field                     | Settings Domain          | Tab         |
| -------------------------------------- | ------------------------ | ----------- |
| Salon name                             | Brand & Profil           | Brand       |
| Salon description                      | Brand & Profil           | Brand       |
| Salon slug                             | Brand & Profil           | Brand       |
| Salon address                          | Brand & Profil           | Brand       |
| Salon phone                            | Brand & Profil           | Brand       |
| Salon logo                             | Brand & Profil           | Brand       |
| Salon cover photo                      | Brand & Profil           | Brand       |
| Category name                          | Layanan                  | Layanan     |
| Category color                         | Layanan                  | Layanan     |
| Category blobColor                     | Layanan                  | Layanan     |
| Category icon (emoji)                  | Layanan                  | Layanan     |
| Category isActive                      | Layanan                  | Layanan     |
| Service name                           | Layanan                  | Layanan     |
| Service description                    | Layanan                  | Layanan     |
| Service price                          | Layanan                  | Layanan     |
| Service duration                       | Layanan                  | Layanan     |
| Service price_type                     | Layanan                  | Layanan     |
| Service requires_specialist            | Layanan                  | Layanan     |
| Service service_questions              | Layanan                  | Layanan     |
| Service isActive                       | Layanan                  | Layanan     |
| Product add-on name                    | Layanan (merged)         | Layanan     |
| Product add-on description             | Layanan (merged)         | Layanan     |
| Product add-on price                   | Layanan (merged)         | Layanan     |
| Product add-on imageEmoji              | Layanan (merged)         | Layanan     |
| Product add-on isActive                | Layanan (merged)         | Layanan     |
| Stylist name                           | Tim                      | Tim         |
| Stylist specialty / role               | Tim                      | Tim         |
| Stylist avatarColor                    | Tim                      | Tim         |
| Stylist bookedSlots                    | Tim (auto from bookings) | Tim         |
| Stylist isActive                       | Tim                      | Tim         |
| Business hours (open days, open hours) | Operasional              | Operasional |
| Time slots generation logic            | Operasional              | Operasional |
| Slot interval (minutes)                | Operasional              | Operasional |
| Deposit amount                         | Booking App              | Booking App |
| Slot reservation timeout               | Booking App              | Booking App |
| QRIS image                             | Booking App              | Booking App |
| Bank account number                    | Booking App              | Booking App |
| Booking code prefix                    | Booking App              | Booking App |
| Confirmation timeout (jam)             | Booking App              | Booking App |
| Payment methods enabled                | Booking App              | Booking App |
| Promo codes                            | Booking App              | Booking App |

---

## STEP 3 - Missing DB Fields

Fields consumed by the customer app that are NOT confirmed in the current DB schema.

### `categories` table - MISSING

| Column       | Type | Purpose                               |
| ------------ | ---- | ------------------------------------- |
| `color`      | TEXT | Card background color in customer UI  |
| `blob_color` | TEXT | Blob/glow color in customer UI        |
| `icon`       | TEXT | Emoji icon displayed on category card |

Existing confirmed columns: `id`, `salon_id`, `name`, `slug`, `description`, `created_at`, `updated_at`

---

### `services` table - MISSING / UNCONFIRMED

| Column                | Type                  | Purpose                                     |
| --------------------- | --------------------- | ------------------------------------------- |
| `price_type`          | TEXT ('fixed'/'from') | Display in customer UI ("mulai dari Rp...") |
| `requires_specialist` | BOOLEAN               | Forces stylist selection                    |
| `service_questions`   | JSONB                 | Per-service custom form questions           |

Migration file `migrate-service-questions.sql` exists - confirm if already applied.
Migration file `add-price-type.sql` exists - confirm if already applied.

---

### `staff` table - MISSING / UNCONFIRMED

| Column         | Type    | Purpose                                       |
| -------------- | ------- | --------------------------------------------- |
| `specialty`    | TEXT    | Displayed under stylist name in customer step |
| `avatar_color` | TEXT    | Background color of avatar circle             |
| `is_active`    | BOOLEAN | Hides stylist from customer booking           |

`StepStylist.tsx` maps from `raw.role / raw.user.role / raw.specialty / raw.title` - ambiguous, needs single canonical column.

---

### `salons` table - MISSING

| Column                         | Type           | Purpose                                                          |
| ------------------------------ | -------------- | ---------------------------------------------------------------- |
| `deposit_amount`               | BIGINT         | DP amount shown at payment step (hardcoded 20000)                |
| `booking_code_prefix`          | TEXT (2 chars) | Prefix for booking codes (hardcoded "RB", BUG: router uses "BK") |
| `slot_reservation_seconds`     | INTEGER        | Payment timer countdown (hardcoded 300)                          |
| `qris_image_url`               | TEXT           | QRIS image shown at payment step                                 |
| `bank_account_number`          | TEXT           | Bank transfer destination                                        |
| `bank_account_name`            | TEXT           | Bank account holder name                                         |
| `bank_name`                    | TEXT           | e.g. "BCA", "Mandiri"                                            |
| `confirmation_timeout_minutes` | INTEGER        | Auto-confirm timer (hardcoded 60 min)                            |
| `payment_methods`              | TEXT[]         | Enabled payment methods ['qris', 'transfer', 'cash']             |

---

### `products` (addons) table - MISSING / UNCONFIRMED

| Column        | Type | Purpose                                        |
| ------------- | ---- | ---------------------------------------------- |
| `image_emoji` | TEXT | Emoji displayed on product card in customer UI |

Products are currently fully hardcoded in `use-mock-data.ts`. No DB table confirmed to exist for addons.

---

### `business_hours` table - STATUS UNKNOWN

Referenced by `useBusinessHours(salonId)` hook in customer app. Table existence unconfirmed from audit. Must have:

- `salon_id`, `day_of_week` (0-6), `open_time`, `close_time`, `is_open`

---

## STEP 4 - Recommended DB Additions

Priority order for Settings V2 implementation.

### Priority 1 - Unblocks customer app from mock data

```sql
-- categories: add display fields
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS color      TEXT,
  ADD COLUMN IF NOT EXISTS blob_color TEXT,
  ADD COLUMN IF NOT EXISTS icon       TEXT;

-- staff: add customer-facing fields
ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS specialty   TEXT,
  ADD COLUMN IF NOT EXISTS avatar_color TEXT,
  ADD COLUMN IF NOT EXISTS is_active   BOOLEAN NOT NULL DEFAULT true;

-- salons: add booking config
ALTER TABLE salons
  ADD COLUMN IF NOT EXISTS deposit_amount              BIGINT  NOT NULL DEFAULT 20000,
  ADD COLUMN IF NOT EXISTS booking_code_prefix         TEXT    NOT NULL DEFAULT 'BK',
  ADD COLUMN IF NOT EXISTS slot_reservation_seconds    INTEGER NOT NULL DEFAULT 300,
  ADD COLUMN IF NOT EXISTS confirmation_timeout_minutes INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS payment_methods             TEXT[]  NOT NULL DEFAULT ARRAY['qris','transfer'],
  ADD COLUMN IF NOT EXISTS qris_image_url              TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number         TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_name           TEXT,
  ADD COLUMN IF NOT EXISTS bank_name                   TEXT;
```

### Priority 2 - Confirm existing migrations applied

- Verify `add-price-type.sql` applied: `services.price_type`
- Verify `migrate-service-questions.sql` applied: `services.service_questions`

### Priority 3 - New table if not exists

```sql
-- products / addons (if no table exists yet)
CREATE TABLE IF NOT EXISTS products (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id   UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  description TEXT,
  price      BIGINT NOT NULL DEFAULT 0,
  image_emoji TEXT,
  category   TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- business_hours (if no table exists yet)
CREATE TABLE IF NOT EXISTS business_hours (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id    UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time   TIME,
  close_time  TIME,
  is_open     BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (salon_id, day_of_week)
);
```

> These are recommendations only. Do not run migrations until Settings domains are being implemented (Phase 5.3+).

---

## STEP 5 - Final Settings IA

6 tabs. Produk Add-on merged into Layanan. Booking Experience renamed and expanded.

| #   | Tab Label        | Route                             | Domains Covered                                                                                                                        |
| --- | ---------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Brand & Profil   | `/dashboard/settings/brand`       | Salon name, description, slug, logo, cover, address, phone, established year, bank info                                                |
| 2   | Layanan          | `/dashboard/settings/layanan`     | Categories, Services (with questions), Products/Add-ons                                                                                |
| 3   | Tim              | `/dashboard/settings/tim`         | Staff profiles, specialty, avatar color, active status, schedules                                                                      |
| 4   | Operasional      | `/dashboard/settings/operasional` | Business hours per day, slot interval, closed dates                                                                                    |
| 5   | Booking App      | `/dashboard/settings/booking`     | Deposit amount, payment methods, QRIS image, bank account, booking code prefix, reservation timeout, confirmation timeout, promo codes |
| 6   | Pengguna & Akses | `/dashboard/settings/pengguna`    | Dashboard users, roles, permissions                                                                                                    |

### Route changes required

- `/dashboard/settings/produk-addon` - REMOVE (content merged into Layanan tab)
- `/dashboard/settings/booking` - RENAME label only: "Booking Experience" -> "Booking App"
- SettingsTopTabs TABS array: remove `produk-addon` entry, update `booking` label

### Known bugs to fix during Settings implementation

| Bug                                               | Location                        | Fix                                                               |
| ------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------- |
| `BOOKING_CODE_PREFIX = "RB"` but router uses "BK" | `constants.ts` + booking router | Migrate to `salons.booking_code_prefix`, default "BK"             |
| `SALON_SLUG` hardcoded                            | `constants.ts`                  | Remove, always read from URL param                                |
| Stylist specialty source ambiguous                | `StepStylist.tsx` mapStylist()  | Standardize to `staff.specialty` column                           |
| Time slots 100% hardcoded                         | `StepStylist.tsx` MOCK_SLOTS    | Replace with `business_hours`-derived slots in Operasional domain |
| `site.config.ts` all hardcoded                    | customer app                    | Remove after Brand domain is live                                 |
