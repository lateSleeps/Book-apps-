'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { BottomCTA } from '@/features/booking/components/bottom-cta';
import { StepHeader } from '@/features/booking/components/step-header';
import { ErrorAlert } from '@/features/booking/components/error-alert';
import { FieldError } from '@/features/booking/components/field-error';
import { cn } from '@/shared/lib/cn';
import type { FormAnswers } from '@/features/booking/types/booking.types';

interface PageProps {
  params: { slug: string };
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-rF px-s16 py-s8 text-[14px] font-semibold transition-all duration-150 active:scale-[0.97]',
        selected ? 'bg-label text-white' : 'bg-surface border border-sep text-label2'
      )}
    >
      {label}
    </button>
  );
}

function Question({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-s12">
      <div className="flex items-center gap-s8">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-label3">{label}</p>
        {required
          ? <span className="rounded-full bg-red-500 px-[8px] py-[2px] text-[10px] font-bold text-white">Wajib</span>
          : <span className="rounded-full border border-sep px-[8px] py-[2px] text-[10px] font-medium text-label3">Opsional</span>
        }
      </div>
      <div className="flex flex-wrap gap-s8">{children}</div>
    </div>
  );
}

function NotesField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full rounded-r16 border border-sep bg-surface px-s16 py-s12 text-[14px] text-label placeholder:text-label3 outline-none focus:border-label2 resize-none transition-colors"
    />
  );
}

function RefPhotoUploader({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const blobRef = useRef<string | null>(null);

  useEffect(() => {
    return () => { if (blobRef.current) URL.revokeObjectURL(blobRef.current); };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    const url = URL.createObjectURL(file);
    blobRef.current = url;
    onChange(url);
  }

  function handleClear() {
    if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; }
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-s12">
      <p className="text-[13px] font-semibold uppercase tracking-widest text-label3">Foto referensi (opsional)</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {value ? (
        <div className="relative w-full overflow-hidden rounded-r20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Referensi" className="w-full h-[180px] object-cover" />
          <button
            onClick={handleClear}
            className="absolute top-s8 right-s8 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-label/80 text-white backdrop-blur-sm"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-s8 rounded-r20 border-2 border-dashed border-sep py-s20 text-[14px] font-medium text-label3 transition-all hover:border-label3 hover:text-label2 active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Upload foto referensi
        </button>
      )}
    </div>
  );
}

export default function FormPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const { services, setFormAnswers } = useBookingStore();
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [refPhoto, setRefPhoto] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (services.length === 0) router.replace(`/book/${slug}`);
  }, [services.length, slug, router]);

  if (services.length === 0) return null;

  const service = services[0]!; // Use first service to determine form flow
  const flow = service.serviceFlow;

  function set<K extends keyof FormAnswers>(key: K, value: FormAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    // Clear error when user makes a selection
    setValidationError(null);
  }

  const canProceed =
    flow === 'STYLING_HAIR' ? !!answers.hairLength
    : flow === 'STYLING_COLOUR' ? !!answers.hairLength && !!answers.hairCondition
    : flow === 'STYLING_NAIL' ? !!answers.nailLength
    : true;

  const getValidationMessage = () => {
    if (flow === 'STYLING_HAIR' && !answers.hairLength) return 'Silakan pilih panjang rambut terlebih dahulu';
    if (flow === 'STYLING_COLOUR') {
      if (!answers.hairLength) return 'Silakan pilih panjang rambut';
      if (!answers.hairCondition) return 'Silakan pilih kondisi rambut saat ini';
    }
    if (flow === 'STYLING_NAIL' && !answers.nailLength) return 'Silakan pilih panjang kuku terlebih dahulu';
    return null;
  };

  function handleContinue() {
    const error = getValidationMessage();
    if (error) {
      setValidationError(error);
      return;
    }
    setFormAnswers(answers);
    router.push(`/book/${slug}/steps/stylist`);
  }

  const config = {
    STYLING_HAIR: { title: 'Detail Potongan', subtitle: 'Bantu kami memahami preferensimu sebelum bertemu stylist.' },
    STYLING_COLOUR: { title: 'Detail Warna', subtitle: 'Info ini membantu stylist mempersiapkan formula dan waktu yang tepat.' },
    STYLING_NAIL: { title: 'Detail Kuku', subtitle: 'Ceritakan preferensimu agar nail artist siap dengan bahan yang tepat.' },
    TREATMENT: { title: '', subtitle: '' },
  }[flow];

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {validationError && (
        <ErrorAlert
          message={validationError}
          onDismiss={() => setValidationError(null)}
          actionLabel="OK"
          onAction={() => setValidationError(null)}
        />
      )}
      <StepHeader title={config.title} subtitle={config.subtitle} />

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-s32 px-s20 py-s32 pt-s32">

          {flow === 'STYLING_HAIR' && (
            <>
              <Question label="Panjang rambut saat ini" required>
                {['Pendek (< 10 cm)', 'Medium (10–25 cm)', 'Panjang (> 25 cm)'].map((opt) => (
                  <Chip key={opt} label={opt} selected={answers.hairLength === opt} onClick={() => set('hairLength', opt)} />
                ))}
              </Question>
              <Question label="Preferensi potongan">
                {['Layer', 'Blunt Cut', 'Thinning', 'Bob', 'Undercut', 'Bebas / Terserah'].map((opt) => (
                  <Chip key={opt} label={opt} selected={answers.hairCutStyle === opt} onClick={() => set('hairCutStyle', opt)} />
                ))}
              </Question>
              <RefPhotoUploader value={refPhoto} onChange={setRefPhoto} />
              <Question label="Catatan tambahan">
                <NotesField value={answers.notes ?? ''} onChange={(v) => set('notes', v)} placeholder="Contoh: tolong layered tipis di bagian dalam, poni panjang..." />
              </Question>
            </>
          )}

          {flow === 'STYLING_COLOUR' && (
            <>
              <Question label="Panjang rambut saat ini" required>
                {['Pendek (< 10 cm)', 'Medium (10–25 cm)', 'Panjang (> 25 cm)'].map((opt) => (
                  <Chip key={opt} label={opt} selected={answers.hairLength === opt} onClick={() => set('hairLength', opt)} />
                ))}
              </Question>
              <Question label="Kondisi rambut saat ini" required>
                {['Sehat / Virgin', 'Sudah dicat sebelumnya', 'Sudah di-bleach', 'Rusak / Kering'].map((opt) => (
                  <Chip key={opt} label={opt} selected={answers.hairCondition === opt} onClick={() => set('hairCondition', opt)} />
                ))}
              </Question>
              <Question label="Target warna / efek">
                {['Natural Brown', 'Ash / Abu', 'Blonde', 'Copper / Merah', 'Pastel / Vivid', 'Gradasi / Ombre'].map((opt) => (
                  <Chip key={opt} label={opt} selected={answers.targetColour === opt} onClick={() => set('targetColour', opt)} />
                ))}
              </Question>
              <RefPhotoUploader value={refPhoto} onChange={setRefPhoto} />
              <Question label="Catatan tambahan">
                <NotesField value={answers.notes ?? ''} onChange={(v) => set('notes', v)} placeholder="Contoh: ingin tetap terlihat natural, alergi tertentu..." />
              </Question>
            </>
          )}

          {flow === 'STYLING_NAIL' && (
            <>
              <Question label="Panjang kuku" required>
                {['Pendek', 'Medium', 'Panjang'].map((opt) => (
                  <Chip key={opt} label={opt} selected={answers.nailLength === opt} onClick={() => set('nailLength', opt)} />
                ))}
              </Question>
              <Question label="Bentuk kuku">
                {['Square', 'Oval', 'Almond', 'Coffin', 'Stiletto', 'Round'].map((opt) => (
                  <Chip key={opt} label={opt} selected={answers.nailShape === opt} onClick={() => set('nailShape', opt)} />
                ))}
              </Question>
              <RefPhotoUploader value={refPhoto} onChange={setRefPhoto} />
              <Question label="Catatan">
                <NotesField value={answers.notes ?? ''} onChange={(v) => set('notes', v)} placeholder="Contoh: warna nude dengan aksen gold, inspirasi dari Instagram..." />
              </Question>
            </>
          )}

        </div>
      </div>

      <BottomCTA
        label={canProceed ? 'Lanjut ke Stylist →' : 'Lengkapi form dulu'}
        variant={canProceed ? 'ready' : 'default'}
        disabled={!canProceed}
        onClick={handleContinue}
      />
    </div>
  );
}
