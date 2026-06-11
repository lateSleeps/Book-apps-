'use client';

import { useState, useCallback } from 'react';
import type { BaseSettingsController } from './types/BaseSettingsController';
import type {
  StaffMember,
  WeeklySchedule,
  StaffLeave,
  TeamDomain,
  WeekDay,
} from '@/features/dashboard/components/settings/types/team.types';

// ── Mock seed data ────────────────────────────────────────────────────────────

const ALL_DAYS: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function defaultSchedule(staffId: string): WeeklySchedule {
  return {
    staffId,
    days: ALL_DAYS.map((day) => ({
      day,
      enabled: !['SUN'].includes(day),
      startTime: '09:00',
      endTime: '18:00',
    })),
  };
}

const MOCK_STAFF: StaffMember[] = [
  {
    id: 'sty-1',
    fullName: 'Dewi Rahayu',
    phone: '081234567890',
    role: 'COLORIST',
    specialty: 'COLORIST',
    avatarUrl: null,
    avatarColor: '#ddedf8',
    isActive: true,
  },
  {
    id: 'sty-2',
    fullName: 'Sinta Wulandari',
    phone: '081298765432',
    role: 'THERAPIST',
    specialty: 'THERAPIST',
    avatarUrl: null,
    avatarColor: '#d8f3ec',
    isActive: true,
  },
  {
    id: 'sty-3',
    fullName: 'Rina Kusuma',
    phone: '081311223344',
    role: 'STYLIST',
    specialty: 'HAIR_STYLIST',
    avatarUrl: null,
    avatarColor: '#fde8dc',
    isActive: true,
  },
  {
    id: 'sty-4',
    fullName: 'Andi Pratama',
    phone: '081355667788',
    role: 'STYLIST',
    specialty: 'HAIR_STYLIST',
    avatarUrl: null,
    avatarColor: '#e8e2f8',
    isActive: true,
  },
];

const MOCK_DOMAIN: TeamDomain = {
  staff: MOCK_STAFF,
  assignments: [
    { staffId: 'sty-1', serviceIds: ['svc-10', 'svc-13'] },
    { staffId: 'sty-2', serviceIds: ['svc-1', 'svc-2'] },
    { staffId: 'sty-3', serviceIds: ['svc-1', 'svc-2'] },
    { staffId: 'sty-4', serviceIds: ['svc-1', 'svc-2'] },
  ],
  schedules: MOCK_STAFF.map((s) => defaultSchedule(s.id)),
  leaves: [
    {
      id: 'lv-1',
      staffId: 'sty-1',
      type: 'LEAVE',
      date: '2026-06-20',
      note: 'Cuti tahunan',
    },
  ],
};

// ── Controller interface ──────────────────────────────────────────────────────

export interface TeamController extends BaseSettingsController {
  domain: TeamDomain;

  // Staff
  addStaff: (draft: Omit<StaffMember, 'id'>) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  deactivateStaff: (id: string) => void;
  deleteStaff: (id: string) => void;

  // Assignments
  setAssignment: (staffId: string, serviceIds: string[]) => void;

  // Schedule
  updateDaySchedule: (
    staffId: string,
    day: WeekDay,
    patch: Partial<{ enabled: boolean; startTime: string; endTime: string }>
  ) => void;

  // Leave
  addLeave: (draft: Omit<StaffLeave, 'id'>) => void;
  removeLeave: (id: string) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTeamController(): TeamController {
  const [domain, setDomain] = useState<TeamDomain>(MOCK_DOMAIN);
  const [savedDomain, setSavedDomain] = useState<TeamDomain>(MOCK_DOMAIN);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function nextId(prefix: string) {
    return `${prefix}-${Date.now()}`;
  }

  function setDirtyDomain(updater: (d: TeamDomain) => TeamDomain) {
    setDomain(updater);
    setIsDirty(true);
  }

  const handleSave = useCallback(() => {
    setIsSaving(true);
    // TODO: replace with tRPC mutation
    setTimeout(() => {
      setSavedDomain(domain);
      setIsDirty(false);
      setIsSaving(false);
    }, 600);
  }, [domain]);

  const handleReset = useCallback(() => {
    setDomain(savedDomain);
    setIsDirty(false);
  }, [savedDomain]);

  const addStaff = useCallback((draft: Omit<StaffMember, 'id'>) => {
    const id = nextId('sty');
    setDirtyDomain((d) => ({
      ...d,
      staff: [...d.staff, { ...draft, id }],
      assignments: [...d.assignments, { staffId: id, serviceIds: [] }],
      schedules: [...d.schedules, defaultSchedule(id)],
    }));
  }, []);

  const updateStaff = useCallback((id: string, patch: Partial<StaffMember>) => {
    setDirtyDomain((d) => ({
      ...d,
      staff: d.staff.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const deactivateStaff = useCallback((id: string) => {
    setDirtyDomain((d) => ({
      ...d,
      staff: d.staff.map((s) => (s.id === id ? { ...s, isActive: false } : s)),
    }));
  }, []);

  const deleteStaff = useCallback((id: string) => {
    setDirtyDomain((d) => ({
      ...d,
      staff: d.staff.filter((s) => s.id !== id),
      assignments: d.assignments.filter((a) => a.staffId !== id),
      schedules: d.schedules.filter((sch) => sch.staffId !== id),
      leaves: d.leaves.filter((l) => l.staffId !== id),
    }));
  }, []);

  const setAssignment = useCallback((staffId: string, serviceIds: string[]) => {
    setDirtyDomain((d) => ({
      ...d,
      assignments: d.assignments.map((a) => (a.staffId === staffId ? { ...a, serviceIds } : a)),
    }));
  }, []);

  const updateDaySchedule = useCallback(
    (
      staffId: string,
      day: WeekDay,
      patch: Partial<{ enabled: boolean; startTime: string; endTime: string }>
    ) => {
      setDirtyDomain((d) => ({
        ...d,
        schedules: d.schedules.map((sch) =>
          sch.staffId !== staffId
            ? sch
            : {
                ...sch,
                days: sch.days.map((dd) => (dd.day === day ? { ...dd, ...patch } : dd)),
              }
        ),
      }));
    },
    []
  );

  const addLeave = useCallback((draft: Omit<StaffLeave, 'id'>) => {
    setDirtyDomain((d) => ({
      ...d,
      leaves: [...d.leaves, { ...draft, id: nextId('lv') }],
    }));
  }, []);

  const removeLeave = useCallback((id: string) => {
    setDirtyDomain((d) => ({ ...d, leaves: d.leaves.filter((l) => l.id !== id) }));
  }, []);

  return {
    isDirty,
    isSaving,
    handleSave,
    handleReset,
    domain,
    addStaff,
    updateStaff,
    deactivateStaff,
    deleteStaff,
    setAssignment,
    updateDaySchedule,
    addLeave,
    removeLeave,
  };
}
