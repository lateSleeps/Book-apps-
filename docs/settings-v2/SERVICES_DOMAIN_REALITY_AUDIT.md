# Services Domain Reality Audit

> Phase 5.5A | Date: 2026-06-08
> Scope: Business-domain audit — no code changes

---

## 1. Domain Model Review

### ServiceCategory

| Field                       | Current                           | Risk                                                              |
| --------------------------- | --------------------------------- | ----------------------------------------------------------------- |
| `id`, `name`, `description` | Correct                           | None                                                              |
| `color` (Tailwind class)    | Correct — drives customer card UI | Risk: if Tailwind purge removes unused classes                    |
| `blobColor` (hex)           | Correct — blob SVG effect         | None                                                              |
| `icon` (emoji)              | Works now                         | Emoji rendering varies across Android/iOS/desktop                 |
| `isActive`                  | Correct                           | None                                                              |
| `sortOrder`                 | Correct                           | None                                                              |
| **MISSING** `salonId`       | Not on type                       | Every category must belong to a salon — required for multi-tenant |

**Risk summary**: Category currently has no `salonId`. At DB level it was noted in the contract but the type doesn't enforce it. When tRPC wiring happens, queries will be scoped by salonId at the DB level — but the type should reflect this.

---

### ServiceItem

| Field                                            | Current                                   | Risk                                                                                                         |
| ------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `id`, `name`, `description`, `price`, `duration` | Correct                                   | None                                                                                                         |
| `categoryId`                                     | Correct                                   | None                                                                                                         |
| `priceType: 'fixed' \| 'starting_from'`          | Correct                                   | Customer app uses snake_case `price_type` — schema mismatch                                                  |
| `serviceFlow`                                    | **INCOMPLETE** — missing `'STYLING_NAIL'` | **CRITICAL** — 8 nail services in customer app use `STYLING_NAIL as const` but owner type doesn't include it |
| `requiresSpecialist`                             | Correct intent                            | Customer app uses snake_case `requires_specialist` — schema mismatch                                         |
| `isActive`, `sortOrder`                          | Correct                                   | None                                                                                                         |
| `questions: ServiceQuestion[]`                   | Correct structure                         | Customer app calls same array `service_questions` — naming mismatch                                          |
| **MISSING** `bufferBefore`                       | Not modeled                               | Required for scheduling — gap before next booking starts                                                     |
| **MISSING** `bufferAfter`                        | Not modeled                               | Required for scheduling — cleanup time after service                                                         |
| **MISSING** `maxConcurrentBookings`              | Not modeled                               | Some services can run in parallel (e.g. hair mask sit time), some cannot                                     |
| **MISSING** `requiresPrivateRoom`                | Not modeled                               | Massage, facial need dedicated room; haircut does not                                                        |
| **MISSING** `salonId`                            | Not on type                               | Same multi-tenant concern as Category                                                                        |

---

### ServiceQuestion

| Field       | Owner Type                     | Customer App Schema            | Status                                            |
| ----------- | ------------------------------ | ------------------------------ | ------------------------------------------------- |
| `id`        | `id: string`                   | `id: string`                   | OK                                                |
| `serviceId` | `serviceId: string`            | — (not on question object)     | OK — embedded differently                         |
| `label`     | `label: string`                | `question: string`             | **FIELD NAME DIVERGED**                           |
| `type`      | `'chips' \| 'photo' \| 'text'` | `'chips' \| 'photo'`           | **DIVERGED — 'text' type not in customer schema** |
| `required`  | `required: boolean`            | `required: boolean`            | OK                                                |
| `options`   | `options: string[]`            | `options: z.array(z.string())` | OK                                                |
| `sortOrder` | `sortOrder: number`            | — (not present)                | **MISSING in customer**                           |

**Summary**: Three divergences in `ServiceQuestion` alone. This is the highest-risk contract divergence in the domain.

---

### AddOnProduct

| Field                                | Current       | Risk                                                                            |
| ------------------------------------ | ------------- | ------------------------------------------------------------------------------- |
| `id`, `name`, `description`, `price` | Correct       | None                                                                            |
| `imageEmoji`                         | Fallback only | Works                                                                           |
| `imageUrl: string \| null`           | Correct       | Customer app `Product` schema does NOT have `imageUrl` — diverged               |
| `isActive`, `sortOrder`              | Correct       | None                                                                            |
| **MISSING** `quantity tracking`      | Not modeled   | Customer `SelectedAddon` has `quantity: number` — owner has no concept of stock |
| **MISSING** `salonId`                | Not on type   | Multi-tenant concern                                                            |
| **MISSING** `category / type flag`   | Not modeled   | See Section 4                                                                   |

---

### ServiceBundle

| Field                                      | Current                | Risk                                                         |
| ------------------------------------------ | ---------------------- | ------------------------------------------------------------ |
| `id`, `name`, `description`, `bundlePrice` | Correct                | None                                                         |
| `serviceIds: string[]`                     | Correct for basic case | Cannot model "1 service from category A + 1 from category B" |
| `isActive`                                 | Correct                | None                                                         |
| **MISSING** `sortOrder`                    | Not modeled            | Inconsistent with all other entities                         |
| **MISSING** `validFrom / validUntil`       | Not modeled            | Seasonal bundles, promo windows impossible                   |
| **MISSING** `maxRedemptions`               | Not modeled            | Limited-time offer slots impossible                          |
| **MISSING** `salonId`                      | Not on type            | Multi-tenant concern                                         |

---

## 2. Customer App Compatibility Review

### ServiceFlow enum — CRITICAL DIVERGENCE

Owner `services.types.ts`:

```ts
export type ServiceFlow = "STYLING_HAIR" | "STYLING_COLOUR" | "TREATMENT";
```

Customer `booking.types.ts`:

```ts
export const ServiceFlowSchema = z.enum([
  "STYLING_HAIR",
  "STYLING_COLOUR",
  "STYLING_NAIL", // <-- EXISTS in customer, MISSING in owner
  "TREATMENT",
]);
```

The customer app has 8 nail services (`svc-43` through `svc-50`) all typed as `'STYLING_NAIL' as const`. Owner type will reject these at compile time when the apps share types.

**Verdict**: Owner must add `'STYLING_NAIL'` to `ServiceFlow` before any type sharing.

---

### Field naming convention — DIVERGED

| Concept             | Owner (camelCase)    | Customer (snake_case in Zod) |
| ------------------- | -------------------- | ---------------------------- |
| Price type          | `priceType`          | `price_type`                 |
| Requires specialist | `requiresSpecialist` | `requires_specialist`        |
| Question array      | `questions`          | `service_questions`          |
| Question label      | `label`              | `question`                   |

This divergence is the result of the owner type being written without reference to the customer Zod schemas. When tRPC is introduced, the API layer will need to transform between the two. The cleaner fix is to align both to camelCase at the type level before the API layer is built.

---

### QuestionType — PARTIAL DIVERGENCE

Owner supports `'chips' | 'photo' | 'text'`. Customer Zod schema only accepts `'chips' | 'photo'`. The `'text'` type exists in the owner domain but would fail customer-side validation today.

This is low-risk now (mock data has no text questions) but will surface when a real question of type `text` is created in the owner dashboard and the customer app tries to render it.

---

### FormAnswers — HARDCODED, not driven by ServiceQuestion

Customer app has a hardcoded `FormAnswersSchema`:

```ts
export const FormAnswersSchema = z.object({
  hairLength,
  hairCutStyle, // Hair
  currentColour,
  targetColour,
  hairCondition, // Colour
  nailLength,
  nailShape, // Nail
  notes, // Shared
});
```

This is a completely static schema. `ServiceQuestion[]` from the owner domain is not used to drive these fields. The consultation questions UI in the booking flow is currently not connected to `ServiceQuestion` at all — it uses hardcoded form fields.

**Risk**: Any consultation questions created in owner dashboard → Services → Consultation Questions will have zero effect on the customer booking flow until `FormAnswers` is refactored to be dynamic. This is not a blocker for current phase but must be resolved before Services domain is considered production-ready.

---

### AddOnProduct vs Product — DIVERGED SCHEMA

| Field       | Owner `AddOnProduct` | Customer `Product`                         |
| ----------- | -------------------- | ------------------------------------------ |
| `imageUrl`  | `string \| null`     | **NOT PRESENT**                            |
| `isActive`  | `boolean`            | **NOT PRESENT** (filtered before exposure) |
| `sortOrder` | `number`             | **NOT PRESENT**                            |

The customer app strips these fields via `.map()` before exposing to the UI. When API integration happens, the API response should return `AddOnProduct` shape and the customer client performs the projection — this is fine. No fix needed now.

---

## 3. Scheduling Dependency Review

Every `ServiceItem` field that will affect scheduling, availability, and calendar logic:

### Currently modeled — will affect scheduling

| Field                | Impact                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `duration`           | Primary slot-blocking unit. A 120-min service blocks 2 hours of a stylist's calendar.                                          |
| `requiresSpecialist` | When true, slot availability is scoped to a specific stylist's calendar. When false, any available chair/technician can serve. |
| `serviceFlow`        | May determine which chair type is needed (colouring chair vs styling chair vs massage bed).                                    |

### Missing fields — required before scheduling engine

| Missing Field           | Type                                         | Purpose                                                                                                                                             |
| ----------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bufferBefore`          | `number` (minutes)                           | Setup time before appointment starts. Example: colour services need 5 min to prepare the mixing station.                                            |
| `bufferAfter`           | `number` (minutes)                           | Cleanup/processing time after service ends. Example: keratin treatment requires 30 min no-touch processing — chair is occupied but stylist is free. |
| `maxConcurrentBookings` | `number`                                     | How many of this service can run simultaneously. A salon with 3 massage beds can serve 3 clients at once.                                           |
| `requiresPrivateRoom`   | `boolean`                                    | Massage, facial, waxing need a private room. Haircut does not. Prevents room double-booking.                                                        |
| `resourceType`          | `'CHAIR' \| 'BED' \| 'ROOM' \| 'OPEN_FLOOR'` | What physical resource the service occupies. Needed for resource-based scheduling.                                                                  |

### Missing fields — desirable for scheduling V2

| Missing Field       | Type             | Purpose                                                                         |
| ------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `minAdvanceBooking` | `number` (hours) | Some services (perm, keratin) need 24h advance notice.                          |
| `maxAdvanceBooking` | `number` (days)  | How far in advance a customer can book.                                         |
| `operatingHours`    | override         | Some services only offered on certain days (e.g. bridal make up weekends only). |

**Summary**: Current `ServiceItem` has enough to show a catalog. It does not have enough to run a real availability engine. The minimum required before scheduling: `bufferBefore`, `bufferAfter`, `maxConcurrentBookings`, `requiresPrivateRoom`.

---

## 4. Add-on Review

### Current state

`AddOnProduct` is a single entity covering everything sold as an add-on during checkout. Looking at the mock data:

- `Makarizo Shampoo` — retail product (take-home)
- `L'Oreal Conditioner` — retail product (take-home)
- `Gatsby Pomade` — retail product (take-home)
- `TRESemmé Serum` — retail product (take-home)
- `Wella Hair Mask` — retail product (take-home)

All 5 current add-ons are retail take-home products. But a salon commonly offers two fundamentally different things during upsell:

**Type A — Retail Product**: Physical product sold to take home. Has stock levels, barcode/SKU, cost price, reorder point. Revenue category: product sales.

**Type B — Add-on Treatment**: An in-chair extra service added to the primary booking. Example: "add Olaplex treatment to your colour service for Rp 150,000." Has duration impact (adds time to appointment), uses a product but doesn't require stock management. Revenue category: service revenue.

### Are they the same entity?

**No. They should be separated.**

| Dimension                      | Retail Product      | Add-on Treatment             |
| ------------------------------ | ------------------- | ---------------------------- |
| Physical item to take home     | Yes                 | No                           |
| Adds time to appointment       | No                  | Yes                          |
| Affects slot availability      | No                  | Yes                          |
| Needs stock/inventory tracking | Yes                 | No                           |
| Revenue category               | Product sales       | Service revenue              |
| Discount rules                 | Inventory discounts | Service discounts            |
| Cost price needed (for margin) | Yes                 | No (already in service cost) |

### Recommendation

Split into two entities:

1. **`RetailProduct`** — take-home items. Fields: `id, salonId, name, description, sku, price, costPrice, stockQty, reorderPoint, imageUrl, imageEmoji, isActive, sortOrder`. Owned by Inventory domain (future).

2. **`AddOnTreatment`** — in-chair extras. Fields: `id, salonId, name, description, price, extraDuration, compatibleServiceIds[], imageEmoji, isActive, sortOrder`. Owned by Services domain (current domain).

**For Phase 5.5/5.6**: Keep `AddOnProduct` as-is. Do not split yet. Flag for Phase inventory domain. Add a `type: 'retail' | 'treatment'` discriminator field now so future migration has a clear path.

---

## 5. Bundle Review

### Current capability

```ts
interface ServiceBundle {
  id: string;
  name: string;
  description: string;
  serviceIds: string[]; // fixed list of service IDs
  bundlePrice: number; // fixed discount price
  isActive: boolean;
}
```

This models exactly one scenario: "these 3 services together cost Rp X instead of Rp Y."

### Future limitations

| Scenario                                | Supported? | Why Not                                                          |
| --------------------------------------- | ---------- | ---------------------------------------------------------------- |
| "Pick any 2 from category Hair"         | No         | `serviceIds` is fixed, not rule-based                            |
| "Bundle valid only in December"         | No         | No `validFrom / validUntil`                                      |
| "First 50 customers only"               | No         | No `maxRedemptions`                                              |
| "Add Rp 50K off if you add conditioner" | No         | No product-service cross-bundle                                  |
| "20% off instead of fixed price"        | No         | `bundlePrice` is absolute, no percentage discount                |
| "Buy hair spa, get 50% off next nail"   | No         | No cross-visit / loyalty bundle                                  |
| Booking-level promo code                | Partial    | `PromoCode` exists in customer but not linked to `ServiceBundle` |

### Current capability score: 1 of 6 scenarios

The current model handles the simplest bundle type (fixed service list + fixed price). It cannot support promotions, seasonal offers, or rule-based bundles.

### Recommended extension path

**Phase 1 (now — keep as-is)**: Fixed bundle, `serviceIds[]` + `bundlePrice`. Ship this.

**Phase 2 (before promotions)**: Add to `ServiceBundle`:

```ts
validFrom?: string;       // ISO date
validUntil?: string;      // ISO date
maxRedemptions?: number;  // null = unlimited
redemptionCount: number;  // tracked server-side
sortOrder: number;        // missing now
```

**Phase 3 (promotions engine)**: Introduce `Promotion` as a separate domain entity. Bundles reference a `promotionId`. Promotions have rule engines (percentage, category-based, cross-visit). This is out of scope for Services domain.

**Do not add these fields yet.** Document only.

---

## 6. Revenue & Reporting Dependency Review

### Target reports to support

| Report                     | Fields Required                                            | Status                                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Visit History              | `serviceId, serviceName, price, duration, date, stylistId` | `ServiceItem` has name + price + duration. `stylistId` comes from booking record. OK for basic.                                                        |
| Revenue Analytics          | `price, priceType, categoryId, date`                       | `ServiceItem` has these. Missing: `costPrice` for margin calculation.                                                                                  |
| Top Services               | `serviceId, serviceName, bookingCount`                     | Service catalog is ready. Booking count comes from bookings table aggregation. OK.                                                                     |
| Stylist Performance        | `stylistId, serviceId, price, duration`                    | `requiresSpecialist` is a flag but no `assignedStylistId` in booking model yet. Depends on Team Domain.                                                |
| Product Revenue            | `addonId, addonName, price, quantity, date`                | `AddOnProduct` has price. Missing: `quantity` (customer buys 2 shampoos). `SelectedAddon.quantity` exists in customer but not tracked in owner domain. |
| Gross Margin               | `price - costPrice`                                        | `costPrice` is missing from both `ServiceItem` and `AddOnProduct`.                                                                                     |
| Category Revenue Breakdown | `categoryId → revenue`                                     | `ServiceItem.categoryId` present. Works.                                                                                                               |

### Missing fields for revenue reporting

| Missing Field    | Entity                              | Impact                                                        |
| ---------------- | ----------------------------------- | ------------------------------------------------------------- |
| `costPrice`      | `ServiceItem`, `AddOnProduct`       | Cannot calculate service margin or product margin             |
| Addon `quantity` | `AddOnProduct` (via booking record) | Cannot calculate "3 shampoos sold" — only "shampoo was added" |
| `taxRate`        | `ServiceItem`                       | Cannot produce tax-inclusive receipts or tax reports          |
| `commissionRate` | `ServiceItem`                       | Cannot calculate stylist commission per service               |

These are not required for the Settings domain itself — they live in the booking record and reporting layer. But `costPrice` and `commissionRate` are owner-entered values that belong in Services domain settings.

---

## 7. Future Risks

### Risk 1 — CRITICAL: `STYLING_NAIL` missing from owner `ServiceFlow`

The owner type `ServiceFlow` does not include `'STYLING_NAIL'`. The customer app has 8 nail services using this value. If the codebase ever shares types (monorepo `packages/types`), this will cause TypeScript compile errors across 8 services.

**Action required before Team Domain**: Add `'STYLING_NAIL'` to `ServiceFlow` in `services.types.ts`.

---

### Risk 2 — HIGH: `ServiceQuestion` field name divergence

`label` (owner) vs `question` (customer). When the consultation question API is built, this will cause a serialization bug. Questions will render undefined labels in the customer app.

**Action required before API integration**: Align to `label` across both apps (owner definition should win, customer schema must update).

---

### Risk 3 — HIGH: `FormAnswers` is static, not driven by `ServiceQuestion`

The customer consultation step renders hardcoded fields (`hairLength`, `currentColour`, etc.) completely disconnected from the `ServiceQuestion[]` array in the owner domain. Owner-created questions have zero effect on the UI today.

This is a larger architectural refactor in the customer app — out of scope for Phase 5.5 — but must be tracked as a known gap.

---

### Risk 4 — MEDIUM: All entities missing `salonId`

`ServiceCategory`, `ServiceItem`, `AddOnProduct`, `ServiceBundle` all lack `salonId` at the type level. Multi-tenant isolation exists only at the DB query level. If any client-side filtering is needed, there's no way to verify ownership from the type alone.

---

### Risk 5 — MEDIUM: Scheduling metadata absent

No `bufferBefore`, `bufferAfter`, `requiresPrivateRoom`, `maxConcurrentBookings`. Any scheduling feature built without these will produce double-bookings or incorrect slot availability.

---

### Risk 6 — LOW: Add-on type conflation

Retail products and add-on treatments are one entity. This complicates inventory reporting, stock management, and appointment duration calculation. Low risk now; medium risk when inventory module is built.

---

### Risk 7 — LOW: `ServiceBundle.sortOrder` missing

Every other entity has `sortOrder`. Bundle does not. Will affect display ordering once bundles are used.

---

## 8. Recommended Improvements

Ordered by priority:

| #   | Action                                                                                                 | Priority | Effort             | When                                |
| --- | ------------------------------------------------------------------------------------------------------ | -------- | ------------------ | ----------------------------------- |
| 1   | Add `'STYLING_NAIL'` to `ServiceFlow` in `services.types.ts`                                           | CRITICAL | 1 line             | Before Phase 5.6                    |
| 2   | Rename `ServiceQuestion.label` alignment audit — confirm owner wins, customer must update              | HIGH     | Audit only now     | Before API layer                    |
| 3   | Add `'text'` type to customer `ServiceQuestionSchema`                                                  | HIGH     | 1 line in customer | Before API layer                    |
| 4   | Add `sortOrder` to `ServiceBundle`                                                                     | MEDIUM   | +1 field           | Phase 5.5 cleanup                   |
| 5   | Add `salonId` to all entity types                                                                      | MEDIUM   | +1 field each      | Before tRPC wiring                  |
| 6   | Add scheduling metadata: `bufferBefore`, `bufferAfter`, `maxConcurrentBookings`, `requiresPrivateRoom` | MEDIUM   | +4 fields          | Before scheduling engine (not now)  |
| 7   | Add `costPrice` to `ServiceItem` and `AddOnProduct`                                                    | MEDIUM   | +1 field each      | Before revenue reporting            |
| 8   | Add `type: 'retail' \| 'treatment'` discriminator to `AddOnProduct`                                    | LOW      | +1 field           | Phase inventory domain prep         |
| 9   | Add `validFrom`, `validUntil`, `maxRedemptions` to `ServiceBundle`                                     | LOW      | +3 fields          | Phase promotions engine             |
| 10  | Refactor customer `FormAnswers` to be dynamic from `ServiceQuestion[]`                                 | HIGH     | Large refactor     | Customer app, after API integration |

---

## Final Verdict

**GO WITH FIXES**

The Services Domain architecture is sound. The component tree, controller pattern, and data model are correct. However, three issues must be resolved before the domain is considered complete:

### Required before Phase 5.6 starts (1 fix, 1 minute)

- **Fix #1**: Add `'STYLING_NAIL'` to `ServiceFlow` in `services.types.ts`. This is a single line. Without it, the owner type is structurally wrong relative to the customer app.

### Required before API integration (not before Phase 5.6)

- **Fix #2**: Align `ServiceQuestion.label` vs `question` naming across both apps.
- **Fix #3**: Add `'text'` to customer `ServiceQuestionSchema.type`.
- **Fix #4**: Add `sortOrder` to `ServiceBundle`.

### Tracked risks (document, do not fix now)

- Scheduling metadata fields — defer to scheduling engine phase
- `costPrice` / `commissionRate` — defer to revenue reporting phase
- `AddOnProduct` type discriminator — defer to inventory domain
- Dynamic `FormAnswers` — large customer app refactor, defer to API integration phase

Phase 5.6 (Team Domain) can proceed after Fix #1 is applied.
