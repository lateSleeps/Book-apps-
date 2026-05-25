/**
 * Format price to IDR currency with proper formatting
 * e.g., 1000 => "Rp 1.000"
 */
export function formatPrice(price: number, locale: string = 'id-ID'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format large numbers with separator
 * e.g., 1000000 => "1,000,000"
 */
export function formatNumber(
  value: number,
  locale: string = 'id-ID'
): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format decimal number
 * e.g., 1234.56 => "1,234.56"
 */
export function formatDecimal(
  value: number,
  decimals: number = 2,
  locale: string = 'id-ID'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage
 * e.g., 0.25 => "25%"
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Parse price string to number
 * e.g., "Rp 1.000" => 1000
 */
export function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Format time duration in minutes to HH:mm format
 * e.g., 90 => "01:30"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Format rating with stars
 * e.g., 4.5 => "4.5 ★"
 */
export function formatRating(rating: number, maxStars: number = 5): string {
  if (rating < 0 || rating > maxStars) {
    return '0 ★';
  }
  return `${rating.toFixed(1)} ★`;
}
