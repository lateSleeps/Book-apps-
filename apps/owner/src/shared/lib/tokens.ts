/**
 * Design Tokens — Firalink Owner Dashboard
 *
 * JS constants for use in:
 * - Components that need dynamic color values (e.g. Phosphor icon color props)
 * - Logic that computes colors from data
 *
 * For Tailwind className usage, use tokens in tailwind.config.ts directly.
 * Docs: docs/design-system/tokens.md
 *
 * @notes
 * Business domain metadata (booking status, payment status, visitor type)
 * lives in features/dashboard/constants/domain/ — not here.
 */

// ── Avatar ────────────────────────────────────────────────────────────────────

export const AVATAR_BG_COLORS = [
  '#D1FAE5', // mint green
  '#DBEAFE', // soft blue
  '#FEF3C7', // soft amber
  '#FECACA', // soft coral
  '#E9D5FF', // soft lavender
  '#FFEDD5', // soft peach
  '#CCFBF1', // soft teal
  '#FEE2E2', // soft rose
] as const;

export const AVATAR_TEXT_COLOR = '#1C1C1E';

// ── Stat Card Icon Colors ─────────────────────────────────────────────────────

export const STAT_ICON_COLORS = {
  revenue: '#007AFF', // iOS blue
  bookings: '#007AFF',
  completed: '#34C759', // iOS green
  cancelled: '#FF3B30', // iOS red
} as const;

// ── Actions ───────────────────────────────────────────────────────────────────

export const ACTION_COLORS = {
  primary: '#2563eb',
  danger: '#ef4444',
  wa: '#25d366',
} as const;
