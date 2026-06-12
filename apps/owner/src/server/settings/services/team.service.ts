import { ServiceError } from '../lib/errors';
import * as teamRepo from '../repositories/team.repository';
import type {
  CreateLeaveData,
  CreateStaffData,
  TeamDomainData,
  UpdateStaffPatch,
} from '../repositories/team.repository';
import type {
  LeaveType,
  StaffLeave,
  StaffMember,
  StaffRole,
  StaffSpecialty,
  WeeklySchedule,
} from '@/features/dashboard/components/settings/types/team.types';

// ── Re-exports for router ─────────────────────────────────────────────────────

export type { TeamDomainData, UpdateStaffPatch, CreateLeaveData };

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getTeamDomain(salonId: string): Promise<TeamDomainData> {
  return teamRepo.getTeamDomain(salonId);
}

export async function getStaffLeaves(salonId: string, staffId: string): Promise<StaffLeave[]> {
  return teamRepo.getStaffLeaves(salonId, staffId);
}

// ── Staff mutations ───────────────────────────────────────────────────────────

export interface CreateStaffInput {
  fullName: string;
  phone: string;
  role: StaffRole;
  specialty: StaffSpecialty | null;
  avatarUrl: string | null;
  avatarColor: string;
  isActive: boolean;
}

export async function createStaff(salonId: string, input: CreateStaffInput): Promise<StaffMember> {
  if (!input.fullName.trim()) {
    throw new ServiceError('Nama staff tidak boleh kosong.', 'STAFF_NAME_EMPTY', 'fullName');
  }

  const data: CreateStaffData = {
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    role: input.role,
    specialty: input.specialty,
    avatarUrl: input.avatarUrl,
    avatarColor: input.avatarColor,
    isActive: input.isActive,
  };

  return teamRepo.createStaff(salonId, data);
}

export async function updateStaff(
  salonId: string,
  id: string,
  patch: UpdateStaffPatch
): Promise<void> {
  if (patch.fullName !== undefined && !patch.fullName.trim()) {
    throw new ServiceError('Nama staff tidak boleh kosong.', 'STAFF_NAME_EMPTY', 'fullName');
  }

  const cleanPatch: UpdateStaffPatch = { ...patch };
  if (cleanPatch.fullName !== undefined) cleanPatch.fullName = cleanPatch.fullName.trim();
  if (cleanPatch.phone !== undefined) cleanPatch.phone = cleanPatch.phone.trim();

  return teamRepo.updateStaff(salonId, id, cleanPatch);
}

export async function deactivateStaff(salonId: string, id: string): Promise<void> {
  return teamRepo.deactivateStaff(salonId, id);
}

export async function deleteStaff(salonId: string, id: string): Promise<void> {
  return teamRepo.deleteStaff(salonId, id);
}

// ── Assignment mutations ──────────────────────────────────────────────────────

export async function setAssignment(
  salonId: string,
  staffId: string,
  serviceIds: string[]
): Promise<void> {
  // Deduplicate serviceIds before writing
  const unique = [...new Set(serviceIds)];
  return teamRepo.setAssignment(salonId, staffId, unique);
}

// ── Schedule mutations ────────────────────────────────────────────────────────

export async function saveScheduleForStaff(
  salonId: string,
  staffId: string,
  schedule: WeeklySchedule
): Promise<void> {
  if (schedule.days.length !== 7) {
    throw new ServiceError('Jadwal harus memuat tepat 7 hari.', 'SCHEDULE_INVALID_DAYS');
  }

  for (const day of schedule.days) {
    if (!day.enabled) continue;
    const startMins = timeToMinutes(day.startTime);
    const endMins = timeToMinutes(day.endTime);
    if (endMins <= startMins) {
      throw new ServiceError(
        `Jam selesai harus setelah jam mulai (${day.day}).`,
        'SCHEDULE_INVALID_TIME'
      );
    }
  }

  return teamRepo.saveScheduleForStaff(salonId, staffId, schedule);
}

function timeToMinutes(time: string): number {
  const parts = time.split(':');
  return parseInt(parts[0] ?? '0', 10) * 60 + parseInt(parts[1] ?? '0', 10);
}

// ── Leave mutations ───────────────────────────────────────────────────────────

export interface CreateLeaveInput {
  staffId: string;
  type: LeaveType;
  date: string;
  note: string;
}

export async function createLeave(salonId: string, input: CreateLeaveInput): Promise<StaffLeave> {
  if (!input.date) {
    throw new ServiceError('Tanggal ketidakhadiran wajib diisi.', 'LEAVE_DATE_EMPTY', 'date');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new ServiceError(
      'Format tanggal tidak valid (harus YYYY-MM-DD).',
      'LEAVE_DATE_FORMAT',
      'date'
    );
  }

  const data: CreateLeaveData = {
    staffId: input.staffId,
    type: input.type,
    date: input.date,
    note: input.note.trim(),
  };

  return teamRepo.createLeave(salonId, data);
}

export async function deleteLeave(salonId: string, id: string): Promise<void> {
  return teamRepo.deleteLeave(salonId, id);
}
