import { db } from '../../db';
import { handleDbError } from '../lib/errors';
import type {
  DaySchedule,
  LeaveType,
  ServiceAssignment,
  StaffLeave,
  StaffMember,
  StaffRole,
  StaffSpecialty,
  WeekDay,
  WeeklySchedule,
} from '@/features/dashboard/components/settings/types/team.types';

// ── DB row shapes ─────────────────────────────────────────────────────────────

interface StaffMemberRow {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  specialty: string | null;
  avatar_url: string | null;
  avatar_color: string;
  is_active: boolean;
  sort_order: number;
}

interface AssignmentRow {
  staff_id: string;
  service_ids: string[];
}

interface ScheduleRow {
  staff_id: string;
  day: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
}

interface LeaveRow {
  id: string;
  staff_id: string;
  type: string;
  date: string;
  note: string;
}

// ── Column constants ──────────────────────────────────────────────────────────

const STAFF_COLUMNS =
  'id, full_name, phone, role, specialty, avatar_url, avatar_color, is_active, sort_order';
const ASSIGNMENT_COLUMNS = 'staff_id, service_ids';
const SCHEDULE_COLUMNS = 'staff_id, day, enabled, start_time, end_time';
const LEAVE_COLUMNS = 'id, staff_id, type, date, note';

// ── Default schedule for new staff ───────────────────────────────────────────

const DEFAULT_DAYS: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function defaultScheduleRows(salonId: string, staffId: string) {
  return DEFAULT_DAYS.map((day) => ({
    salon_id: salonId,
    staff_id: staffId,
    day,
    enabled: day !== 'SUN',
    start_time: '09:00',
    end_time: '18:00',
  }));
}

// ── Row mappers ───────────────────────────────────────────────────────────────

function rowToStaff(row: StaffMemberRow): StaffMember {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    role: row.role as StaffRole,
    specialty: (row.specialty as StaffSpecialty | null) ?? null,
    avatarUrl: row.avatar_url,
    avatarColor: row.avatar_color,
    isActive: row.is_active,
  };
}

function rowsToSchedules(rows: ScheduleRow[]): WeeklySchedule[] {
  // Group 7 per-day rows by staff_id
  const map = new Map<string, DaySchedule[]>();
  for (const row of rows) {
    const days = map.get(row.staff_id) ?? [];
    days.push({
      day: row.day as WeekDay,
      enabled: row.enabled,
      startTime: row.start_time,
      endTime: row.end_time,
    });
    map.set(row.staff_id, days);
  }
  return Array.from(map.entries()).map(([staffId, days]) => ({ staffId, days }));
}

function rowToLeave(row: LeaveRow): StaffLeave {
  return {
    id: row.id,
    staffId: row.staff_id,
    type: row.type as LeaveType,
    // Postgres DATE returns 'YYYY-MM-DD' string
    date: typeof row.date === 'string' ? row.date.slice(0, 10) : String(row.date),
    note: row.note,
  };
}

// ── Domain query ──────────────────────────────────────────────────────────────

export interface TeamDomainData {
  staff: StaffMember[];
  assignments: ServiceAssignment[];
  schedules: WeeklySchedule[];
}

/**
 * Fetches staff, assignments, and schedules in one call via Promise.all.
 * Does NOT include leaves — leaves are loaded separately via getStaffLeaves.
 */
export async function getTeamDomain(salonId: string): Promise<TeamDomainData> {
  const [staffResult, assignmentResult, scheduleResult] = await Promise.all([
    db
      .from('staff_members')
      .select(STAFF_COLUMNS)
      .eq('salon_id', salonId)
      .order('sort_order', { ascending: true }),
    db.from('staff_service_assignments').select(ASSIGNMENT_COLUMNS).eq('salon_id', salonId),
    db.from('staff_schedules').select(SCHEDULE_COLUMNS).eq('salon_id', salonId),
  ]);

  if (staffResult.error) throw handleDbError(staffResult.error);
  if (assignmentResult.error) throw handleDbError(assignmentResult.error);
  if (scheduleResult.error) throw handleDbError(scheduleResult.error);

  const staffRows = (staffResult.data as unknown as StaffMemberRow[]) ?? [];
  const assignmentRows = (assignmentResult.data as unknown as AssignmentRow[]) ?? [];
  const scheduleRows = (scheduleResult.data as unknown as ScheduleRow[]) ?? [];

  return {
    staff: staffRows.map(rowToStaff),
    assignments: assignmentRows.map((r) => ({ staffId: r.staff_id, serviceIds: r.service_ids })),
    schedules: rowsToSchedules(scheduleRows),
  };
}

/**
 * Fetches leave records for a single staff member.
 * Called separately (not in getTeamDomain) because leave history is unbounded.
 */
export async function getStaffLeaves(salonId: string, staffId: string): Promise<StaffLeave[]> {
  const { data, error } = await db
    .from('staff_leaves')
    .select(LEAVE_COLUMNS)
    .eq('salon_id', salonId)
    .eq('staff_id', staffId)
    .order('date', { ascending: false });

  if (error) throw handleDbError(error);
  return ((data as unknown as LeaveRow[]) ?? []).map(rowToLeave);
}

// ── Staff mutations ───────────────────────────────────────────────────────────

export interface CreateStaffData {
  fullName: string;
  phone: string;
  role: StaffRole;
  specialty: StaffSpecialty | null;
  avatarUrl: string | null;
  avatarColor: string;
  isActive: boolean;
}

/**
 * Creates a staff member + empty assignment row + default schedule (7 rows).
 * Three sequential Supabase calls — not a DB transaction. If calls 2 or 3 fail,
 * the staff row still exists and can be recovered. Documented known limitation.
 */
export async function createStaff(salonId: string, data: CreateStaffData): Promise<StaffMember> {
  const { data: staffData, error: staffError } = await db
    .from('staff_members')
    .insert({
      salon_id: salonId,
      full_name: data.fullName,
      phone: data.phone,
      role: data.role,
      specialty: data.specialty,
      avatar_url: data.avatarUrl,
      avatar_color: data.avatarColor,
      is_active: data.isActive,
    })
    .select(STAFF_COLUMNS)
    .single();

  if (staffError) throw handleDbError(staffError);

  const row = staffData as unknown as StaffMemberRow;
  const newId = row.id;

  // Seed empty assignment row
  const { error: assignError } = await db.from('staff_service_assignments').insert({
    salon_id: salonId,
    staff_id: newId,
    service_ids: [],
  });
  if (assignError) throw handleDbError(assignError);

  // Seed default schedule (7 rows)
  const { error: schedError } = await db
    .from('staff_schedules')
    .insert(defaultScheduleRows(salonId, newId));
  if (schedError) throw handleDbError(schedError);

  return rowToStaff(row);
}

export interface UpdateStaffPatch {
  fullName?: string;
  phone?: string;
  role?: StaffRole;
  specialty?: StaffSpecialty | null;
  avatarUrl?: string | null;
  avatarColor?: string;
  isActive?: boolean;
}

export async function updateStaff(
  salonId: string,
  id: string,
  patch: UpdateStaffPatch
): Promise<void> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.fullName !== undefined) update.full_name = patch.fullName;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.role !== undefined) update.role = patch.role;
  if (Object.prototype.hasOwnProperty.call(patch, 'specialty')) update.specialty = patch.specialty;
  if (Object.prototype.hasOwnProperty.call(patch, 'avatarUrl')) update.avatar_url = patch.avatarUrl;
  if (patch.avatarColor !== undefined) update.avatar_color = patch.avatarColor;
  if (patch.isActive !== undefined) update.is_active = patch.isActive;

  const { error } = await db
    .from('staff_members')
    .update(update)
    .eq('id', id)
    .eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}

export async function deactivateStaff(salonId: string, id: string): Promise<void> {
  const { error } = await db
    .from('staff_members')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}

/**
 * Hard delete. DB CASCADE removes linked assignments, schedules, and leaves.
 */
export async function deleteStaff(salonId: string, id: string): Promise<void> {
  const { error } = await db.from('staff_members').delete().eq('id', id).eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}

// ── Assignment mutations ──────────────────────────────────────────────────────

/**
 * Replaces the full serviceIds array for a staff member.
 * Uses UPSERT on the UNIQUE(staff_id) constraint.
 */
export async function setAssignment(
  salonId: string,
  staffId: string,
  serviceIds: string[]
): Promise<void> {
  const { error } = await db.from('staff_service_assignments').upsert(
    {
      salon_id: salonId,
      staff_id: staffId,
      service_ids: serviceIds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'staff_id' }
  );

  if (error) throw handleDbError(error);
}

// ── Schedule mutations ────────────────────────────────────────────────────────

/**
 * Saves an entire staff member's weekly schedule (7 day rows) via UPSERT.
 * ON CONFLICT (staff_id, day) DO UPDATE — requires UNIQUE(staff_id, day) constraint.
 */
export async function saveScheduleForStaff(
  salonId: string,
  staffId: string,
  schedule: WeeklySchedule
): Promise<void> {
  const rows = schedule.days.map((d) => ({
    salon_id: salonId,
    staff_id: staffId,
    day: d.day,
    enabled: d.enabled,
    start_time: d.startTime,
    end_time: d.endTime,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await db.from('staff_schedules').upsert(rows, { onConflict: 'staff_id,day' });

  if (error) throw handleDbError(error);
}

// ── Leave mutations ───────────────────────────────────────────────────────────

export interface CreateLeaveData {
  staffId: string;
  type: LeaveType;
  date: string;
  note: string;
}

export async function createLeave(salonId: string, data: CreateLeaveData): Promise<StaffLeave> {
  const { data: leaveData, error } = await db
    .from('staff_leaves')
    .insert({
      salon_id: salonId,
      staff_id: data.staffId,
      type: data.type,
      date: data.date,
      note: data.note,
    })
    .select(LEAVE_COLUMNS)
    .single();

  if (error) throw handleDbError(error);
  return rowToLeave(leaveData as unknown as LeaveRow);
}

export async function deleteLeave(salonId: string, id: string): Promise<void> {
  const { error } = await db.from('staff_leaves').delete().eq('id', id).eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}
