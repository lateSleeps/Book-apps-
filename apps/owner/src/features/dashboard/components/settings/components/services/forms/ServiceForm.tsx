'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SettingsInput,
  SettingsTextarea,
} from '@/features/dashboard/components/settings/components/shared';
import type {
  ServiceCategory,
  ServiceFlow,
  ServiceItem,
  ServicePriceType,
} from '@/features/dashboard/components/settings/types/services.types';

export type ServiceFormDraft = Omit<ServiceItem, 'id' | 'sortOrder' | 'questions'>;

const FLOW_OPTIONS: { value: ServiceFlow; label: string }[] = [
  { value: 'STYLING_HAIR', label: 'Styling Rambut' },
  { value: 'STYLING_COLOUR', label: 'Pewarnaan Rambut' },
  { value: 'STYLING_NAIL', label: 'Kuku & Nail Art' },
  { value: 'TREATMENT', label: 'Treatment / Spa' },
];

interface ServiceFormProps {
  initial?: Partial<ServiceItem>;
  categories: ServiceCategory[];
  onChange: (draft: ServiceFormDraft | null) => void;
}

export function ServiceForm({ initial, categories, onChange }: ServiceFormProps) {
  const activeCategories = categories.filter((c) => c.isActive);

  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? activeCategories[0]?.id ?? ''
  );
  const [priceType, setPriceType] = useState<ServicePriceType>(initial?.priceType ?? 'fixed');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [duration, setDuration] = useState(String(initial?.duration ?? ''));
  const [serviceFlow, setServiceFlow] = useState<ServiceFlow>(
    initial?.serviceFlow ?? 'STYLING_HAIR'
  );
  const [requiresSpecialist, setRequiresSpecialist] = useState(
    initial?.requiresSpecialist ?? false
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const emit = useCallback(
    (
      n = name,
      d = description,
      cid = categoryId,
      pt = priceType,
      p = price,
      dur = duration,
      sf = serviceFlow,
      rs = requiresSpecialist,
      a = isActive
    ) => {
      const numPrice = Number(p) || 0;
      const numDuration = Number(dur) || 0;
      const valid = n.trim() && numDuration > 0 && numPrice >= 0 && cid;
      onChangeRef.current(
        valid
          ? {
              name: n.trim(),
              description: d.trim(),
              categoryId: cid,
              priceType: pt,
              price: numPrice,
              duration: numDuration,
              serviceFlow: sf,
              requiresSpecialist: rs,
              isActive: a,
            }
          : null
      );
    },
    [
      name,
      description,
      categoryId,
      priceType,
      price,
      duration,
      serviceFlow,
      requiresSpecialist,
      isActive,
    ]
  );

  useEffect(() => {
    emit();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleSpecialist() {
    const next = !requiresSpecialist;
    setRequiresSpecialist(next);
    emit(name, description, categoryId, priceType, price, duration, serviceFlow, next, isActive);
  }

  function toggleActive() {
    const next = !isActive;
    setIsActive(next);
    emit(
      name,
      description,
      categoryId,
      priceType,
      price,
      duration,
      serviceFlow,
      requiresSpecialist,
      next
    );
  }

  return (
    <div className="flex flex-col gap-s16">
      {/* Name */}
      <div className="flex flex-col gap-s8">
        <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
          Nama Layanan <span className="text-ac-danger">*</span>
        </label>
        <SettingsInput
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            emit(e.target.value);
          }}
          placeholder="Contoh: Ladies Haircut + Wash"
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
          placeholder="Deskripsi singkat layanan..."
          rows={2}
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-s8">
        <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
          Kategori <span className="text-ac-danger">*</span>
        </label>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            emit(name, description, e.target.value);
          }}
          className="w-full rounded-r10 border border-bd-card bg-bg-input px-s16 py-s12 text-ts-fn text-tx-primary focus:border-tx-secondary focus:outline-none"
        >
          {activeCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price type */}
      <div className="flex flex-col gap-s8">
        <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
          Tipe Harga
        </label>
        <div className="flex overflow-hidden rounded-r10 border border-bd-card text-ts-fn font-medium">
          {(['fixed', 'starting_from'] as ServicePriceType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setPriceType(t);
                emit(name, description, categoryId, t);
              }}
              className={`flex-1 px-s16 py-s8 transition-colors ${priceType === t ? 'bg-tx-primary text-bg-card' : 'bg-bg-input text-tx-secondary hover:bg-bg-hover'}`}
            >
              {t === 'fixed' ? 'Harga Tetap' : 'Mulai Dari'}
            </button>
          ))}
        </div>
      </div>

      {/* Price + Duration */}
      <div className="grid grid-cols-2 gap-s12">
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
              emit(name, description, categoryId, priceType, e.target.value);
            }}
            placeholder="150000"
          />
        </div>
        <div className="flex flex-col gap-s8">
          <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
            Durasi (mnt) <span className="text-ac-danger">*</span>
          </label>
          <SettingsInput
            type="number"
            min={1}
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value);
              emit(name, description, categoryId, priceType, price, e.target.value);
            }}
            placeholder="60"
          />
        </div>
      </div>

      {/* Service Flow */}
      <div className="flex flex-col gap-s8">
        <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
          Service Flow
        </label>
        <select
          value={serviceFlow}
          onChange={(e) => {
            const v = e.target.value as ServiceFlow;
            setServiceFlow(v);
            emit(name, description, categoryId, priceType, price, duration, v);
          }}
          className="w-full rounded-r10 border border-bd-card bg-bg-input px-s16 py-s12 text-ts-fn text-tx-primary focus:border-tx-secondary focus:outline-none"
        >
          {FLOW_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Requires Specialist */}
      <div className="flex items-center justify-between rounded-r10 border border-bd-card bg-bg-input px-s16 py-s12">
        <div className="flex flex-col gap-s4">
          <p className="m-0 text-ts-fn font-medium text-tx-primary">Wajib Pilih Stylist</p>
          <p className="m-0 text-ts-cap1 text-tx-secondary">
            Pelanggan harus memilih stylist spesifik
          </p>
        </div>
        <button
          type="button"
          onClick={toggleSpecialist}
          className={`relative h-6 w-11 rounded-rF transition-colors ${requiresSpecialist ? 'bg-ac-ios-green' : 'bg-bg-control'}`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-rF bg-white shadow transition-transform ${requiresSpecialist ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      {/* isActive */}
      <div className="flex items-center justify-between rounded-r10 border border-bd-card bg-bg-input px-s16 py-s12">
        <div className="flex flex-col gap-s4">
          <p className="m-0 text-ts-fn font-medium text-tx-primary">Aktif</p>
          <p className="m-0 text-ts-cap1 text-tx-secondary">Layanan tampil di customer app</p>
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
