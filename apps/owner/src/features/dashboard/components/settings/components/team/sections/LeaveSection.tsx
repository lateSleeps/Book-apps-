'use client';

/**
 * @responsibility
 * Staff availability timeline — Apple-style information hierarchy.
 *
 * Section order:
 *   A. Staff selector   — identity only, full-width card
 *   B. Summary card     — 3-column equal grid (catatan / hari / berikutnya)
 *   C. Timeline         — primary content, grouped by month
 *
 * Staff is context. Leave records are the primary content.
 * No metric duplication between selector and summary card.
 */

import { CalendarX, CaretDown, CaretUp, Check, Users } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import {
  SettingsAddButton,
  SettingsEmptyState,
  SettingsFieldGroup,
  SettingsFormGrid,
  SettingsInput,
  SettingsSelect,
  SettingsTextarea,
} from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsContentCard,
  SettingsSectionHeader,
} from '@/features/dashboard/components/settings/layout';
import type {
  LeaveType,
  StaffLeave,
  StaffMember,
  StaffRole,
} from '@/features/dashboard/components/settings/types/team.types';
import type { TeamController } from '@/features/dashboard/hooks/settings/useTeamController';
import { AvatarBubble } from '@/shared/components/ui/AvatarBubble';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { cn } from '@/shared/lib/cn';

// ── Constants ─────────────────────────────────────────────────────────────────

const LEAVE_LABELS: Record<LeaveType, string> = {
  LEAVE: 'Cuti',
  SICK: 'Sakit',
  HOLIDAY: 'Libur Nasional',
  UNAVAILABLE: 'Tidak Tersedia',
};

const LEAVE_BADGE_CLASS: Record<LeaveType, string> = {
  LEAVE: 'bg-st-confirmed-bg text-st-confirmed',
  SICK: 'bg-st-cancelled-bg text-st-cancelled',
  HOLIDAY: 'bg-bg-control text-tx-subtle',
  UNAVAILABLE: 'bg-st-upcoming-bg text-st-upcoming',
};

const LEAVE_TYPES: LeaveType[] = ['LEAVE', 'SICK', 'HOLIDAY', 'UNAVAILABLE'];

const ROLE_LABEL: Record<StaffRole, string> = {
  MANAGER: 'Manager',
  STYLIST: 'Stylist',
  COLORIST: 'Colorist',
  NAIL_ARTIST: 'Nail Artist',
  THERAPIST: 'Therapist',
  RECEPTIONIST: 'Receptionist',
};

const ID_MONTH: string[] = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const ID_MONTH_SHORT: string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

const ID_DAY: string[] = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// ── Date helpers ──────────────────────────────────────────────────────────────

function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  return `${ID_DAY[dt.getDay()]}, ${d} ${ID_MONTH[m - 1]} ${y}`;
}

function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${ID_MONTH_SHORT[m - 1]} ${y}`;
}

function monthYearLabel(iso: string): string {
  const [y, m] = iso.split('-').map(Number);
  if (!y || !m) return iso;
  return `${ID_MONTH[m - 1]} ${y}`;
}

function monthSortKey(iso: string): number {
  const [y, m] = iso.split('-').map(Number);
  return (y ?? 0) * 100 + (m ?? 0);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Derived metrics ───────────────────────────────────────────────────────────

interface AbsenceMetrics {
  totalCatatan: number;
  totalHari: number;
  nextLeave: string | null;
}

function computeMetrics(leaves: StaffLeave[]): AbsenceMetrics {
  const today = todayIso();
  const upcoming = [...leaves]
    .filter((l) => l.date >= today && l.type === 'LEAVE')
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalCatatan: leaves.length,
    totalHari: leaves.length,
    nextLeave: upcoming[0]?.date ?? null,
  };
}

// ── Timeline grouping ─────────────────────────────────────────────────────────

interface TimelineGroup {
  label: string;
  sortKey: number;
  entries: StaffLeave[];
}

function groupByMonth(leaves: StaffLeave[]): TimelineGroup[] {
  const map = new Map<string, StaffLeave[]>();
  for (const leave of leaves) {
    const label = monthYearLabel(leave.date);
    const existing = map.get(label) ?? [];
    existing.push(leave);
    map.set(label, existing);
  }
  return Array.from(map.entries())
    .map(([label, entries]) => ({
      label,
      sortKey: monthSortKey(entries[0]!.date),
      entries: [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .sort((a, b) => b.sortKey - a.sortKey);
}

// ── Leave type badge ──────────────────────────────────────────────────────────

function LeaveBadge({ type }: { type: LeaveType }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-rF px-s8 py-0.5 text-ts-cap2 font-medium',
        LEAVE_BADGE_CLASS[type]
      )}
    >
      {LEAVE_LABELS[type]}
    </span>
  );
}

// ── Section A: Staff selector card ────────────────────────────────────────────
// Identity only — no metrics, no record counts, no leave dates.
// Metrics live in the separate Summary card (Section B).

interface StaffSelectorProps {
  staff: StaffMember[];
  selectedId: string;
  onSelect: (id: string) => void;
}

function StaffSelector({ staff, selectedId, onSelect }: StaffSelectorProps) {
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

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger — full-width card, identity only */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-s12 rounded-r12 border border-bd-card bg-bg-card px-s16 py-s12 shadow-card transition-colors hover:bg-bg-hover"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <AvatarBubble name={selected.fullName} />
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-ts-sub font-semibold text-tx-primary">{selected.fullName}</p>
          <div className="mt-s2 flex items-center gap-s8">
            <span className="text-ts-fn text-tx-secondary">{ROLE_LABEL[selected.role]}</span>
            <StatusBadge isActive={selected.isActive} />
          </div>
        </div>
        {open ? (
          <CaretUp size={14} weight="duotone" className="shrink-0 text-tx-muted" aria-hidden />
        ) : (
          <CaretDown size={14} weight="duotone" className="shrink-0 text-tx-muted" aria-hidden />
        )}
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

// ── Section B: Summary card ───────────────────────────────────────────────────
// 3-column equal-width grid. No left-heavy alignment.
// Values are large; labels are small and subtle below.

interface SummaryCardProps {
  metrics: AbsenceMetrics;
}

function SummaryCard({ metrics }: SummaryCardProps) {
  const nextLeaveLabel = metrics.nextLeave ? formatDateShort(metrics.nextLeave) : '—';
  const nextLeaveIsUpcoming = metrics.nextLeave !== null;

  return (
    <div className="grid grid-cols-3 divide-x divide-bd-card overflow-hidden rounded-r12 border border-bd-card bg-bg-card shadow-card">
      {/* Catatan */}
      <div className="flex flex-col items-center gap-s4 px-s16 py-s14">
        <span className="text-ts-t3 font-bold text-tx-primary">{metrics.totalCatatan}</span>
        <span className="text-ts-cap1 text-tx-subtle">Catatan</span>
      </div>

      {/* Hari Tidak Hadir */}
      <div className="flex flex-col items-center gap-s4 px-s16 py-s14">
        <span className="text-ts-t3 font-bold text-tx-primary">{metrics.totalHari}</span>
        <span className="text-center text-ts-cap1 text-tx-subtle">Hari Tidak Hadir</span>
      </div>

      {/* Cuti Berikutnya */}
      <div className="flex flex-col items-center gap-s4 px-s16 py-s14">
        <span
          className={cn(
            'text-ts-t3 font-bold',
            nextLeaveIsUpcoming ? 'text-st-confirmed' : 'text-tx-subtle'
          )}
        >
          {nextLeaveLabel}
        </span>
        <span className="text-ts-cap1 text-tx-subtle">Berikutnya</span>
      </div>
    </div>
  );
}

// ── Section C: Timeline entry card ───────────────────────────────────────────
// Full-width card per record. Vertical hierarchy: badge → date → note → delete.

interface TimelineEntryProps {
  leave: StaffLeave;
  onDelete: (id: string) => void;
}

function TimelineEntry({ leave, onDelete }: TimelineEntryProps) {
  return (
    <div className="flex flex-col gap-s8 rounded-r12 border border-bd-card bg-bg-card px-s16 py-s12 shadow-card">
      <LeaveBadge type={leave.type} />
      <p className="text-ts-fn font-medium text-tx-primary">{formatDateLong(leave.date)}</p>
      {leave.note && <p className="text-ts-fn text-tx-secondary">{leave.note}</p>}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onDelete(leave.id)}
          className="text-ts-cap1 font-medium text-ac-danger transition-opacity hover:opacity-70"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type LeaveForm = Omit<StaffLeave, 'id'>;

interface Props {
  ctrl: TeamController;
}

export function LeaveSection({ ctrl }: Props) {
  const activeStaff = ctrl.domain.staff.filter((s) => s.isActive);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(activeStaff[0]?.id ?? '');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<LeaveForm>({
    staffId: selectedStaffId,
    type: 'LEAVE',
    date: '',
    note: '',
  });

  if (activeStaff.length === 0) {
    return (
      <div className="flex flex-col gap-s16">
        <SettingsSectionHeader
          title="Cuti & Hari Tidak Tersedia"
          description="Catat hari cuti, sakit, dan ketidakhadiran staff."
        />
        <SettingsEmptyState
          icon={<Users size={24} weight="duotone" />}
          title="Belum ada staff aktif"
          description="Tambahkan staff terlebih dahulu di tab Direktori Staff."
        />
      </div>
    );
  }

  const resolvedId = activeStaff.find((s) => s.id === selectedStaffId)?.id ?? activeStaff[0]!.id;
  const staffLeaves = ctrl.domain.leaves.filter((l) => l.staffId === resolvedId);
  const metrics = computeMetrics(staffLeaves);
  const groups = groupByMonth(staffLeaves);

  function openAdd() {
    setForm({ staffId: resolvedId, type: 'LEAVE', date: '', note: '' });
    setShowForm(true);
  }

  function handleSave() {
    if (!form.date) return;
    ctrl.addLeave({ ...form, staffId: resolvedId });
    setShowForm(false);
  }

  function handleStaffChange(id: string) {
    setSelectedStaffId(id);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-s16">
      {/* Header — add button in action slot */}
      <SettingsSectionHeader
        title="Cuti & Hari Tidak Tersedia"
        description="Catat hari cuti, sakit, dan ketidakhadiran staff."
        action={
          !showForm ? (
            <SettingsAddButton onClick={openAdd}>Tambah Ketidakhadiran</SettingsAddButton>
          ) : undefined
        }
      />

      {/* ── A: Staff selector — identity only ─────────────────────────── */}
      <StaffSelector staff={activeStaff} selectedId={resolvedId} onSelect={handleStaffChange} />

      {/* ── B: Summary — 3-column equal grid ──────────────────────────── */}
      <SummaryCard metrics={metrics} />

      {/* ── Inline add form ───────────────────────────────────────────── */}
      {showForm && (
        <SettingsContentCard padding="default">
          <SettingsFormGrid cols={2}>
            <SettingsFieldGroup label="Tanggal" required htmlFor="leave-date">
              <SettingsInput
                id="leave-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </SettingsFieldGroup>

            <SettingsFieldGroup label="Tipe" htmlFor="leave-type">
              <SettingsSelect
                id="leave-type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LeaveType }))}
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {LEAVE_LABELS[t]}
                  </option>
                ))}
              </SettingsSelect>
            </SettingsFieldGroup>

            <SettingsFieldGroup label="Keterangan" htmlFor="leave-note" fullWidth>
              <SettingsTextarea
                id="leave-note"
                rows={2}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Opsional — catatan tambahan"
              />
            </SettingsFieldGroup>
          </SettingsFormGrid>

          <div className="mt-s16 flex items-center justify-end gap-s8">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-r8 px-s16 py-s8 text-ts-fn font-medium text-tx-secondary transition-colors hover:text-tx-primary"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.date}
              className="rounded-r8 bg-tx-primary px-s16 py-s8 text-ts-fn font-medium text-white transition-opacity disabled:opacity-40"
            >
              Simpan
            </button>
          </div>
        </SettingsContentCard>
      )}

      {/* ── C: Timeline — primary content ─────────────────────────────── */}
      {staffLeaves.length === 0 ? (
        <SettingsEmptyState
          icon={<CalendarX size={24} weight="duotone" />}
          title="Belum ada catatan ketidakhadiran"
          description="Tambahkan cuti, sakit, atau jadwal tidak tersedia untuk staff ini."
        />
      ) : (
        <div className="flex flex-col gap-s16">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-s8">
              {/* Month divider */}
              <div className="flex items-center gap-s8">
                <p className="shrink-0 text-ts-cap1 font-semibold text-tx-subtle">{group.label}</p>
                <div className="h-px flex-1 bg-bd-row" />
              </div>
              {/* Leave cards */}
              {group.entries.map((leave) => (
                <TimelineEntry key={leave.id} leave={leave} onDelete={ctrl.removeLeave} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
