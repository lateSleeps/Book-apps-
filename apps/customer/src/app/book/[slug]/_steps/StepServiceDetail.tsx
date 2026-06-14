"use client";

import { useState, useRef } from "react";
import { BottomCTA } from "@/components/ui/BottomCTA";
import { QuestionSectionHeader } from "@/features/booking/components/question-section-header/QuestionSectionHeader";
import { ReferenceUploadRow } from "@/features/booking/components/reference-upload-row/ReferenceUploadRow";
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
    console.log("[StepServiceDetail] Saving form answers:", merged);
    setFormAnswers(merged as Parameters<typeof setFormAnswers>[0]);
    try {
      localStorage.setItem("service_detail_answers", JSON.stringify(merged));
    } catch {}
    onNext();
  }

  if (!service) {
    return (
      <div className="flex h-full items-center justify-center bg-bg-page">
        <p className="text-ts-fn text-tx-muted">Tidak ada layanan dipilih.</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-bg-page">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* ── Page header — on canvas ── */}
        <div className="px-s20 pt-s20 pb-s4">
          <button
            onClick={onBack}
            aria-label="Kembali"
            className="mb-s20 flex h-[36px] w-[36px] items-center justify-center rounded-full bg-bg-card text-tx-secondary transition-all hover:bg-sep active:scale-95"
          >
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
          </button>
          <h1 className="text-[28px] font-bold text-tx-primary leading-tight tracking-tight">
            Detail layanan
          </h1>
          <p className="mt-[6px] text-[15px] text-tx-secondary leading-snug">
            Bantu stylist memahami preferensimu.
          </p>
        </div>

        {/* ── Single white form card ── */}
        <div className="px-s16 pt-s20 pb-s40">
          <div className="bg-bg-card rounded-r20 shadow-card px-s20 py-s24 flex flex-col gap-s32">
            {questions.length === 0 && (
              <p className="text-ts-fn text-tx-muted">
                Tidak ada pertanyaan untuk layanan ini.
              </p>
            )}

            {questions.map((q) => (
              <div key={q.id}>
                <QuestionSectionHeader
                  title={q.question}
                  required={q.required}
                />

                {/* Chips */}
                {q.type === "chips" && (
                  <div className="flex flex-wrap gap-[7px]">
                    {q.options.map((opt) => {
                      const selected = (chipAnswers[q.id] ?? []).includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleChip(q.id, opt)}
                          className={cn(
                            "rounded-full px-[13px] py-[6px] text-[13px] font-medium",
                            "transition-all duration-150 active:scale-95",
                            selected
                              ? "bg-tx-primary text-bg-card"
                              : "border border-bd-card bg-bg-card text-tx-secondary",
                          )}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Photo */}
                {q.type === "photo" && (
                  <div className="mt-[4px]">
                    {photoAnswers[q.id] ? (
                      <div className="relative w-full overflow-hidden rounded-r16">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoAnswers[q.id]!}
                          alt="Referensi"
                          className="h-[90px] w-full rounded-r16 object-cover"
                        />
                        <button
                          onClick={() => removePhoto(q.id)}
                          className="absolute right-[8px] top-[8px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all active:scale-95"
                          aria-label="Hapus foto"
                        >
                          <svg
                            width="9"
                            height="9"
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
                      <ReferenceUploadRow
                        onClick={() => fileInputRefs.current[q.id]?.click()}
                      />
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

            {/* ── Notes ── */}
            <div>
              <QuestionSectionHeader title="Catatan untuk stylist" />
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: tolong layered tipis di bagian dalam, poni panjang..."
                rows={3}
                className={cn(
                  "mt-[4px] w-full resize-none rounded-r16 px-[14px] py-[12px]",
                  "border border-bd-card bg-bg-page",
                  "text-[14px] text-tx-primary leading-relaxed",
                  "placeholder:text-tx-muted",
                  "focus:border-tx-secondary focus:outline-none transition-colors",
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <BottomCTA
        label={allRequiredAnswered ? "Lanjut pilih stylist →" : "Lengkapi dulu"}
        variant={allRequiredAnswered ? "ready" : "default"}
        disabled={!allRequiredAnswered}
        onClick={handleContinue}
      />
    </div>
  );
}
