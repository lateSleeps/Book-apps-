import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../constants/booking.constants';

/**
 * Validates a file for payment proof upload.
 * Returns an error message string, or null if valid.
 */
export function validateUploadedFile(file: File): string | null {
  if (!(ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
    return 'Hanya JPG dan PNG yang diterima';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Ukuran file maksimal 5MB';
  }
  return null;
}

/**
 * Validates that a date string (ISO) is not in the past.
 * Returns error message or null if valid.
 */
export function validateDateNotPast(isoDate: string): string | null {
  const selected = new Date(isoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selected < today) {
    return 'Tanggal sudah lewat';
  }
  return null;
}

/**
 * Validates that a date string is not on a closed day.
 * @param isoDate - ISO date string
 * @param closedDays - Array of day numbers (0=Sun, 1=Mon, ...)
 */
export function validateDateNotClosed(isoDate: string, closedDays: number[]): string | null {
  const date = new Date(isoDate);
  const dayOfWeek = date.getDay();
  if (closedDays.includes(dayOfWeek)) {
    return 'Salon tutup di hari ini';
  }
  return null;
}
