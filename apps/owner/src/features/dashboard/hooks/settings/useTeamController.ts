'use client';

import { useCallback, useState } from 'react';
import type {
  LeaveType,
  ServiceAssignment,
  StaffLeave,
  StaffMember,
  StaffRole,
  StaffSpecialty,
  WeeklySchedule,
} from '@/features/dashboard/components/settings/types/team.types';
import { trpc } from '@/lib/trpc';

// ── Section interfaces ────────────────────────────────────────────────────────

export interface StaffSection {
  data: StaffMember[];
  isLoading: boolean;
  isSaving: boolean;
  add: (draft: Omit<StaffMember, 'id'>) => void;
  update: (id: string, patch: Partial<Omit<StaffMember, 'id'>>) => void;
  deactivate: (id: string) => void;
  remove: (id: string) => void;
}

export interface AssignmentsSection {
  data: ServiceAssignment[];
  isLoading: boolean;
  isSaving: boolean;
  set: (staffId: string, serviceIds: string[]) => void;
}

export interface SchedulesSection {
  data: WeeklySchedule[];
  isLoading: boolean;
  isSaving: boolean;
  saveForStaff: (staffId: string, schedule: WeeklySchedule) => void;
}

export interface LeavesSection {
  data: StaffLeave[];
  isLoading: boolean;
  isSaving: boolean;
  selectedStaffId: string | null;
  selectStaff: (id: string | null) => void;
  add: (draft: Omit<StaffLeave, 'id'>) => void;
  remove: (id: string) => void;
}

// ── Public interface ──────────────────────────────────────────────────────────

export interface TeamController {
  staff: StaffSection;
  assignments: AssignmentsSection;
  schedules: SchedulesSection;
  leaves: LeavesSection;
}

// ── Placeholder data ──────────────────────────────────────────────────────────

const EMPTY_DOMAIN = {
  staff: [] as StaffMember[],
  assignments: [] as ServiceAssignment[],
  schedules: [] as WeeklySchedule[],
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTeamController(): TeamController {
  const utils = trpc.useUtils();

  // ── Selected staff for leaves query ──────────────────────────────────────
  const [leavesStaffId, setLeavesStaffId] = useState<string | null>(null);

  // ── Domain query (staff + assignments + schedules) ────────────────────────
  const { data: domainFromDb, isLoading: isDomainLoading } =
    trpc.settings.team.getTeamDomain.useQuery(undefined, {
      staleTime: 30_000,
      placeholderData: EMPTY_DOMAIN,
    });

  // ── Leaves query (parameterized, lazy) ───────────────────────────────────
  const { data: leavesFromDb, isLoading: isLeavesLoading } =
    trpc.settings.team.getStaffLeaves.useQuery(
      { staffId: leavesStaffId! },
      {
        enabled: !!leavesStaffId,
        staleTime: 30_000,
        placeholderData: [] as StaffLeave[],
      }
    );

  // ── Invalidation helpers ──────────────────────────────────────────────────

  const invalidateDomain = useCallback(() => {
    void utils.settings.team.getTeamDomain.invalidate();
  }, [utils]);

  const invalidateLeaves = useCallback(() => {
    if (leavesStaffId) {
      void utils.settings.team.getStaffLeaves.invalidate({ staffId: leavesStaffId });
    }
  }, [utils, leavesStaffId]);

  // ── Staff mutations ───────────────────────────────────────────────────────

  const { mutateAsync: createStaffMutation, isLoading: isCreatingStaff } =
    trpc.settings.team.createStaff.useMutation({ onSuccess: invalidateDomain });

  const { mutateAsync: updateStaffMutation, isLoading: isUpdatingStaff } =
    trpc.settings.team.updateStaff.useMutation({ onSuccess: invalidateDomain });

  const { mutateAsync: deactivateStaffMutation, isLoading: isDeactivatingStaff } =
    trpc.settings.team.deactivateStaff.useMutation({ onSuccess: invalidateDomain });

  const { mutateAsync: deleteStaffMutation, isLoading: isDeletingStaff } =
    trpc.settings.team.deleteStaff.useMutation({
      onSuccess: (_data, variables) => {
        // Clear leaves selection if the deleted staff was selected
        if (leavesStaffId === variables.id) {
          setLeavesStaffId(null);
        }
        invalidateDomain();
      },
    });

  // ── Assignment mutation ───────────────────────────────────────────────────

  const { mutateAsync: setAssignmentMutation, isLoading: isSavingAssignment } =
    trpc.settings.team.setAssignment.useMutation({ onSuccess: invalidateDomain });

  // ── Schedule mutation ─────────────────────────────────────────────────────

  const { mutateAsync: saveScheduleMutation, isLoading: isSavingSchedule } =
    trpc.settings.team.saveScheduleForStaff.useMutation({ onSuccess: invalidateDomain });

  // ── Leave mutations ───────────────────────────────────────────────────────

  const { mutateAsync: createLeaveMutation, isLoading: isCreatingLeave } =
    trpc.settings.team.createLeave.useMutation({ onSuccess: invalidateLeaves });

  const { mutateAsync: deleteLeaveMutation, isLoading: isDeletingLeave } =
    trpc.settings.team.deleteLeave.useMutation({ onSuccess: invalidateLeaves });

  // ── Staff actions ─────────────────────────────────────────────────────────

  const addStaff = useCallback(
    (draft: Omit<StaffMember, 'id'>) => {
      void createStaffMutation({
        fullName: draft.fullName,
        phone: draft.phone,
        role: draft.role as StaffRole,
        specialty: draft.specialty as StaffSpecialty | null,
        avatarUrl: draft.avatarUrl,
        avatarColor: draft.avatarColor,
        isActive: draft.isActive,
      });
    },
    [createStaffMutation]
  );

  const updateStaff = useCallback(
    (id: string, patch: Partial<Omit<StaffMember, 'id'>>) => {
      void updateStaffMutation({ id, patch });
    },
    [updateStaffMutation]
  );

  const deactivateStaff = useCallback(
    (id: string) => {
      void deactivateStaffMutation({ id });
    },
    [deactivateStaffMutation]
  );

  const removeStaff = useCallback(
    (id: string) => {
      void deleteStaffMutation({ id });
    },
    [deleteStaffMutation]
  );

  // ── Assignment action ─────────────────────────────────────────────────────

  const setAssignment = useCallback(
    (staffId: string, serviceIds: string[]) => {
      void setAssignmentMutation({ staffId, serviceIds });
    },
    [setAssignmentMutation]
  );

  // ── Schedule action ───────────────────────────────────────────────────────

  const saveScheduleForStaff = useCallback(
    (staffId: string, schedule: WeeklySchedule) => {
      void saveScheduleMutation({ staffId, days: schedule.days });
    },
    [saveScheduleMutation]
  );

  // ── Leave actions ─────────────────────────────────────────────────────────

  const addLeave = useCallback(
    (draft: Omit<StaffLeave, 'id'>) => {
      void createLeaveMutation({
        staffId: draft.staffId,
        type: draft.type as LeaveType,
        date: draft.date,
        note: draft.note,
      });
    },
    [createLeaveMutation]
  );

  const removeLeave = useCallback(
    (id: string) => {
      void deleteLeaveMutation({ id });
    },
    [deleteLeaveMutation]
  );

  // ── Assemble ──────────────────────────────────────────────────────────────

  return {
    staff: {
      data: domainFromDb?.staff ?? EMPTY_DOMAIN.staff,
      isLoading: isDomainLoading,
      isSaving: isCreatingStaff || isUpdatingStaff || isDeactivatingStaff || isDeletingStaff,
      add: addStaff,
      update: updateStaff,
      deactivate: deactivateStaff,
      remove: removeStaff,
    },
    assignments: {
      data: domainFromDb?.assignments ?? EMPTY_DOMAIN.assignments,
      isLoading: isDomainLoading,
      isSaving: isSavingAssignment,
      set: setAssignment,
    },
    schedules: {
      data: domainFromDb?.schedules ?? EMPTY_DOMAIN.schedules,
      isLoading: isDomainLoading,
      isSaving: isSavingSchedule,
      saveForStaff: saveScheduleForStaff,
    },
    leaves: {
      data: leavesFromDb ?? [],
      isLoading: isLeavesLoading,
      isSaving: isCreatingLeave || isDeletingLeave,
      selectedStaffId: leavesStaffId,
      selectStaff: setLeavesStaffId,
      add: addLeave,
      remove: removeLeave,
    },
  };
}
