'use client';

/**
 * @responsibility
 * Weekly schedule editor — staff-first layout.
 *
 * Layout:
 *   1. Section header
 *   2. StaffPicker — unified trigger (identity + schedule summary + chevron)
 *   3. Day rows — checkbox · day label · time inputs · auto-computed duration
 *
 * Schedule metrics (hari kerja, total jam) are computed from the current schedule
 * and shown inside the StaffPicker trigger — no separate summary card needed.
 */

import { CaretDown, CaretUp, Check, Users } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { SettingsEmptyState } from '@/features/dashboard/components/settings/components/shared';
import { SettingsSectionHeader } from '@/features/dashboard/components/settings/layout';
import type {
  StaffMember,
  StaffRole,
  WeekDay,
  WeeklySchedule,
} from '@/features/dashboard/components/settings/types/team.types';
import type { TeamController } from '@/features/dashboard/hooks/settings/useTeamController';
import { avatarColor, getInitials } from '@/shared/lib/avatar';
import { cn } from '@/shared/lib/cn';

// ── Constants ─────────────────────────────────────────────────────────────────

const DAY_LABELS: Record<WeekDay, string> = {
  MON: 'Senin',
  TUE: 'Selasa',
  WED: 'Rabu',
  THU: 'Kamis',
  FRI: 'Jumat',
  SAT: 'Sabtu',
  SUN: 'Minggu',
};

const ROLE_LABEL: Record<StaffRole, string> = {
  OWNER: 'Owner',
  STYLIST: 'Stylist',
  COLORIST: 'Colorist',
  NAIL_ARTIST: 'Nail Artist',
  THERAPIST: 'Therapist',
  RECEPTIONIST: 'Receptionist',
};

// ── Duration helpers ──────────────────────────────────────────────────────────

function parseMinutes(time: string): number {
  const parts = time.split(':');
  return parseInt(parts[0] ?? '0', 10) * 60 + parseInt(parts[1] ?? '0', 10);
}

function dayDurationMinutes(startTime: string, endTime: string): number {
  const diff = parseMinutes(endTime) - parseMinutes(startTime);
  return diff > 0 ? diff : 0;
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} mnt`;
  if (m === 0) return `${h} jam`;
  return `${h}j ${m}m`;
}

function scheduleMetrics(schedule: WeeklySchedule | undefined): {
  hariKerja: number;
  totalMinutes: number;
} {
  if (!schedule) return { hariKerja: 0, totalMinutes: 0 };
  const enabled = schedule.days.filter((d) => d.enabled);
  const totalMinutes = enabled.reduce(
    (sum, d) => sum + dayDurationMinutes(d.startTime, d.endTime),
    0
  );
  return { hariKerja: enabled.length, totalMinutes };
}

// ── Avatar bubble ─────────────────────────────────────────────────────────────
// Same rules as ServiceAssignmentSection — inline style only for computed bg.

function AvatarBubble({ name }: { name: string }) {
  const { bg } = avatarColor(name);
  const initials = getInitials(name);
  const isTwoChar = initials.length > 1;

  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-r10 font-semibold text-tx-primary',
        isTwoChar ? 'text-ts-fn' : 'text-ts-body'
      )}
      style={{ background: bg }}
    >
      {initials}
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-rF px-s8 py-0.5 text-ts-cap2 font-medium',
        isActive ? 'bg-st-in-progress-bg text-st-in-progress' : 'bg-bg-control text-tx-subtle'
      )}
    >
      {isActive ? 'Aktif' : 'Nonaktif'}
    </span>
  );
}

// ── StaffPicker ───────────────────────────────────────────────────────────────
// Trigger shows: identity (avatar + name + role + status) + schedule metrics + chevron.

interface StaffPickerProps {
  staff: StaffMember[];
  selectedId: string;
  hariKerja: number;
  totalMinutes: number;
  onSelect: (id: string) => void;
}

function StaffPicker({ staff, selectedId, hariKerja, totalMinutes, onSelect }: StaffPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = staff.find((s) => s.id === selectedId) ?? staff[0]!;

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const totalJam = Math.floor(totalMinutes / 60);
  const totalMnt = totalMinutes % 60;
  const jamLabel =
    totalMinutes === 0
      ? '—'
      : totalMnt === 0
        ? `${totalJam} jam / minggu`
        : `${totalJam}j ${totalMnt}m / minggu`;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-s12 rounded-r12 border border-bd-card bg-bg-card px-s16 py-s12 shadow-card transition-colors hover:bg-bg-hover"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {/* Left — identity */}
        <AvatarBubble name={selected.fullName} />
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-ts-sub font-semibold text-tx-primary">{selected.fullName}</p>
          <div className="mt-s2 flex items-center gap-s8">
            <span className="text-ts-fn text-tx-secondary">{ROLE_LABEL[selected.role]}</span>
            <StatusBadge isActive={selected.isActive} />
          </div>
        </div>

        {/* Right — schedule metrics + chevron */}
        <div className="flex shrink-0 items-center gap-s12">
          <div className="flex flex-col items-end gap-s2">
            <span className="text-ts-fn font-medium text-tx-primary">{hariKerja} hari kerja</span>
            <span className="text-ts-cap1 text-tx-subtle">{jamLabel}</span>
          </div>
          {open ? (
            <CaretUp size={14} weight="duotone" className="text-tx-muted" aria-hidden />
          ) : (
            <CaretDown size={14} weight="duotone" className="text-tx-muted" aria-hidden />
          )}
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-s4 overflow-hidden rounded-r12 border border-bd-card bg-bg-card shadow-card"
        >
          {staff.map((member) => {
            const isSelected = member.id === selectedId;
            return (
              <button
                key={member.id}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => {
                  onSelect(member.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-s12 border-b border-bd-row px-s16 py-s8 transition-colors last:border-b-0 hover:bg-bg-hover',
                  isSelected && 'bg-bg-hover'
                )}
              >
                <AvatarBubble name={member.fullName} />
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-ts-fn font-semibold text-tx-primary">
                    {member.fullName}
                  </p>
                  <div className="mt-s2 flex items-center gap-s8">
                    <span className="text-ts-cap1 text-tx-secondary">
                      {ROLE_LABEL[member.role]}
                    </span>
                    <StatusBadge isActive={member.isActive} />
                  </div>
                </div>
                {isSelected && (
                  <Check
                    size={14}
                    weight="duotone"
                    className="shrink-0 text-ac-primary"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Time input ────────────────────────────────────────────────────────────────

const TIME_INPUT_CLASS =
  'rounded-r8 border border-bd-card bg-bg-input px-s8 py-s4 text-ts-fn text-tx-primary ' +
  'focus:border-tx-secondary focus:outline-none focus:ring-1 focus:ring-tx-secondary transition-colors';

// ── Main ──────────────────────────────────────────────────────────────────────

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

  const selectedMember = activeStaff.find((s) => s.id === selectedStaffId) ?? activeStaff[0]!;
  const resolvedId = selectedMember.id;
  const schedule = ctrl.domain.schedules.find((s) => s.staffId === resolvedId);
  const { hariKerja, totalMinutes } = scheduleMetrics(schedule);

  return (
    <div className="flex flex-col gap-s16">
      <SettingsSectionHeader
        title="Jadwal Mingguan"
        description="Atur hari kerja dan jam operasional setiap staff."
      />

      {/* ── Staff picker ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-s8">
        <p className="text-ts-fn font-medium text-tx-primary">Pilih Staff</p>
        <StaffPicker
          staff={activeStaff}
          selectedId={resolvedId}
          hariKerja={hariKerja}
          totalMinutes={totalMinutes}
          onSelect={setSelectedStaffId}
        />
      </div>

      {/* ── Day rows ─────────────────────────────────────────────────────── */}
      {schedule && (
        <div className="overflow-hidden rounded-r12 border border-bd-card bg-bg-card shadow-card">
          {schedule.days.map((dd) => {
            const duration = dd.enabled ? dayDurationMinutes(dd.startTime, dd.endTime) : 0;

            return (
              <div
                key={dd.day}
                className={cn(
                  'flex items-center gap-s12 px-s16 py-s12',
                  'border-b border-bd-row last:border-b-0',
                  'transition-colors',
                  !dd.enabled && 'opacity-50'
                )}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={dd.enabled}
                  onChange={(e) =>
                    ctrl.updateDaySchedule(resolvedId, dd.day, { enabled: e.target.checked })
                  }
                  className="h-4 w-4 shrink-0 rounded accent-tx-primary"
                />

                {/* Day label */}
                <span className="w-16 shrink-0 text-ts-fn font-medium text-tx-primary">
                  {DAY_LABELS[dd.day]}
                </span>

                {/* Time inputs — center */}
                <div className="flex flex-1 items-center gap-s8">
                  {dd.enabled ? (
                    <>
                      <input
                        type="time"
                        value={dd.startTime}
                        onChange={(e) =>
                          ctrl.updateDaySchedule(resolvedId, dd.day, {
                            startTime: e.target.value,
                          })
                        }
                        className={TIME_INPUT_CLASS}
                      />
                      <span className="text-ts-cap1 text-tx-muted">→</span>
                      <input
                        type="time"
                        value={dd.endTime}
                        onChange={(e) =>
                          ctrl.updateDaySchedule(resolvedId, dd.day, {
                            endTime: e.target.value,
                          })
                        }
                        className={TIME_INPUT_CLASS}
                      />
                    </>
                  ) : (
                    <span className="text-ts-fn text-tx-subtle">Libur</span>
                  )}
                </div>

                {/* Duration — right */}
                <span className="w-12 shrink-0 text-right text-ts-cap1 text-tx-subtle">
                  {dd.enabled && duration > 0 ? formatHours(duration) : ''}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
