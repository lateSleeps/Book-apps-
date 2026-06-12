# PREVIEW — Wireframe

> Settings > Booking App > Preview section. Last updated: 2026-06-12.

---

## UX Decisions (Challenges Answered First)

### Challenge 1 — Desktop or mobile sized iframe?

**Mobile (390px width). Fixed.**

The customer app is a mobile-first product. It has no desktop layout. Rendering it at desktop width would show a stretched, broken layout that no customer ever sees. The preview exists to answer "what does MY customer see?" That customer is on a phone.

A 390px iframe inside the owner's desktop settings panel is the only honest answer.

### Challenge 2 — Health above or beside preview?

**Health above preview, full width.**

Health is a blocking concern. If the salon has no services, the preview will show an empty screen — the owner needs to understand why before looking at the iframe. Health must be read before the preview, not alongside it.

"Beside" would split attention. "Above" creates a clear read-order: status first, then see what customers see.

### Challenge 3 — Default to landing page or last visited step?

**Always default to StepServices (the entry point).**

Rationale: The owner is previewing what a _new_ customer experiences when they open the link for the first time. That is always StepServices. There is no persistent step state between sessions.

"Last visited step" creates confusion — the owner edits payment settings, navigates to StepPayment in the preview, comes back tomorrow and sees StepPayment with no context. It implies continuity that doesn't exist.

Default: `?preview=true` with no step override. StepServices always.

---

## Layout — Desktop (lg+)

The Preview section is the fourth card in `BookingAppPageClient`, positioned below the existing three settings sections (Metode Pembayaran, Konfirmasi Booking, Kebijakan Salon).

On desktop, the Preview section uses the same full-width card container as the other three sections. The iframe is center-aligned within its card, not in a sidebar.

**Rationale:** `SettingsPreviewPanel` (the existing two-column layout) is designed for form + inline preview pairs — Brand's logo + cover is a good example. The Preview section has no form. Putting an iframe in a sticky right column next to nothing would leave a large empty left column. A full-width card is the correct container.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Metode Pembayaran                                            [card] │
├─────────────────────────────────────────────────────────────────────┤
│  Konfirmasi Booking                                           [card] │
├─────────────────────────────────────────────────────────────────────┤
│  Kebijakan Salon                                              [card] │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  SECTION A — Public Link                                      │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  SECTION B — Preview Health                                   │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  SECTION C — Live Preview (iframe, centered)                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

All three sections share one `bg-bg-card rounded-r16 shadow-card` container. They are divided by `border-b border-bd-row` separators, consistent with Metode Pembayaran's internal section separators.

---

## Layout — Mobile

On mobile, all sections stack full width in the same order: A → B → C.

The iframe section on mobile renders with `overflow-x: auto` so the owner can horizontally pan to see the full 390px customer UI if the screen is narrower.

---

## Section A — Public Link

```
┌─────────────────────────────────────────────────────┐
│  Halaman Booking Anda                               │
│  Bagikan link ini ke customer.                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────┐       │
│  │  firalink.id/book/rara-beauty-jakarta    │       │
│  └──────────────────────────────────────────┘       │
│                                                     │
│  [  Salin Link  ]    [ Buka ↗ ]                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Anatomy:**

- Section header: `text-ts-sub font-bold` title + `text-ts-fn text-tx-secondary` subtitle
- URL display: read-only input-like row, `bg-bg-base rounded-r12 px-s16 py-s12`, `text-ts-fn font-medium text-tx-primary`, truncated with ellipsis
- "Salin Link": secondary button (outlined). On click: copies to clipboard, button label changes to "Tersalin ✓" for 2 seconds, then reverts
- "Buka ↗": ghost button. Opens `{CUSTOMER_APP_URL}/book/{slug}` in new tab (no `?preview=true` — real link)

**QR code:** Deferred to Phase 2. Placeholder row not shown in Phase 1.

**Empty state (slug missing):**

```
┌─────────────────────────────────────────────────────┐
│  Halaman Booking Anda                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Link booking belum tersedia.                       │
│  Hubungi support untuk mengaktifkan halaman Anda.   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Buttons are hidden. No iframe is shown.

---

## Section B — Preview Health

Health renders as a compact status list. Each row is one check.

**All clear state:**

```
┌─────────────────────────────────────────────────────┐
│  ●  Halaman booking siap dibagikan                  │
└─────────────────────────────────────────────────────┘
```

Single green row. `text-ac-success`. No expand, no detail. Owner moves on.

**Issues present:**

```
┌─────────────────────────────────────────────────────┐
│  Status Halaman Booking                             │
├─────────────────────────────────────────────────────┤
│  ✕  Belum ada layanan         → Ke Layanan           │
│  ✕  Belum ada stylist         → Ke Tim               │
│  ⚠  Metode pembayaran kosong  → Ke Pembayaran        │
│  ⚠  QRIS aktif, foto belum   → Upload QRIS          │
│  ⚠  Jam operasional kosong   → Ke Operasional       │
└─────────────────────────────────────────────────────┘
```

**Row anatomy:**

- Icon: `✕` (red, `text-ac-danger`) for blocking issues, `⚠` (amber, `text-ac-warning`) for warnings
- Label: `text-ts-fn text-tx-primary`
- Arrow link: `→ Ke [Domain]` right-aligned, `text-ts-fn text-ac-primary`, taps navigate to that settings section

**Blocking vs warning distinction:**

- **Blocking (✕):** Customer literally cannot complete booking. No services → StepServices is empty. No stylists → StepStylist is empty. These stop the flow.
- **Warning (⚠):** Booking is possible but degraded. Missing QRIS image → customer sees a warning icon at StepPayment but can still pick Transfer or Cash.

**Check inventory:**

| Icon | Condition                                     | Label                              | Navigation target                 |
| ---- | --------------------------------------------- | ---------------------------------- | --------------------------------- |
| ✕    | `serviceCount === 0`                          | Belum ada layanan                  | `/dashboard/settings/layanan`     |
| ✕    | `stylistCount === 0`                          | Belum ada stylist                  | `/dashboard/settings/tim`         |
| ⚠   | `paymentMethodCount === 0`                    | Metode pembayaran kosong           | scroll to Metode Pembayaran above |
| ⚠   | `qrisActive && !qrisImageUrl`                 | QRIS aktif, foto belum diupload    | opens QRIS upload sheet           |
| ⚠   | `transferActive && bankAccounts.length === 0` | Transfer aktif, belum ada rekening | opens add-bank sheet              |
| ⚠   | `businessHoursCount === 0`                    | Jam operasional belum diisi        | `/dashboard/settings/operasional` |

Branding status (logo, cover, tagline) is excluded from health checks in Phase 1. The customer app does not yet consume those fields, so a missing logo is not a customer-facing issue yet.

---

## Section C — Live Preview

```
┌─────────────────────────────────────────────────────┐
│  Pratinjau Halaman Customer            [Muat Ulang]  │
│  Persis seperti yang dilihat customer.               │
├─────────────────────────────────────────────────────┤
│                                                     │
│         ┌───────────────────────┐                   │
│         │ ╔═══════════════════╗ │                   │
│         │ ║  [iframe 390px]   ║ │                   │
│         │ ║                   ║ │                   │
│         │ ║  StepServices     ║ │                   │
│         │ ║  — real data —    ║ │                   │
│         │ ║                   ║ │                   │
│         │ ║  [Pratinjau]      ║ │  ← banner inside  │
│         │ ╚═══════════════════╝ │
│         └───────────────────────┘                   │
│                                                     │
│   Pratinjau — navigasi aktif, booking tidak dikirim  │
└─────────────────────────────────────────────────────┘
```

**Device frame:** A thin border (`border border-bd-card rounded-r20 shadow-card`) wraps the iframe, simulating a phone. No decorative notch, no status bar chrome. Keep it minimal.

**Iframe dimensions:**

- Width: 390px (fixed, not responsive)
- Height: 700px (fixed)
- Scrolling: enabled inside iframe
- Pointer events: enabled — owner can click through all 7 steps

**"Muat Ulang" button:** Top-right of section header. Ghost button. Reloads the iframe src to reset to StepServices. Useful after the owner has navigated through steps and wants to see the fresh entry state.

**Caption below device frame:** "Pratinjau — navigasi aktif, booking tidak dikirim" — `text-ts-cap2 text-tx-muted text-center`. Permanent, not a warning.

---

## Loading State

Shown while the iframe is loading (between `src` set and `onload` fired).

The device frame renders, but instead of the iframe, shows a skeleton:

```
┌───────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░  │  ← cover placeholder (h-28, bg-bg-control shimmer)
│                       │
│  ░░░░░░░  ← logo      │
│                       │
│  ░░░░░░░░░░░░░        │  ← salon name
│  ░░░░░░░░░            │  ← tagline
│                       │
│  ░░  ░░░░░░  ░░░░░░░  │  ← category chips
│                       │
│  ┌─────────────────┐  │
│  │ ░░░░░░░░░░░░░░░ │  │  ← service card
│  └─────────────────┘  │
│  ┌─────────────────┐  │
│  │ ░░░░░░░░░░░░░░░ │  │
│  └─────────────────┘  │
└───────────────────────┘
```

Skeleton uses `animate-pulse bg-bg-control` consistent with the loading skeleton used in `book/[slug]/loading.tsx`.

---

## Error State

Shown when the iframe fails to load after 10 seconds, or when `onerror` fires.

The device frame is replaced with:

```
┌───────────────────────────────────────────────────┐
│                                                   │
│           [!]  Pratinjau tidak dapat dimuat       │
│                                                   │
│   Buka halaman booking langsung untuk mengecek:   │
│                                                   │
│   firalink.id/book/rara-beauty-jakarta  [ Buka ↗ ] │
│                                                   │
│                   [ Coba Lagi ]                   │
│                                                   │
└───────────────────────────────────────────────────┘
```

"Coba Lagi" resets the iframe src, triggering a fresh load.

---

## Empty State — Slug Missing

If `salon.slug` is null, the entire Section C is hidden. Section A shows the slug-missing state (described above). Section B still renders health checks.

---

## Preview Banner (inside customer app)

When `?preview=true` is active, the customer app renders a fixed banner at the top of every step.

```
┌──────────────────────────────────────────────────┐
│  PRATINJAU — Booking tidak akan dikirim          │
└──────────────────────────────────────────────────┘
```

- Position: `position: fixed; top: 0; left: 0; right: 0; z-index: 9999`
- Height: 36px
- Background: `bg-tx-primary` (near-black)
- Text: `text-ts-cap1 font-semibold text-bg-card text-center uppercase tracking-widest`
- The banner pushes no content. It overlays. Steps already have enough top padding.
- The banner is not dismissible.

This is the only change to `apps/customer`.

---

## Component Tree (owner app)

```
BookingAppPageClient
  └── PreviewSection                      (new component)
        ├── PublicLinkCard                (new)
        │     ├── URL display row
        │     ├── CopyButton
        │     └── OpenButton
        ├── PreviewHealthCard             (new)
        │     └── HealthCheckRow[]
        └── PreviewIframeCard             (new)
              ├── DeviceFrame
              │     ├── IframeSkeleton   (loading state)
              │     └── <iframe>         (loaded state)
              └── ReloadButton
```

`PreviewSection` sits inside the same `SettingsPageShell` as the existing three sections. It is one card container with internal separators.

---

## Tokens Used

All tokens from the existing system. No new tokens required.

| Element              | Token                         |
| -------------------- | ----------------------------- |
| Card background      | `bg-bg-card`                  |
| Card border          | `border-bd-card`              |
| Card shadow          | `shadow-card`                 |
| Section separator    | `border-b border-bd-row`      |
| Blocking issue color | `text-ac-danger`              |
| Warning color        | `text-ac-warning`             |
| Success color        | `text-ac-success`             |
| URL row background   | `bg-bg-base`                  |
| Skeleton shimmer     | `bg-bg-control animate-pulse` |
| Caption text         | `text-ts-cap2 text-tx-muted`  |
| Device frame radius  | `rounded-r20`                 |
| URL field radius     | `rounded-r12`                 |
