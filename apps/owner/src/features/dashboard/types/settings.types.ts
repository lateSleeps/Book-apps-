// Salon Profile
export interface SalonProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  bankAccount?: string;
  taxId?: string;
  establishedYear?: number;
}

// Services & Categories
export interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface ServiceQuestion {
  id: string;
  question: string;
  type: 'chips' | 'photo';
  required: boolean;
  options: string[];
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  duration: number; // in minutes
  description?: string;
  isActive: boolean;
  price_type?: 'fixed' | 'starting_from';
  requires_specialist?: boolean;
  service_questions?: ServiceQuestion[];
}

// Team/Staff
export type StaffRole = 'STYLIST' | 'THERAPIST' | 'BARBER' | 'NAIL_ARTIST' | 'MASSAGE_THERAPIST';

export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface DaySchedule {
  dayName: string;
  slots: TimeSlot[];
}

export interface RecurringBreak {
  id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
}

export interface HolidayOff {
  id: string;
  date: string; // YYYY-MM-DD
  reason?: string;
}

export interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  phone?: string;
  email?: string;
  joinDate: string; // YYYY-MM-DD
  status: 'ACTIVE' | 'INACTIVE';
  availability: WeeklySchedule;
  recurringBreaks: RecurringBreak[];
  holidaysOff: HolidayOff[];
  serviceIds: string[];
  color: string; // hex color for avatar
  initials: string;
}

// Add-Ons
export interface AddOnProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  isActive: boolean;
}

// Shift Templates
export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

// Settings State Container
export interface SalonSettings {
  profile: SalonProfile;
  serviceCategories: ServiceCategory[];
  services: Service[];
  staff: StaffMember[];
  addOns: AddOnProduct[];
}

// Form State Types
export interface ServiceFormData extends Omit<Service, 'id'> {}
export interface StaffFormData extends Omit<StaffMember, 'id'> {}
export interface AddOnFormData extends Omit<AddOnProduct, 'id'> {}
export interface ServiceCategoryFormData extends Omit<ServiceCategory, 'id'> {}
