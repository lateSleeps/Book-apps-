'use client';

import { Scissors, Tag, Clock, ArrowDown } from '@phosphor-icons/react';
import { useState } from 'react';
import {
  EntityActionMenu,
  resolveIcon,
  SettingsAddButton,
  SettingsEmptyState,
} from '@/features/dashboard/components/settings/components/shared';
import type {
  ServiceCategory,
  ServiceItem,
} from '@/features/dashboard/components/settings/types/services.types';
import { cn } from '@/shared/lib/cn';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} mnt`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}j ${m}m` : `${h} jam`;
}

function formatPrice(price: number, priceType: ServiceItem['priceType']): string {
  const fmt = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
  return priceType === 'starting_from' ? `Mulai ${fmt}` : fmt;
}

// ── types ─────────────────────────────────────────────────────────────────────

interface AccordionProps {
  categories: ServiceCategory[];
  services: ServiceItem[];
  onAddCategory: () => void;
  onEditCategory: (cat: ServiceCategory) => void;
  onDeleteCategory: (cat: ServiceCategory) => void;
  onAddService: (categoryId?: string) => void;
  onEditService: (svc: ServiceItem) => void;
  onDeleteService: (svc: ServiceItem) => void;
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function ServicesAccordion({
  categories,
  services,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddService,
  onEditService,
  onDeleteService,
}: AccordionProps) {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  const selectedCat = categories.find((c) => c.id === selectedCatId) ?? null;
  const visibleServices = selectedCatId
    ? services.filter((s) => s.categoryId === selectedCatId)
    : [];

  return (
    <section className="flex flex-col gap-s32">
      {/* ── Kategori ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-s16">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-s4">
            <h2 className="m-0 text-ts-t3 font-bold text-tx-primary">Kategori</h2>
            <p className="m-0 text-ts-cap1 text-tx-secondary">
              Pilih kategori untuk melihat layanan di dalamnya.
            </p>
          </div>
          <SettingsAddButton onClick={onAddCategory}>Tambah Kategori</SettingsAddButton>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-r16 border border-bd-card bg-bg-card shadow-card">
            <SettingsEmptyState
              icon={<Tag size={24} weight="duotone" />}
              title="Belum ada kategori"
              description="Tambah kategori untuk mengelompokkan layanan salon."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-s12 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => {
              const Icon = resolveIcon(cat.iconName);
              const isSelected = selectedCatId === cat.id;
              const count = services.filter((s) => s.categoryId === cat.id).length;

              return (
                <div
                  key={cat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCatId(isSelected ? null : cat.id)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && setSelectedCatId(isSelected ? null : cat.id)
                  }
                  className={
                    isSelected
                      ? 'flex cursor-pointer flex-col gap-s12 rounded-r16 border-2 border-tx-primary bg-bg-card p-s16 text-left shadow-dropdown transition-all'
                      : 'flex cursor-pointer flex-col gap-s12 rounded-r16 border-2 border-bd-card bg-bg-card p-s16 text-left shadow-card transition-all hover:border-tx-secondary hover:shadow-dropdown'
                  }
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-r12',
                        cat.color ?? 'bg-bg-control'
                      )}
                    >
                      <Icon size={19} weight="duotone" className="text-tx-primary" />
                    </div>
                    <EntityActionMenu
                      actions={[
                        { label: 'Edit Kategori', onClick: () => onEditCategory(cat) },
                        {
                          label: 'Hapus Permanen',
                          variant: 'danger',
                          onClick: () => onDeleteCategory(cat),
                        },
                      ]}
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-s4">
                    <p className="m-0 text-ts-body font-semibold text-tx-primary">{cat.name}</p>
                    {cat.description && (
                      <p className="m-0 line-clamp-2 text-ts-fn text-tx-secondary">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-bd-row pt-s12">
                    <span className="text-ts-cap1 text-tx-muted">{count} layanan</span>
                    {isSelected && <span className="text-ts-cap1 text-tx-secondary">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Layanan ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-s16">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-s4">
            <h2 className="m-0 text-ts-t3 font-bold text-tx-primary">Layanan</h2>
            {selectedCat ? (
              <p className="m-0 text-ts-fn text-tx-secondary">
                Kategori: <span className="font-semibold text-tx-primary">{selectedCat.name}</span>
              </p>
            ) : (
              <p className="m-0 text-ts-fn text-tx-secondary">
                Pilih kategori di atas untuk melihat daftar layanan.
              </p>
            )}
          </div>

          {selectedCat && (
            <SettingsAddButton onClick={() => onAddService(selectedCatId ?? undefined)}>
              Tambah Layanan
            </SettingsAddButton>
          )}
        </div>

        {!selectedCatId && (
          <div className="flex flex-col items-center gap-s12 rounded-r16 border border-dashed border-bd-card bg-bg-card p-s32 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-rF bg-bg-control">
              <ArrowDown size={20} weight="duotone" className="text-tx-muted" />
            </div>
            <div className="flex flex-col gap-s4">
              <p className="m-0 text-ts-fn font-semibold text-tx-primary">
                Pilih kategori terlebih dahulu
              </p>
              <p className="m-0 text-ts-cap1 text-tx-secondary">
                Klik salah satu kategori di atas untuk menampilkan layanan yang tersedia.
              </p>
            </div>
          </div>
        )}

        {selectedCatId && visibleServices.length === 0 && (
          <div className="rounded-r16 border border-bd-card bg-bg-card shadow-card">
            <SettingsEmptyState
              icon={<Scissors size={24} weight="duotone" />}
              title="Belum ada layanan"
              description="Tambah layanan pertama untuk kategori ini."
            />
          </div>
        )}

        {visibleServices.length > 0 && (
          <div className="grid grid-cols-2 gap-s12 md:grid-cols-3 lg:grid-cols-4">
            {visibleServices.map((svc) => (
              <div
                key={svc.id}
                className="flex flex-col gap-s12 rounded-r16 border border-bd-card bg-bg-card p-s16 shadow-card transition-shadow hover:shadow-dropdown"
              >
                <div className="flex items-center justify-end">
                  <EntityActionMenu
                    actions={[
                      { label: 'Edit Layanan', onClick: () => onEditService(svc) },
                      {
                        label: 'Hapus Permanen',
                        variant: 'danger',
                        onClick: () => onDeleteService(svc),
                      },
                    ]}
                  />
                </div>

                <div className="flex flex-1 flex-col gap-s4">
                  <p className="m-0 text-ts-head font-bold text-tx-primary">{svc.name}</p>
                  {svc.description && (
                    <p className="m-0 line-clamp-3 text-ts-cap1 text-tx-secondary">
                      {svc.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-s4 border-t border-bd-row pt-s12">
                  <p className="m-0 text-ts-fn font-bold text-tx-primary">
                    {formatPrice(svc.price, svc.priceType)}
                  </p>
                  <div className="flex items-center gap-s4 text-tx-secondary">
                    <Clock size={12} weight="duotone" />
                    <span className="text-ts-cap1">{formatDuration(svc.duration)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
