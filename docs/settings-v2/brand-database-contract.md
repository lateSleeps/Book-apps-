# Brand Domain — Database Contract

> Source: `brand.types.ts` BrandProfile interface
> Table: `salons`

## Column Mapping

| BrandProfile field     | DB column                | Status                    |
| ---------------------- | ------------------------ | ------------------------- |
| `identity.salonName`   | `salons.name`            | EXISTS                    |
| `identity.tagline`     | `salons.tagline`         | MISSING — needs migration |
| `identity.description` | `salons.description`     | EXISTS                    |
| `media.logoUrl`        | `salons.logo_url`        | MISSING — needs migration |
| `media.coverImageUrl`  | `salons.cover_image_url` | MISSING — needs migration |
| `contact.phone`        | `salons.phone`           | EXISTS                    |
| `contact.whatsapp`     | `salons.whatsapp`        | MISSING — needs migration |
| `contact.email`        | `salons.email`           | MISSING — needs migration |
| `contact.website`      | `salons.website`         | MISSING — needs migration |
| `social.instagram`     | `salons.instagram`       | MISSING — needs migration |
| `social.tiktok`        | `salons.tiktok`          | MISSING — needs migration |
| `social.facebook`      | `salons.facebook`        | MISSING — needs migration |
| `location.address`     | `salons.address`         | EXISTS                    |
| `location.city`        | `salons.city`            | MISSING — needs migration |
| `location.mapsUrl`     | `salons.maps_url`        | MISSING — needs migration |

## Migration SQL (run when Brand domain is wired to backend)

```sql
ALTER TABLE salons
  ADD COLUMN IF NOT EXISTS tagline          TEXT,
  ADD COLUMN IF NOT EXISTS logo_url         TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url  TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp         TEXT,
  ADD COLUMN IF NOT EXISTS email            TEXT,
  ADD COLUMN IF NOT EXISTS website          TEXT,
  ADD COLUMN IF NOT EXISTS instagram        TEXT,
  ADD COLUMN IF NOT EXISTS tiktok           TEXT,
  ADD COLUMN IF NOT EXISTS facebook         TEXT,
  ADD COLUMN IF NOT EXISTS city             TEXT,
  ADD COLUMN IF NOT EXISTS maps_url         TEXT;
```

## Storage Buckets Required

| Asset       | Bucket         | Naming pattern         |
| ----------- | -------------- | ---------------------- |
| Logo        | `salon-assets` | `{salonId}/logo.webp`  |
| Cover image | `salon-assets` | `{salonId}/cover.webp` |
