'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SettingsInput,
  SettingsTextarea,
  SettingsUploadField,
} from '@/features/dashboard/components/settings/components/shared';
import type { AddOnProduct } from '@/features/dashboard/components/settings/types/services.types';
import { prepareUploadImage } from '@/shared/lib/image';

export type AddonFormDraft = Omit<AddOnProduct, 'id' | 'sortOrder'>;

interface AddonFormProps {
  initial?: Partial<AddOnProduct>;
  onChange: (draft: AddonFormDraft | null) => void;
}

export function AddonForm({ initial, onChange }: AddonFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const emit = useCallback(
    (n = name, d = description, p = price, img: string | null = imageUrl, active = isActive) => {
      const numPrice = Number(p) || 0;
      onChangeRef.current(
        n.trim() && numPrice >= 0
          ? {
              name: n.trim(),
              description: d.trim(),
              price: numPrice,
              imageUrl: img,
              isActive: active,
            }
          : null
      );
    },
    [name, description, price, imageUrl, isActive]
  );

  useEffect(() => {
    emit();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleImageChange(rawFile: File, rawPreview: string) {
    setImageUrl(rawPreview); // show immediately while converting
    void prepareUploadImage(rawFile)
      .then((webpFile) => {
        const url = URL.createObjectURL(webpFile);
        setImageUrl(url);
        emit(name, description, price, url, isActive);
      })
      .catch(() => {
        // conversion failed — keep raw preview as-is
        emit(name, description, price, rawPreview, isActive);
      });
  }

  function handleImageRemove() {
    setImageUrl(null);
    emit(name, description, price, null, isActive);
  }

  function toggleActive() {
    const next = !isActive;
    setIsActive(next);
    emit(name, description, price, imageUrl, next);
  }

  return (
    <div className="flex flex-col gap-s16">
      {/* Image upload */}
      <SettingsUploadField
        variant="addon"
        value={imageUrl}
        onChange={handleImageChange}
        onRemove={handleImageRemove}
      />

      {/* Name */}
      <div className="flex flex-col gap-s8">
        <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
          Nama Produk <span className="text-ac-danger">*</span>
        </label>
        <SettingsInput
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            emit(e.target.value);
          }}
          placeholder="Contoh: Makarizo Shampoo"
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
          placeholder="Deskripsi singkat produk..."
          rows={2}
        />
      </div>

      {/* Price */}
      <div className="flex flex-col gap-s8">
        <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
          Harga (Rp) <span className="text-ac-danger">*</span>
        </label>
        <SettingsInput
          type="number"
          min={0}
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            emit(name, description, e.target.value);
          }}
          placeholder="45000"
        />
      </div>

      {/* isActive */}
      <div className="flex items-center justify-between rounded-r10 border border-bd-card bg-bg-input px-s16 py-s12">
        <div className="flex flex-col gap-s4">
          <p className="m-0 text-ts-fn font-medium text-tx-primary">Aktif</p>
          <p className="m-0 text-ts-cap1 text-tx-secondary">
            Produk tampil sebagai pilihan add-on saat booking
          </p>
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
