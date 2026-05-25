import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function for combining classnames
 * Merges and deduplicates class names, useful for conditional styling
 *
 * @example
 * cn('px-2 py-1', condition && 'bg-red-500')
 * // => 'px-2 py-1 bg-red-500'
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
