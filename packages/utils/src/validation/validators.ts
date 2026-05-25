/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Returns object with strength level and missing requirements
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  score: number;
  missing: string[];
} {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;
  const missing = Object.entries(requirements)
    .filter(([, passed]) => !passed)
    .map(([req]) => req);

  return {
    isStrong: score >= 4,
    score,
    missing,
  };
}

/**
 * Validate phone number (Indonesian format)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date is in future
 */
export function isDateInFuture(date: Date): boolean {
  return date > new Date();
}

/**
 * Validate date is in past
 */
export function isDateInPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Validate date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Validate time format (HH:mm)
 */
export function validateTimeFormat(time: string): boolean {
  const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validate that end time is after start time
 */
export function isEndTimeAfterStartTime(
  startTime: string,
  endTime: string
): boolean {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startTotalMinutes = startHour * 60 + startMin;
  const endTotalMinutes = endHour * 60 + endMin;

  return endTotalMinutes > startTotalMinutes;
}

/**
 * Validate that price is positive
 */
export function validatePrice(price: number): boolean {
  return price > 0 && Number.isFinite(price);
}

/**
 * Validate that capacity is positive integer
 */
export function validateCapacity(capacity: number): boolean {
  return capacity > 0 && Number.isInteger(capacity);
}

/**
 * Validate color format (hex)
 */
export function validateHexColor(color: string): boolean {
  const hexRegex = /^#[0-9A-F]{6}$/i;
  return hexRegex.test(color);
}

/**
 * Validate that two dates don't overlap
 */
export function datesDoNotOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return end1 <= start2 || end2 <= start1;
}

/**
 * Validate username (alphanumeric, underscore, hyphen, 3-20 chars)
 */
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}
