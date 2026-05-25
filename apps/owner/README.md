# Rara Beauty Booking

Customer-facing salon booking web app built with Next.js 14 App Router.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/book/rara-beauty`.

## npm Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests (Vitest) |
| `pnpm test:ui` | Vitest UI |
| `pnpm test:coverage` | Coverage report |

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (DM Sans, metadata)
│   ├── page.tsx                  # Redirects to /book/rara-beauty
│   └── book/[slug]/
│       ├── layout.tsx            # Mobile shell (max-w-[430px])
│       ├── page.tsx              # Step 1: Pick date
│       ├── loading.tsx           # Skeleton loader
│       ├── error.tsx             # Error boundary
│       └── (steps)/
│           ├── category/         # Step 2: Pick category
│           ├── services/         # Step 3: Pick service
│           ├── stylist/          # Step 4: Pick stylist + time
│           ├── time/             # Step 5: Standalone time picker
│           ├── confirm/          # Step 6: Summary + countdown
│           ├── addons/           # Step 7: Product upsell
│           ├── payment/          # Step 8: QRIS payment + upload
│           └── ticket/           # Step 9: Digital ticket
├── features/booking/
│   ├── components/               # UI components by domain
│   ├── hooks/                    # Zustand store, mock data, timer
│   ├── lib/                      # Date utils, price calculator
│   ├── types/                    # Zod schemas + inferred types
│   └── constants/                # Booking constants
└── shared/
    ├── components/ui/            # Button, Card, Input, etc.
    ├── hooks/                    # useDebounce, useMediaQuery
    └── lib/                      # cn, format, logger
```

## Design System

| Token | Value |
|---|---|
| `accent` | `#4a9b7f` |
| `label` | `#111110` |
| `bg` | `#f7f7f5` |
| `surface` | `#ffffff` |
| `sep` | `#e8e7e3` |

Font: **DM Sans** (Google Fonts via `next/font`)

All spacing uses semantic tokens: `s4`–`s48`. Border radius tokens: `r8`–`rF`.

## Booking Flow

1. Pick date → 2. Category → 3. Service → 4. Stylist & Time → 5. Confirm + Countdown → 6. Add-ons → 7. Payment (QRIS) → 8. Digital Ticket

State is managed in a single Zustand store with `persist` middleware (`booking-store` key in localStorage). Each page guards against missing prior state and redirects back if needed.
