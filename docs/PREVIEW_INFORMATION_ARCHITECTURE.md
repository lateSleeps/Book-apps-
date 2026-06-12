# PREVIEW — Information Architecture

> Submodule of Settings → Booking App domain. Last updated: 2026-06-12.

---

## Answer: A or B?

**A. Embed the customer application.**

Rationale below. All structural decisions in this document follow from that choice.

---

## 1. User Goals

The owner opens Preview to answer three questions:

1. **"What does my booking page look like right now?"**
   A real render of the customer experience, not a wireframe or approximation.

2. **"Is my booking page ready to share?"**
   Surface blockers — missing payment method, no services, no stylists — before customers discover them.

3. **"What is my booking link?"**
   One-tap copy and share. The URL is the product.

These are read-only goals. Preview never edits settings. It reflects them.

---

## 2. Rationale: Embed (A) vs Rebuild (B)

### Option B — Rebuild customer screens inside owner app

Rebuild means maintaining two rendering paths for the same screens.

The risk is not the initial build cost. The risk is drift. Every change to a Step component in `apps/customer` — a new field, a layout fix, a new step in the flow — requires a parallel update in the owner app's rebuilt version. That second update will be forgotten. The preview will lie.

The rule states: **"Single source of truth: Customer App."**

A rebuilt preview cannot satisfy this rule. It is, by definition, a second source of truth.

### Option A — Embed the customer application

The customer app at `/book/[slug]` already renders the correct experience for any slug. The owner's salon has a slug. The preview iframe loads `{CUSTOMER_APP_URL}/book/{slug}?preview=true`.

Every customer app change is automatically reflected. No drift. No second rendering path.

The only required change to `apps/customer`: a `?preview=true` query param that:

- Disables form submissions (StepPayment `handleSubmit` does nothing)
- Shows a non-interactive "Pratinjau" banner
- Does not write to Supabase or Supabase Storage

This is a one-time, narrow addition to `apps/customer`. It does not change any UI. It only gates the side effects.

### Ownership boundary

```
apps/owner  → decides WHEN to show the preview, WHICH slug to load,
              and renders the health/link sections around the iframe

apps/customer → owns WHAT is rendered inside the preview
```

The owner app wraps. The customer app renders. This boundary is clear and permanent.

---

## 3. Page Structure

Preview is a section inside `BookingAppPageClient`, rendered below the existing three sections (Metode Pembayaran, Konfirmasi Booking, Kebijakan Salon).

It does not get its own settings route. It lives within `/dashboard/settings/booking`.

```
/dashboard/settings/booking
  ├── [Metode Pembayaran]          ← existing
  ├── [Konfirmasi Booking]         ← existing
  ├── [Kebijakan Salon]            ← existing
  └── [Preview Halaman Booking]    ← new section (this document)
        ├── Public Link section
        ├── Live Preview section
        └── Preview Health section
```

On mobile: sections stack vertically in that order.
On desktop: the preview panel pins to the right, matching the existing `SettingsPreviewPanel` pattern already used in the Brand domain.

---

## 4. Public Link Section

**Purpose:** Give the owner their booking URL in one action.

**Contents:**

```
┌─────────────────────────────────────────────────────┐
│  Link Booking Anda                                  │
│                                                     │
│  ┌──────────────────────────────────┐  [Salin]      │
│  │  firalink.id/book/rara-beauty    │  [Buka ↗]     │
│  └──────────────────────────────────┘               │
│                                                     │
│  Bagikan ke customer untuk mulai menerima booking.  │
└─────────────────────────────────────────────────────┘
```

**Data source:** `salon.slug` from the owner's authenticated session (already in `ctx.salonId` context). The URL is constructed at render time: `{NEXT_PUBLIC_CUSTOMER_URL}/book/{salon.slug}`.

**Actions:**

- **Salin** — copies full URL to clipboard, shows toast "Link disalin"
- **Buka** — opens in new tab (`target="_blank"`, `rel="noopener"`)

**Empty state:** If `salon.slug` is null or empty (should not happen post-onboarding), show: "Link belum tersedia. Hubungi support."

---

## 5. Live Preview Section

**Purpose:** Render the real customer booking experience inside the settings page.

**Implementation:** `<iframe>` pointing to `{CUSTOMER_APP_URL}/book/{slug}?preview=true`.

**Required change in `apps/customer`:** Read `?preview=true` from URL params in `book/[slug]/page.tsx`. When true:

- Pass `isPreview={true}` down to StepPayment — disables the `handleSubmit` function
- Render a fixed banner: "Pratinjau — booking tidak akan dikirim"
- No other behavioral change

**Iframe contract:**

| Property        | Value                                                 |
| --------------- | ----------------------------------------------------- |
| `src`           | `{CUSTOMER_APP_URL}/book/{slug}?preview=true`         |
| `width`         | 390px (iPhone 14 viewport width)                      |
| `height`        | 700px                                                 |
| `scrolling`     | auto                                                  |
| `title`         | "Pratinjau halaman booking"                           |
| Pointer events  | Enabled — owner can interact and navigate all 7 steps |
| Form submission | Disabled via `?preview=true`                          |

**Why 390px width:** The customer app is a mobile-first experience. The preview should render at mobile width to be representative. This also avoids iframe overflow issues inside the settings panel.

**What the owner sees:** All 7 steps of the booking flow, fully navigable, using their real data:

- StepServices: their actual categories and services from Supabase
- StepServiceDetail: their actual service_questions if configured
- StepStylist: their actual stylists; time slots as MOCK_SLOTS (same as real app)
- StepConfirm: booking summary with real prices
- StepContact: contact form + mock addon products (same as real app)
- StepPayment: their actual payment methods (QRIS/Transfer/Cash) based on Booking App settings
- StepTicket: shows "PREVIEW-0000" instead of a real confirmation code

This is not a simulation. This is the customer app. The owner is experiencing exactly what a customer will experience.

---

## 6. Preview Health Section

**Purpose:** Surface blockers before the owner shares their link.

**Render location:** Between the Public Link section and the Live Preview section (visible before scrolling to the iframe).

**Health checks and their sources:**

| Check                                  | Source                                 | Blocking?                                   |
| -------------------------------------- | -------------------------------------- | ------------------------------------------- |
| Minimal 1 layanan aktif                | `services` table count                 | Yes — customer sees empty StepServices      |
| Minimal 1 stylist aktif                | `stylists` table count                 | Yes — customer sees empty StepStylist       |
| Minimal 1 metode pembayaran aktif      | `bookingApp.paymentMethods`            | Yes — StepPayment has no options            |
| QRIS aktif tapi foto belum diupload    | `bookingApp.qrisImageUrl === null`     | Warning — customer sees warning icon        |
| Transfer aktif tapi belum ada rekening | `bookingApp.bankAccounts.length === 0` | Warning — customer sees no destination      |
| Jam operasional belum diisi            | `businessHours` count                  | Warning — no available dates in StepStylist |

**Display rules:**

- If all checks pass: show a single green row — "Halaman booking siap dibagikan"
- If any check is blocking: show a red banner above the iframe with count of issues
- Each issue links directly to the relevant settings section

**Data fetching:** These checks reuse data already fetched by existing settings controllers. No new API calls. Health checks are derived client-side from cached query results.

---

## 7. Empty States

### Salon has no services

```
[Icon: layers]
Belum ada layanan
Tambah layanan agar customer bisa memilih treatment.
[CTA: Ke Layanan →]
```

The iframe is still shown but will display the customer app's own empty state for StepServices.

### Salon has no stylists

```
[Icon: users]
Belum ada stylist
Tambah anggota tim agar booking bisa dilanjutkan.
[CTA: Ke Tim →]
```

### `salon.slug` cannot be resolved (edge case)

The iframe is not shown. Show:

```
[Icon: warning]
Link booking tidak tersedia
Hubungi support untuk mengaktifkan halaman booking Anda.
```

### iframe fails to load (network error, customer app down)

Show a fallback below the iframe:

```
Pratinjau tidak dapat dimuat. Buka link booking langsung:
[link]
```

---

## 8. Future Evolution Path

These are deferred. Do not implement now.

### Phase 2 — Branding reflected in preview

The customer app does not yet consume salon branding (logo, cover, tagline, colors). When `apps/customer` starts reading those fields from Supabase, the iframe preview will automatically reflect them. No change to the Preview module is required. This is the payoff of Option A.

### Phase 2 — Real-time preview refresh

When the owner saves a setting (e.g., enables QRIS), the iframe reloads to show the updated state. Implemented by listening to save events in `BookingAppPageClient` and calling `iframeRef.current.contentWindow.location.reload()`.

### Phase 2 — Step-specific deep links

"Preview pembayaran" button that loads the iframe starting at StepPayment:
`/book/{slug}?preview=true&step=payment`

Requires `apps/customer` to accept `?step=` as initial state.

### Phase 3 — Mobile share sheet

On mobile, the "Bagikan" action opens the native Web Share API with the booking URL and a default message in Indonesian.

### Phase 3 — QR code for link

Below the URL field, show a QR code image for the booking link. Owners can screenshot and share directly to WhatsApp.

---

## 9. Component Boundary Map

```
BookingAppPageClient (apps/owner)
  └── PreviewSection
        ├── PublicLinkCard
        │     ├── booking URL (derived from salon.slug)
        │     ├── CopyButton
        │     └── OpenButton
        ├── PreviewHealthCard
        │     └── HealthCheckRow[] (derived from existing ctrl data)
        └── PreviewIframeCard
              └── <iframe src="{CUSTOMER_URL}/book/{slug}?preview=true" />

apps/customer — book/[slug]/page.tsx
  └── reads ?preview=true
  └── passes isPreview down to StepPayment only
  └── renders PreviewBanner (fixed position, non-interactive)
```

The `PreviewSection` is a new component in `booking-app/`. It reads `salon.slug` from a new tRPC call or from the existing auth context. It does not duplicate any data already owned by Booking App settings.

`BookingPagePreview.tsx` (the existing component in `shared/preview/`) renders only the salon header. It remains as-is for use by the Brand domain's inline preview. It is not the Preview module described here.

---

## 10. Data Contract for Preview Section

```typescript
interface PreviewSectionProps {
  slug: string; // from salon context — never null at this point
  customerAppUrl: string; // from env: NEXT_PUBLIC_CUSTOMER_URL
  healthData: {
    serviceCount: number;
    stylistCount: number;
    paymentMethodCount: number;
    qrisActiveWithoutImage: boolean;
    transferActiveWithoutBank: boolean;
    businessHoursCount: number;
  };
}
```

`healthData` is derived from values already fetched by existing settings controllers — no new backend procedures required for Phase 1.
