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

        // Text
        'tx-primary': '#1C1C1E', // judul, angka, nama customer (iOS label)
        'tx-body': '#1a1a1a', // body content
        'tx-secondary': '#8E8E93', // label uppercase, count (iOS system gray)
        'tx-subtle': '#555555', // deskripsi pendukung
        'tx-muted': '#C7C7CC', // disabled, placeholder extreme

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
        // ── Type scale (Apple HIG-aligned, WCAG AA accessible) ──────────────
        // Caption 2 — absolute minimum, use sparingly (legend dots, badges)
        'ts-cap2': ['11px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        // Caption 1 — labels, tags, eyebrow text, calendar day letters
        'ts-cap1': ['12px', { lineHeight: '1.4', letterSpacing: '0.015em' }],
        // Footnote — secondary meta, time slots, step indicators
        'ts-fn': ['13px', { lineHeight: '1.5', letterSpacing: '0' }],
        // Subheadline — supporting body, chip text, helper text
        'ts-sub': ['15px', { lineHeight: '1.5', letterSpacing: '0' }],
        // Callout / Body — descriptions, secondary content
        'ts-body': ['16px', { lineHeight: '1.5', letterSpacing: '0' }],
        // Headline — primary body, button labels, card titles
        'ts-head': ['17px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        // Title 3 — calendar date numbers, section titles
        'ts-t3': ['20px', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        // Title 2 — page sub-headings
        'ts-t2': ['22px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        // Title 1 — page headings ("Pilih Stylist")
        'ts-t1': ['28px', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        // Large Title — hero headings ("Selamat pagi.")
        'ts-hero': ['34px', { lineHeight: '1.0', letterSpacing: '-0.03em' }],

        // ── Legacy aliases (kept for backwards compat) ──────────────────────
        t12: ['12px', { lineHeight: '1.4', letterSpacing: '0.015em' }],
        t14: ['14px', { lineHeight: '1.5' }],
        t16: ['16px', { lineHeight: '1.5' }],
        t18: ['18px', { lineHeight: '1.4' }],
        t20: ['20px', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        t24: ['24px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        t28: ['28px', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        t32: ['32px', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
      },
      spacing: {
        s4: '4px',
        s8: '8px',
        s12: '12px',
        s16: '16px',
        s20: '20px',
        s24: '24px',
        s32: '32px',
        s40: '40px',
        s48: '48px',
      },
      borderRadius: {
        r6: '6px', // badge status booking
        r8: '8px',
        r10: '10px', // input, button action, avatar
        r12: '12px',
        r14: '14px',
        r16: '16px', // table container
        r20: '20px', // stat card, drawer, dialog
        r24: '24px',
        r32: '32px',
        rF: '9999px', // pill badge
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
