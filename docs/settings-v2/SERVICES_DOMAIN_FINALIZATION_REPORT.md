# Services Domain Finalization Report

> Phase 5.5B | Date: 2026-06-08
> Scope: Blocker fix + scheduling documentation

---

## 1. Blocker Fix Verification

### Fix applied: `STYLING_NAIL` added to `ServiceFlow`

**File**: `apps/owner/src/features/dashboard/components/settings/types/services.types.ts`

**Before**:

```ts
export type ServiceFlow = "STYLING_HAIR" | "STYLING_COLOUR" | "TREATMENT";
```

**After**:

```ts
/**
 * Drives customer booking flow routing:
 * - STYLING_HAIR   -> stylist selection step, hair consultation
 * - STYLING_COLOUR -> stylist selection step, colour consultation
 * - STYLING_NAIL   -> nail technician step, nail consultation
 * - TREATMENT      -> no specialist required by default (facial, massage, etc.)
 */
export type ServiceFlow =
  | "STYLING_HAIR"
  | "STYLING_COLOUR"
  | "STYLING_NAIL"
  | "TREATMENT";
```

### Verification checklist

| Check                                                                           | Result                                                                            |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Owner `ServiceFlow` type now includes all 4 values                              | PASS                                                                              |
| Customer `ServiceFlowSchema` (Zod) includes `'STYLING_NAIL'`                    | PASS — was already correct                                                        |
| `salon-shared-mock.ts` — 8 nail services use `'STYLING_NAIL'` (untyped strings) | PASS — no type annotation, will resolve correctly                                 |
| Customer `use-mock-data.ts` — 8 nail services use `'STYLING_NAIL' as const`     | PASS — customer Zod schema already accepted this                                  |
| No exhaustive `switch (serviceFlow)` in owner app                               | PASS — grep found zero switch statements on `serviceFlow`                         |
| `packages/types` shared enum                                                    | NOT AFFECTED — uses stale `STANDARD/EXPRESS/PREMIUM` enum, neither app imports it |

---

## 2. ServiceFlow Inventory

Complete inventory of all 50 services across both apps, mapped to their `serviceFlow` value.

### `STYLING_HAIR` — 9 services (cat-1 Hair)

| ID    | Name                       |
| ----- | -------------------------- |
| svc-1 | Ladies Haircut + Wash      |
| svc-2 | Men Haircut + Wash + Dry   |
| svc-3 | Hair Trim (Incl. Wash)     |
| svc-4 | Fringe Trim                |
| svc-5 | Beard Trim                 |
| svc-6 | Ladies Hair Wash + Styling |
| svc-7 | Hair Braiding Simple       |
| svc-8 | Full Braiding              |
| svc-9 | Balinese Creambath         |

### `STYLING_COLOUR` — 14 services (cat-2 Colour & Treatment)

| ID     | Name                                |
| ------ | ----------------------------------- |
| svc-10 | Root Colour                         |
| svc-11 | Basic Full Colour                   |
| svc-12 | Balayage _(inactive)_               |
| svc-13 | Full Highlight                      |
| svc-14 | Money Piece                         |
| svc-15 | Bleaching                           |
| svc-16 | Keratin Hair Treatment _(inactive)_ |
| svc-17 | Smoothing Treatment                 |
| svc-18 | Classic Perm                        |
| svc-19 | Hair Spa (Short)                    |
| svc-20 | Hair Spa (Medium-Long)              |
| svc-21 | Hair Mask (Short)                   |
| svc-22 | Hair Mask (Medium-Long)             |
| svc-23 | Ice Scrub Scalp Ritual              |

### `TREATMENT` — 19 services (cat-3 Face & Lashes, cat-4 Massage)

| ID     | Name                                |
| ------ | ----------------------------------- |
| svc-24 | Classic Facial                      |
| svc-25 | Facial Detox                        |
| svc-26 | Totok Wajah                         |
| svc-27 | Make Up                             |
| svc-28 | Make Up + Hair Do                   |
| svc-29 | Natural Lash Extensions             |
| svc-30 | Volume Lash Extensions _(inactive)_ |
| svc-31 | Lash Lift + Tint                    |
| svc-32 | Eyebrow Tint + Shaping              |
| svc-33 | Refill Lash Extensions              |
| svc-34 | Full Body Massage                   |
| svc-35 | Full Body Massage + Scrub           |
| svc-36 | Stone Massage _(inactive)_          |
| svc-37 | Reflexology (30 min)                |
| svc-38 | Reflexology (60 min)                |
| svc-39 | Back Massage (30 min)               |
| svc-40 | Head Massage                        |
| svc-41 | Body Scrub                          |
| svc-42 | Ear Candle                          |

### `STYLING_NAIL` — 8 services (cat-5 Nail) — previously missing from owner type

| ID     | Name                   |
| ------ | ---------------------- |
| svc-43 | Manicure Express       |
| svc-44 | Manicure Spa           |
| svc-45 | Pedicure Express       |
| svc-46 | Signature Pedicure Spa |
| svc-47 | Pedicure Spa Gel       |
| svc-48 | Nail Art               |
| svc-49 | Basic Gel Polish       |
| svc-50 | Gel Removal            |

**Total: 50 services across 4 flows. All now representable in owner `ServiceFlow` type.**

---

## 3. Future Scheduling Contract

Documented in `docs/settings-v2/services-database-contract.md` under **Future Scheduling Metadata**.

### Fields to add to `ServiceItem` when scheduling engine is built

| Field                   | Type           | Default | Notes                                          |
| ----------------------- | -------------- | ------- | ---------------------------------------------- |
| `bufferBefore`          | `number` (min) | `0`     | Setup/prep time before client arrival          |
| `bufferAfter`           | `number` (min) | `0`     | Cleanup/processing time after service ends     |
| `maxConcurrentBookings` | `number`       | `1`     | Parallel capacity for this service             |
| `requiresPrivateRoom`   | `boolean`      | `false` | Massage/facial rooms need explicit reservation |

### Slot calculation contract (future)

```
effective slot = bufferBefore + duration + bufferAfter
```

### `ServiceFlow` → scheduling behaviour

| ServiceFlow      | Stylist Required         | Private Room Default      |
| ---------------- | ------------------------ | ------------------------- |
| `STYLING_HAIR`   | Per `requiresSpecialist` | No                        |
| `STYLING_COLOUR` | Always yes               | No                        |
| `STYLING_NAIL`   | Per `requiresSpecialist` | No                        |
| `TREATMENT`      | Per `requiresSpecialist` | Per `requiresPrivateRoom` |

**Status**: Documented only. No fields added to `ServiceItem`. No migration SQL executed. Implementation deferred to scheduling engine phase.

---

## 4. Final Readiness Decision

### Blocker status

| Blocker                                   | Status |
| ----------------------------------------- | ------ |
| `STYLING_NAIL` missing from `ServiceFlow` | FIXED  |

### Known gaps (not blockers for Team Domain)

| Gap                                                         | Deferred To                     |
| ----------------------------------------------------------- | ------------------------------- |
| `ServiceQuestion.label` vs `question` naming                | API integration phase           |
| `'text'` type missing from customer `ServiceQuestionSchema` | API integration phase           |
| `ServiceBundle.sortOrder` missing                           | Phase cleanup pass              |
| Scheduling metadata fields                                  | Scheduling engine phase         |
| `costPrice` for margin reporting                            | Revenue reporting phase         |
| `AddOnProduct` type discriminator (`retail` vs `treatment`) | Inventory domain phase          |
| `salonId` on all entity types                               | tRPC wiring phase               |
| Dynamic `FormAnswers` driven by `ServiceQuestion[]`         | Customer app refactor, post-API |

None of these gaps affect Team Domain implementation. Team Domain depends on `ServiceItem.requiresSpecialist` and `ServiceFlow` — both are now correct.

---

## READY FOR TEAM DOMAIN

Services Domain is structurally complete and internally consistent. The only compile-time blocker (`STYLING_NAIL`) is resolved. All remaining gaps are documented with explicit deferral phases and do not affect Phase 5.6 (Team Domain) development.

**Next**: Phase 5.6 — Team Domain.
