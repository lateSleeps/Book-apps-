import { format } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format a number as Indonesian Rupiah.
 * e.g. 65000 → "Rp 65.000"
 */
export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

/**
 * Format ISO date string for display.
 * e.g. "2026-05-20" → "Rabu, 20 Mei 2026"
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return format(date, 'EEEE, d MMMM yyyy', { locale: id });
}

/**
 * Format duration in minutes to human-readable string.
 * e.g. 90 → "1 jam 30 mnt"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} mnt`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} jam ${mins} mnt` : `${hours} jam`;
}

/**
 * Format countdown seconds to MM:SS string.
 * e.g. 300 → "05:00"
 */
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Format a number as compact Rupiah for stat cards.
 * e.g. 1500000 → "1.5M", 85000 → "85K"
 *
 * @usedBy StatCardsRow, overview/page.tsx
 */
export function formatCompactRupiah(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(0) + 'K';
  }
  return value.toString();
}
