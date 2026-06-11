import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Customer app tokens (legacy, jangan dihapus) ──────────────────
        accent: '#4a9b7f',
        'accent-dark': '#2d7a5f',
        'accent-soft': '#edf7f3',
        label: '#111110',
        label2: '#605f5b',
        label3: '#a09f9a',
        sep: '#e8e7e3',
        surface: '#ffffff',
        bg: '#f7f7f5',
        'c-peach': '#fde8dc',
        'c-blue': '#ddedf8',
        'c-mauve': '#eddde9',
        'c-yellow': '#fef3c2',
        'c-mint': '#d8f3ec',
        'c-lilac': '#e8e2f8',
        'c-salmon': '#E8705A',
        'bg-ticket': '#eeeef2',

        // ── Dashboard / Owner tokens ───────────────────────────────────────
        // Background
        'bg-page': '#F2F2F7', // page background (iOS system gray 6)
        'bg-card': '#FFFFFF', // cards, panels, drawers
        'bg-surface': '#fafaf8', // expanded detail, subtle hover
        'bg-header': '#F7F7F8', // table header row
        'bg-control': '#F2F2F7', // segmented tab container, icon buttons
        'bg-input': '#F9F9FB', // secondary button, input bg
        'bg-hover': '#F5F5F7', // list item / row hover state
        'bg-row-selected': '#fafaf8', // selected table row background

        // Text
        'tx-primary': '#1C1C1E', // judul, angka, nama customer (iOS label)
        'tx-body': '#1a1a1a', // body content
        'tx-secondary': '#8E8E93', // label uppercase, count (iOS system gray)
        'tx-subtle': '#555555', // deskripsi pendukung
        'tx-muted': '#C7C7CC', // disabled, placeholder extreme
        'tx-control': '#3C3C43', // iOS tertiary control label (refresh, sort, secondary action)

        // Border
        'bd-card': '#E5E5EA', // card, input, modal
        'bd-row': '#F2F2F7', // row separator
        'bd-detail': '#f0f0f0', // detail panel inner

        // Booking status — text & background pairs
        'st-upcoming': '#d97706',
        'st-upcoming-bg': '#fffbeb',
        'st-upcoming-dot': '#f59e0b', // notif dot, animate-badge-shake
        'st-confirmed': '#2563eb',
        'st-confirmed-bg': '#eff6ff',
        'st-in-progress': '#16a34a',
        'st-in-progress-bg': '#f0fdf4',
        'st-completed': '#9ca3af',
        'st-completed-bg': '#f9fafb',
        'st-cancelled': '#ef4444',
        'st-cancelled-bg': '#fef2f2',
        'st-no-show': '#9ca3af',
        'st-no-show-bg': '#f9fafb',

        // Payment status
        'py-paid': '#34C759', // Lunas
        'py-deposit': '#FF9500', // DP
        'py-unpaid': '#8E8E93', // Belum Bayar
        'py-paid-bg': '#DCFCE7', // Lunas badge background
        'py-deposit-bg': '#FEF9C3', // DP badge background
        'py-unpaid-bg': '#F5F5F5', // Belum Bayar badge background

        // Visitor type badge
        'vt-walkin-text': '#856404',
        'vt-walkin-bg': '#FEF3C7',
        'vt-booking-text': '#1565C0',
        'vt-booking-bg': '#DBEAFE',

        // Action
        'ac-primary': '#2563eb', // Konfirmasi, Save
        'ac-danger': '#ef4444', // Tolak, Hapus
        'ac-wa': '#25d366', // WhatsApp
        'ac-ios-blue': '#007AFF', // Stat card icon
        'ac-ios-red': '#FF3B30', // Pembatalan icon
        'ac-ios-green': '#34C759', // Selesai icon
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // ── Apple HIG Type Scale — rem units ─────────────────────────────────
        // Micro — 10px — sub-caption, category card description, legend chips
        'ts-micro': ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        // Caption 2 — 11px — minimum, gunakan untuk legend dots, badges
        'ts-cap2': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        // Caption 1 — 12px — labels, tags, eyebrow text
        'ts-cap1': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.015em' }],
        // Footnote — 13px — secondary meta, time slots
        'ts-fn': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0' }],
        // Subheadline — 15px — supporting body, chip text
        'ts-sub': ['0.9375rem', { lineHeight: '1.5', letterSpacing: '0' }],
        // Callout / Body — 16px — descriptions, secondary content
        'ts-body': ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],
        // Headline — 17px — primary body, button labels, card titles
        'ts-head': ['1.0625rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        // Title 3 — 20px — section titles
        'ts-t3': ['1.25rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        // Title 2 — 22px — page sub-headings
        'ts-t2': ['1.375rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        // Title 1 — 28px — page headings
        'ts-t1': ['1.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        // Large Title — 34px — hero headings
        'ts-hero': ['2.125rem', { lineHeight: '1.0', letterSpacing: '-0.03em' }],

        // ── Legacy aliases — backwards compat ────────────────────────────────
        t12: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.015em' }],
        t14: ['0.875rem', { lineHeight: '1.5' }],
        'ts-t14': ['0.875rem', { lineHeight: '1.5' }],
        t16: ['1rem', { lineHeight: '1.5' }],
        t18: ['1.125rem', { lineHeight: '1.4' }],
        t20: ['1.25rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        t24: ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        t28: ['1.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        t32: ['2rem', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
      },
      spacing: {
        // 4pt grid — rem units
        // Half-step values (s2, s6, s14) used by SegmentedControl primitive
        s2: '0.125rem', // 2px  — segmented control inner gap
        s4: '0.25rem', // 4px
        s6: '0.375rem', // 6px  — segmented control button vertical padding
        s8: '0.5rem', // 8px
        s12: '0.75rem', // 12px
        s14: '0.875rem', // 14px — segmented control button horizontal padding
        s16: '1rem', // 16px
        s20: '1.25rem', // 20px
        s24: '1.5rem', // 24px
        s32: '2rem', // 32px
        s40: '2.5rem', // 40px
        s48: '3rem', // 48px
      },
      borderRadius: {
        r6: '0.375rem', // 6px  — badge status booking
        r8: '0.5rem', // 8px
        r10: '0.625rem', // 10px — input, button action, avatar
        r12: '0.75rem', // 12px
        r14: '0.875rem', // 14px
        r16: '1rem', // 16px — table container
        r20: '1.25rem', // 20px — stat card, drawer, dialog
        r24: '1.5rem', // 24px
        r32: '2rem', // 32px
        rF: '9999px', // pill badge — tetap px supaya tidak overflow
      },
      boxShadow: {
        // Legacy
        shell: '0 0 60px rgba(0,0,0,0.12)',
        button: '0 4px 16px rgba(17,17,16,0.20)',
        // Dashboard
        card: '0 2px 8px rgba(0,0,0,0.06)', // stat cards, table panel
        drawer: '-8px 0 48px rgba(0,0,0,0.18)', // walk-in drawer
        dialog: '0 24px 64px rgba(0,0,0,0.18)', // modals
        tab: '0 1px 4px rgba(0,0,0,0.1)', // tab button aktif
        dropdown: '0 8px 32px rgba(0,0,0,0.14)', // floating dropdowns
      },
      keyframes: {
        sIn: {
          from: { transform: 'translateX(100%)', opacity: '0.4' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        sheetUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        sBk: {
          from: { transform: 'translateX(-24%)', opacity: '0.4' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        up: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%': { transform: 'translateX(-6px)' },
          '30%': { transform: 'translateX(6px)' },
          '45%': { transform: 'translateX(-4px)' },
          '60%': { transform: 'translateX(4px)' },
          '75%': { transform: 'translateX(-2px)' },
          '90%': { transform: 'translateX(2px)' },
        },
      },
      animation: {
        sIn: 'sIn 280ms cubic-bezier(.25,.46,.45,.94)',
        sheetUp: 'sheetUp 320ms cubic-bezier(.32,.72,0,1)',
        sBk: 'sBk 280ms cubic-bezier(.25,.46,.45,.94)',
        up: 'up 200ms ease',
        fadeIn: 'fadeIn 260ms ease',
        shake: 'shake 500ms ease 400ms both',
      },
    },
  },
  plugins: [
    function ({
      addUtilities,
    }: {
      addUtilities: (u: Record<string, Record<string, string>>) => void;
    }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.scrollbar-hide::-webkit-scrollbar': {
          display: 'none',
        },
      });
    },
  ],
};

export default config;
