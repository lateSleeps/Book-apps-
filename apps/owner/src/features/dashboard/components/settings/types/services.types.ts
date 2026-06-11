// Services Domain — source of truth for the salon catalog.
// DB column mapping: docs/settings-v2/services-database-contract.md

// ── Enums ─────────────────────────────────────────────────────────────────────

export type ServicePriceType = 'fixed' | 'starting_from';

/**
 * Drives customer booking flow routing:
 * - STYLING_HAIR   -> stylist selection step, hair consultation
 * - STYLING_COLOUR -> stylist selection step, colour consultation
 * - STYLING_NAIL   -> nail technician step, nail consultation
 * - TREATMENT      -> no specialist required by default (facial, massage, etc.)
 */
export type ServiceFlow = 'STYLING_HAIR' | 'STYLING_COLOUR' | 'STYLING_NAIL' | 'TREATMENT';

export type QuestionType = 'chips' | 'photo' | 'text';

// ── Category ──────────────────────────────────────────────────────────────────

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  /** Tailwind bg class for customer app card. e.g. 'bg-c-peach' */
  color: string;
  /** Hex color for blob/glow effect in customer app. e.g. '#f5c4ab' */
  blobColor: string;
  /** Phosphor icon name for category card. e.g. 'Scissors' */
  iconName: string;
  isActive: boolean;
  sortOrder: number;
}

// ── Consultation Question ─────────────────────────────────────────────────────

export interface ServiceQuestion {
  id: string;
  serviceId: string;
  label: string;
  type: QuestionType;
  required: boolean;
  /** Options for chips type. Empty array for photo/text. */
  options: string[];
  sortOrder: number;
  isActive: boolean;
}

// ── Service ───────────────────────────────────────────────────────────────────

export interface ServiceItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  /** Price in IDR (smallest unit, rupiah) */
  price: number;
  /** Duration in minutes */
  duration: number;
  priceType: ServicePriceType;
  serviceFlow: ServiceFlow;
  /** When true, customer must select a specific stylist */
  requiresSpecialist: boolean;
  isActive: boolean;
  sortOrder: number;
  questions: ServiceQuestion[];
}

// ── Add-on Product ────────────────────────────────────────────────────────────

export interface AddOnProduct {
  id: string;
  name: string;
  description: string;
  /** Price in IDR */
  price: number;
  /** Product image URL (WebP). Null until uploaded. */
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

// ── Bundle ────────────────────────────────────────────────────────────────────

export interface ServiceBundle {
  id: string;
  name: string;
  description: string;
  /** IDs of ServiceItem included in this bundle */
  serviceIds: string[];
  /** Bundle price (usually lower than sum of individual services) */
  bundlePrice: number;
  /** Cover image URL (WebP). Null until uploaded. */
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

// ── Aggregate ─────────────────────────────────────────────────────────────────

/** Services domain — owned exclusively by useServicesController */
export interface ServicesDomain {
  categories: ServiceCategory[];
  services: ServiceItem[];
}
