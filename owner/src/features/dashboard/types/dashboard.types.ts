export type BookingStatus = 'UPCOMING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type PaymentStatus = 'UNPAID' | 'DEPOSIT' | 'PAID';
export type VisitorType = 'BOOKING' | 'WALK_IN';

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface DashboardBooking {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  categoryName: string;
  stylistName: string;
  stylistInitials: string;
  stylistColor: string;
  date: string;
  timeSlot: string;
  duration: number;
  price: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentType: 'DEPOSIT' | 'FULL' | null;
  visitorType: VisitorType;
  addOns?: AddOn[];
  treatmentNotes?: string;
  notes?: string;
}

export interface DashboardStats {
  revenueToday: number;
  revenueDelta: number;
  bookingsToday: number;
  bookingsDelta: number;
  avgBookingValue: number;
  completionRate: number;
  activeStylists: number;
  totalStylists: number;
}

export interface DashboardStylist {
  id: string;
  name: string;
  initials: string;
  color: string;
}
