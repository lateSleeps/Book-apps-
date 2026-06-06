# Design Tokens — Referensi Lengkap

> Semua nilai diambil langsung dari `overview/page.tsx` audit Juni 2026.
> Token JS ada di `apps/owner/src/shared/lib/tokens.ts`
> Token Tailwind ada di `apps/owner/tailwind.config.ts`

---

## Warna — Background

```
bg-page          #F2F2F7   page background
bg-card          #FFFFFF   cards, panels, drawers
bg-surface       #fafaf8   expanded detail bg, subtle surface
bg-header        #F7F7F8   table header row
bg-control       #F2F2F7   segmented tab container, icon buttons
bg-input         #F9F9FB   secondary button, input bg
```

## Warna — Text

```
tx-primary       #1C1C1E   judul, nilai angka, nama
tx-body          #1a1a1a   body content
tx-secondary     #8E8E93   label uppercase, count, placeholder
tx-subtle        #555555   deskripsi pendukung
tx-muted         #C7C7CC   disabled, placeholder extreme
tx-control       #3C3C43   iOS tertiary control label — refresh icons,
                           sort controls, secondary action buttons
```

## Warna — Border

```
border-card      #E5E5EA   card outline, input border, modal
border-row       #F2F2F7   row separator
border-detail    #f0f0f0   detail panel inner border
border-strong    #E5E5EA   (sama dengan border-card)
```

## Warna — Status Booking

```
upcoming-text    #d97706   badge text
upcoming-bg      #fffbeb   badge background
upcoming-dot     #f59e0b   notif dot (animate-badge-shake)

confirmed-text   #2563eb
confirmed-bg     #eff6ff

in-progress-text #16a34a
in-progress-bg   #f0fdf4

completed-text   #9ca3af
completed-bg     #f9fafb

cancelled-text   #ef4444
cancelled-bg     #fef2f2

no-show-text     #9ca3af
no-show-bg       #f9fafb
```

## Warna — Payment Status

```
py-paid          #34C759   Lunas — text color
py-deposit       #FF9500   DP — text color
py-unpaid        #8E8E93   Belum Bayar — text color

py-paid-bg       #DCFCE7   Lunas badge background
py-deposit-bg    #FEF9C3   DP badge background
py-unpaid-bg     #F5F5F5   Belum Bayar badge background
```

## Warna — Visitor Type Badge

```
walk-in-text     #856404
walk-in-bg       #FEF3C7

booking-text     #1565C0
booking-bg       #DBEAFE
```

## Warna — Actions

```
action-primary   #2563eb   Konfirmasi, Save
action-danger    #ef4444   Tolak, Hapus
action-wa        #25d366   WhatsApp button
action-ios-blue  #007AFF   Stat card icons
action-ios-red   #FF3B30   Pembatalan icon
action-ios-green #34C759   Selesai icon
```

## Warna — Avatar Background Pool

```
#D1FAE5  mint green
#DBEAFE  soft blue
#FEF3C7  soft amber
#FECACA  soft coral
#E9D5FF  soft lavender
#FFEDD5  soft peach
#CCFBF1  soft teal
#FEE2E2  soft rose
Avatar text: #1C1C1E (semua warna)
```

---

## Tipografi

Font family: **DM Sans** (sudah di tailwind.config.ts)

```
11px / 600 / uppercase / ls:0.07em   Eyebrow labels (NOMOR HP, LAYANAN, dll)
13px / 400–600                        Table text, badge, tab
14px / 400–500 (0.875rem)            Body, phone, service name
18px / 700                           Drawer header
36px / 700                           Stat card number
```

Tailwind tokens yang sudah ada:

```
ts-cap2  11px    ts-cap1  12px    ts-fn   13px
ts-sub   15px    ts-body  16px    ts-head 17px
ts-t3    20px    ts-t2    22px    ts-t1   28px
ts-hero  34px
```

---

## Spacing

```
s4   4px    s8   8px    s12  12px   s16  16px
s20  20px   s24  24px   s32  32px   s40  40px   s48  48px
```

---

## Border Radius

```
r8   8px    r12  12px   r14  14px   r16  16px
r20  20px   r24  24px   r32  32px   rF   9999px
```

Mapping komponen:

```
Stat card / Drawer / Dialog   r20  (20px)
Table container               r16  (16px)
Input / Button action         10px (belum ada token → tambah r10)
Booking status badge          6px  (belum ada token → tambah r6)
Avatar                        10px
Visitor type badge            rF   (pill)
```

---

## Shadows

```
shadow-card    0 2px 8px rgba(0,0,0,0.06)      cards, table
shadow-drawer  -8px 0 48px rgba(0,0,0,0.18)   walk-in drawer
shadow-dialog  0 24px 64px rgba(0,0,0,0.18)   modals, dialogs
shadow-tab     0 1px 4px rgba(0,0,0,0.1)       tab button aktif
```

---

## Animations

```
badge-shake      globals.css   badge notif UPCOMING bergoyang
skeleton-shimmer globals.css   loading state
fadeIn           tailwind       0→1 opacity 260ms
up               tailwind       slide up 200ms
sIn              tailwind       slide in dari kanan 280ms
```

---

## Token yang BELUM ada di tailwind.config.ts (perlu ditambahkan)

```ts
// Colors yang hardcode di overview tapi belum jadi token:
colors: {
  'bg-page':       '#F2F2F7',
  'bg-surface':    '#fafaf8',
  'bg-header':     '#F7F7F8',
  'bg-control':    '#F2F2F7',
  'text-primary':  '#1C1C1E',
  'text-secondary':'#8E8E93',
  'text-subtle':   '#555555',
  'text-muted':    '#C7C7CC',
  'border-card':   '#E5E5EA',
  'border-row':    '#F2F2F7',
  'border-detail': '#f0f0f0',

  // Status booking
  'status-upcoming':     '#d97706',
  'status-upcoming-bg':  '#fffbeb',
  'status-confirmed':    '#2563eb',
  'status-confirmed-bg': '#eff6ff',
  'status-in-progress':     '#16a34a',
  'status-in-progress-bg':  '#f0fdf4',
  'status-completed':    '#9ca3af',
  'status-completed-bg': '#f9fafb',
  'status-cancelled':    '#ef4444',
  'status-cancelled-bg': '#fef2f2',

  // Payment
  'payment-paid':    '#34C759',
  'payment-deposit': '#FF9500',
  'payment-unpaid':  '#8E8E93',

  // Visitor type
  'type-walkin-text': '#856404',
  'type-walkin-bg':   '#FEF3C7',
  'type-booking-text':'#1565C0',
  'type-booking-bg':  '#DBEAFE',
}

// BorderRadius yang belum ada:
borderRadius: {
  r6:  '6px',   // badge
  r10: '10px',  // input, button action
}

// Shadows yang belum ada:
boxShadow: {
  card:   '0 2px 8px rgba(0,0,0,0.06)',
  drawer: '-8px 0 48px rgba(0,0,0,0.18)',
  dialog: '0 24px 64px rgba(0,0,0,0.18)',
  tab:    '0 1px 4px rgba(0,0,0,0.1)',
}
```
