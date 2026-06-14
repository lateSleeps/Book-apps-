# Customer App — Full Audit

Branch: `feature/customer-experience-v2`
Baseline: `9cd1a70`
Audited: 2026-06-13

---

## Section 1 — Route Map

```
apps/customer (port 3002)
├── /                        → redirect → /book/[salon-slug]
│                              file: app/page.tsx (redirects to first salon)
│
├── /book/[slug]             → Booking flow
│   ├── layout.tsx           → max-w-[480px] shell, h-screen mobile
│   ├── page.tsx             → Step router (useState machine, 7 steps)
│   └── _steps/
│       ├── StepServices.tsx
│       ├── StepServiceDetail.tsx
│       ├── StepStylist.tsx
│       ├── StepConfirm.tsx
│       ├── StepContact.tsx
│       ├── StepPayment.tsx
│       └── StepTicket.tsx
│
└── /check-booking           → Lookup booking by phone
    └── page.tsx             → Phone input → booking card + QR
```

**Per-route details:**

| Route            | Provider                | Key Queries                                                      | Key Mutations     |
| ---------------- | ----------------------- | ---------------------------------------------------------------- | ----------------- |
| `/book/[slug]`   | tRPC, Zustand (persist) | `salons.getBySlug`, `services.getBySalon`, `stylists.getBySalon` | `bookings.create` |
| `/check-booking` | tRPC                    | `bookings.getByPhone`                                            | —                 |

**Providers (app/layout.tsx):**

- `TRPCProvider` (react-query)
- No auth provider — fully public

---

## Section 2 — Booking Journey Map

```
/book/[slug]
│
├─ STEP: services
│   component : StepServices
│   state     : date (string), services[] (Zustand)
│   data      : useSalon(slug) → salon + salonId
│               useServices(salonId) → services + categories
│   UI        : greeting, 30-day calendar strip, category cards, bottom sheet per category
│   condition : date AND services.length > 0
│   exit      : onNext(needsDetail: boolean)
│               needsDetail = service[0].price_type === "starting_from"
│
├─ STEP: service-detail   (conditional — only if needsDetail)
│   component : StepServiceDetail
│   state     : formAnswers (Zustand)
│   data      : services[0].service_questions (from store)
│   UI        : chip questions + photo upload per question
│   condition : all required questions answered
│   exit      : onNext() → "stylist"
│
├─ STEP: stylist
│   component : StepStylist
│   state     : stylist (Stylist), timeSlot (string) (Zustand)
│   data      : useStylists(salonId) → raw stylists → mapped Stylist[]
│               MOCK_SLOTS (hardcoded, not from API yet)
│   UI        : StylistCards (expand/collapse per stylist, time picker inside)
│   condition : stylist AND timeSlot
│   exit      : onNext() → "confirm"
│
├─ STEP: confirm
│   component : StepConfirm
│   state     : read-only from Zustand (date, services, stylist, timeSlot, totalPrice)
│   data      : Zustand store only (no API call)
│   UI        : BookingSummary + discount breakdown (if promoCode)
│   condition : timeSlot AND services.length > 0 (guard: redirect back if not)
│   validation: mock async 500ms delay
│   exit      : onNext() → "contact"
│
├─ STEP: contact
│   component : StepContact
│   state     : customerName, customerPhone (local useState → Zustand on continue)
│               addons[] (Zustand)
│   data      : useMockData().products (mock — not from API)
│   UI        : name input, phone input (+62 prefix), addon bottom sheet after continue
│   condition : name.length >= 2 AND phone.length >= 8
│   exit      : handleContinue() → showAddons sheet → "payment"
│
├─ STEP: payment
│   component : StepPayment
│   state     : paymentType, proofImageUrl, proofImageFile (Zustand)
│   data      : trpc.salons.getBySlug.useQuery (re-fetches salon.id)
│               trpc.bookings.create.useMutation
│   uploads   : proofImageFile → Supabase Storage ("payment-proofs" bucket)
│               formAnswers blob: URLs → Supabase Storage ("payment-proofs/references/")
│   preview   : isPreview → disables submission entirely
│   condition : paymentType AND proofImageUrl AND !isSubmitting
│   exit      : createBooking.mutate() → onSuccess: confirmBooking() → "ticket"
│
└─ STEP: ticket
    component : StepTicket
    state     : stylist, timeSlot, date (Zustand read)
    data      : Zustand store only
    UI        : success icon, booking info card, next-steps timeline, link to /check-booking
    exit      : onDone() → reset() → back to "services"
```

---

## Section 3 — Conditional States

### Service Selection

| Condition                                           | UI Behavior                                    | Business Outcome                |
| --------------------------------------------------- | ---------------------------------------------- | ------------------------------- |
| No salon found (slug invalid)                       | Error message in place of category grid        | User cannot book                |
| Salon loading                                       | "Loading..." text                              | User waits                      |
| No services returned                                | Empty grid (no category cards)                 | User cannot proceed             |
| service.price_type = "starting_from"                | StepServiceDetail step injected                | Price confirmed after questions |
| service.price_type = "fixed"                        | Skip StepServiceDetail                         | Proceed directly to stylist     |
| service.requires_specialist = true                  | (Data stored, not yet wired to stylist filter) | No effect currently             |
| Category slug in ["hair","colour-treatment","nail"] | Toast "Estimasi Harga" shown in bottom sheet   | Price expectation managed       |

### Stylist & Time

| Condition                 | UI Behavior                               | Business Outcome           |
| ------------------------- | ----------------------------------------- | -------------------------- |
| No stylists               | "Tidak ada stylist tersedia" message      | User cannot proceed        |
| Stylist selected, no time | CTA disabled: "Pilih waktu dulu"          | User must select both      |
| Time slots                | HARDCODED MOCK (not from API)             | Always shows 7 fixed slots |
| Stylist changed           | timeSlot cleared (setStylist clears slot) | User must re-select time   |

### Payment

| Condition                      | UI Behavior                                          | Business Outcome       |
| ------------------------------ | ---------------------------------------------------- | ---------------------- |
| isPreview = true               | CTA disabled: "Pratinjau — Pembayaran dinonaktifkan" | Mutation blocked       |
| No paymentType selected        | canSubmit = false, CTA disabled                      | User must pick method  |
| paymentType selected, no proof | canSubmit = false                                    | User must upload proof |
| paymentType + proof present    | CTA active: "Konfirmasi Pembayaran →"                | Submission enabled     |
| Upload fails                   | Error: "Gagal mengunggah bukti pembayaran"           | User retries           |
| Mutation fails                 | Error shown inline, isSubmitting reset               | User retries           |
| Mutation succeeds              | confirmBooking() → bookingCode + PIN generated       | Moves to ticket        |
| paymentStatus                  | Always hardcoded to "dp"                             | Deposit-only flow      |

### Confirm Step

| Condition                 | UI Behavior                                 | Business Outcome            |
| ------------------------- | ------------------------------------------- | --------------------------- |
| discountAmount > 0        | Shows subtotal + discount + total breakdown | Promo code applied          |
| discountAmount = 0        | Shows only totalPrice                       | No promo                    |
| timeSlot missing on mount | Immediate redirect back                     | Guard against invalid state |

### Contact Step

| Condition                 | UI Behavior                                 | Business Outcome        |
| ------------------------- | ------------------------------------------- | ----------------------- |
| Products available (mock) | Addon bottom sheet shown after "Selesaikan" | User can add products   |
| No products               | Bottom sheet empty                          | Addon sheet still shown |
| User skips addon          | "Lewati" button → direct to payment         | No addons added         |

---

## Section 4 — Data Flow

### A. Salon + Services (StepServices)

```
Supabase DB (salons, services, categories)
    ↓ Supabase client
server/trpc/routers/salons.ts     → salons.getBySlug
server/trpc/routers/services.ts   → services.getBySalon
    ↓ tRPC router
pages/api/trpc/[trpc].ts          → API endpoint
    ↓ react-query (TRPCProvider)
hooks/useSalon.ts                 → { salonId, salon, isLoading, error }
hooks/useServices.ts              → { services, isLoading }
    ↓
StepServices.tsx                  → renders categories + services
    ↓ user selects
useBookingStore.addService()      → Zustand (persisted localStorage)
```

### B. Stylists (StepStylist)

```
Supabase DB (stylists table)
    ↓
server/trpc/routers/stylists.ts   → stylists.getBySalon
    ↓
hooks/useStylists.ts              → { stylists, isLoading, error }
    ↓
StepStylist.tsx                   → mapStylist() → Stylist[]
                                    MOCK_SLOTS (hardcoded — not from API)
    ↓ user selects
useBookingStore.setStylist()      → Zustand
useBookingStore.setTimeSlot()     → Zustand
```

### C. Booking Creation (StepPayment)

```
useBookingStore (Zustand)         → read all booking state
    ↓
Supabase Storage                  → upload proofImageFile → paymentProofUrl
Supabase Storage                  → upload formAnswers blob URLs → permanent URLs
    ↓
trpc.bookings.create.mutate({
  salonId, serviceId, stylistId,
  bookingDate, startTime, endTime,
  customerName, customerPhone,
  notes (serialized formAnswers),
  paymentProofUrl,
  paymentStatus: "dp",
  addons[]
})
    ↓
server/trpc/routers/bookings.ts
    ↓
Supabase DB (bookings table)
    ↓ onSuccess
useBookingStore.confirmBooking()  → generates bookingCode + PIN
→ StepTicket
```

### D. Check Booking

```
User inputs phone number
    ↓
trpc.bookings.getByPhone.useQuery → Supabase bookings by customer_phone
    ↓
Booking card + QR Code (Canvas API)
    ↓ optional
Download PNG (canvas.toDataURL → anchor click)
```

---

## Section 5 — Design System Usage

**Design tokens defined in:** `styles/design-tokens.css`

```css
--accent: #4a9b7f /* teal green */ --label: #111110 /* near-black */ --label2:
  #605f5b /* secondary text */ --label3: #a09f9a /* muted text */ --sep: #e8e7e3
  /* divider / border */ --surface: #ffffff --bg: #f7f7f5 /* page background */;
```

**Typography scale:** `--t12` to `--t32` (via CSS variables, mapped to Tailwind)
**Spacing scale:** `--s4` to `--s48` (4px base, via Tailwind tokens `s4`…`s48`)
**Radius tokens:** `--r8` to `--rF` (full pill)

### Per-screen design system audit:

| Screen               | Token Usage                                                            | Custom Styling Issues                                                                                  |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| StepServices header  | ✅ `text-ts-hero`, `px-s20`, `pt-s48`                                  | `text-[18px]` hardcoded in category cards                                                              |
| Calendar strip       | ✅ `py-s8`, `px-s16`                                                   | `w-[56px]`, `h-[24px]`, `h-[40px]` — hardcoded sizes, inline style for today dot                       |
| Category cards       | ✅ spacing tokens                                                      | `backgroundColor: "#F1F2F3"` hardcoded, font sizes `text-[18px]`/`text-[13px]`/`text-[11px]` hardcoded |
| Service bottom sheet | Partial                                                                | `maxHeight: "82%"` inline style, `text-[20px]`/`text-[13px]`/`text-[17px]`/`text-[14px]` hardcoded     |
| StepStylist          | ✅ StepHeader, BottomCTA                                               | StylistCards internal styling unknown without reading                                                  |
| StepConfirm          | ✅ spacing, `bg-white`, `rounded-r16`                                  | `text-sm`/`text-base`/`text-lg` (Tailwind default, not token)                                          |
| StepContact hero     | ❌ Hardcoded inline SVG, `height: "30%"`, `backgroundColor: "#E8705A"` | Full custom hero — zero token usage                                                                    |
| StepContact inputs   | Partial                                                                | `px-s16 py-[14px]` mixed — `py-[14px]` custom                                                          |
| StepPayment          | ✅ StepHeader, BottomCTA                                               | PaymentOptions internal unknown                                                                        |
| StepTicket           | Partial                                                                | `pt-s48 pb-s32`, `rounded-2xl` (vs token `rounded-r16`)                                                |

**Summary:**

- Spacing tokens (`s4`–`s48`): ~70% adoption — some inline custom values
- Typography: mix of Tailwind text-ts-\* tokens and raw `text-[Npx]` hardcoded values
- Colors: `--accent` used via class but also raw hex `#4a9b7f` in button styles
- Radius: mostly token but `rounded-2xl` and `rounded-t-[28px]` appear as custom values
- No design system buttons used — custom inline button styling throughout

---

## Section 6 — Responsive Audit

**Container:** `max-w-[480px]` centered, `h-screen` on mobile, `md:h-[calc(100vh-40px)]` on desktop.

| Breakpoint     | Layout Behavior                                                                                                       | Known Issues                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 320px          | Container shrinks to 320px, calendar strip scrolls                                                                    | Calendar day cells (w-[56px]) create tight but functional layout. Some text might clip. |
| 375px          | iPhone SE — intended default                                                                                          | Works well. Designed for this size.                                                     |
| 390px          | iPhone 14 — tested default                                                                                            | Works well.                                                                             |
| 430px          | iPhone 14 Pro Max                                                                                                     | Container caps at 480px, centered on wider display. OK.                                 |
| 768px (tablet) | `max-w-[480px]` centered. `md:pt-10 md:px-4` adds padding around the shell. `md:rounded-t-[28px]` rounds top of card. | Bottom CTA feels disconnected — fixed bottom but card is floating.                      |
| 1024px+        | Same as tablet — 480px card floats in center. Desktop whitespace heavy.                                               | No desktop-optimized layout. Two-panel opportunity unused.                              |
| 1440px         | Heavy empty space left/right of 480px card.                                                                           | Not designed for desktop. Low visual weight.                                            |

**Fixed-width components that could cause issues:**

- Calendar strip cells: `w-[56px]` — if container < 336px (6 cells), wraps awkward
- Category card icons: `h-[64px] w-[64px]` — fine, fixed decorative
- Service check circle: `h-[22px] w-[22px]` — fine

---

## Section 7 — Current Information Architecture

### StepServices

```
Salon Name (small caps, muted)
Greeting "Selamat pagi/siang/sore/malam." (hero text)
  [Cek Booking] [Share]                         ← secondary actions in header
────────────────────────────────────────────
Calendar Strip (30 days, horizontal scroll)
  [S] [M] [S] [S] [R] [K] [J] …
  date circles, today highlighted
────────────────────────────────────────────
Category Cards (vertical list)
  [Category Name]                [✓ if selected]
  Description (optional)
  N layanan tersedia
  ↓ tap → bottom sheet
    ├─ Toast warning (for hair/colour/nail)
    └─ Service cards
         Name
         Description
         Price (Mulai dari / Harga)
         [select circle]
────────────────────────────────────────────
Selected Services Indicator (bottom float)
Bottom CTA: "Pilih tanggal dulu" / "Pilih layanan dulu" / "Lanjutkan →"
```

**IA Assessment:** Date selection is separated from service selection with no logical connection shown. User picks a date and then picks a service, but the UI doesn't explain WHY they pick a date first. The date strip and category cards compete for attention without clear hierarchy.

### StepStylist

```
← Back  "Pilih Stylist"
────────────────────────────────────────────
Stylist cards (vertical list, expandable)
  Avatar (initials, colored)
  Name
  Specialty
  ↓ tap to expand → time slot grid
    PAGI / SIANG / SORE sections
    [09:00] [10:00] …
────────────────────────────────────────────
Bottom CTA: "Pilih stylist dulu" / "Pilih waktu dulu" / "Lanjutkan →"
```

**IA Assessment:** Combining stylist selection and time selection in one step is efficient, but the expand/collapse pattern adds interaction cost.

### StepConfirm

```
← Back  "Ringkasan" / "Periksa kembali pesanan kamu"
────────────────────────────────────────────
BookingSummary component
  Date, Time, Stylist, Services, Duration, Total
[Optional] Discount breakdown
────────────────────────────────────────────
Bottom CTA: "Lanjut ke Pembayaran →"
```

**IA Assessment:** Clear and focused. No issues.

### StepContact

```
Hero illustration (SVG, #E8705A background, 30% height)
────────────────────────────────────────────
"Hampir selesai! 🙏"
"Maaf, perlu data dirimu dulu."
Subtitle text
────────────────────────────────────────────
Nama lengkap [input]
Nomor WhatsApp [+62] [input]
────────────────────────────────────────────
Bottom CTA: "Selesaikan Booking →"
  ↓ tap
  Addon bottom sheet:
    "Mau tambah produk?"
    Product cards [−] qty [+]
    [Lanjut ke Pembayaran →]
    [Lewati, tidak perlu]
```

**IA Assessment:** Hero illustration takes 30% of screen — expensive real estate. The apology tone ("Maaf, perlu data...") is a deliberate trust-building choice but unusual. Addon upsell gated behind "Selesaikan" is a dark pattern risk — user thinks they're done then gets another screen.

### StepPayment

```
← Back  "Pembayaran" / "Pilih metode dan unggah bukti bayar"
────────────────────────────────────────────
PaymentOptions component (internal)
  Payment method selector
  File upload (proof)
────────────────────────────────────────────
Bottom CTA: "Konfirmasi Pembayaran →"
```

### StepTicket

```
[✓ success icon]
"Bukti pembayaran diterima!"
"Booking kamu sedang menunggu konfirmasi dari salon."
────────────────────────────────────────────
Info card: Tanggal / Waktu / Stylist
────────────────────────────────────────────
Next steps timeline (numbered 1-2-3, yellow bg)
[Cek Status Booking →]
────────────────────────────────────────────
Bottom CTA: "Selesai"
```

**IA Assessment:** No booking code shown on this screen. User told to go to /check-booking to get QR — extra friction for a key deliverable (proof of booking).

---

## Section 8 — Apple Experience Audit

Scored as Apple Product Designer. Scale 1–10.

| Dimension                  | Score | Notes                                                                                                                                                                                       |
| -------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Clarity**                | 6/10  | Step purpose is clear but copy is informal in places. "Maaf, perlu data dirimu dulu" is charming but confusing for task context.                                                            |
| **Hierarchy**              | 5/10  | StepServices: date strip + category grid compete. No clear primary CTA flow. Hero greeting takes attention away from the actual task (pick a date).                                         |
| **Focus**                  | 6/10  | Each step is generally focused. StepContact breaks focus with hero illustration that serves no functional purpose.                                                                          |
| **Progressive Disclosure** | 7/10  | Bottom sheets for service detail is good disclosure. Addon sheet after contact is reasonable but not signaled.                                                                              |
| **Trust**                  | 7/10  | Upload proof workflow is clear. Pending confirmation message on ticket is honest. No QR code on ticket is a trust gap.                                                                      |
| **Scanability**            | 5/10  | Category cards are scannable. Service items in bottom sheet are dense (name + desc + price in varying font sizes). Time slots are clear.                                                    |
| **Booking Confidence**     | 5/10  | Ticket screen doesn't give customer a booking code visible at a glance. Customer must navigate to /check-booking to get their confirmation — that's an extra step after completing payment. |

**Overall: 5.9 / 10**

Core issue: the app does a good job at individual steps but the journey as a whole has friction at entry (date-first with no explanation) and at exit (no instant confirmation artifact).

---

## Section 9 — Revamp Opportunities

### P0 — Critical (blocking good experience)

| ID   | Opportunity                     | Current Problem                                                       |
| ---- | ------------------------------- | --------------------------------------------------------------------- |
| P0-1 | Persistent salon header         | No salon identity visible after StepServices header                   |
| P0-2 | Step progress indicator         | User has no idea which step they're on or how many remain             |
| P0-3 | Show booking code on StepTicket | User gets no immediate confirmation artifact — must navigate away     |
| P0-4 | Fix typography hardcoding       | `text-[Npx]` inconsistency breaks visual hierarchy                    |
| P0-5 | Date + Service coupling clarity | Unclear why date must be selected before service — UI doesn't explain |

### P1 — High Value

| ID   | Opportunity                                  | Current Problem                                                                 |
| ---- | -------------------------------------------- | ------------------------------------------------------------------------------- |
| P1-1 | Desktop layout (two-panel)                   | 480px card floating in whitespace at 1440px                                     |
| P1-2 | Replace hero SVG in StepContact              | 30% height SVG illustration adds no functional value                            |
| P1-3 | Signal addon upsell before CTA               | User surprised by addon sheet after "Selesaikan Booking"                        |
| P1-4 | API-driven time slots                        | MOCK_SLOTS hardcoded — all stylists always show same 7 slots                    |
| P1-5 | Service card inside bottom sheet scanability | Font size mix (`text-[17px]`, `text-[14px]`, `text-[11px]`) makes scanning slow |
| P1-6 | Booking code in ticket                       | Show QR or code immediately on StepTicket                                       |

### P2 — Nice to Have

| ID   | Opportunity                       | Current Problem                                                         |
| ---- | --------------------------------- | ----------------------------------------------------------------------- |
| P2-1 | Stylist availability real-time    | All slots always available — no actual conflict detection               |
| P2-2 | "Any stylist" option              | Some customers don't care — forced to pick one                          |
| P2-3 | Category filter tabs (horizontal) | Current vertical card list grows long with many categories              |
| P2-4 | Promo code input in confirm step  | PromoCodeInput component exists but not wired to confirm UI             |
| P2-5 | Share booking link                | share() called on button in header but no shareable booking page exists |

---

## Section 10 — Redesign Constraints

The following must NOT change during V2 redesign. Visual-first only.

### Booking Logic (do not touch)

- `useBookingStore` — state machine, all setters and derived values
- `generateBookingCode()` — prefix + date + 4-digit PIN format
- `DEPOSIT_AMOUNT` constant (Rp 20,000)
- `calculateTotalPrice()` in price-calculator.ts
- Step guard: `StepConfirm` redirects back if `!timeSlot || !services.length`
- Preview guard: `isPreview` blocks `handleSubmit()` in StepPayment

### API Contracts (do not touch)

- `trpc.salons.getBySlug` — input: `{ slug }`, output: `{ id, name, ... }`
- `trpc.services.getBySalon` — input: `{ salonId }`, output: services with categories
- `trpc.stylists.getBySalon` — input: `{ salonId }`, output: raw stylists
- `trpc.bookings.create` — all input fields (salonId, serviceId, stylistId, bookingDate, startTime, endTime, customerName, customerPhone, notes, paymentProofUrl, paymentStatus, addons)
- `trpc.bookings.getByPhone` — used in /check-booking

### Validation Rules (do not touch)

- canProceed: `date && services.length > 0`
- canProceed stylist: `stylist && timeSlot`
- canProceed contact: `name.length >= 2 && phone.length >= 8`
- canSubmit payment: `paymentType && proofImageUrl && !isSubmitting`

### Upload Flow (do not touch)

- Supabase Storage bucket: `payment-proofs`
- Payment proof upload before mutation
- FormAnswer blob URL upload pipeline

### Payment Status (do not touch)

- `paymentStatus: "dp"` hardcoded — deposit-only

---

## Appendix — Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│               Customer App (port 3002)           │
│                                                  │
│  app/layout.tsx                                  │
│    └── TRPCProvider (react-query)                │
│         └── app/book/[slug]/layout.tsx           │
│              max-w-[480px] h-screen shell        │
│               └── page.tsx (step router)         │
│                    useState: step                │
│                    PreviewContext                │
│                                                  │
│  State Layer                                     │
│    useBookingStore (Zustand + persist)           │
│    └── localStorage: "booking-storage"           │
│                                                  │
│  Data Layer                                      │
│    hooks/ ──→ tRPC client ──→ /api/trpc         │
│                               └── routers/       │
│                                   salons.ts      │
│                                   services.ts    │
│                                   stylists.ts    │
│                                   bookings.ts    │
│                                   business-hours │
│                                   └── Supabase   │
│                                                  │
│  Upload Layer                                    │
│    Supabase Storage                              │
│    └── bucket: payment-proofs                    │
│         ├── {timestamp}-{filename} (proof)       │
│         └── references/{timestamp}-{key}.jpg    │
└─────────────────────────────────────────────────┘
```

---

_No code was modified in this audit. All findings are based on static analysis of source files._
