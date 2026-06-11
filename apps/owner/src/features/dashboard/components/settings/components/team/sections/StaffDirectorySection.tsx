'use client';

import { Users } from '@phosphor-icons/react';
import { useState } from 'react';
import {
  SettingsFormGrid,
  SettingsFieldGroup,
  SettingsInput,
  SettingsListCard,
  SettingsAddButton,
  SettingsEmptyState,
  SettingsUploadField,
  ConfirmDialog,
} from '@/features/dashboard/components/settings/components/shared';
import type { ConfirmPending } from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsContentCard,
  SettingsSectionHeader,
} from '@/features/dashboard/components/settings/layout';
import type {
  StaffMember,
  StaffRole,
  StaffSpecialty,
} from '@/features/dashboard/components/settings/types/team.types';
import type { TeamController } from '@/features/dashboard/hooks/settings/useTeamController';

const ROLE_LABELS: Record<StaffRole, string> = {
  OWNER: 'Owner',
  STYLIST: 'Stylist',
  COLORIST: 'Colorist',
  NAIL_ARTIST: 'Nail Artist',
  THERAPIST: 'Therapist',
  RECEPTIONIST: 'Receptionist',
};

const SPECIALTY_LABELS: Record<StaffSpecialty, string> = {
  HAIR_STYLIST: 'Hair Stylist',
  COLORIST: 'Colorist',
  NAIL_ARTIST: 'Nail Artist',
  THERAPIST: 'Therapist',
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

const AVATAR_PALETTE = ['#ddedf8', '#d8f3ec', '#fde8dc', '#e8e2f8', '#fef3dc', '#f0ddf5'];

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
}

type EditState = Omit<StaffMember, 'id'>;

const BLANK: EditState = {
  fullName: '',
  phone: '',
  role: 'STYLIST',
  specialty: 'HAIR_STYLIST',
  avatarUrl: null,
  avatarColor: AVATAR_PALETTE[0],
  isActive: true,
};

interface Props {
  ctrl: TeamController;
}

export function StaffDirectorySection({ ctrl }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditState>(BLANK);
  const [confirmPending, setConfirmPending] = useState<ConfirmPending | null>(null);

  const staff = ctrl.domain.staff;

  function openAdd() {
    setEditingId('new');
    setForm({ ...BLANK, avatarColor: AVATAR_PALETTE[staff.length % AVATAR_PALETTE.length] });
  }

  function openEdit(member: StaffMember) {
    setEditingId(member.id);
    setForm({
      fullName: member.fullName,
      phone: member.phone,
      role: member.role,
      specialty: member.specialty,
      avatarUrl: member.avatarUrl,
      avatarColor: member.avatarColor,
      isActive: member.isActive,
    });
  }

  function closeForm() {
    setEditingId(null);
  }

  function handleSave() {
    if (!form.fullName.trim()) return;
    if (editingId === 'new') {
      ctrl.addStaff(form);
    } else if (editingId) {
      ctrl.updateStaff(editingId, form);
    }
    closeForm();
  }

  return (
    <div className="flex flex-col gap-s16">
      <SettingsSectionHeader
        title="Direktori Staff"
        description="Kelola anggota tim, role, dan status aktif."
      />
      <div className="flex flex-col gap-s8">
        {staff.length === 0 && (
          <SettingsEmptyState
            icon={<Users size={24} weight="duotone" />}
            title="Belum ada staff"
            description="Tambahkan anggota tim untuk mulai mengatur jadwal dan layanan."
          />
        )}

        {staff.map((member) => (
          <div key={member.id}>
            <SettingsListCard
              title={member.fullName}
              description={`${ROLE_LABELS[member.role]}${member.specialty ? ' · ' + SPECIALTY_LABELS[member.specialty] : ''} · ${member.phone}`}
              imageUrl={member.avatarUrl ?? undefined}
              imageFallback={getInitials(member.fullName)}
              badges={[
                { label: ROLE_LABELS[member.role], variant: 'info' },
                member.isActive
                  ? { label: 'Aktif', variant: 'success' }
                  : { label: 'Nonaktif', variant: 'default' },
              ]}
              actions={
                <div className="flex items-center gap-s8">
                  <button
                    type="button"
                    onClick={() => openEdit(member)}
                    className="text-ts-cap1 font-medium text-ac-primary hover:text-tx-primary"
                  >
                    Edit
                  </button>
                  {member.isActive && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmPending({
                          title: 'Nonaktifkan Staff',
                          message: `${member.fullName} tidak akan bisa dijadwalkan setelah dinonaktifkan.`,
                          confirmLabel: 'Nonaktifkan',
                          variant: 'danger',
                          onConfirm: () => ctrl.deactivateStaff(member.id),
                        })
                      }
                      className="text-ts-cap1 font-medium text-ac-danger hover:opacity-80"
                    >
                      Nonaktifkan
                    </button>
                  )}
                </div>
              }
            />

            {editingId === member.id && (
              <StaffForm
                form={form}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                onSave={handleSave}
                onCancel={closeForm}
              />
            )}
          </div>
        ))}

        {editingId === 'new' && (
          <StaffForm
            form={form}
            onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            onSave={handleSave}
            onCancel={closeForm}
          />
        )}

        {editingId !== 'new' && (
          <SettingsAddButton onClick={openAdd}>Tambah Staff</SettingsAddButton>
        )}
      </div>

      {confirmPending && (
        <ConfirmDialog
          title={confirmPending.title}
          message={confirmPending.message}
          confirmLabel={confirmPending.confirmLabel}
          variant={confirmPending.variant}
          onConfirm={() => {
            confirmPending.onConfirm();
            setConfirmPending(null);
          }}
          onCancel={() => setConfirmPending(null)}
        />
      )}
    </div>
  );
}

interface StaffFormProps {
  form: EditState;
  onChange: (patch: Partial<EditState>) => void;
  onSave: () => void;
  onCancel: () => void;
}

function StaffForm({ form, onChange, onSave, onCancel }: StaffFormProps) {
  return (
    <SettingsContentCard padding="default" className="mt-s8">
      <SettingsFormGrid cols={2}>
        <SettingsFieldGroup label="Foto" htmlFor="staff-avatar" fullWidth>
          <SettingsUploadField
            variant="avatar"
            value={form.avatarUrl}
            onChange={(_file, previewUrl) => onChange({ avatarUrl: previewUrl })}
            onRemove={() => onChange({ avatarUrl: null })}
          />
        </SettingsFieldGroup>

        <SettingsFieldGroup label="Nama Lengkap" required htmlFor="staff-name">
          <SettingsInput
            id="staff-name"
            type="text"
            value={form.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="Contoh: Dewi Rahayu"
          />
        </SettingsFieldGroup>

        <SettingsFieldGroup label="No. HP" htmlFor="staff-phone">
          <SettingsInput
            id="staff-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="08xxxxxxxxxx"
          />
        </SettingsFieldGroup>

        <SettingsFieldGroup label="Role" htmlFor="staff-role">
          <select
            id="staff-role"
            value={form.role}
            onChange={(e) => onChange({ role: e.target.value as StaffRole })}
            className="w-full rounded-r10 border border-bd-card bg-bg-input px-s12 py-s8 text-ts-fn text-tx-primary focus:outline-none focus:ring-2 focus:ring-tx-primary/20"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </SettingsFieldGroup>

        <SettingsFieldGroup label="Spesialisasi" htmlFor="staff-specialty">
          <select
            id="staff-specialty"
            value={form.specialty ?? ''}
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

      <div className="mt-s16 flex items-center justify-end gap-s8">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-r8 px-s16 py-s8 text-ts-fn font-medium text-tx-secondary hover:text-tx-primary"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!form.fullName.trim()}
          className="rounded-r8 bg-tx-primary px-s16 py-s8 text-ts-fn font-medium text-white disabled:opacity-40"
        >
          Simpan
        </button>
      </div>
    </SettingsContentCard>
  );
}
