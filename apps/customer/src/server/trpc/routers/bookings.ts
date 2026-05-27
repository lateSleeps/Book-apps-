import { supabase } from "@rara/database";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const bookingsRouter = router({
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
        customerEmail: z.string(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const confirmationCode =
        "BK" + Math.random().toString(36).substr(2, 9).toUpperCase();

      const { data, error } = await supabase
        .from("bookings")
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
            status: "pending",
          },
        ])
        .select();

      if (error) throw error;
      return data?.[0] || null;
    }),
});
