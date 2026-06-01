/**
 * Typography design system — single source of truth for all dashboard pages.
 * WCAG AA compliant: minimum 4.5:1 contrast ratio on white backgrounds.
 *
 * Tailwind gray scale contrast on #fff:
 *   gray-900 (#111827)  ~18.5:1  ✅
 *   gray-700 (#374151)  ~10.4:1  ✅
 *   gray-600 (#4b5563)   ~7.0:1  ✅
 *   gray-500 (#6b7280)   ~4.6:1  ✅  ← minimum for normal text
 *   gray-400 (#9ca3af)   ~2.9:1  ❌  DO NOT USE for text
 *
 * Custom hex equivalents to AVOID (fail AA):
 *   #777, #888, #999, #aaa, #bbb, #ccc, #737373
 *
 * Custom hex values that PASS AA:
 *   #1a1a1a, #333, #444, #555  ✅
 *   #666  ✅ (~4.74:1)
 */

export const typography = {
  // Page titles — "Pemesanan", "Overview"
  pageTitle: 'text-2xl font-bold text-gray-900',

  // Section headers (PELANGGAN, LAYANAN, JADWAL & TERAPIS)
  sectionHeader: 'text-xs font-semibold text-gray-500 uppercase tracking-wider',

  // Card / table column headers
  columnHeader: 'text-xs font-semibold text-gray-600 uppercase tracking-wide',

  // Primary text — names, booking codes, important values
  primary: 'text-sm font-semibold text-gray-900',

  // Body text — descriptions, secondary values
  body: 'text-sm text-gray-700',

  // Secondary / label text
  secondary: 'text-sm text-gray-500',

  // Caption / meta text — timestamps, hints
  caption: 'text-xs text-gray-500',

  // Stat card numbers on overview
  statNumber: 'text-2xl font-bold text-gray-900',

  // Stat card labels on overview
  statLabel: 'text-xs font-medium text-gray-500 uppercase tracking-wide',
} as const;
