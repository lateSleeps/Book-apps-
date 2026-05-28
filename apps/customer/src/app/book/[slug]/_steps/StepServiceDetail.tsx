"use client";

import { useState, useRef } from "react";
import { BottomCTA } from "@/components/ui/BottomCTA";
import { StepHeader } from "@/features/booking/components/step-header";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";
import { cn } from "@/shared/lib/cn";

interface ServiceQuestion {
  id: string;
  question: string;
  type: "chips" | "photo";
  required: boolean;
  options: string[];
}

type ChipAnswers = Record<string, string[]>;
type PhotoAnswers = Record<string, string | null>;

function OpsionalBadge() {
  return (
    <span className="flex-shrink-0 rounded-full border border-gray-200 px-[8px] py-[2px] text-[10px] font-medium text-gray-400">
      Opsional
    </span>
  );
}

function WajibBadge() {
  return (
    <span className="flex-shrink-0 rounded-full bg-red-50 border border-red-100 px-[10px] py-[3px] text-[10px] font-semibold uppercase tracking-wide text-red-500">
      Wajib
    </span>
  );
}

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepServiceDetail({ onNext, onBack }: Props) {
  const { services, setFormAnswers } = useBookingStore();

  const service = services[0] as
    | ((typeof services)[0] & {
        requires_specialist?: boolean;
        service_questions?: ServiceQuestion[];
        category?: { name?: string };
      })
    | undefined;

  const rawQuestions = service?.service_questions;
  const questions: ServiceQuestion[] = Array.isArray(rawQuestions)
    ? rawQuestions
    : [];
  console.log("[StepServiceDetail] service:", service);
  console.log(
    "[StepServiceDetail] requires_specialist:",
    service?.requires_specialist,
  );
  console.log("[StepServiceDetail] service_questions:", rawQuestions);

  const [chipAnswers, setChipAnswers] = useState<ChipAnswers>({});
  const [photoAnswers, setPhotoAnswers] = useState<PhotoAnswers>({});
  const [catatan, setCatatan] = useState("");
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function toggleChip(questionId: string, option: string) {
    setChipAnswers((prev) => {
      const current = prev[questionId] ?? [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: next };
    });
  }

  function handlePhotoChange(questionId: string, file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoAnswers((prev) => ({ ...prev, [questionId]: url }));
  }

  function removePhoto(questionId: string) {
    const prev = photoAnswers[questionId];
    if (prev) URL.revokeObjectURL(prev);
    setPhotoAnswers((p) => ({ ...p, [questionId]: null }));
    const input = fileInputRefs.current[questionId];
    if (input) input.value = "";
  }

  const allRequiredAnswered = questions.every((q) => {
    if (!q.required) return true;
    if (q.type === "chips") return (chipAnswers[q.id] ?? []).length > 0;
    if (q.type === "photo") return !!photoAnswers[q.id];
    return true;
  });

  function handleContinue() {
    const merged: Record<string, string | string[]> = {
      catatan_tambahan: catatan,
    };
    questions.forEach((q) => {
      if (q.type === "chips") merged[q.id] = chipAnswers[q.id] ?? [];
      if (q.type === "photo") merged[q.id] = photoAnswers[q.id] ?? "";
    });
    setFormAnswers(merged as Parameters<typeof setFormAnswers>[0]);
    try {
      localStorage.setItem("service_detail_answers", JSON.stringify(merged));
    } catch {}
    onNext();
  }

  if (!service) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-label3">Tidak ada layanan dipilih.</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <StepHeader
          title="Detail Potongan"
          subtitle="Bantu kami memahami preferensimu sebelum bertemu stylist."
          onBack={onBack}
        />

        <div className="flex flex-col gap-6 px-4 pt-4 pb-32">
          {questions.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <p className="text-[13px] text-gray-400">
                Tidak ada pertanyaan untuk layanan ini.
              </p>
            </div>
          )}

          {questions.map((q) => (
            <div key={q.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  {q.question}
                </p>
                {q.required ? <WajibBadge /> : <OpsionalBadge />}
              </div>

              {q.type === "chips" && (
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => {
                    const selected = (chipAnswers[q.id] ?? []).includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleChip(q.id, opt)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-150 active:scale-95",
                          selected
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === "photo" && (
                <div>
                  {photoAnswers[q.id] ? (
                    <div className="relative w-full overflow-hidden rounded-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoAnswers[q.id]!}
                        alt="Referensi"
                        className="h-[200px] w-full rounded-2xl object-cover"
                      />
                      <button
                        onClick={() => removePhoto(q.id)}
                        className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70 active:scale-95"
                        aria-label="Hapus foto"
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRefs.current[q.id]?.click()}
                      className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white px-5 py-9 transition-all hover:border-gray-400 active:scale-[0.99]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="3" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-[14px] font-semibold text-gray-500">
                          Upload foto referensi
                        </p>
                        <p className="mt-0.5 text-[12px] text-gray-400">
                          JPG atau PNG · maks 5 MB
                        </p>
                      </div>
                    </button>
                  )}
                  <input
                    ref={(el) => {
                      fileInputRefs.current[q.id] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handlePhotoChange(q.id, e.target.files?.[0] ?? null)
                    }
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Catatan Tambahan
              </p>
              <OpsionalBadge />
            </div>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: tolong layered tipis di bagian dalam, poni panjang..."
              rows={4}
              className="w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-[14px] text-gray-800 leading-relaxed placeholder:text-gray-300 focus:border-gray-400 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <BottomCTA
        label={
          allRequiredAnswered ? "Lanjut Pilih Stylist →" : "Lengkapi form dulu"
        }
        disabled={!allRequiredAnswered}
        onClick={handleContinue}
      />
    </div>
  );
}
