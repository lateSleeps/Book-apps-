'use client';

/**
 * @responsibility
 * Staff availability timeline — staff-first layout.
 *
 * Layout order:
 *   1. Section header
 *   2. StaffPicker — identity + absence metrics + upcoming leave in trigger
 *   3. SettingsAddButton — primary CTA above timeline (intent: add before browse)
 *   4. Inline add form (appears between button and timeline when open)
 *   5. Timeline — activity-feed grouped by month, descending
 *   6. SettingsEmptyState — when no records exist
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
import { avatarColor, getInitials } from '@/shared/lib/avatar';
import { cn } from '@/shared/lib/cn';

// ── Constants ─────────────────────────────────────────────────────────────────

const LEAVE_LABELS: Record<LeaveType, string> = {
  LEAVE: 'Cuti',
  SICK: 'Sakit',
  HOLIDAY: 'Libur Nasional',
  UNAVAILABLE: 'Tidak Tersedia',
};

// Badge token classes per type — no hardcoded colors
const LEAVE_BADGE_CLASS: Record<LeaveType, string> = {
  LEAVE: 'bg-st-confirmed-bg text-st-confirmed',
  SICK: 'bg-st-cancelled-bg text-st-cancelled',
  HOLIDAY: 'bg-bg-control text-tx-subtle',
  UNAVAILABLE: 'bg-st-upcoming-bg text-st-upcoming',
};

const LEAVE_TYPES: LeaveType[] = ['LEAVE', 'SICK', 'HOLIDAY', 'UNAVAILABLE'];

const ROLE_LABEL: Record<StaffRole, string> = {
  OWNER: 'Owner',
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

/** "YYYY-MM-DD" → "Jumat, 20 Juni 2026" */
function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  return `${ID_DAY[dt.getDay()]}, ${d} ${ID_MONTH[m - 1]} ${y}`;
}

/** "YYYY-MM-DD" → "20 Jun 2026" */
function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${ID_MONTH_SHORT[m - 1]} ${y}`;
}

/** "YYYY-MM-DD" → "Juni 2026" — used as timeline group label */
function monthYearLabel(iso: string): string {
  const [y, m] = iso.split('-').map(Number);
  if (!y || !m) return iso;
  return `${ID_MONTH[m - 1]} ${y}`;
}

/** "YYYY-MM-DD" → sortable number YYYYMM */
function monthSortKey(iso: string): number {
  const [y, m] = iso.split('-').map(Number);
  return (y ?? 0) * 100 + (m ?? 0);
}

/** Today as "YYYY-MM-DD" */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Derived metrics ───────────────────────────────────────────────────────────

interface AbsenceMetrics {
  totalCatatan: number;
  totalHari: number;
  lastDate: string | null;
  nextLeave: string | null;
}

function computeMetrics(leaves: StaffLeave[]): AbsenceMetrics {
  const today = todayIso();
  const sorted = [...leaves].sort((a, b) => b.date.localeCompare(a.date));
  const upcoming = sorted
    .filter((l) => l.date >= today && l.type === 'LEAVE')
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalCatatan: leaves.length,
    totalHari: leaves.length,
    lastDate: sorted[0]?.date ?? null,
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

// ── Avatar bubble ─────────────────────────────────────────────────────────────
// Inline style only for runtime-computed avatar bg — cannot be Tailwind.

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

// ── StaffPicker ───────────────────────────────────────────────────────────────
// Trigger: identity (avatar + name + role + status) + absence metrics + chevron.
// Metrics row shows catatan count + hari count.
// Third line: upcoming leave date (only if exists).

interface StaffPickerProps {
  staff: StaffMember[];
  selectedId: string;
  metrics: AbsenceMetrics;
  onSelect: (id: string) => void;
}

function StaffPicker({ staff, selectedId, metrics, onSelect }: StaffPickerProps) {
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

  const summaryLine =
    metrics.totalCatatan === 0
      ? 'Belum ada catatan'
      : `${metrics.totalCatatan} catatan · ${metrics.totalHari} hari tidak hadir`;

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
          <p className="mt-s4 text-ts-cap1 text-tx-subtle">{summaryLine}</p>
          {metrics.nextLeave && (
            <p className="mt-s2 text-ts-cap1 text-tx-secondary">
              Cuti berikutnya:{' '}
              <span className="font-medium text-st-confirmed">
                {formatDateShort(metrics.nextLeave)}
              </span>
            </p>
          )}
        </div>

        {/* Chevron */}
        <div className="shrink-0">
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

// ── Timeline entry ────────────────────────────────────────────────────────────
// Lightweight activity-feed row — badge + date + note + delete.
// No outer card wrapper; separated only by a thin divider.

interface TimelineEntryProps {
  leave: StaffLeave;
  onDelete: (id: string) => void;
}

function TimelineEntry({ leave, onDelete }: TimelineEntryProps) {
  return (
    <div className="flex items-start gap-s12 px-s4 py-s12">
      {/* Left — badge + date + note */}
      <div className="flex flex-1 flex-col gap-s4">
        <LeaveBadge type={leave.type} />
        <p className="text-ts-fn font-medium text-tx-primary">{formatDateLong(leave.date)}</p>
        {leave.note && <p className="text-ts-fn text-tx-secondary">{leave.note}</p>}
      </div>

      {/* Right — delete */}
      <button
        type="button"
        onClick={() => onDelete(leave.id)}
        className="shrink-0 text-ts-cap1 font-medium text-ac-danger transition-opacity hover:opacity-70"
      >
        Hapus
      </button>
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
      <SettingsSectionHeader
        title="Cuti & Hari Tidak Tersedia"
        description="Catat hari cuti, sakit, dan ketidakhadiran staff."
      />

      {/* ── Staff picker ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-s8">
        <p className="text-ts-fn font-medium text-tx-primary">Pilih Staff</p>
        <StaffPicker
          staff={activeStaff}
          selectedId={resolvedId}
          metrics={metrics}
          onSelect={handleStaffChange}
        />
      </div>

      {/* ── Primary CTA — above timeline ─────────────────────────────────── */}
      {!showForm && <SettingsAddButton onClick={openAdd}>Tambah Ketidakhadiran</SettingsAddButton>}

      {/* ── Inline add form ───────────────────────────────────────────────── */}
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

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      {staffLeaves.length === 0 ? (
        <SettingsEmptyState
          icon={<CalendarX size={24} weight="duotone" />}
          title="Belum ada catatan ketidakhadiran"
          description="Tambahkan cuti, sakit, atau jadwal tidak tersedia untuk staff ini."
        />
      ) : (
        <div className="flex flex-col gap-s8">
          {groups.map((group) => (
            <div key={group.label}>
              {/* Month label */}
              <div className="mb-s8 flex items-center gap-s8">
                <p className="shrink-0 text-ts-cap1 font-semibold text-tx-subtle">{group.label}</p>
                <div className="h-px flex-1 bg-bd-row" />
              </div>

              {/* Entries */}
              <div className="flex flex-col">
                {group.entries.map((leave, idx) => (
                  <div key={leave.id}>
                    <TimelineEntry leave={leave} onDelete={ctrl.removeLeave} />
                    {idx < group.entries.length - 1 && <div className="h-px bg-bd-row" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
