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
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'ts-cap2':  ['11px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'ts-cap1':  ['12px', { lineHeight: '1.4', letterSpacing: '0.015em' }],
        'ts-fn':    ['13px', { lineHeight: '1.5', letterSpacing: '0' }],
        'ts-sub':   ['15px', { lineHeight: '1.5', letterSpacing: '0' }],
        'ts-body':  ['16px', { lineHeight: '1.5', letterSpacing: '0' }],
        'ts-head':  ['17px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'ts-t3':    ['20px', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'ts-t2':    ['22px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'ts-t1':    ['28px', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'ts-hero':  ['34px', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
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
        r8: '8px',
        r12: '12px',
        r14: '14px',
        r16: '16px',
        r20: '20px',
        r24: '24px',
        r32: '32px',
        rF: '9999px',
      },
      boxShadow: {
        shell: '0 0 60px rgba(0,0,0,0.12)',
        button: '0 4px 16px rgba(17,17,16,0.20)',
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
          '15%':       { transform: 'translateX(-6px)' },
          '30%':       { transform: 'translateX(6px)' },
          '45%':       { transform: 'translateX(-4px)' },
          '60%':       { transform: 'translateX(4px)' },
          '75%':       { transform: 'translateX(-2px)' },
          '90%':       { transform: 'translateX(2px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        sIn: 'sIn 280ms cubic-bezier(.25,.46,.45,.94)',
        sheetUp: 'sheetUp 320ms cubic-bezier(.32,.72,0,1)',
        sBk: 'sBk 280ms cubic-bezier(.25,.46,.45,.94)',
        up: 'up 200ms ease',
        fadeIn: 'fadeIn 260ms ease',
        shake: 'shake 500ms ease 400ms both',
        slideUp: 'slideUp 280ms cubic-bezier(.25,.46,.45,.94)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) {
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
