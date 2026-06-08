# Services Domain — Database Contract

> Source: `services.types.ts`
> Date: 2026-06-08

## Tables Required

### `categories` (partially exists)

| Field       | Column               | Status  |
| ----------- | -------------------- | ------- |
| id          | `id` UUID PK         | EXISTS  |
| name        | `name` TEXT          | EXISTS  |
| description | `description` TEXT   | EXISTS  |
| color       | `color` TEXT         | MISSING |
| blobColor   | `blob_color` TEXT    | MISSING |
| icon        | `icon` TEXT          | MISSING |
| isActive    | `is_active` BOOLEAN  | MISSING |
| sortOrder   | `sort_order` INTEGER | MISSING |

```sql
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS color      TEXT,
  ADD COLUMN IF NOT EXISTS blob_color TEXT,
  ADD COLUMN IF NOT EXISTS icon       TEXT,
  ADD COLUMN IF NOT EXISTS is_active  BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
```

---

### `services` (partially exists)

| Field              | Column                        | Status                                    |
| ------------------ | ----------------------------- | ----------------------------------------- |
| id                 | `id` UUID PK                  | EXISTS                                    |
| categoryId         | `category_id` UUID FK         | EXISTS                                    |
| name               | `name` TEXT                   | EXISTS                                    |
| description        | `description` TEXT            | EXISTS                                    |
| price              | `price` BIGINT                | EXISTS                                    |
| duration           | `duration` INTEGER            | EXISTS                                    |
| isActive           | `is_active` BOOLEAN           | EXISTS                                    |
| priceType          | `price_type` TEXT             | CONFIRM via add-price-type.sql            |
| serviceFlow        | `service_flow` TEXT           | MISSING                                   |
| requiresSpecialist | `requires_specialist` BOOLEAN | CONFIRM via migrate-service-questions.sql |
| sortOrder          | `sort_order` INTEGER          | MISSING                                   |

```sql
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS service_flow        TEXT CHECK (service_flow IN ('STYLING_HAIR','STYLING_COLOUR','TREATMENT')) DEFAULT 'TREATMENT',
  ADD COLUMN IF NOT EXISTS sort_order          INTEGER NOT NULL DEFAULT 0;
-- price_type and requires_specialist: confirm existing migration files applied
```

---

### `service_questions` (may exist — check migrate-service-questions.sql)

| Field     | Column                               | Status      |
| --------- | ------------------------------------ | ----------- |
| id        | `id` UUID PK                         | UNCONFIRMED |
| serviceId | `service_id` UUID FK                 | UNCONFIRMED |
| label     | `label` TEXT                         | UNCONFIRMED |
| type      | `type` TEXT ('chips','photo','text') | UNCONFIRMED |
| required  | `required` BOOLEAN                   | UNCONFIRMED |
| options   | `options` TEXT[] or JSONB            | UNCONFIRMED |
| sortOrder | `sort_order` INTEGER                 | UNCONFIRMED |

```sql
CREATE TABLE IF NOT EXISTS service_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('chips','photo','text')),
  required    BOOLEAN NOT NULL DEFAULT false,
  options     TEXT[] NOT NULL DEFAULT '{}',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### `products` (add-ons — may not exist)

| Field       | Column               | Status      |
| ----------- | -------------------- | ----------- |
| id          | `id` UUID PK         | UNCONFIRMED |
| salonId     | `salon_id` UUID FK   | UNCONFIRMED |
| name        | `name` TEXT          | UNCONFIRMED |
| description | `description` TEXT   | UNCONFIRMED |
| price       | `price` BIGINT       | UNCONFIRMED |
| imageEmoji  | `image_emoji` TEXT   | UNCONFIRMED |
| imageUrl    | `image_url` TEXT     | UNCONFIRMED |
| isActive    | `is_active` BOOLEAN  | UNCONFIRMED |
| sortOrder   | `sort_order` INTEGER | UNCONFIRMED |

```sql
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id    UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       BIGINT NOT NULL DEFAULT 0,
  image_emoji TEXT,
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### `service_bundles` (new table)

```sql
CREATE TABLE IF NOT EXISTS service_bundles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id     UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  bundle_price BIGINT NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_bundle_items (
  bundle_id  UUID NOT NULL REFERENCES service_bundles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (bundle_id, service_id)
);
```

---

## Future Scheduling Metadata

> DO NOT implement these fields yet. Document only.
> Add to `ServiceItem` and `services` table when the scheduling engine is built.

These fields are required before any availability or calendar feature can be built.
They are NOT in the current `services.types.ts` — this section defines what must be added at that time.

### Fields to add to `ServiceItem`

| Field                   | Type               | Default | Purpose                                                                                                                                                                                               |
| ----------------------- | ------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `duration`              | `number` (minutes) | —       | **Already exists.** Primary slot-blocking unit. A 45-min haircut blocks 45 min on the stylist's calendar.                                                                                             |
| `bufferBefore`          | `number` (minutes) | `0`     | Setup time before the appointment clock starts. Example: colour services need 5 min to prepare the mixing station. Slot is reserved but stylist is not yet with the client.                           |
| `bufferAfter`           | `number` (minutes) | `0`     | Cleanup or processing time after the service ends. Example: keratin treatment has 30 min no-touch processing — the chair is occupied but the stylist is free to take another booking.                 |
| `maxConcurrentBookings` | `number`           | `1`     | How many of this service can run simultaneously in the salon. A salon with 3 massage beds can accept 3 concurrent massage bookings. Set to `1` for services that require exclusive stylist attention. |
| `requiresPrivateRoom`   | `boolean`          | `false` | When `true`, the booking engine must reserve a private room (massage room, facial room). Prevents room double-booking independent of stylist availability.                                            |

### Booking slot calculation (future)

```
effective slot duration = bufferBefore + duration + bufferAfter
```

Example — Root Colour (60 min service, 5 min prep, 15 min processing):

```
bufferBefore = 5
duration     = 60
bufferAfter  = 15
─────────────────
slot blocked = 80 min on calendar
stylist free = after 65 min (can start prep on next client during processing)
```

### Migration SQL (do not run yet)

```sql
-- Add to services table when scheduling engine is built
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS buffer_before           INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS buffer_after            INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_concurrent_bookings INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS requires_private_room   BOOLEAN NOT NULL DEFAULT false;
```

### ServiceFlow → scheduling behaviour mapping

| ServiceFlow      | Requires Stylist                   | Requires Private Room (default)     | Notes                                                 |
| ---------------- | ---------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| `STYLING_HAIR`   | Conditional (`requiresSpecialist`) | No                                  | Open styling chair                                    |
| `STYLING_COLOUR` | Yes (always)                       | No                                  | Open styling chair, chemical processing buffer needed |
| `STYLING_NAIL`   | Conditional (`requiresSpecialist`) | No                                  | Nail station                                          |
| `TREATMENT`      | Conditional (`requiresSpecialist`) | Conditional (`requiresPrivateRoom`) | Massage/facial/body need room; lash/brow do not       |

---

## Storage Buckets Required

| Asset                | Bucket         | Path pattern                          |
| -------------------- | -------------- | ------------------------------------- |
| Add-on product image | `salon-assets` | `{salonId}/products/{productId}.webp` |
