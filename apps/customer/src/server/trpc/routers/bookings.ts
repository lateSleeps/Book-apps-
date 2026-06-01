import { supabase } from "@rara/database";
import { TRPCError } from "@trpc/server";
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
        notes: z.string().optional(),
        paymentProofUrl: z.string().optional(),
        paymentStatus: z
          .enum(["dp", "lunas", "pending"])
          .optional()
          .default("dp"),
        addons: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              price: z.number(),
              quantity: z.number(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const confirmationCode =
        "BK" + Math.random().toString(36).substr(2, 9).toUpperCase();

      const bookingData = {
        salon_id: input.salonId,
        service_id: input.serviceId,
        stylist_id: input.stylistId,
        booking_date: input.bookingDate,
        start_time: input.startTime,
        end_time: input.endTime,
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        customer_email: null,
        notes: input.notes || null,
        confirmation_code: confirmationCode,
        status: "pending",
        payment_proof_url: input.paymentProofUrl || null,
        payment_status: input.paymentStatus || "dp",
        addons: input.addons && input.addons.length > 0 ? input.addons : null,
      };

      try {
        const { data, error } = await supabase
          .from("bookings")
          .insert([bookingData])
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        return data;
      } catch (e: unknown) {
        if (e instanceof TRPCError) throw e;
        const err = e instanceof Error ? e : new Error(String(e));
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message || "Failed to create booking",
        });
      }
    }),

  getByCode: publicProcedure
    .input(
      z.object({
        customerPhone: z.string(),
        pin: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const normalizedPhone = input.customerPhone
        .replace(/\D/g, "")
        .replace(/^62/, "0");

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          confirmation_code,
          status,
          booking_date,
          start_time,
          customer_name,
          customer_phone,
          payment_status,
          services(name),
          stylists(user_id, users(full_name))
        `,
        )
        .or(
          `customer_phone.eq.${normalizedPhone},customer_phone.eq.62${normalizedPhone.slice(1)}`,
        )
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        confirmationCode: data.confirmation_code,
        status: data.status,
        bookingDate: data.booking_date,
        startTime: data.start_time,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        paymentStatus: data.payment_status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceName: (data.services as any)?.name || "-",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stylistName: (data.stylists as any)?.users?.full_name || "-",
        pin: data.confirmation_code.slice(-4).toUpperCase(),
      };
    }),
});
