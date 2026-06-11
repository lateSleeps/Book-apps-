'use client';

import { Users, CalendarX } from '@phosphor-icons/react';
import { useState } from 'react';
import {
  SettingsListCard,
  SettingsAddButton,
  SettingsEmptyState,
  SettingsFormGrid,
  SettingsFieldGroup,
  SettingsInput,
  SettingsTextarea,
} from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsSectionHeader,
  SettingsContentCard,
} from '@/features/dashboard/components/settings/layout';
import type {
  LeaveType,
  StaffLeave,
} from '@/features/dashboard/components/settings/types/team.types';
import type { TeamController } from '@/features/dashboard/hooks/settings/useTeamController';
import { cn } from '@/shared/lib/cn';

const LEAVE_LABELS: Record<LeaveType, string> = {
  LEAVE: 'Cuti',
  SICK: 'Sakit',
  HOLIDAY: 'Libur Nasional',
  UNAVAILABLE: 'Tidak Tersedia',
};

const LEAVE_BADGE_VARIANT: Record<LeaveType, 'default' | 'info' | 'warning' | 'danger'> = {
  LEAVE: 'info',
  SICK: 'warning',
  HOLIDAY: 'default',
  UNAVAILABLE: 'danger',
};

const LEAVE_TYPES: LeaveType[] = ['LEAVE', 'SICK', 'HOLIDAY', 'UNAVAILABLE'];

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

  const staffLeaves = ctrl.domain.leaves.filter((l) => l.staffId === selectedStaffId);

  function openAdd() {
    setForm({ staffId: selectedStaffId, type: 'LEAVE', date: '', note: '' });
    setShowForm(true);
  }

  function handleSave() {
    if (!form.date) return;
    ctrl.addLeave(form);
    setShowForm(false);
  }

  function handleStaffChange(staffId: string) {
    setSelectedStaffId(staffId);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-s16">
      <SettingsSectionHeader
        title="Cuti & Hari Tidak Tersedia"
        description="Catat hari cuti, sakit, dan ketidakhadiran staff."
      />
      {/* Staff selector */}
      <div className="flex flex-wrap gap-s8">
        {activeStaff.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => handleStaffChange(s.id)}
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

      {/* Leave list */}
      <div className="flex flex-col gap-s8">
        {staffLeaves.length === 0 && !showForm && (
          <SettingsEmptyState
            icon={<CalendarX size={24} weight="duotone" />}
            title="Belum ada catatan"
            description="Tambahkan hari cuti atau ketidakhadiran staff ini."
          />
        )}

        {staffLeaves.map((leave) => (
          <SettingsListCard
            key={leave.id}
            title={leave.date}
            description={leave.note || undefined}
            badges={[{ label: LEAVE_LABELS[leave.type], variant: LEAVE_BADGE_VARIANT[leave.type] }]}
            actions={
              <button
                type="button"
                onClick={() => ctrl.removeLeave(leave.id)}
                className="text-ts-cap1 font-medium text-ac-danger hover:opacity-80"
              >
                Hapus
              </button>
            }
          />
        ))}

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
                <select
                  id="leave-type"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LeaveType }))}
                  className="w-full rounded-r10 border border-bd-card bg-bg-input px-s12 py-s8 text-ts-fn text-tx-primary focus:outline-none focus:ring-2 focus:ring-tx-primary/20"
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {LEAVE_LABELS[t]}
                    </option>
                  ))}
                </select>
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
                className="rounded-r8 px-s16 py-s8 text-ts-fn font-medium text-tx-secondary hover:text-tx-primary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!form.date}
                className="rounded-r8 bg-tx-primary px-s16 py-s8 text-ts-fn font-medium text-white disabled:opacity-40"
              >
                Simpan
              </button>
            </div>
          </SettingsContentCard>
        )}

        {!showForm && <SettingsAddButton onClick={openAdd}>Tambah Catatan</SettingsAddButton>}
      </div>
    </div>
  );
}
