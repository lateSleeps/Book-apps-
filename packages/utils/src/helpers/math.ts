/**
 * Calculate percentage of a number
 */
export function calculatePercentage(value: number, percentage: number): number {
  return (value * percentage) / 100;
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(
  originalPrice: number,
  discountPercentage: number
): number {
  return originalPrice - calculatePercentage(originalPrice, discountPercentage);
}

/**
 * Round a number to specified decimal places
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Calculate service duration in hours
 */
export function minutesToHours(minutes: number): number {
  return minutes / 60;
}

/**
 * Calculate service duration in minutes
 */
export function hoursToMinutes(hours: number): number {
  return hours * 60;
}

/**
 * Calculate total price with tax
 */
export function calculateWithTax(
  basePrice: number,
  taxPercentage: number = 10
): number {
  return basePrice + calculatePercentage(basePrice, taxPercentage);
}

/**
 * Check if a number is within a range
 */
export function isInRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}
