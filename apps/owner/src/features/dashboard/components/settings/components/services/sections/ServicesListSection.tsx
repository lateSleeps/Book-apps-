'use client';

import { Scissors } from '@phosphor-icons/react';
import {
  SettingsListCard,
  SettingsEmptyState,
  SettingsAddButton,
} from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsSection,
  SettingsSectionHeader,
  SettingsContentCard,
} from '@/features/dashboard/components/settings/layout';
import type {
  ServiceItem,
  ServiceCategory,
} from '@/features/dashboard/components/settings/types/services.types';
import type { ServicesController } from '@/features/dashboard/hooks/settings/useServicesController';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} mnt`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}j ${m}m` : `${h} jam`;
}

function formatPrice(price: number, priceType: ServiceItem['priceType']): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
  return priceType === 'starting_from' ? `Mulai ${formatted}` : formatted;
}

interface ServicesListSectionProps {
  services: ServiceItem[];
  categories: ServiceCategory[];
  onArchive: ServicesController['archiveService'];
  onAdd: () => void;
}

export function ServicesListSection({
  services,
  categories,
  onArchive,
  onAdd,
}: ServicesListSectionProps) {
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <SettingsSection>
      <SettingsSectionHeader
        title="Layanan"
        description="Daftar layanan yang tersedia untuk dipesan pelanggan."
        action={<SettingsAddButton onClick={onAdd}>+ Tambah Layanan</SettingsAddButton>}
      />

      <SettingsContentCard padding="none">
        {services.length === 0 ? (
          <SettingsEmptyState
            icon={<Scissors size={24} weight="duotone" />}
            title="Belum ada layanan"
            description="Tambah layanan untuk mulai menerima booking."
          />
        ) : (
          <div className="divide-y divide-bd-row">
            {services.map((svc) => (
              <SettingsListCard
                key={svc.id}
                className="rounded-none border-0 shadow-none"
                imageFallback={categoryMap[svc.categoryId] ? '✂️' : '?'}
                title={svc.name}
                description={`${categoryMap[svc.categoryId] ?? '—'} · ${formatDuration(svc.duration)}`}
                badges={[
                  { label: formatPrice(svc.price, svc.priceType), variant: 'default' },
                  {
                    label: svc.isActive ? 'Aktif' : 'Diarsipkan',
                    variant: svc.isActive ? 'success' : 'warning',
                  },
                  ...(svc.requiresSpecialist
                    ? [{ label: 'Pilih Stylist', variant: 'info' as const }]
                    : []),
                ]}
                actions={
                  svc.isActive ? (
                    <button
                      type="button"
                      onClick={() => onArchive(svc.id)}
                      className="rounded-r8 border border-bd-card px-s8 py-s4 text-ts-cap2 text-tx-control transition-colors hover:bg-bg-hover"
                    >
                      Arsipkan
                    </button>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </SettingsContentCard>
    </SettingsSection>
  );
}
