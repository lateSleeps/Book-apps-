'use client';

import { Plus, Trash } from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SettingsInput } from '@/features/dashboard/components/settings/components/shared';
import type {
  QuestionType,
  ServiceQuestion,
} from '@/features/dashboard/components/settings/types/services.types';

export type QuestionFormDraft = Omit<ServiceQuestion, 'id' | 'sortOrder'>;

const QUESTION_TYPES: { value: QuestionType; label: string; description: string }[] = [
  { value: 'chips', label: 'Pilihan', description: 'Pelanggan memilih dari opsi yang tersedia' },
  { value: 'photo', label: 'Foto', description: 'Pelanggan upload foto referensi' },
  { value: 'text', label: 'Teks', description: 'Pelanggan mengisi jawaban bebas' },
];

interface QuestionFormProps {
  serviceId: string;
  initial?: Partial<ServiceQuestion>;
  onChange: (draft: QuestionFormDraft | null) => void;
}

export function QuestionForm({ serviceId, initial, onChange }: QuestionFormProps) {
  const [label, setLabel] = useState(initial?.label ?? '');
  const [type, setType] = useState<QuestionType>(initial?.type ?? 'chips');
  const [required, setRequired] = useState(initial?.required ?? false);
  const [options, setOptions] = useState<string[]>(
    initial?.options?.length ? initial.options : ['']
  );

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const emit = useCallback(
    (lbl = label, t = type, req = required, opts = options) => {
      const trimmed = lbl.trim();
      const hasValidOptions = t !== 'chips' || opts.some((o) => o.trim().length > 0);
      onChangeRef.current(
        trimmed && hasValidOptions
          ? {
              serviceId,
              label: trimmed,
              type: t,
              required: req,
              options: t === 'chips' ? opts.filter((o) => o.trim().length > 0) : [],
              isActive: true,
            }
          : null
      );
    },
    [label, type, required, options, serviceId]
  );

  useEffect(() => {
    emit();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function addOption() {
    const next = [...options, ''];
    setOptions(next);
    emit(label, type, required, next);
  }

  function updateOption(idx: number, value: string) {
    const next = options.map((o, i) => (i === idx ? value : o));
    setOptions(next);
    emit(label, type, required, next);
  }

  function removeOption(idx: number) {
    const next = options.filter((_, i) => i !== idx);
    setOptions(next);
    emit(label, type, required, next);
  }

  function selectType(t: QuestionType) {
    setType(t);
    emit(label, t, required, options);
  }

  function toggleRequired() {
    const next = !required;
    setRequired(next);
    emit(label, type, next, options);
  }

  return (
    <div className="flex flex-col gap-s16">
      {/* Label */}
      <div className="flex flex-col gap-s8">
        <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
          Pertanyaan <span className="text-ac-danger">*</span>
        </label>
        <SettingsInput
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
            emit(e.target.value);
          }}
          placeholder="Contoh: Apa warna yang Anda inginkan?"
        />
      </div>

      {/* Type selector */}
      <div className="flex flex-col gap-s8">
        <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
          Tipe Jawaban
        </label>
        <div className="flex flex-col gap-s8">
          {QUESTION_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => selectType(t.value)}
              className={`flex items-center gap-s12 rounded-r10 border px-s16 py-s12 text-left transition-colors ${
                type === t.value
                  ? 'border-tx-primary bg-bg-hover'
                  : 'border-bd-card bg-bg-input hover:border-tx-secondary'
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-rF border-2 ${
                  type === t.value ? 'border-tx-primary bg-tx-primary' : 'border-bd-card'
                }`}
              >
                {type === t.value && <span className="h-2 w-2 rounded-rF bg-bg-card" />}
              </span>
              <div className="flex flex-col gap-s4">
                <p className="m-0 text-ts-fn font-medium text-tx-primary">{t.label}</p>
                <p className="m-0 text-ts-cap1 text-tx-secondary">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Options — chips only */}
      {type === 'chips' && (
        <div className="flex flex-col gap-s8">
          <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
            Pilihan Jawaban
          </label>
          <div className="flex flex-col gap-s8">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-s8">
                <SettingsInput
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Opsi ${idx + 1}`}
                />
                {options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="shrink-0 text-tx-muted transition-colors hover:text-ac-danger"
                  >
                    <Trash size={16} weight="duotone" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-s8 text-ts-fn font-medium text-ac-primary transition-opacity hover:opacity-70"
            >
              <Plus size={14} weight="bold" />
              Tambah Opsi
            </button>
          </div>
        </div>
      )}

      {/* Required */}
      <div className="flex items-center justify-between rounded-r10 border border-bd-card bg-bg-input px-s16 py-s12">
        <div className="flex flex-col gap-s4">
          <p className="m-0 text-ts-fn font-medium text-tx-primary">Wajib Dijawab</p>
          <p className="m-0 text-ts-cap1 text-tx-secondary">
            Pelanggan tidak bisa lanjut jika belum menjawab
          </p>
        </div>
        <button
          type="button"
          onClick={toggleRequired}
          className={`relative h-6 w-11 rounded-rF transition-colors ${required ? 'bg-ac-ios-green' : 'bg-bg-control'}`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-rF bg-white shadow transition-transform ${required ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>
    </div>
  );
}
