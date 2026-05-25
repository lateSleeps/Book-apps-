/** Deposit amount in Rupiah */
export const DEPOSIT_AMOUNT = 20_000;

/** Max file size for payment proof: 5MB */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Allowed MIME types for payment proof */
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'] as const;

/** Countdown duration in seconds (5 minutes) */
export const SLOT_RESERVATION_SECONDS = 300;

/** Total steps in booking flow */
export const TOTAL_STEPS = 9;

/** Time slot session mapping */
export const SESSION_TIMES = {
  PAGI: ['09:00', '10:30'],
  SIANG: ['12:00', '14:00'],
  SORE: ['16:00', '18:00', '20:00'],
} as const;

/** All available time slots */
export const ALL_TIME_SLOTS = ['09:00', '10:30', '12:00', '14:00', '16:00', '18:00', '20:00'] as const;

/** Days closed (1 = Monday) */
export const CLOSED_DAYS = [1] as const;

/** Booking code prefix */
export const BOOKING_CODE_PREFIX = 'RB';

/** Storage key for Zustand persist */
export const STORAGE_KEY = 'booking-storage';
