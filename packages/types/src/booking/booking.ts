import { z } from 'zod';
import { BookingStatus, PaymentStatus } from './enums';

export const BookingSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  serviceId: z.string(),
  stylistId: z.string(),
  bookingDate: z.date(),
  startTime: z.string(), // HH:mm format
  endTime: z.string(), // HH:mm format
  status: z.nativeEnum(BookingStatus),
  paymentStatus: z.nativeEnum(PaymentStatus),
  totalPrice: z.number(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const BookingStateSchema = z.object({
  bookings: z.array(BookingSchema),
  selectedDate: z.date().optional(),
  filter: z.object({
    status: z.nativeEnum(BookingStatus).optional(),
    stylistId: z.string().optional(),
  }).optional(),
  loading: z.boolean().default(false),
  error: z.string().nullable().optional(),
});

export type Booking = z.infer<typeof BookingSchema>;
export type BookingState = z.infer<typeof BookingStateSchema>;
