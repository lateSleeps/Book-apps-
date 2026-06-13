"use client";

import { useState } from "react";
import { useIsPreview } from "../preview-context";
import { BottomCTA } from "@/features/booking/components/bottom-cta";
import { PaymentOptions } from "@/features/booking/components/payment-options";
import { StepHeader } from "@/features/booking/components/step-header";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";
import { getSupabaseClient } from "@/lib/supabase-client";
import { calculateEndTime } from "@/lib/time-utils";
import { trpc } from "@/lib/trpc";

interface Props {
  onNext: () => void;
  onBack: () => void;
  slug: string;
}

export function StepPayment({ onNext, onBack, slug }: Props) {
  const isPreview = useIsPreview();
  const {
    paymentType,
    proofImageUrl,
    proofImageFile,
    confirmBooking,
    services,
    stylist,
    date,
    timeSlot,
    customerName,
    customerPhone,
    customerEmail,
    formAnswers,
    addons,
  } = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch salon ID from slug
  const { data: salon } = trpc.salons.getBySlug.useQuery({ slug });

  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: () => {
      confirmBooking();
      onNext();
    },
    onError: (err) => {
      setError(err.message || "Gagal membuat pemesanan. Coba lagi.");
      setIsSubmitting(false);
    },
  });

  async function handleSubmit() {
    if (isPreview) return; // Block all mutations in preview mode
    // Validation phase
    if (!services.length) {
      setError("Pilih minimal satu layanan");
      return;
    }

    if (!salon?.id) {
      setError("Salon tidak ditemukan");
      return;
    }

    if (!stylist) {
      setError("Pilih stylist");
      return;
    }

    if (!date || !timeSlot) {
      setError("Pilih tanggal dan waktu");
      return;
    }

    if (!customerName || !customerPhone) {
      setError("Isi data kontak lengkap (nama, no. telp)");
      return;
    }

    // Set submitting state only after validation passes
    setIsSubmitting(true);
    setError(null);

    try {
      const endTimeStr = calculateEndTime(timeSlot, services[0].duration || 0);

      // Upload payment proof to Supabase Storage if file exists
      let paymentProofUrl: string | undefined = undefined;
      if (proofImageFile) {
        try {
          const supabase = getSupabaseClient();

          // Generate unique filename
          const timestamp = Date.now();
          const fileName = `${timestamp}-${proofImageFile.name}`;

          // Upload file to payment-proofs bucket
          const { error: uploadError } = await supabase.storage
            .from("payment-proofs")
            .upload(fileName, proofImageFile, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error("[StepPayment] Upload error:", uploadError);
            throw uploadError;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from("payment-proofs")
            .getPublicUrl(fileName);

          paymentProofUrl = urlData?.publicUrl;
        } catch (uploadErr) {
          setError("Gagal mengunggah bukti pembayaran. Coba lagi.");
          setIsSubmitting(false);
          return;
        }
      }

      // Upload reference photos from form answers to Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const processedFormAnswers = { ...formAnswers } as Record<string, any>;
      if (
        formAnswers &&
        typeof formAnswers === "object" &&
        !Array.isArray(formAnswers)
      ) {
        try {
          const supabase = getSupabaseClient();

          for (const [key, value] of Object.entries(formAnswers)) {
            // If value is a blob URL, upload it to Supabase Storage
            if (
              value &&
              typeof value === "string" &&
              value.startsWith("blob:")
            ) {
              try {
                const response = await fetch(value);
                const blob = await response.blob();
                const timestamp = Date.now();
                const fileName = `references/${timestamp}-${key}.jpg`;

                const { error: uploadError } = await supabase.storage
                  .from("payment-proofs")
                  .upload(fileName, blob, {
                    cacheControl: "3600",
                    upsert: false,
                  });

                if (!uploadError) {
                  const { data: urlData } = supabase.storage
                    .from("payment-proofs")
                    .getPublicUrl(fileName);
                  if (urlData?.publicUrl) {
                    processedFormAnswers[key] = urlData.publicUrl;
                  }
                }
              } catch (err) {
                console.warn(
                  "[StepPayment] Failed to upload reference photo:",
                  err,
                );
                // Continue without uploading this photo
              }
            }
          }
        } catch (err) {
          console.warn("[StepPayment] Error processing form answers:", err);
        }
      }

      // Convert form answers object to readable string
      // Format: "q1: answer\nq2: answer\nq3: https://photo-url"
      let notesStr = "";

      if (
        processedFormAnswers &&
        typeof processedFormAnswers === "object" &&
        !Array.isArray(processedFormAnswers)
      ) {
        const entries = Object.entries(processedFormAnswers)
          .map(([key, value]) => {
            // Skip catatan_tambahan for now (can add later if needed)
            if (key === "catatan_tambahan") return null;

            if (Array.isArray(value)) {
              // Chips question: q1: Option1, Option2
              return `${key}: ${value.join(", ")}`;
            } else if (value && typeof value === "string") {
              // Photo or text question: q2: answer or q3: https://photo-url
              return `${key}: ${value}`;
            }
            return null;
          })
          .filter(Boolean);

        notesStr = entries.join("\n");
      }

      await createBooking.mutateAsync({
        salonId: salon!.id,
        serviceId: services[0].id,
        stylistId: stylist.id,
        bookingDate: date,
        startTime: timeSlot,
        endTime: endTimeStr,
        customerName,
        customerPhone,
        customerEmail: customerEmail || "",
        notes: notesStr,
        paymentProofUrl,
        paymentStatus: "dp",
        addons: addons.length > 0 ? addons : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pemesanan");
      setIsSubmitting(false);
    }
  }

  const canSubmit = !!paymentType && !!proofImageUrl && !isSubmitting;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <StepHeader
        title="Pembayaran"
        subtitle="Pilih metode dan unggah bukti bayar"
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="px-s16 py-s32">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <PaymentOptions />
        </div>
      </div>
      <BottomCTA
        label={
          isPreview
            ? "Pratinjau — Pembayaran dinonaktifkan"
            : isSubmitting
              ? "Memproses..."
              : "Konfirmasi Pembayaran →"
        }
        onClick={handleSubmit}
        disabled={isPreview || !canSubmit}
        variant={canSubmit && !isPreview ? "ready" : "default"}
      />
    </div>
  );
}
