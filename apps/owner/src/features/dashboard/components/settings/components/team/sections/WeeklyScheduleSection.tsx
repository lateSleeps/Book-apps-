'use client';

import { Users } from '@phosphor-icons/react';
import { useState } from 'react';
import { SettingsEmptyState } from '@/features/dashboard/components/settings/components/shared';
import { SettingsSectionHeader } from '@/features/dashboard/components/settings/layout';
import type { WeekDay } from '@/features/dashboard/components/settings/types/team.types';
import type { TeamController } from '@/features/dashboard/hooks/settings/useTeamController';
import { cn } from '@/shared/lib/cn';

const DAY_LABELS: Record<WeekDay, string> = {
  MON: 'Senin',
  TUE: 'Selasa',
  WED: 'Rabu',
  THU: 'Kamis',
  FRI: 'Jumat',
  SAT: 'Sabtu',
  SUN: 'Minggu',
};

interface Props {
  ctrl: TeamController;
}

export function WeeklyScheduleSection({ ctrl }: Props) {
  const activeStaff = ctrl.domain.staff.filter((s) => s.isActive);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(activeStaff[0]?.id ?? '');

  if (activeStaff.length === 0) {
    return (
      <div className="flex flex-col gap-s16">
        <SettingsSectionHeader
          title="Jadwal Mingguan"
          description="Atur hari kerja dan jam operasional setiap staff."
        />
        <SettingsEmptyState
          icon={<Users size={24} weight="duotone" />}
          title="Belum ada staff aktif"
          description="Tambahkan staff terlebih dahulu di tab Direktori Staff."
        />
      </div>
    );
  }

  const schedule = ctrl.domain.schedules.find((s) => s.staffId === selectedStaffId);

  return (
    <div className="flex flex-col gap-s16">
      <SettingsSectionHeader
        title="Jadwal Mingguan"
        description="Atur hari kerja dan jam operasional setiap staff."
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

      {/* Day rows */}
      {schedule && (
        <div className="flex flex-col gap-s4">
          {schedule.days.map((dd) => (
            <div
              key={dd.day}
              className={cn(
                'flex items-center gap-s12 rounded-r10 border border-bd-card bg-bg-card px-s16 py-s8',
                !dd.enabled && 'opacity-50'
              )}
            >
              {/* Toggle */}
              <input
                type="checkbox"
                checked={dd.enabled}
                onChange={(e) =>
                  ctrl.updateDaySchedule(selectedStaffId, dd.day, { enabled: e.target.checked })
                }
                className="h-4 w-4 rounded accent-tx-primary"
              />

              {/* Day label */}
              <span className="w-16 shrink-0 text-ts-fn font-medium text-tx-primary">
                {DAY_LABELS[dd.day]}
              </span>

              {/* Time inputs */}
              {dd.enabled ? (
                <div className="flex items-center gap-s8">
                  <input
                    type="time"
                    value={dd.startTime}
                    onChange={(e) =>
                      ctrl.updateDaySchedule(selectedStaffId, dd.day, { startTime: e.target.value })
                    }
                    className="rounded-r8 border border-bd-card bg-bg-input px-s8 py-s4 text-ts-fn text-tx-primary focus:outline-none focus:ring-2 focus:ring-tx-primary/20"
                  />
                  <span className="text-ts-cap1 text-tx-subtle">-</span>
                  <input
                    type="time"
                    value={dd.endTime}
                    onChange={(e) =>
                      ctrl.updateDaySchedule(selectedStaffId, dd.day, { endTime: e.target.value })
                    }
                    className="rounded-r8 border border-bd-card bg-bg-input px-s8 py-s4 text-ts-fn text-tx-primary focus:outline-none focus:ring-2 focus:ring-tx-primary/20"
                  />
                </div>
              ) : (
                <span className="text-ts-cap1 text-tx-subtle">Libur</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
