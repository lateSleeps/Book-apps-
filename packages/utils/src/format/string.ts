/**
 * Capitalize first letter of a string
 * e.g., "hello" => "Hello"
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert to title case
 * e.g., "hello world" => "Hello World"
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Convert to kebab case
 * e.g., "Hello World" => "hello-world"
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Convert to snake case
 * e.g., "Hello World" => "hello_world"
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1_$2')
    .toLowerCase();
}

/**
 * Convert to camel case
 * e.g., "hello-world" => "helloWorld"
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '');
}

/**
 * Truncate string to specified length with ellipsis
 * e.g., truncateString("Hello World", 8) => "Hello..."
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Extract numbers from string
 * e.g., "Price: 1500" => "1500"
 */
export function extractNumbers(str: string): string {
  return str.replace(/[^\d]/g, '');
}

/**
 * Remove special characters
 * e.g., "Hello@World#123!" => "HelloWorld123"
 */
export function removeSpecialChars(str: string): string {
  return str.replace(/[^a-zA-Z0-9\s]/g, '');
}

/**
 * Check if string is email
 */
export function isEmail(str: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

/**
 * Check if string is phone number (Indonesian format)
 */
export function isPhoneNumber(str: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(str.replace(/\s|-/g, ''));
}

/**
 * Slugify string for URL
 * e.g., "Hello World 123!" => "hello-world-123"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Highlight text with search term
 * e.g., highlightText("Hello World", "World") => "Hello <mark>World</mark>"
 */
export function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
