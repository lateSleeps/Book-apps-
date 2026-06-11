'use client';

/**
 * @responsibility
 * Staff Directory — table-format list of staff members.
 *
 * Columns: Staff | Role | Telepon | Status | Jadwal | Aksi
 *
 * Table layout follows the VisitTable pattern (display:grid with fr columns).
 * Badges use existing token classes from the Design System.
 * Avatar uses avatarColor() + getInitials() from shared/lib/avatar.
 * Edit opens a SettingsSideSheet (same pattern as Layanan / Produk).
 * Add Staff is in SettingsSectionHeader action slot (matches all other domains).
 *
 * Does NOT modify: Service Assignment, Weekly Schedule, Leave.
 */

import { Users } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import {
  ConfirmDialog,
  EntityActionMenu,
  SettingsAddButton,
  SettingsEmptyState,
  SettingsFieldGroup,
  SettingsFormGrid,
  SettingsInput,
  SettingsUploadField,
} from '@/features/dashboard/components/settings/components/shared';
import type { ConfirmPending } from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsSectionHeader,
  SettingsSideSheet,
} from '@/features/dashboard/components/settings/layout';
import type {
  StaffMember,
  StaffRole,
  StaffSpecialty,
  WeekDay,
  WeeklySchedule,
} from '@/features/dashboard/components/settings/types/team.types';
import type { TeamController } from '@/features/dashboard/hooks/settings/useTeamController';
import { avatarColor, getInitials } from '@/shared/lib/avatar';

// ── Grid layout — matches VisitTable pattern ──────────────────────────────────
// Staff (2fr) | Role (1fr) | Telepon (1.3fr) | Status (0.8fr) | Jadwal (1fr) | Aksi (2.5rem)

const COLUMN_HEADERS = ['Staff', 'Role', 'Telepon', 'Status', 'Jadwal', 'Aksi'];

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1.3fr 0.8fr 1fr 2.5rem',
  columnGap: 16,
  alignItems: 'center',
};

// ── Role metadata ─────────────────────────────────────────────────────────────

const ROLE_META: Record<StaffRole, { label: string; badgeClass: string }> = {
  OWNER: { label: 'Owner', badgeClass: 'bg-st-confirmed-bg text-st-confirmed' },
  STYLIST: { label: 'Stylist', badgeClass: 'bg-bg-control text-tx-subtle' },
  COLORIST: { label: 'Colorist', badgeClass: 'bg-st-upcoming-bg text-st-upcoming' },
  NAIL_ARTIST: { label: 'Nail Artist', badgeClass: 'bg-bg-control text-tx-subtle' },
  THERAPIST: { label: 'Therapist', badgeClass: 'bg-st-in-progress-bg text-st-in-progress' },
  RECEPTIONIST: { label: 'Receptionist', badgeClass: 'bg-bg-control text-tx-subtle' },
};

const ROLE_OPTIONS: StaffRole[] = [
  'STYLIST',
  'COLORIST',
  'NAIL_ARTIST',
  'THERAPIST',
  'RECEPTIONIST',
  'OWNER',
];

const SPECIALTY_OPTIONS: StaffSpecialty[] = [
  'HAIR_STYLIST',
  'COLORIST',
  'NAIL_ARTIST',
  'THERAPIST',
];

const SPECIALTY_LABELS: Record<StaffSpecialty, string> = {
  HAIR_STYLIST: 'Hair Stylist',
  COLORIST: 'Colorist',
  NAIL_ARTIST: 'Nail Artist',
  THERAPIST: 'Therapist',
};

// ── Schedule summary ──────────────────────────────────────────────────────────

const DAY_ORDER: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_SHORT: Record<WeekDay, string> = {
  MON: 'Sen',
  TUE: 'Sel',
  WED: 'Rab',
  THU: 'Kam',
  FRI: 'Jum',
  SAT: 'Sab',
  SUN: 'Min',
};

function scheduleLabel(schedule: WeeklySchedule | undefined): string {
  if (!schedule) return '—';
  const enabledDays = schedule.days.filter((d) => d.enabled).map((d) => d.day);
  const count = enabledDays.length;
  if (count === 0) return 'Libur';
  if (count === 7) return 'Setiap hari';

  const firstIdx = DAY_ORDER.findIndex((d) => enabledDays.includes(d));
  const reversed = [...DAY_ORDER].reverse();
  const lastIdx = DAY_ORDER.length - 1 - reversed.findIndex((d) => enabledDays.includes(d));

  // Contiguous range: Sen - Sab
  if (lastIdx - firstIdx + 1 === count) {
    const first = DAY_SHORT[DAY_ORDER[firstIdx]!];
    const last = DAY_SHORT[DAY_ORDER[lastIdx]!];
    return first === last ? first ?? '—' : `${first} - ${last}`;
  }

  return `${count} hari/minggu`;
}

// ── Form draft ────────────────────────────────────────────────────────────────

type StaffDraft = Omit<StaffMember, 'id'>;

const AVATAR_PALETTE = ['#ddedf8', '#d8f3ec', '#fde8dc', '#e8e2f8', '#fef3dc', '#f0ddf5'];

const BLANK_DRAFT: StaffDraft = {
  fullName: '',
  phone: '',
  role: 'STYLIST',
  specialty: 'HAIR_STYLIST',
  avatarUrl: null,
  avatarColor: AVATAR_PALETTE[0]!,
  isActive: true,
};

type SheetMode = { mode: 'add' } | { mode: 'edit'; staff: StaffMember };

// ── StaffTableHeader ──────────────────────────────────────────────────────────

function StaffTableHeader() {
  return (
    <div style={GRID_STYLE} className="rounded-t-r12 bg-bg-header px-s20 py-s8">
      {COLUMN_HEADERS.map((h, i) => (
        <span
          key={h}
          className={`relative text-ts-fn font-medium text-tx-secondary ${
            i > 0
              ? 'before:absolute before:-left-s8 before:top-1/2 before:-translate-y-1/2 before:text-bd-card before:content-["|"]'
              : ''
          }`}
        >
          {h}
        </span>
      ))}
    </div>
  );
}

// ── StaffTableRow ─────────────────────────────────────────────────────────────

interface StaffTableRowProps {
  member: StaffMember;
  schedule: WeeklySchedule | undefined;
  onEdit: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}

function StaffTableRow({ member, schedule, onEdit, onDeactivate, onDelete }: StaffTableRowProps) {
  const { bg } = avatarColor(member.fullName);
  const initials = getInitials(member.fullName);
  const roleMeta = ROLE_META[member.role];
  const isTwoChar = initials.length > 1;

  return (
    <div
      style={GRID_STYLE}
      className="border-b border-bd-row px-s20 py-s12 transition-colors last:border-b-0 hover:bg-bg-hover"
    >
      {/* Staff — avatar + name */}
      <div className="flex min-w-0 items-center gap-s12">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatarUrl}
            alt={member.fullName}
            className="h-10 w-10 shrink-0 rounded-r10 object-cover"
          />
        ) : (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-r10 font-semibold text-tx-primary ${
              isTwoChar ? 'text-ts-fn' : 'text-ts-body'
            }`}
            style={{ background: bg }}
          >
            {initials}
          </div>
        )}
        <span className="truncate text-ts-fn font-medium text-tx-primary">{member.fullName}</span>
      </div>

      {/* Role badge */}
      <span
        className={`inline-flex w-fit items-center rounded-rF px-s8 py-0.5 text-ts-cap2 font-medium ${roleMeta.badgeClass}`}
      >
        {roleMeta.label}
      </span>

      {/* Telepon */}
      <span className="text-ts-fn text-tx-subtle">{member.phone || '—'}</span>

      {/* Status badge */}
      <span
        className={`inline-flex w-fit items-center rounded-rF px-s8 py-0.5 text-ts-cap2 font-medium ${
          member.isActive
            ? 'bg-st-in-progress-bg text-st-in-progress'
            : 'bg-bg-control text-tx-subtle'
        }`}
      >
        {member.isActive ? 'Aktif' : 'Nonaktif'}
      </span>

      {/* Jadwal summary */}
      <span className="text-ts-fn text-tx-subtle">{scheduleLabel(schedule)}</span>

      {/* Aksi — EntityActionMenu (matches Services / Produk pattern) */}
      <EntityActionMenu
        actions={[
          { label: 'Edit Staff', onClick: onEdit },
          ...(member.isActive ? [{ label: 'Nonaktifkan Staff', onClick: onDeactivate }] : []),
          { label: 'Hapus Permanen', variant: 'danger' as const, onClick: onDelete },
        ]}
      />
    </div>
  );
}

// ── StaffFormContent (inside SideSheet) ──────────────────────────────────────

interface StaffFormContentProps {
  draft: StaffDraft;
  onChange: (patch: Partial<StaffDraft>) => void;
}

function StaffFormContent({ draft, onChange }: StaffFormContentProps) {
  return (
    <SettingsFormGrid cols={2}>
      <SettingsFieldGroup label="Foto" htmlFor="staff-avatar" fullWidth>
        <SettingsUploadField
          variant="avatar"
          value={draft.avatarUrl}
          onChange={(_file, previewUrl) => onChange({ avatarUrl: previewUrl })}
          onRemove={() => onChange({ avatarUrl: null })}
          compact
        />
      </SettingsFieldGroup>

      <SettingsFieldGroup label="Nama Lengkap" required htmlFor="staff-name">
        <SettingsInput
          id="staff-name"
          type="text"
          value={draft.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          placeholder="Contoh: Dewi Rahayu"
        />
      </SettingsFieldGroup>

      <SettingsFieldGroup label="No. HP" htmlFor="staff-phone">
        <SettingsInput
          id="staff-phone"
          type="tel"
          value={draft.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="08xxxxxxxxxx"
        />
      </SettingsFieldGroup>

      <SettingsFieldGroup label="Role" htmlFor="staff-role">
        <select
          id="staff-role"
          value={draft.role}
          onChange={(e) => onChange({ role: e.target.value as StaffRole })}
          className="w-full rounded-r10 border border-bd-card bg-bg-input px-s12 py-s8 text-ts-fn text-tx-primary focus:outline-none focus:ring-2 focus:ring-tx-primary/20"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {ROLE_META[r].label}
            </option>
          ))}
        </select>
      </SettingsFieldGroup>

      <SettingsFieldGroup label="Spesialisasi" htmlFor="staff-specialty">
        <select
          id="staff-specialty"
          value={draft.specialty ?? ''}
          onChange={(e) =>
            onChange({ specialty: (e.target.value || null) as StaffSpecialty | null })
          }
          className="w-full rounded-r10 border border-bd-card bg-bg-input px-s12 py-s8 text-ts-fn text-tx-primary focus:outline-none focus:ring-2 focus:ring-tx-primary/20"
        >
          <option value="">Tidak ada</option>
          {SPECIALTY_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {SPECIALTY_LABELS[s]}
            </option>
          ))}
        </select>
      </SettingsFieldGroup>
    </SettingsFormGrid>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface Props {
  ctrl: TeamController;
}

export function StaffDirectorySection({ ctrl }: Props) {
  const [sheet, setSheet] = useState<SheetMode | null>(null);
  const [draft, setDraft] = useState<StaffDraft>(BLANK_DRAFT);
  const [confirmPending, setConfirmPending] = useState<ConfirmPending | null>(null);

  const staff = ctrl.domain.staff;

  function openAdd() {
    setDraft({
      ...BLANK_DRAFT,
      avatarColor: AVATAR_PALETTE[staff.length % AVATAR_PALETTE.length] ?? BLANK_DRAFT.avatarColor,
    });
    setSheet({ mode: 'add' });
  }

  function openEdit(member: StaffMember) {
    setDraft({
      fullName: member.fullName,
      phone: member.phone,
      role: member.role,
      specialty: member.specialty,
      avatarUrl: member.avatarUrl,
      avatarColor: member.avatarColor,
      isActive: member.isActive,
    });
    setSheet({ mode: 'edit', staff: member });
  }

  function closeSheet() {
    setSheet(null);
  }

  const handleSheetSave = useCallback(() => {
    if (!sheet || !draft.fullName.trim()) return;
    if (sheet.mode === 'add') {
      ctrl.addStaff(draft);
    } else {
      ctrl.updateStaff(sheet.staff.id, draft);
    }
    closeSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet, draft, ctrl]);

  function handleDeactivate(member: StaffMember) {
    setConfirmPending({
      title: 'Nonaktifkan Staff',
      message: `${member.fullName} tidak akan bisa dijadwalkan setelah dinonaktifkan.`,
      confirmLabel: 'Nonaktifkan',
      variant: 'danger',
      onConfirm: () => {
        ctrl.deactivateStaff(member.id);
        setConfirmPending(null);
      },
    });
  }

  function handleDelete(member: StaffMember) {
    const assignment = ctrl.domain.assignments.find((a) => a.staffId === member.id);
    const hasAssignments = (assignment?.serviceIds.length ?? 0) > 0;
    const schedule = ctrl.domain.schedules.find((s) => s.staffId === member.id);
    const hasSchedule = schedule?.days.some((d) => d.enabled) ?? false;
    const hasData = hasAssignments || hasSchedule;

    setConfirmPending({
      title: 'Hapus Staff?',
      message: hasData
        ? 'Staff akan dihapus permanen. Semua penugasan layanan dan jadwal kerja staff ini juga akan dihapus.'
        : 'Staff akan dihapus permanen.',
      confirmLabel: 'Hapus Permanen',
      variant: 'danger',
      onConfirm: () => {
        ctrl.deleteStaff(member.id);
        setConfirmPending(null);
      },
    });
  }

  const sheetTitle = sheet?.mode === 'add' ? 'Tambah Staff' : 'Edit Staff';
  const canSave = draft.fullName.trim().length > 0;

  return (
    <div className="flex flex-col gap-s16">
      {/* Section header — Add Staff button anchored here */}
      <SettingsSectionHeader
        title="Direktori Staff"
        description="Kelola anggota tim, role, dan status aktif."
        action={<SettingsAddButton onClick={openAdd}>Tambah Staff</SettingsAddButton>}
      />

      {/* Empty state */}
      {staff.length === 0 ? (
        <div className="rounded-r16 border border-bd-card bg-bg-card shadow-card">
          <SettingsEmptyState
            icon={<Users size={24} weight="duotone" />}
            title="Belum ada staff"
            description="Tambahkan anggota tim untuk mulai mengatur jadwal dan layanan."
            action={<SettingsAddButton onClick={openAdd}>Tambah Staff</SettingsAddButton>}
          />
        </div>
      ) : (
        /* Table */
        <div className="overflow-hidden rounded-r16 border border-bd-card bg-bg-card shadow-card">
          <StaffTableHeader />
          {staff.map((member) => {
            const schedule = ctrl.domain.schedules.find((s) => s.staffId === member.id);
            return (
              <StaffTableRow
                key={member.id}
                member={member}
                schedule={schedule}
                onEdit={() => openEdit(member)}
                onDeactivate={() => handleDeactivate(member)}
                onDelete={() => handleDelete(member)}
              />
            );
          })}
        </div>
      )}

      {/* SideSheet — Add / Edit Staff */}
      {sheet && (
        <SettingsSideSheet
          title={sheetTitle}
          description={sheet.mode === 'add' ? 'Tambah anggota tim baru.' : 'Ubah data staff.'}
          onClose={closeSheet}
          onSave={handleSheetSave}
          canSave={canSave}
        >
          <StaffFormContent
            draft={draft}
            onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
          />
        </SettingsSideSheet>
      )}

      {/* ConfirmDialog — Deactivate or Delete */}
      {confirmPending && (
        <ConfirmDialog
          title={confirmPending.title}
          message={confirmPending.message}
          confirmLabel={confirmPending.confirmLabel}
          variant={confirmPending.variant}
          onConfirm={confirmPending.onConfirm}
          onCancel={() => setConfirmPending(null)}
        />
      )}
    </div>
  );
}
