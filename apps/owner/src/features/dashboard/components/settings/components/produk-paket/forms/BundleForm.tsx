'use client';

import { MagnifyingGlass, Check } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SettingsInput,
  SettingsTextarea,
  SettingsUploadField,
} from '@/features/dashboard/components/settings/components/shared';
import type {
  ServiceBundle,
  ServiceItem,
} from '@/features/dashboard/components/settings/types/services.types';

export type BundleFormDraft = Omit<ServiceBundle, 'id' | 'sortOrder'>;

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

interface BundleFormProps {
  initial?: Partial<ServiceBundle>;
  services: ServiceItem[];
  onChange: (draft: BundleFormDraft | null) => void;
}

export function BundleForm({ initial, services, onChange }: BundleFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [serviceIds, setServiceIds] = useState<string[]>(initial?.serviceIds ?? []);
  const [bundlePrice, setBundlePrice] = useState(String(initial?.bundlePrice ?? ''));
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [search, setSearch] = useState('');

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const activeServices = useMemo(() => services.filter((s) => s.isActive), [services]);

  const filteredServices = useMemo(
    () =>
      search.trim()
        ? activeServices.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
        : activeServices,
    [activeServices, search]
  );

  // Auto-calc original price from selected services
  const originalPrice = useMemo(
    () =>
      serviceIds.reduce((sum, id) => {
        const svc = activeServices.find((s) => s.id === id);
        return sum + (svc?.price ?? 0);
      }, 0),
    [serviceIds, activeServices]
  );

  const numBundlePrice = Number(bundlePrice) || 0;
  const savings = originalPrice - numBundlePrice;

  const emit = useCallback(
    (
      n = name,
      d = description,
      ids = serviceIds,
      bp = bundlePrice,
      img = imageUrl,
      active = isActive
    ) => {
      const price = Number(bp) || 0;
      const valid = n.trim() && ids.length >= 2 && price > 0;
      onChangeRef.current(
        valid
          ? {
              name: n.trim(),
              description: d.trim(),
              serviceIds: ids,
              bundlePrice: price,
              imageUrl: img,
              isActive: active,
            }
          : null
      );
    },
    [name, description, serviceIds, bundlePrice, imageUrl, isActive]
  );

  useEffect(() => {
    emit();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleService(id: string) {
    const next = serviceIds.includes(id) ? serviceIds.filter((s) => s !== id) : [...serviceIds, id];
    setServiceIds(next);
    emit(name, description, next);
  }

  function toggleActive() {
    const next = !isActive;
    setIsActive(next);
    emit(name, description, serviceIds, bundlePrice, imageUrl, next);
  }

  return (
    <div className="flex flex-col gap-s20">
      {/* Cover image */}
      <SettingsUploadField
        variant="cover"
        value={imageUrl}
        onChange={(_, previewUrl) => {
          setImageUrl(previewUrl);
          emit(name, description, serviceIds, bundlePrice, previewUrl);
        }}
        onRemove={() => {
          setImageUrl(null);
          emit(name, description, serviceIds, bundlePrice, null);
        }}
      />

      {/* Name */}
      <div className="flex flex-col gap-s8">
        <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
          Nama Paket <span className="text-ac-danger">*</span>
        </label>
        <SettingsInput
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            emit(e.target.value);
          }}
          placeholder="Contoh: Paket Cantik Lengkap"
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
          placeholder="Deskripsi singkat paket..."
          rows={2}
        />
      </div>

      {/* Service picker */}
      <div className="flex flex-col gap-s8">
        <div className="flex items-center justify-between">
          <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
            Pilih Layanan <span className="text-ac-danger">*</span>
          </label>
          <span className="text-ts-cap1 text-tx-muted">{serviceIds.length} dipilih (min. 2)</span>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlass
            size={14}
            className="absolute left-s12 top-1/2 -translate-y-1/2 text-tx-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari layanan..."
            className="w-full rounded-r10 border border-bd-card bg-bg-input py-s8 pl-s32 pr-s12 text-ts-fn text-tx-primary placeholder:text-tx-muted focus:border-tx-secondary focus:outline-none"
          />
        </div>

        {/* Service list */}
        <div className="flex max-h-48 flex-col overflow-y-auto rounded-r10 border border-bd-card">
          {filteredServices.length === 0 ? (
            <p className="px-s12 py-s12 text-ts-cap1 text-tx-muted">Tidak ada layanan ditemukan.</p>
          ) : (
            filteredServices.map((svc) => {
              const selected = serviceIds.includes(svc.id);
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => toggleService(svc.id)}
                  className={`py-s10 flex items-center gap-s12 px-s12 text-left transition-colors hover:bg-bg-hover ${
                    selected ? 'bg-bg-hover' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <span
                    className={`rounded-r4 flex h-4 w-4 shrink-0 items-center justify-center border-2 transition-colors ${
                      selected ? 'border-tx-primary bg-tx-primary' : 'border-bd-card'
                    }`}
                  >
                    {selected && <Check size={10} weight="bold" className="text-bg-card" />}
                  </span>

                  {/* Name + price */}
                  <span className="flex-1 truncate text-ts-fn text-tx-primary">{svc.name}</span>
                  <span className="shrink-0 text-ts-cap1 text-tx-secondary">
                    {formatPrice(svc.price)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Price section */}
      <div className="flex flex-col gap-s12 rounded-r12 border border-bd-card bg-bg-input p-s16">
        {/* Original price row */}
        <div className="flex items-center justify-between">
          <p className="m-0 text-ts-fn text-tx-secondary">Total Harga Asli</p>
          <p className="m-0 text-ts-fn font-medium text-tx-primary">{formatPrice(originalPrice)}</p>
        </div>

        {/* Bundle price input */}
        <div className="flex flex-col gap-s8">
          <label className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
            Harga Bundle (Rp) <span className="text-ac-danger">*</span>
          </label>
          <SettingsInput
            type="number"
            min={0}
            value={bundlePrice}
            onChange={(e) => {
              setBundlePrice(e.target.value);
              emit(name, description, serviceIds, e.target.value);
            }}
            placeholder="Contoh: 320000"
          />
        </div>

        {/* Savings preview */}
        {numBundlePrice > 0 && savings > 0 && (
          <div className="flex items-center justify-between rounded-r8 bg-st-in-progress-bg px-s12 py-s8">
            <p className="m-0 text-ts-cap1 font-medium text-st-in-progress">Hemat</p>
            <p className="m-0 text-ts-fn font-bold text-st-in-progress">{formatPrice(savings)}</p>
          </div>
        )}
        {numBundlePrice > 0 && savings <= 0 && (
          <p className="m-0 text-ts-cap1 text-ac-danger">
            Harga bundle harus lebih rendah dari harga asli.
          </p>
        )}
      </div>

      {/* isActive */}
      <div className="flex items-center justify-between rounded-r10 border border-bd-card bg-bg-input px-s16 py-s12">
        <div className="flex flex-col gap-s4">
          <p className="m-0 text-ts-fn font-medium text-tx-primary">Aktif</p>
          <p className="m-0 text-ts-cap1 text-tx-secondary">
            Paket tampil sebagai pilihan di customer app
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
