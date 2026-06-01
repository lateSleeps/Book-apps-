export type BookingStatus =
  | 'UPCOMING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';
export type PaymentStatus = 'UNPAID' | 'DEPOSIT' | 'PAID';
export type VisitorType = 'BOOKING' | 'WALK_IN';

export interface AddOn {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

export interface ServiceQuestion {
  id: string;
  question: string;
  type: 'chips' | 'photo';
  required: boolean;
  options: string[];
}

export interface DashboardBooking {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceName: string;
  categoryName: string;
  stylistName: string;
  stylistInitials: string;
  stylistColor: string;
  date: string;
  timeSlot: string;
  endTime: string;
  createdAt?: string;
  duration: number;
  price: number;
  status: BookingStatus;
  visitorType: VisitorType;
  addOns?: AddOn[];
  notes?: string;
  paymentProofUrl?: string;
  paymentStatus?: 'PAID' | 'DEPOSIT' | 'UNPAID';
  promoCode?: string;
  serviceQuestions?: ServiceQuestion[];
}

export interface DashboardStats {
  revenueToday: number;
  revenueDelta: number;
  bookingsToday: number;
  bookingsDelta: number;
  avgRating: number;
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
