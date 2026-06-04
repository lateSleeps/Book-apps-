import { supabase } from '@rara/database';
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const bookingsRouter = router({
  getBySalon: publicProcedure.input(z.object({ salonId: z.string() })).query(async ({ input }) => {
    // Fetch bookings with proper joins for all required data
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select(
        `
        id,
        salon_id,
        service_id,
        stylist_id,
        booking_date,
        start_time,
        end_time,
        customer_name,
        customer_phone,
        customer_email,
        confirmation_code,
        status,
        notes,
        payment_proof_url,
        settlement_proof_url,
        payment_status,
        promo_code,
        addons,
        created_at,
        updated_at,
        services(id, name, duration, price, category_id, service_questions, categories(id, name)),
        stylists(id, user_id, users(id, full_name, email))
        `
      )
      .eq('salon_id', input.salonId)
      .order('booking_date', { ascending: false });

    if (bookingsError) {
      throw bookingsError;
    }

    // Transform data to match UI expectations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformed = (bookingsData || []).map((booking: any) => {
      const stylistName = booking.stylists?.users?.full_name || '-';
      const stylistInitials = stylistName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      return {
        id: booking.id,
        bookingCode: booking.confirmation_code,
        customerName: booking.customer_name,
        customerPhone: booking.customer_phone,
        customerEmail: booking.customer_email,
        serviceName: booking.services?.name || '-',
        categoryName: booking.services?.categories?.name || '-',
        stylistName,
        stylistInitials,
        stylistColor: '#888888', // Default color, could be enhanced with user preferences
        date: booking.booking_date,
        timeSlot: booking.start_time,
        endTime: booking.end_time,
        duration: booking.services?.duration || 0,
        price: booking.services?.price || 0,
        status: booking.status,
        notes: booking.notes,
        paymentProofUrl: booking.payment_proof_url,
        settlementProofUrl: booking.settlement_proof_url ?? null,
        paymentStatus: (() => {
          const raw = (booking.payment_status || '').toLowerCase();
          if (raw === 'paid') return 'PAID';
          if (raw === 'dp' || raw === 'deposit') return 'DEPOSIT';
          return 'UNPAID';
        })(),
        promoCode: booking.promo_code,
        addOns: booking.addons ? (Array.isArray(booking.addons) ? booking.addons : []) : undefined,
        serviceQuestions: booking.services?.service_questions || [],
        visitorType: (booking.notes === 'Walk-in' ? 'WALK_IN' : 'BOOKING') as 'WALK_IN' | 'BOOKING',
        createdAt: booking.created_at,
      };
    });

    return transformed;
  }),

  create: publicProcedure
    .input(
      z.object({
        salonId: z.string(),
        serviceId: z.string(),
        stylistId: z.string(),
        bookingDate: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        customerName: z.string(),
        customerPhone: z.string(),
        customerEmail: z.string().optional().default(''),
        notes: z.string().optional(),
        paymentStatus: z.enum(['dp', 'lunas', 'pending']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const confirmationCode = 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const isWalkIn = input.notes === 'Walk-in';

      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            salon_id: input.salonId,
            service_id: input.serviceId,
            stylist_id: input.stylistId,
            booking_date: input.bookingDate,
            start_time: input.startTime,
            end_time: input.endTime,
            customer_name: input.customerName,
            customer_phone: input.customerPhone,
            customer_email: input.customerEmail,
            notes: input.notes || null,
            confirmation_code: confirmationCode,
            status: isWalkIn ? 'CONFIRMED' : 'pending',
            payment_status: isWalkIn ? 'lunas' : input.paymentStatus ?? 'dp',
          },
        ])
        .select('id, confirmation_code, status, payment_status');

      if (error) throw error;
      return data?.[0] || null;
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
        status: z.enum(['CONFIRMED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW']),
        cancellationReason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updateData: {
        status: string;
        updated_at: string;
        cancellation_reason?: string;
      } = {
        status: input.status,
        updated_at: new Date().toISOString(),
      };

      if (input.status === 'CANCELLED') {
        updateData.cancellation_reason =
          input.cancellationReason ??
          'Maaf, stylist sudah memiliki booking lain pada jam tersebut.';
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', input.bookingId)
        .select('id, status, updated_at');

      if (error) throw error;
      return data?.[0] || null;
    }),

  processPayment: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
        paymentMethod: z.enum(['cash', 'transfer', 'qris']),
        amountReceived: z.number().int().min(0),
        servicePrice: z.number().int().min(0),
        settlementProofUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const changeAmount =
        input.paymentMethod === 'cash' ? Math.max(0, input.amountReceived - input.servicePrice) : 0;
      const effectiveAmount =
        input.paymentMethod === 'cash' ? input.amountReceived : input.servicePrice;

      const { data, error } = await supabase
        .from('bookings')
        .update({
          payment_status: 'lunas',
          payment_method: input.paymentMethod,
          amount_paid: effectiveAmount,
          change_amount: changeAmount,
          paid_at: new Date().toISOString(),
          status: 'COMPLETED',
          updated_at: new Date().toISOString(),
          ...(input.settlementProofUrl ? { settlement_proof_url: input.settlementProofUrl } : {}),
        })
        .eq('id', input.bookingId)
        .select('id, payment_status, status')
        .single();

      if (error) {
        // Only fall back if the error is due to missing columns (migration not yet run)
        if (!error.message?.includes('column') && !error.message?.includes('does not exist')) {
          throw error;
        }
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('bookings')
          .update({
            payment_status: 'lunas',
            status: 'COMPLETED',
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.bookingId)
          .select('id, payment_status, status')
          .single();

        if (fallbackError) throw fallbackError;
        return { ...fallbackData, changeAmount, amountReceived: effectiveAmount };
      }

      return { ...data, changeAmount, amountReceived: effectiveAmount };
    }),
});
