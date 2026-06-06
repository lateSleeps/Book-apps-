/**
 * @responsibility
 * Locale helpers for Indonesian date/time display and greeting messages.
 *
 * @usedBy
 * overview/page.tsx (greeting header), BookingTableHeader
 *
 * @notes
 * All arrays are zero-indexed to match JS Date getDay() / getMonth().
 */

/** Indonesian day names, Sunday-indexed (matches Date.getDay()) */
export const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;

/** Indonesian month names, zero-indexed (matches Date.getMonth()) */
export const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

/**
 * Returns a time-appropriate Indonesian greeting.
 * - 00:00–10:59 → "Selamat pagi"
 * - 11:00–14:59 → "Selamat siang"
 * - 15:00–17:59 → "Selamat sore"
 * - 18:00–23:59 → "Selamat malam"
 */
export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

/**
 * Returns today's date formatted in full Indonesian.
 * e.g. "Kamis, 5 Juni 2026"
 */
export function formatDateLabel(date: Date = new Date()): string {
  return `${DAYS_ID[date.getDay()]}, ${date.getDate()} ${MONTHS_ID[date.getMonth()]} ${date.getFullYear()}`;
}
