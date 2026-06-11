'use client';

import { MagnifyingGlass, UserGear } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { PermissionSummaryCard } from './PermissionSummaryCard';
import type { AccessRole, User } from '@/features/auth/types/auth.types';
import { getRoleDisplayName } from '@/features/auth/utils/role-permissions';
import {
  ConfirmDialog,
  EntityActionMenu,
  SettingsAddButton,
  SettingsDangerZone,
  SettingsEmptyState,
  SettingsFieldGroup,
  SettingsInput,
} from '@/features/dashboard/components/settings/components/shared';
import type {
  ActionItem,
  ConfirmPending,
} from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsPageShell,
  SettingsSectionHeader,
  SettingsSideSheet,
} from '@/features/dashboard/components/settings/layout';
import type { PenggunaController } from '@/features/dashboard/hooks/settings/usePenggunaController';
import { usePenggunaController } from '@/features/dashboard/hooks/settings/usePenggunaController';
import { AvatarBubble } from '@/shared/components/ui/AvatarBubble';
import { SegmentedControl } from '@/shared/components/ui/segmented-control';
import { avatarColor, getInitials } from '@/shared/lib/avatar';

// ── Badge helpers ─────────────────────────────────────────────────────────────

const ROLE_BADGE_CLASS: Record<AccessRole, string> = {
  OWNER: 'bg-st-confirmed-bg text-st-confirmed',
  ADMIN: 'bg-st-upcoming-bg text-st-upcoming',
  STAFF: 'bg-bg-control text-tx-subtle',
};

const STATUS_LABEL: Record<User['status'], string> = {
  ACTIVE: 'Aktif',
  INVITED: 'Diundang',
  INACTIVE: 'Nonaktif',
  REVOKED: 'Dicabut',
};

const STATUS_BADGE_CLASS: Record<User['status'], string> = {
  ACTIVE: 'bg-st-in-progress-bg text-st-in-progress',
  INVITED: 'bg-st-upcoming-bg text-st-upcoming',
  INACTIVE: 'bg-bg-control text-tx-muted',
  REVOKED: 'bg-st-cancelled-bg text-st-cancelled',
};

// ── Date helpers ──────────────────────────────────────────────────────────────

function formatRelativeDate(iso: string | null | undefined): string {
  if (!iso) return 'Belum pernah';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan lalu`;
  return `${Math.floor(months / 12)} tahun lalu`;
}

function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

// ── Table grid ────────────────────────────────────────────────────────────────

const GRID = '2.5fr 1fr 1fr 1.4fr 44px';
const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: GRID,
  columnGap: 16,
  alignItems: 'center',
} as const;

const COLUMN_HEADERS = ['Pengguna', 'Peran', 'Status', 'Login Terakhir', ''];

// ── PenggunaTableHeader ───────────────────────────────────────────────────────

function PenggunaTableHeader() {
  return (
    <div style={GRID_STYLE} className="bg-bg-header px-s20 py-s8">
      {COLUMN_HEADERS.map((h, i) => (
        <span
          key={i}
          className={`text-ts-fn font-medium text-tx-secondary ${
            i > 0
              ? 'relative before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:text-bd-card before:content-["|"]'
              : ''
          }`}
        >
          {h}
        </span>
      ))}
    </div>
  );
}

// ── PenggunaTableRow ──────────────────────────────────────────────────────────

interface PenggunaTableRowProps {
  user: User;
  isSelf: boolean;
  actions: ActionItem[];
  onClick: () => void;
}

function PenggunaTableRow({ user, isSelf, actions, onClick }: PenggunaTableRowProps) {
  const { bg, text: avatarText } = avatarColor(user.name);
  const initials = getInitials(user.name);

  return (
    <div
      role="row"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={GRID_STYLE}
      className="cursor-pointer border-b border-bd-row px-s20 py-s12 transition-colors last:border-0 hover:bg-bg-hover focus:outline-none focus-visible:bg-bg-hover"
    >
      {/* Col 1 — Pengguna */}
      <div className="flex min-w-0 items-center gap-s12">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-r10 font-semibold"
          style={{
            background: bg,
            color: avatarText,
            fontSize: initials.length > 1 ? '0.8125rem' : '1rem',
          }}
        >
          {initials}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-s8">
            <span className="truncate text-ts-fn font-semibold text-tx-primary">{user.name}</span>
            {isSelf && (
              <span className="shrink-0 text-ts-cap2 font-medium text-tx-muted">(Kamu)</span>
            )}
          </div>
          <span className="truncate text-ts-cap1 text-tx-subtle">{user.email}</span>
        </div>
      </div>

      {/* Col 2 — Peran */}
      <span
        className={`inline-flex w-fit items-center rounded-rF px-s8 py-1 text-ts-cap2 font-semibold ${ROLE_BADGE_CLASS[user.role]}`}
      >
        {getRoleDisplayName(user.role)}
      </span>

      {/* Col 3 — Status */}
      <span
        className={`inline-flex w-fit items-center rounded-rF px-s8 py-1 text-ts-cap2 font-semibold ${STATUS_BADGE_CLASS[user.status]}`}
      >
        {STATUS_LABEL[user.status]}
      </span>

      {/* Col 4 — Login Terakhir */}
      <span className="text-ts-fn text-tx-subtle">{formatRelativeDate(user.lastLoginAt)}</span>

      {/* Col 5 — Aksi */}
      <EntityActionMenu actions={actions} />
    </div>
  );
}

// ── Filter type ───────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'active' | 'invited' | 'inactive';

// ── Sheet modes ───────────────────────────────────────────────────────────────

type SheetMode = { kind: 'invite' } | { kind: 'edit'; user: User };

// ── Role toggle (full-width, matches ServiceForm price toggle) ───────────────

const ROLE_TOGGLE_OPTIONS: { value: 'ADMIN' | 'STAFF'; label: string; hint: string }[] = [
  { value: 'ADMIN', label: 'Admin', hint: 'Kelola salon penuh (kecuali pengguna)' },
  { value: 'STAFF', label: 'Staf', hint: 'Kelola pemesanan & jadwal sendiri' },
];

interface RoleToggleProps {
  value: 'ADMIN' | 'STAFF';
  onChange: (v: 'ADMIN' | 'STAFF') => void;
}

function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div className="flex overflow-hidden rounded-r10 border border-bd-card text-ts-fn font-medium">
      {ROLE_TOGGLE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex flex-1 flex-col items-center px-s16 py-s12 transition-colors ${
            value === opt.value
              ? 'bg-tx-primary text-bg-card'
              : 'bg-bg-input text-tx-secondary hover:bg-bg-hover'
          }`}
        >
          <span className="font-semibold">{opt.label}</span>
          <span
            className={`mt-s2 text-ts-cap2 font-normal ${
              value === opt.value ? 'text-bg-card/80' : 'text-tx-muted'
            }`}
          >
            {opt.hint}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Invite sheet body ─────────────────────────────────────────────────────────

interface InviteSheetBodyProps {
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  emailError: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onRole: (v: 'ADMIN' | 'STAFF') => void;
}

function InviteSheetBody({
  name,
  email,
  role,
  emailError,
  onName,
  onEmail,
  onRole,
}: InviteSheetBodyProps) {
  return (
    <div className="flex flex-col gap-s20">
      <SettingsFieldGroup label="Nama Lengkap" required htmlFor="invite-name">
        <SettingsInput
          id="invite-name"
          type="text"
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Contoh: Dewi Rahayu"
          autoFocus
        />
      </SettingsFieldGroup>

      <SettingsFieldGroup
        label="Email"
        required
        htmlFor="invite-email"
        error={emailError || undefined}
      >
        <SettingsInput
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          placeholder="dewi@rarabeauty.com"
          hasError={!!emailError}
        />
      </SettingsFieldGroup>

      <SettingsFieldGroup label="Peran Akses" required>
        <RoleToggle value={role} onChange={onRole} />
      </SettingsFieldGroup>

      <div className="flex flex-col gap-s8">
        <p className="text-ts-fn font-medium text-tx-primary">Izin Akses</p>
        <PermissionSummaryCard role={role} />
      </div>
    </div>
  );
}

// ── Edit sheet body ───────────────────────────────────────────────────────────

interface EditSheetBodyProps {
  user: User;
  editRole: 'ADMIN' | 'STAFF';
  isSelf: boolean;
  onRoleChange: (v: 'ADMIN' | 'STAFF') => void;
  ctrl: PenggunaController;
  onClose: () => void;
}

function EditSheetBody({
  user,
  editRole,
  isSelf,
  onRoleChange,
  ctrl,
  onClose,
}: EditSheetBodyProps) {
  const isOwner = user.role === 'OWNER';
  const isEditable = !isOwner && !isSelf;

  return (
    <div className="flex flex-col gap-s24">
      {/* ── Identity block ─────────────────────────────── */}
      <div className="flex flex-col gap-s16 rounded-r12 border border-bd-card bg-bg-card p-s16">
        <div className="flex items-center gap-s12">
          <AvatarBubble name={user.name} size="md" />
          <div className="flex min-w-0 flex-1 flex-col gap-s4">
            <div className="flex flex-wrap items-center gap-s8">
              <span className="text-ts-sub font-bold text-tx-primary">{user.name}</span>
              {isSelf && (
                <span className="inline-flex items-center rounded-rF bg-bg-control px-s8 py-0.5 text-ts-cap2 font-medium text-tx-muted">
                  Kamu
                </span>
              )}
            </div>
            <span className="truncate text-ts-fn text-tx-secondary">{user.email}</span>
          </div>
        </div>

        {/* Role + Status badges */}
        <div className="flex flex-wrap gap-s8">
          <span
            className={`inline-flex items-center rounded-rF px-s8 py-0.5 text-ts-cap2 font-medium ${ROLE_BADGE_CLASS[user.role]}`}
          >
            {getRoleDisplayName(user.role)}
          </span>
          <span
            className={`inline-flex items-center rounded-rF px-s8 py-0.5 text-ts-cap2 font-medium ${STATUS_BADGE_CLASS[user.status]}`}
          >
            {STATUS_LABEL[user.status]}
          </span>
        </div>
      </div>

      {/* ── Login activity ─────────────────────────────── */}
      <div className="flex flex-col gap-s8">
        <p className="text-ts-fn font-semibold text-tx-primary">Aktivitas Login</p>
        <div className="flex flex-col gap-s4 rounded-r12 border border-bd-card bg-bg-card px-s16 py-s12">
          <div className="flex items-center justify-between">
            <span className="text-ts-fn text-tx-secondary">Bergabung</span>
            <span className="text-ts-fn font-medium text-tx-primary">
              {formatDateLong(user.joinDate)}
            </span>
          </div>
          {user.invitedAt && (
            <div className="flex items-center justify-between">
              <span className="text-ts-fn text-tx-secondary">Diundang</span>
              <span className="text-ts-fn font-medium text-tx-primary">
                {formatDateLong(user.invitedAt)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-ts-fn text-tx-secondary">Login terakhir</span>
            <span className="text-ts-fn font-medium text-tx-primary">
              {formatRelativeDate(user.lastLoginAt)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Role editor ────────────────────────────────── */}
      {isEditable && (
        <div className="flex flex-col gap-s8">
          <p className="text-ts-fn font-semibold text-tx-primary">Peran Akses</p>
          <RoleToggle value={editRole} onChange={onRoleChange} />
        </div>
      )}

      {/* ── Permission summary ──────────────────────────── */}
      <div className="flex flex-col gap-s8">
        <p className="text-ts-fn font-semibold text-tx-primary">Izin Akses</p>
        <PermissionSummaryCard role={isEditable ? editRole : user.role} />
      </div>

      {/* ── Danger zone ─────────────────────────────────── */}
      {isEditable && user.status === 'ACTIVE' && (
        <SettingsDangerZone
          actions={[
            {
              label: 'Nonaktifkan Akun',
              description: 'Akun dinonaktifkan sementara. Dapat diaktifkan kembali.',
              confirmLabel: 'Nonaktifkan',
              confirmPrompt: 'Pengguna tidak bisa login sampai diaktifkan kembali.',
              onConfirm: () => {
                ctrl.deactivateUser(user.id);
                onClose();
              },
            },
            {
              label: 'Cabut Akses Permanen',
              description: 'Akses dicabut selamanya. Diperlukan undangan baru.',
              confirmLabel: 'Cabut Akses',
              confirmPrompt: 'Tindakan ini tidak dapat dibatalkan.',
              onConfirm: () => {
                ctrl.revokeUser(user.id);
                onClose();
              },
            },
          ]}
        />
      )}

      {/* Reactivate if inactive */}
      {isEditable && user.status === 'INACTIVE' && (
        <SettingsDangerZone
          title="Pemulihan Akun"
          actions={[
            {
              label: 'Aktifkan Kembali',
              description: 'Pengguna bisa login lagi setelah diaktifkan.',
              confirmLabel: 'Aktifkan',
              onConfirm: () => {
                ctrl.reactivateUser(user.id);
                onClose();
              },
            },
          ]}
        />
      )}
    </div>
  );
}

// ── Main client ───────────────────────────────────────────────────────────────

export function PenggunaPageClient() {
  const ctrl = usePenggunaController();

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [sheet, setSheet] = useState<SheetMode | null>(null);
  const [confirmPending, setConfirmPending] = useState<ConfirmPending | null>(null);

  // Invite form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [inviteEmailError, setInviteEmailError] = useState('');

  // Edit form state
  const [editRole, setEditRole] = useState<'ADMIN' | 'STAFF'>('STAFF');

  // ── Derived counts ──────────────────────────────────────────────────────────

  const counts = useMemo(() => {
    const active = ctrl.users.filter((u) => u.status === 'ACTIVE').length;
    const invited = ctrl.users.filter((u) => u.status === 'INVITED').length;
    const inactive = ctrl.users.filter(
      (u) => u.status === 'INACTIVE' || u.status === 'REVOKED'
    ).length;
    return { all: ctrl.users.length, active, invited, inactive };
  }, [ctrl.users]);

  // ── Filtered + searched list ────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list: User[];
    if (filter === 'active') list = ctrl.users.filter((u) => u.status === 'ACTIVE');
    else if (filter === 'invited') list = ctrl.users.filter((u) => u.status === 'INVITED');
    else if (filter === 'inactive')
      list = ctrl.users.filter((u) => u.status === 'INACTIVE' || u.status === 'REVOKED');
    else list = ctrl.users;

    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [ctrl.users, filter, search]);

  // Sort: OWNER first, then ADMIN, then STAFF; within each tier, alphabetical
  const ROLE_ORDER: Record<AccessRole, number> = { OWNER: 0, ADMIN: 1, STAFF: 2 };
  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const roleDiff = ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
        return roleDiff !== 0 ? roleDiff : a.name.localeCompare(b.name, 'id');
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered]
  );

  // ── Sheet helpers ───────────────────────────────────────────────────────────

  function openInviteSheet() {
    setInviteName('');
    setInviteEmail('');
    setInviteRole('STAFF');
    setInviteEmailError('');
    setSheet({ kind: 'invite' });
  }

  function openEditSheet(user: User) {
    const safeRole: 'ADMIN' | 'STAFF' = user.role === 'OWNER' ? 'ADMIN' : user.role;
    setEditRole(safeRole);
    setSheet({ kind: 'edit', user });
  }

  function closeSheet() {
    setSheet(null);
  }

  // ── Save handlers ───────────────────────────────────────────────────────────

  function handleInviteSave() {
    const emailTaken = ctrl.users.some((u) => u.email.toLowerCase() === inviteEmail.toLowerCase());
    if (emailTaken) {
      setInviteEmailError('Email ini sudah terdaftar.');
      return;
    }
    ctrl.inviteUser({ name: inviteName.trim(), email: inviteEmail.trim(), role: inviteRole });
    closeSheet();
  }

  function handleEditSave() {
    if (sheet?.kind !== 'edit') return;
    const user = sheet.user;
    const isDowngrade = user.role === 'ADMIN' && editRole === 'STAFF';
    if (isDowngrade) {
      setConfirmPending({
        title: `Turunkan peran ${user.name}?`,
        message: `${user.name} tidak akan lagi bisa mengubah pengaturan salon, mengelola staf, atau melihat laporan.`,
        confirmLabel: 'Ya, Turunkan',
        variant: 'danger',
        onConfirm: () => {
          ctrl.updateRole(user.id, editRole);
          closeSheet();
          setConfirmPending(null);
        },
      });
    } else {
      ctrl.updateRole(user.id, editRole);
      closeSheet();
    }
  }

  function canSaveEdit(): boolean {
    if (sheet?.kind !== 'edit') return false;
    const { user } = sheet;
    if (user.id === ctrl.currentUserId) return false;
    if (user.role === 'OWNER') return false;
    return editRole !== user.role;
  }

  function canSaveInvite(): boolean {
    return inviteName.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail);
  }

  // ── Row action menus ────────────────────────────────────────────────────────

  function buildActions(user: User): ActionItem[] {
    const isSelf = user.id === ctrl.currentUserId;
    const isOwner = user.role === 'OWNER';

    const items: ActionItem[] = [{ label: 'Lihat Detail', onClick: () => openEditSheet(user) }];

    if (!isSelf && !isOwner) {
      if (user.status === 'INVITED') {
        items.push({
          label: 'Kirim Ulang Undangan',
          onClick: () => ctrl.resendInvite(user.id),
        });
        items.push({
          label: 'Batalkan Undangan',
          variant: 'danger',
          onClick: () => {
            setConfirmPending({
              title: 'Batalkan undangan?',
              message: `Undangan ke ${user.email} akan dibatalkan.`,
              confirmLabel: 'Batalkan Undangan',
              variant: 'danger',
              onConfirm: () => {
                ctrl.cancelInvite(user.id);
                setConfirmPending(null);
              },
            });
          },
        });
      }

      if (user.status === 'INACTIVE') {
        items.push({
          label: 'Aktifkan Kembali',
          onClick: () => ctrl.reactivateUser(user.id),
        });
      }
    }

    return items;
  }

  // ── Empty state copy ────────────────────────────────────────────────────────

  function getEmptyState(): { icon: React.ReactNode; title: string; description: string } {
    if (search.trim()) {
      return {
        icon: <MagnifyingGlass size={24} weight="duotone" />,
        title: 'Tidak ada hasil',
        description: `Tidak ada pengguna yang cocok dengan "${search}".`,
      };
    }
    if (filter === 'invited') {
      return {
        icon: <UserGear size={24} weight="duotone" />,
        title: 'Tidak ada undangan aktif',
        description: 'Undangan yang belum diterima akan muncul di sini.',
      };
    }
    if (filter === 'inactive') {
      return {
        icon: <UserGear size={24} weight="duotone" />,
        title: 'Tidak ada akun nonaktif',
        description: 'Semua anggota tim masih aktif.',
      };
    }
    return {
      icon: <UserGear size={24} weight="duotone" />,
      title: 'Belum ada anggota tim',
      description: 'Undang anggota tim untuk memberi mereka akses ke dashboard.',
    };
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const segmentItems = [
    { id: 'all', label: `Semua (${counts.all})` },
    { id: 'active', label: `Aktif (${counts.active})` },
    { id: 'invited', label: `Diundang (${counts.invited})` },
    { id: 'inactive', label: `Nonaktif (${counts.inactive})` },
  ];

  return (
    <SettingsPageShell>
      <div className="overflow-hidden rounded-r16 bg-bg-card shadow-card">
        {/* Controls */}
        <div className="flex flex-col gap-s16 p-s20">
          <SettingsSectionHeader
            title="Pengguna & Akses"
            description="Kelola akun login dan hak akses anggota tim."
            action={
              <SettingsAddButton onClick={openInviteSheet}>Undang Pengguna</SettingsAddButton>
            }
          />

          <SegmentedControl
            items={segmentItems}
            activeId={filter}
            onChange={(id) => setFilter(id as StatusFilter)}
          />

          <div className="relative">
            <MagnifyingGlass
              size={14}
              weight="duotone"
              className="pointer-events-none absolute left-s12 top-1/2 -translate-y-1/2 text-tx-secondary"
              aria-hidden
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full rounded-r10 border border-bd-card bg-bg-input py-s12 pl-s32 pr-s16 text-ts-fn text-tx-primary transition-colors placeholder:text-tx-muted focus:border-tx-secondary focus:outline-none focus:ring-1 focus:ring-tx-secondary"
            />
          </div>
        </div>

        {/* Table — full bleed, separated from controls */}
        <div className="border-t border-bd-row">
          <PenggunaTableHeader />
          {sorted.length === 0 ? (
            (() => {
              const { icon, title, description } = getEmptyState();
              return (
                <SettingsEmptyState
                  icon={icon}
                  title={title}
                  description={description}
                  action={
                    filter === 'all' && !search ? (
                      <SettingsAddButton onClick={openInviteSheet}>
                        Undang Pengguna
                      </SettingsAddButton>
                    ) : undefined
                  }
                />
              );
            })()
          ) : (
            <div role="rowgroup">
              {sorted.map((user) => (
                <PenggunaTableRow
                  key={user.id}
                  user={user}
                  isSelf={user.id === ctrl.currentUserId}
                  actions={buildActions(user)}
                  onClick={() => openEditSheet(user)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Invite side sheet ──────────────────────────── */}
      {sheet?.kind === 'invite' && (
        <SettingsSideSheet
          title="Undang Pengguna"
          description="Kirim undangan akses ke anggota tim."
          onClose={closeSheet}
          onSave={handleInviteSave}
          canSave={canSaveInvite()}
          saveLabel="Kirim Undangan"
        >
          <InviteSheetBody
            name={inviteName}
            email={inviteEmail}
            role={inviteRole}
            emailError={inviteEmailError}
            onName={setInviteName}
            onEmail={(v) => {
              setInviteEmail(v);
              setInviteEmailError('');
            }}
            onRole={setInviteRole}
          />
        </SettingsSideSheet>
      )}

      {/* ── Edit / detail side sheet ───────────────────── */}
      {sheet?.kind === 'edit' && (
        <SettingsSideSheet
          title="Detail Pengguna"
          description={sheet.user.email}
          onClose={closeSheet}
          onSave={handleEditSave}
          canSave={canSaveEdit()}
          saveLabel="Simpan Peran"
        >
          <EditSheetBody
            user={sheet.user}
            editRole={editRole}
            isSelf={sheet.user.id === ctrl.currentUserId}
            onRoleChange={setEditRole}
            ctrl={ctrl}
            onClose={closeSheet}
          />
        </SettingsSideSheet>
      )}

      {/* ── Confirmation dialog ────────────────────────── */}
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
    </SettingsPageShell>
  );
}
