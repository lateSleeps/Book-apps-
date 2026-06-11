'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SettingsInput,
  SettingsTextarea,
  SettingsIconPicker,
} from '@/features/dashboard/components/settings/components/shared';
import type { ServiceCategory } from '@/features/dashboard/components/settings/types/services.types';

export type CategoryFormDraft = Omit<ServiceCategory, 'id' | 'sortOrder'>;

const BLOB_PRESETS = [
  { label: 'Peach', blob: '#f5c4ab', color: 'bg-c-peach' },
  { label: 'Blue', blob: '#b8d6f0', color: 'bg-c-blue' },
  { label: 'Mint', blob: '#a8e6d4', color: 'bg-c-mint' },
  { label: 'Yellow', blob: '#f5d98a', color: 'bg-c-yellow' },
  { label: 'Lilac', blob: '#c8bef0', color: 'bg-c-lilac' },
  { label: 'Mauve', blob: '#e4b8d8', color: 'bg-c-mauve' },
] as const;

interface CategoryFormProps {
  initial?: Partial<ServiceCategory>;
  onChange: (draft: CategoryFormDraft | null) => void;
}

export function CategoryForm({ initial, onChange }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [iconName, setIconName] = useState(initial?.iconName ?? 'Scissors');
  const [blobColor, setBlobColor] = useState(initial?.blobColor ?? BLOB_PRESETS[0].blob);
  const [color, setColor] = useState(initial?.color ?? BLOB_PRESETS[0].color);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  // Stable ref so onChange never needs to be in deps
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const emit = useCallback(
    (n = name, d = description, ic = iconName, bc = blobColor, c = color, a = isActive) => {
      onChangeRef.current(
        n.trim()
          ? {
              name: n.trim(),
              description: d.trim(),
              iconName: ic,
              blobColor: bc,
              color: c,
              isActive: a,
            }
          : null
      );
    },
    [name, description, iconName, blobColor, color, isActive]
  );

  // Emit initial value on mount
  useEffect(() => {
    emit();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function selectPreset(blob: string, col: string) {
    setBlobColor(blob);
    setColor(col);
    emit(name, description, iconName, blob, col, isActive);
  }

  function toggleActive() {
    const next = !isActive;
    setIsActive(next);
    emit(name, description, iconName, blobColor, color, next);
  }

  return (
    <div className="flex flex-col gap-s16">
      {/* Name */}
      <div className="flex flex-col gap-s8">
        <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
          Nama Kategori <span className="text-ac-danger">*</span>
        </label>
        <SettingsInput
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            emit(e.target.value);
          }}
          placeholder="Contoh: Rambut"
          hasError={name.length > 0 && !name.trim()}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-s8">
        <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
          Deskripsi{' '}
          <span className="text-ts-cap1 font-normal normal-case text-tx-muted">(opsional)</span>
        </label>
        <SettingsTextarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            emit(name, e.target.value);
          }}
          placeholder="Contoh: Potong, keramas, styling & braiding"
          rows={2}
        />
      </div>

      {/* Icon */}
      <div className="flex flex-col gap-s8">
        <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
          Ikon Kategori
        </label>
        <SettingsIconPicker
          value={iconName}
          onChange={(newIcon) => {
            setIconName(newIcon);
            emit(undefined, undefined, newIcon);
          }}
        />
      </div>

      {/* Color preset */}
      <div className="flex flex-col gap-s8">
        <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
          Warna Tema
        </label>
        <div className="flex flex-wrap gap-s8">
          {BLOB_PRESETS.map((p) => (
            <button
              key={p.blob}
              type="button"
              onClick={() => selectPreset(p.blob, p.color)}
              title={p.label}
              className={`h-8 w-8 rounded-rF transition-all ${p.color} ${blobColor === p.blob ? 'ring-2 ring-tx-primary ring-offset-2' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* isActive */}
      <div className="flex items-center justify-between rounded-r10 border border-bd-card bg-bg-input px-s16 py-s12">
        <div className="flex flex-col gap-s4">
          <p className="m-0 text-ts-fn font-medium text-tx-primary">Aktif</p>
          <p className="m-0 text-ts-cap1 text-tx-secondary">Kategori tampil di customer app</p>
        </div>
        <button
          type="button"
          onClick={toggleActive}
          className={`relative h-6 w-11 rounded-rF transition-colors ${isActive ? 'bg-ac-ios-green' : 'bg-bg-control'}`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-rF bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>
    </div>
  );
}
