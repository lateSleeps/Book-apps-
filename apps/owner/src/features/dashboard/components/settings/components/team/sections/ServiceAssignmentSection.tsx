'use client';

import { Users, Scissors } from '@phosphor-icons/react';
import { useState } from 'react';
import { SettingsEmptyState } from '@/features/dashboard/components/settings/components/shared';
import { SettingsSectionHeader } from '@/features/dashboard/components/settings/layout';
import type { ServiceItem } from '@/features/dashboard/components/settings/types/services.types';
import type { TeamController } from '@/features/dashboard/hooks/settings/useTeamController';
import { cn } from '@/shared/lib/cn';

// ServiceFlow -> staff specialty routing reference (read-only, no hardcoded assumptions)
// STYLING_HAIR   -> HAIR_STYLIST
// STYLING_COLOUR -> COLORIST
// STYLING_NAIL   -> NAIL_ARTIST
// TREATMENT      -> THERAPIST (specialist not required by default)

interface Props {
  ctrl: TeamController;
  services: ServiceItem[];
}

export function ServiceAssignmentSection({ ctrl, services }: Props) {
  const activeStaff = ctrl.domain.staff.filter((s) => s.isActive);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(activeStaff[0]?.id ?? '');

  if (activeStaff.length === 0) {
    return (
      <div className="flex flex-col gap-s16">
        <SettingsSectionHeader
          title="Penugasan Layanan"
          description="Pilih layanan yang dapat dilakukan oleh setiap staff."
        />
        <SettingsEmptyState
          icon={<Users size={24} weight="duotone" />}
          title="Belum ada staff aktif"
          description="Tambahkan staff terlebih dahulu di tab Direktori Staff."
        />
      </div>
    );
  }

  const assignment = ctrl.domain.assignments.find((a) => a.staffId === selectedStaffId);
  const assignedIds = new Set(assignment?.serviceIds ?? []);

  const activeServices = services.filter((s) => s.isActive);

  function toggleService(serviceId: string) {
    const next = assignedIds.has(serviceId)
      ? [...assignedIds].filter((id) => id !== serviceId)
      : [...assignedIds, serviceId];
    ctrl.setAssignment(selectedStaffId, next);
  }

  // Group services by categoryId for display
  const grouped = activeServices.reduce<Record<string, ServiceItem[]>>((acc, svc) => {
    if (!acc[svc.categoryId]) acc[svc.categoryId] = [];
    acc[svc.categoryId].push(svc);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-s16">
      <SettingsSectionHeader
        title="Penugasan Layanan"
        description="Pilih layanan yang dapat dilakukan oleh setiap staff."
      />
      {/* Staff selector */}
      <div className="flex flex-wrap gap-s8">
        {activeStaff.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedStaffId(s.id)}
            className={cn(
              'rounded-rF px-s12 py-s4 text-ts-fn font-medium transition-colors',
              selectedStaffId === s.id
                ? 'bg-tx-primary text-white'
                : 'bg-bg-control text-tx-secondary hover:text-tx-primary'
            )}
          >
            {s.fullName}
          </button>
        ))}
      </div>

      {/* Service checklist grouped by category */}
      {activeServices.length === 0 ? (
        <SettingsEmptyState
          icon={<Scissors size={24} weight="duotone" />}
          title="Belum ada layanan aktif"
          description="Aktifkan layanan di tab Layanan terlebih dahulu."
        />
      ) : (
        <div className="flex flex-col gap-s16">
          {Object.entries(grouped).map(([categoryId, categoryServices]) => (
            <div key={categoryId}>
              <p className="mb-s8 text-ts-cap1 font-medium uppercase tracking-wide text-tx-subtle">
                {categoryId}
              </p>
              <div className="flex flex-col gap-s4">
                {categoryServices.map((svc) => {
                  const checked = assignedIds.has(svc.id);
                  return (
                    <label
                      key={svc.id}
                      className="flex cursor-pointer items-center gap-s12 rounded-r10 border border-bd-card bg-bg-card px-s16 py-s8 hover:bg-bg-hover"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleService(svc.id)}
                        className="h-4 w-4 rounded accent-tx-primary"
                      />
                      <div className="flex flex-1 items-center justify-between">
                        <span className="text-ts-fn text-tx-primary">{svc.name}</span>
                        <span className="text-ts-cap1 text-tx-subtle">{svc.duration} mnt</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
