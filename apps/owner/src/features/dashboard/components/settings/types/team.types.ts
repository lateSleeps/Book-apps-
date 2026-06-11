// Team Domain — source of truth for staff, schedules, and assignments.
// DB column mapping: future docs/settings-v2/team-database-contract.md

// ── Enums ─────────────────────────────────────────────────────────────────────

export type StaffRole =
  | 'OWNER'
  | 'STYLIST'
  | 'COLORIST'
  | 'NAIL_ARTIST'
  | 'THERAPIST'
  | 'RECEPTIONIST';

// Maps to ServiceFlow in services.types:
// HAIR_STYLIST  <- STYLING_HAIR
// COLORIST      <- STYLING_COLOUR
// NAIL_ARTIST   <- STYLING_NAIL
// THERAPIST     <- TREATMENT
export type StaffSpecialty = 'HAIR_STYLIST' | 'COLORIST' | 'NAIL_ARTIST' | 'THERAPIST';

export type LeaveType = 'LEAVE' | 'SICK' | 'HOLIDAY' | 'UNAVAILABLE';

export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

// ── Staff Member ──────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  fullName: string;
  phone: string;
  role: StaffRole;
  /** Null when role does not require service-based specialist routing */
  specialty: StaffSpecialty | null;
  /** Uploaded photo URL (WebP). Null until uploaded; falls back to initials. */
  avatarUrl: string | null;
  /** Hex color for initials avatar background */
  avatarColor: string;
  isActive: boolean;
}

// ── Service Assignment ────────────────────────────────────────────────────────

export interface ServiceAssignment {
  staffId: string;
  /** Array of ServiceItem IDs this staff member can perform */
  serviceIds: string[];
}

// ── Weekly Schedule ───────────────────────────────────────────────────────────

export interface DaySchedule {
  day: WeekDay;
  enabled: boolean;
  /** HH:mm — only meaningful when enabled = true */
  startTime: string;
  /** HH:mm — only meaningful when enabled = true */
  endTime: string;
}

export interface WeeklySchedule {
  staffId: string;
  days: DaySchedule[];
}

// ── Leave & Unavailable ───────────────────────────────────────────────────────

export interface StaffLeave {
  id: string;
  staffId: string;
  type: LeaveType;
  /** ISO date YYYY-MM-DD */
  date: string;
  note: string;
}

// ── Aggregate ─────────────────────────────────────────────────────────────────

export interface TeamDomain {
  staff: StaffMember[];
  assignments: ServiceAssignment[];
  schedules: WeeklySchedule[];
  leaves: StaffLeave[];
}
