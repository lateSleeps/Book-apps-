"use client";

import { useState } from "react";
import { useIsPreview } from "../preview-context";
import { BottomCTA } from "@/features/booking/components/bottom-cta";
import { FileUploader } from "@/features/booking/components/payment-options/FileUploader";
import { PaymentTimer } from "@/features/booking/components/payment-options/PaymentTimer";
import { PaymentTypeSelector } from "@/features/booking/components/payment-options/PaymentTypeSelector";
import { QRISDisplay } from "@/features/booking/components/payment-options/QRISDisplay";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";
import { getSupabaseClient } from "@/lib/supabase-client";
import { calculateEndTime } from "@/lib/time-utils";
import { trpc } from "@/lib/trpc";
import { InlineNotice } from "@/shared/components/ui/InlineNotice";

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
    if (isPreview) return;
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
      setError("Isi data kontak lengkap");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const endTimeStr = calculateEndTime(timeSlot, services[0].duration || 0);

      let paymentProofUrl: string | undefined = undefined;
      if (proofImageFile) {
        try {
          const supabase = getSupabaseClient();
          const fileName = `${Date.now()}-${proofImageFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from("payment-proofs")
            .upload(fileName, proofImageFile, {
              cacheControl: "3600",
              upsert: false,
            });
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage
            .from("payment-proofs")
            .getPublicUrl(fileName);
          paymentProofUrl = urlData?.publicUrl;
        } catch {
          setError("Gagal mengunggah bukti pembayaran. Coba lagi.");
          setIsSubmitting(false);
          return;
        }
      }

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
            if (
              value &&
              typeof value === "string" &&
              value.startsWith("blob:")
            ) {
              try {
                const response = await fetch(value);
                const blob = await response.blob();
                const fileName = `references/${Date.now()}-${key}.jpg`;
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
                  if (urlData?.publicUrl)
                    processedFormAnswers[key] = urlData.publicUrl;
                }
              } catch {
                /* continue */
              }
            }
          }
        } catch {
          /* continue */
        }
      }

      const notesStr =
        processedFormAnswers &&
        typeof processedFormAnswers === "object" &&
        !Array.isArray(processedFormAnswers)
          ? Object.entries(processedFormAnswers)
              .map(([key, value]) => {
                if (key === "catatan_tambahan") return null;
                if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
                if (value && typeof value === "string")
                  return `${key}: ${value}`;
                return null;
              })
              .filter(Boolean)
              .join("\n")
          : "";

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
    <div className="relative flex flex-col h-full overflow-hidden bg-bg-page">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* ── Header — same pattern as Ringkasan ── */}
        <div className="px-s20 pt-s20 pb-s4">
          <button
            onClick={onBack}
            aria-label="Kembali"
            className="mb-[16px] -ml-[4px] flex h-[44px] w-[44px] items-center justify-center rounded-full text-label2 transition-all active:scale-95"
          >
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-bg-card hover:bg-sep transition-colors">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
          </button>
          <p className="text-[11px] font-semibold text-label3 tracking-[0.08em] uppercase mb-[4px]">
            Langkah terakhir
          </p>
          <h1 className="text-ts-t2 font-bold text-label leading-tight tracking-tight">
            Selesaikan Pembayaran
          </h1>
          <p className="mt-[4px] text-ts-fn text-label2 leading-snug">
            Booking kamu hampir selesai.
          </p>
        </div>

        {/* ── Timer hero — tight to heading; number is the page's dominant element ── */}
        <div className="px-s20 pt-s12 pb-s4">
          <PaymentTimer />
        </div>

        {/* ── Content ── */}
        <div className="px-s16 pt-s16 pb-s24 space-y-s16">
          {error && <InlineNotice variant="warning" title={error} />}

          {/* ── Combined payment card: method selector + QRIS in one container ── */}
          <div className="bg-bg-card rounded-r20 shadow-card overflow-hidden">
            {/* Payment method tabs or deposit notice */}
            <div className="px-s16 pt-s16 pb-s16">
              <PaymentTypeSelector />
            </div>

            {/* QRIS — below tabs, separated by hairline divider */}
            {paymentType && (
              <div className="border-t border-sep">
                <QRISDisplay />
              </div>
            )}
          </div>

          {/* Upload proof — separate card below */}
          {paymentType && <FileUploader />}
        </div>
      </div>

      <BottomCTA
        label={
          isPreview
            ? "Pratinjau aktif"
            : isSubmitting
              ? "Memproses..."
              : "Saya Sudah Membayar →"
        }
        onClick={handleSubmit}
        disabled={isPreview || !canSubmit}
        variant={canSubmit && !isPreview ? "ready" : "default"}
      />
    </div>
  );
}
