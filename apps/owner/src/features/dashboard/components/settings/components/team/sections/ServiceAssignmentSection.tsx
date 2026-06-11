'use client';

/**
 * @responsibility
 * Staff-first service assignment.
 *
 * Layout (top to bottom):
 *   1. Section header
 *   2. Staff selector (SettingsSelect — "Name — Role")
 *   3. Staff summary card (avatar + name + metrics)
 *   4. Search field
 *   5. Category accordions (collapsed by default, "N/M" count, Pilih/Hapus Semua)
 *      └── Service rows (checkbox + name + duration + Specialist badge)
 *
 * Dirty state is owned by useTeamController → SettingsActionBar handles save.
 * No auto-save. No local save button.
 */

import { CaretDown, MagnifyingGlass, Scissors, Users } from '@phosphor-icons/react';
import { useState } from 'react';
import {
  SettingsAddButton,
  SettingsEmptyState,
  SettingsSelect,
} from '@/features/dashboard/components/settings/components/shared';
import { SettingsSectionHeader } from '@/features/dashboard/components/settings/layout';
import type {
  ServiceCategory,
  ServiceItem,
} from '@/features/dashboard/components/settings/types/services.types';
import type {
  StaffMember,
  StaffRole,
} from '@/features/dashboard/components/settings/types/team.types';
import type { TeamController } from '@/features/dashboard/hooks/settings/useTeamController';
import { avatarColor, getInitials } from '@/shared/lib/avatar';
import { cn } from '@/shared/lib/cn';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} mnt`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}j ${m}m` : `${h} jam`;
}

const ROLE_LABEL: Record<StaffRole, string> = {
  OWNER: 'Owner',
  STYLIST: 'Stylist',
  COLORIST: 'Colorist',
  NAIL_ARTIST: 'Nail Artist',
  THERAPIST: 'Therapist',
  RECEPTIONIST: 'Receptionist',
};

// ── Metric chip ───────────────────────────────────────────────────────────────

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-s2">
      <span className="text-ts-t3 font-bold text-tx-primary">{value}</span>
      <span className="text-ts-cap2 text-tx-subtle">{label}</span>
    </div>
  );
}

// ── Staff summary card ────────────────────────────────────────────────────────

interface SummaryCardProps {
  member: StaffMember;
  assignedCount: number;
  categoryCount: number;
}

function StaffSummaryCard({ member, assignedCount, categoryCount }: SummaryCardProps) {
  const { bg } = avatarColor(member.fullName);
  const initials = getInitials(member.fullName);
  const isTwoChar = initials.length > 1;

  return (
    <div className="flex items-center gap-s16 rounded-r12 border border-bd-card bg-bg-card px-s16 py-s12 shadow-card">
      {/* Avatar */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-r10 font-semibold text-tx-primary',
          isTwoChar ? 'text-ts-fn' : 'text-ts-body'
        )}
        style={{ background: bg }}
      >
        {initials}
      </div>

      {/* Name + role + status */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-ts-fn font-semibold text-tx-primary">{member.fullName}</p>
        <div className="mt-s2 flex items-center gap-s8">
          <span className="text-ts-cap1 text-tx-secondary">{ROLE_LABEL[member.role]}</span>
          <span
            className={cn(
              'inline-flex items-center rounded-rF px-s8 py-0.5 text-ts-cap2 font-medium',
              member.isActive
                ? 'bg-st-in-progress-bg text-st-in-progress'
                : 'bg-bg-control text-tx-subtle'
            )}
          >
            {member.isActive ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex shrink-0 items-center gap-s24">
        <Metric label="Layanan" value={assignedCount} />
        <div className="h-6 w-px bg-bd-card" />
        <Metric label="Kategori" value={categoryCount} />
      </div>
    </div>
  );
}

// ── Category accordion ────────────────────────────────────────────────────────

interface CategoryAccordionProps {
  category: ServiceCategory;
  services: ServiceItem[];
  assignedIds: Set<string>;
  onToggle: (serviceId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

function CategoryAccordion({
  category,
  services,
  assignedIds,
  onToggle,
  onSelectAll,
  onClearAll,
}: CategoryAccordionProps) {
  const [open, setOpen] = useState(false);

  const assignedCount = services.filter((s) => assignedIds.has(s.id)).length;
  const total = services.length;

  return (
    <div className="overflow-hidden rounded-r12 border border-bd-card bg-bg-card shadow-card">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-s12 px-s16 py-s12 transition-colors hover:bg-bg-hover"
      >
        {/* Name + count */}
        <span className="flex-1 text-left text-ts-fn font-semibold text-tx-primary">
          {category.name}
          <span className="ml-s8 text-ts-cap1 font-normal text-tx-subtle">
            ({assignedCount}/{total})
          </span>
        </span>

        {/* Pilih / Hapus Semua */}
        <div
          className="flex items-center gap-s8"
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          <button
            type="button"
            onClick={onSelectAll}
            className="text-ts-cap1 font-medium text-ac-primary transition-colors hover:underline"
          >
            Pilih Semua
          </button>
          <span className="text-ts-cap1 text-bd-card">·</span>
          <button
            type="button"
            onClick={onClearAll}
            className="text-ts-cap1 font-medium text-tx-secondary transition-colors hover:text-tx-primary hover:underline"
          >
            Hapus Semua
          </button>
        </div>

        {/* Chevron */}
        <CaretDown
          size={14}
          weight="bold"
          className={cn(
            'shrink-0 text-tx-muted transition-transform duration-200',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      {/* Service rows */}
      {open && (
        <div className="border-t border-bd-row">
          {services.map((svc) => {
            const checked = assignedIds.has(svc.id);
            return (
              <label
                key={svc.id}
                className="py-s10 flex cursor-pointer items-center gap-s12 border-b border-bd-row px-s16 transition-colors last:border-b-0 hover:bg-bg-hover"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(svc.id)}
                  className="h-4 w-4 shrink-0 rounded accent-tx-primary"
                />
                <span className="flex-1 text-ts-fn text-tx-primary">{svc.name}</span>
                <span className="shrink-0 text-ts-cap1 text-tx-subtle">
                  {formatDuration(svc.duration)}
                </span>
                {svc.requiresSpecialist && (
                  <span className="shrink-0 rounded-rF bg-st-upcoming-bg px-s8 py-0.5 text-ts-cap2 font-medium text-st-upcoming">
                    Specialist
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface Props {
  ctrl: TeamController;
  services: ServiceItem[];
  categories: ServiceCategory[];
}

export function ServiceAssignmentSection({ ctrl, services, categories }: Props) {
  const activeStaff = ctrl.domain.staff.filter((s) => s.isActive);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(activeStaff[0]?.id ?? '');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Empty: no active staff ────────────────────────────────────────────────

  if (activeStaff.length === 0) {
    return (
      <div className="flex flex-col gap-s16">
        <SettingsSectionHeader
          title="Penugasan Layanan"
          description="Pilih layanan yang dapat dilakukan oleh setiap staff."
        />
        <SettingsEmptyState
          icon={<Users size={24} weight="duotone" />}
          title="Belum ada staff aktif"
          description="Tambahkan staff terlebih dahulu di tab Direktori Staff."
        />
      </div>
    );
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const selectedMember = activeStaff.find((s) => s.id === selectedStaffId) ?? activeStaff[0]!;
  const resolvedStaffId = selectedMember.id;

  const assignment = ctrl.domain.assignments.find((a) => a.staffId === resolvedStaffId);
  const assignedIds = new Set(assignment?.serviceIds ?? []);

  const activeServices = services.filter((s) => s.isActive);
  const activeCategories = categories.filter((c) => c.isActive);

  // Compute summary metrics
  const assignedCount = [...assignedIds].filter((id) =>
    activeServices.some((s) => s.id === id)
  ).length;
  const assignedCategoryIds = new Set(
    activeServices.filter((s) => assignedIds.has(s.id)).map((s) => s.categoryId)
  );
  const categoryCount = assignedCategoryIds.size;

  // Search filter
  const q = searchQuery.trim().toLowerCase();

  // Build category groups with optional search filter applied
  const visibleGroups = activeCategories
    .map((cat) => {
      const catServices = activeServices.filter((s) => s.categoryId === cat.id);
      const filtered = q
        ? catServices.filter((s) => s.name.toLowerCase().includes(q))
        : catServices;
      return { cat, services: filtered };
    })
    .filter((g) => g.services.length > 0);

  // ── Event handlers ────────────────────────────────────────────────────────

  function toggleService(serviceId: string) {
    const next = assignedIds.has(serviceId)
      ? [...assignedIds].filter((id) => id !== serviceId)
      : [...assignedIds, serviceId];
    ctrl.setAssignment(resolvedStaffId, next);
  }

  function selectAll(serviceIds: string[]) {
    const next = [...new Set([...assignedIds, ...serviceIds])];
    ctrl.setAssignment(resolvedStaffId, next);
  }

  function clearAll(serviceIds: string[]) {
    const removeSet = new Set(serviceIds);
    const next = [...assignedIds].filter((id) => !removeSet.has(id));
    ctrl.setAssignment(resolvedStaffId, next);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-s16">
      <SettingsSectionHeader
        title="Penugasan Layanan"
        description="Pilih layanan yang dapat dilakukan oleh setiap staff."
      />

      {/* ── [A] Staff Selector ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-s8">
        <p className="text-ts-fn font-medium text-tx-primary">Pilih Staff</p>
        <SettingsSelect
          value={resolvedStaffId}
          onChange={(e) => {
            setSelectedStaffId(e.target.value);
            setSearchQuery('');
          }}
        >
          {activeStaff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName} — {ROLE_LABEL[s.role]}
            </option>
          ))}
        </SettingsSelect>
      </div>

      {/* ── [B] Staff Summary Card ──────────────────────────────────────── */}
      <StaffSummaryCard
        member={selectedMember}
        assignedCount={assignedCount}
        categoryCount={categoryCount}
      />

      {/* ── [C] Search ──────────────────────────────────────────────────── */}
      <div className="relative">
        <MagnifyingGlass
          size={14}
          weight="duotone"
          className="pointer-events-none absolute left-s12 top-1/2 -translate-y-1/2 text-tx-secondary"
          aria-hidden
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari layanan..."
          className="w-full rounded-r10 border border-bd-card bg-bg-input py-s12 pl-s32 pr-s16 text-ts-fn text-tx-primary transition-colors placeholder:text-tx-muted focus:border-tx-secondary focus:outline-none focus:ring-1 focus:ring-tx-secondary"
        />
      </div>

      {/* ── [D] Service catalog ─────────────────────────────────────────── */}
      {activeServices.length === 0 ? (
        <SettingsEmptyState
          icon={<Scissors size={24} weight="duotone" />}
          title="Belum ada layanan aktif"
          description="Buat layanan di halaman Layanan terlebih dahulu."
          action={<SettingsAddButton onClick={() => {}}>Buat Layanan</SettingsAddButton>}
        />
      ) : visibleGroups.length === 0 ? (
        <p className="py-s24 text-center text-ts-fn text-tx-subtle">
          Tidak ada layanan yang cocok dengan &ldquo;{searchQuery}&rdquo;
        </p>
      ) : (
        <div className="flex flex-col gap-s12">
          {visibleGroups.map(({ cat, services: catServices }) => {
            const catServiceIds = catServices.map((s) => s.id);
            return (
              <CategoryAccordion
                key={cat.id}
                category={cat}
                services={catServices}
                assignedIds={assignedIds}
                onToggle={toggleService}
                onSelectAll={() => selectAll(catServiceIds)}
                onClearAll={() => clearAll(catServiceIds)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
