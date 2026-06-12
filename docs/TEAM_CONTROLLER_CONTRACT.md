# Team Controller Contract

**Date:** 2026-06-12
**Status:** Approved for Sprint 3 implementation
**Scope:** Interface definition only. No implementation details.

---

## Final Interface

```typescript
// src/features/dashboard/hooks/settings/useTeamController.ts

export interface TeamController {
  staff: StaffSection;
  assignments: AssignmentsSection;
  schedules: SchedulesSection;
  leaves: LeavesSection;
}

// ── Section interfaces ────────────────────────────────────────────────────────

export interface StaffSection {
  data: StaffMember[];
  isLoading: boolean;
  isSaving: boolean;
  add: (draft: Omit<StaffMember, "id">) => void;
  update: (id: string, patch: Partial<Omit<StaffMember, "id">>) => void;
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
  add: (draft: Omit<StaffLeave, "id">) => void;
  remove: (id: string) => void;
}
```

---

## Section Responsibilities

### `ctrl.staff.*`

Owns the source-of-truth staff list. All other sections cross-read `ctrl.staff.data`
to populate their staff dropdowns.

**Data:** `StaffMember[]` -- all staff for this salon (active + inactive).

**Mutations -- all immediate:**

| Method              | DB operation                       | Cascade                                                                |
| ------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| `add(draft)`        | INSERT staff row                   | Service creates default schedule row + empty assignment row atomically |
| `update(id, patch)` | UPDATE staff row                   | No cascade                                                             |
| `deactivate(id)`    | UPDATE staff SET is_active = false | No cascade (deactivated staff excluded from booking, not deleted)      |
| `remove(id)`        | DELETE staff row                   | DB CASCADE (or service) removes linked assignments, schedules, leaves  |

`deactivate` is kept separate from `update` because it is a distinct business operation
with its own service validation and potential side effects (active bookings check, future
sprint). It should not be collapsed into `update(id, { isActive: false })`.

On `add`, the server (service layer) is responsible for creating the default schedule and
empty assignment row atomically. The controller does not fire separate schedule or
assignment mutations for initialization. On `onSuccess`, the shared domain query is
invalidated and refetches -- the new staff appears in `staff.data`, `assignments.data`,
and `schedules.data` with server-created defaults.

On `remove`, the controller clears `leaves.selectedStaffId` if it matches the removed
staff ID before invalidating, to prevent a dangling leaves query.

**`isSaving`:** true if any of `add`, `update`, `deactivate`, or `remove` is in flight.

---

### `ctrl.assignments.*`

Owns service-to-staff mapping. Replaces the full assignment list for a staff member
on each write (no additive toggle at DB level -- the full `serviceIds[]` array is
written as one operation).

**Data:** `ServiceAssignment[]` -- full list for all staff in this salon.

Sections filter this list by `staffId` locally. Loading all assignments at once is
acceptable: 100 staff x ~5 services each = 500 items maximum, well within a single
query result.

**Mutations -- immediate:**

| Method                     | DB operation                                       |
| -------------------------- | -------------------------------------------------- |
| `set(staffId, serviceIds)` | UPSERT (or UPDATE) assignment row for this staffId |

`set` replaces the complete `serviceIds` array, not an individual toggle. The section
computes the new array (add/remove individual serviceId) before calling `set`. This
keeps the controller mutation simple and the DB write predictable.

**`isSaving`:** true if `set` is in flight. Multiple rapid calls may overlap if the
user toggles quickly; this is acceptable because each call writes the complete array
state and later calls supersede earlier ones.

---

### `ctrl.schedules.*`

Owns weekly schedule per staff member. Uses explicit save (not immediate) because
schedule editing is a form interaction involving time pickers -- firing on every
field change would spam the DB with intermediate states.

**Data:** `WeeklySchedule[]` -- full list for all staff in this salon.

Sections filter by `staffId` locally. 100 staff x 7 days = 700 day records, fine
for a single query.

**Mutation -- explicit save:**

| Method                            | DB operation                         |
| --------------------------------- | ------------------------------------ |
| `saveForStaff(staffId, schedule)` | UPSERT schedule row for this staffId |

The section owns draft state for the schedule being edited. On mount, the section
initializes its draft from `ctrl.schedules.data` filtered to the selected staff.
The section's "Simpan Jadwal" button calls `saveForStaff` with the final draft.

`ctrl.schedules.data` reflects the last saved-to-DB version. The section
re-initializes its draft from `ctrl.schedules.data` after `isSaving` transitions
from true to false (via `onSuccess` invalidation + refetch).

**`isSaving`:** true if `saveForStaff` is in flight.

---

### `ctrl.leaves.*`

Owns leave and unavailability records. Uses a separate parameterized query (not
included in the shared domain query) because leave history is unbounded -- years of
records per staff member at scale. Loading all leaves for all staff at once is
prohibited by the scale requirement.

**Data:** `StaffLeave[]` -- leaves for `selectedStaffId` only. Empty array when
`selectedStaffId` is null or query is loading.

**State:**

| Field             | Type                           | Description                                        |
| ----------------- | ------------------------------ | -------------------------------------------------- |
| `selectedStaffId` | `string \| null`               | Drives the leaves query. Null = no query issued.   |
| `selectStaff(id)` | `(id: string \| null) => void` | Updates selectedStaffId. Query re-runs for new id. |

**Mutations -- immediate:**

| Method       | DB operation                         |
| ------------ | ------------------------------------ |
| `add(draft)` | INSERT leave row for `draft.staffId` |
| `remove(id)` | DELETE leave row                     |

`add` takes a draft that includes `staffId`. The section is responsible for
populating `staffId` from `selectedStaffId` before calling `add`.

Both `add` and `remove` invalidate the leaves query for `selectedStaffId` on success.
They do NOT invalidate the domain query (domain query does not include leaves).

**`isLoading`:** true when the leaves query for `selectedStaffId` is fetching.

**`isSaving`:** true if `add` or `remove` is in flight.

---

## Query Design

Two separate queries back this controller.

### Query 1: `trpc.settings.team.getTeamDomain`

Fetches staff, assignments, and schedules in one call (three parallel SELECTs via
`Promise.all`). All three are bounded in size and load on page mount.

```
salonId → { staff: StaffMember[], assignments: ServiceAssignment[], schedules: WeeklySchedule[] }
```

Staff mutations (`add`, `update`, `deactivate`, `remove`), assignment mutations (`set`),
and schedule mutations (`saveForStaff`) all invalidate this query on success.

`staleTime: 30_000`
`placeholderData: { staff: [], assignments: [], schedules: [] }`

### Query 2: `trpc.settings.team.getStaffLeaves`

Fetches leaves for one staff member. Enabled only when `selectedStaffId` is non-null.

```
{ staffId: string } → StaffLeave[]
```

`enabled: !!selectedStaffId`
`staleTime: 30_000`
`placeholderData: []`

Leave mutations (`add`, `remove`) invalidate this query on success.
Domain query is NOT invalidated by leave mutations.

---

## Example Usage from TeamPageClient

### Page-level registration

```tsx
// TeamPageClient.tsx

export function TeamPageClient() {
  const ctrl = useTeamController();
  const servicesCtrl = useServicesController();
  const [activeTab, setActiveTab] = useState("directory");

  // Team uses immediate mutations and per-section explicit save.
  // No global dirty state -- action bar is permanently hidden.
  useRegisterSettingsActions({
    onSave: () => void 0,
    onCancel: () => void 0,
    isDirty: false,
    isSaving: false,
  });

  return (
    <SettingsPageShell>
      <SettingsTabbedCard
        tabs={TEAM_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <TeamForm
          ctrl={ctrl}
          activeTab={activeTab}
          services={servicesCtrl.domain.services}
          categories={servicesCtrl.domain.categories}
        />
      </SettingsTabbedCard>
    </SettingsPageShell>
  );
}
```

### StaffDirectorySection

```tsx
// Reads staff list. Also reads assignments/schedules for card badges.

function StaffDirectorySection({ ctrl }: { ctrl: TeamController }) {
  const staff = ctrl.staff.data;

  // Assignment count badge per staff card
  const assignmentCountFor = (staffId: string) =>
    ctrl.assignments.data.find((a) => a.staffId === staffId)?.serviceIds
      .length ?? 0;

  // Schedule summary badge per staff card
  const enabledDaysFor = (staffId: string) =>
    ctrl.schedules.data
      .find((s) => s.staffId === staffId)
      ?.days.filter((d) => d.enabled).length ?? 0;

  const handleAdd = (draft: Omit<StaffMember, "id">) => {
    ctrl.staff.add(draft);
  };

  const handleUpdate = (
    id: string,
    patch: Partial<Omit<StaffMember, "id">>,
  ) => {
    ctrl.staff.update(id, patch);
  };

  const handleDeactivate = (id: string) => {
    ctrl.staff.deactivate(id);
  };

  const handleRemove = (id: string) => {
    ctrl.staff.remove(id);
  };

  // ...
}
```

### ServiceAssignmentSection

```tsx
// Immediate toggle -- each checkbox calls ctrl.assignments.set with the updated array.

function ServiceAssignmentSection({
  ctrl,
  services,
  categories,
}: {
  ctrl: TeamController;
  services: ServiceItem[];
  categories: ServiceCategory[];
}) {
  const [selectedStaffId, setSelectedStaffId] = useState(
    ctrl.staff.data.filter((s) => s.isActive)[0]?.id ?? null,
  );

  const assignment = ctrl.assignments.data.find(
    (a) => a.staffId === selectedStaffId,
  );
  const assignedIds = new Set(assignment?.serviceIds ?? []);

  const handleToggle = (serviceId: string, checked: boolean) => {
    if (!selectedStaffId) return;
    const current = assignment?.serviceIds ?? [];
    const next = checked
      ? [...current, serviceId]
      : current.filter((id) => id !== serviceId);
    ctrl.assignments.set(selectedStaffId, next);
  };

  const handleSelectAll = (categoryServiceIds: string[]) => {
    if (!selectedStaffId) return;
    const current = assignment?.serviceIds ?? [];
    const next = [...new Set([...current, ...categoryServiceIds])];
    ctrl.assignments.set(selectedStaffId, next);
  };

  const handleClearAll = (categoryServiceIds: string[]) => {
    if (!selectedStaffId) return;
    const toRemove = new Set(categoryServiceIds);
    const next = (assignment?.serviceIds ?? []).filter(
      (id) => !toRemove.has(id),
    );
    ctrl.assignments.set(selectedStaffId, next);
  };

  // ...
}
```

### WeeklyScheduleSection

```tsx
// Explicit save -- section owns draft state, calls saveForStaff on submit.

function WeeklyScheduleSection({ ctrl }: { ctrl: TeamController }) {
  const activeStaff = ctrl.staff.data.filter((s) => s.isActive);
  const [selectedStaffId, setSelectedStaffId] = useState(
    activeStaff[0]?.id ?? null,
  );

  const savedSchedule = ctrl.schedules.data.find(
    (s) => s.staffId === selectedStaffId,
  );

  const [draftSchedule, setDraftSchedule] = useState<WeeklySchedule | null>(
    savedSchedule ?? null,
  );

  // Re-initialize draft when saved schedule changes (after save completes).
  useEffect(() => {
    if (savedSchedule) setDraftSchedule(savedSchedule);
  }, [savedSchedule]);

  const isDirty =
    draftSchedule !== null &&
    savedSchedule !== undefined &&
    JSON.stringify(draftSchedule) !== JSON.stringify(savedSchedule);

  const handleSave = () => {
    if (!selectedStaffId || !draftSchedule) return;
    ctrl.schedules.saveForStaff(selectedStaffId, draftSchedule);
  };

  // "Simpan Jadwal" button shown only when isDirty.
  // ...
}
```

### LeaveSection

```tsx
// Lazy query -- selectStaff drives what the controller loads.

function LeaveSection({ ctrl }: { ctrl: TeamController }) {
  const activeStaff = ctrl.staff.data.filter((s) => s.isActive);

  // Initialize selected staff on mount.
  useEffect(() => {
    if (!ctrl.leaves.selectedStaffId && activeStaff.length > 0) {
      ctrl.leaves.selectStaff(activeStaff[0].id);
    }
  }, [ctrl.leaves, activeStaff]);

  const handleAdd = (draft: Omit<StaffLeave, "staffId" | "id">) => {
    if (!ctrl.leaves.selectedStaffId) return;
    ctrl.leaves.add({ ...draft, staffId: ctrl.leaves.selectedStaffId });
  };

  const handleRemove = (id: string) => {
    ctrl.leaves.remove(id);
  };

  // ...
}
```

---

## Why Each Section Owns Its Own Lifecycle

### Staff vs Assignments: different mutation shapes

Adding a staff member is a create operation with server-assigned ID and cascade side
effects. Toggling a service assignment is a replace operation on an existing row. These
have different input shapes, different DB tables, and different invalidation targets.
Mixing them into a flat interface (current mock) forces the consumer to know which
mutations affect which tables and whether a save is needed.

Section ownership makes the consumer concern-free: `ctrl.staff.add()` creates staff.
`ctrl.assignments.set()` updates assignments. Neither needs to know about the other.

### Schedules: explicit save prevents DB spam

Time picker changes fire on every blur. If schedule updates were immediate, editing
a single staff's schedule (open day, set start time, set end time = 3 mutations minimum)
would issue 3 DB calls for what is conceptually one operation. With explicit save, the
section drafts locally and writes once.

Assignment toggles (checkboxes) are different: each toggle is a complete state change
that the owner intends immediately. No draft needed.

### Leaves: separate query prevents unbounded load

If leaves were included in `getTeamDomain`, a salon with 3 years of leave records
across 20 staff (20 x 12 months x 3 years = potentially 720+ records) would load all
of it on page mount, even when the owner just opened the Staff Directory tab.

The separate query loads only the selected staff's leaves, only when the Leave tab is
open and a staff member is selected. The rest of the controller (staff, assignments,
schedules) is unaffected.

### Staff data is cross-cutting

`ctrl.staff.data` is read by all four sections (for staff dropdowns and directory
rendering). It is not duplicated across sections -- all sections read from the same
`ctrl.staff.data`. The single domain query ensures all sections see the same staff list
without inconsistency.

---

## Scale Guarantees

| Entity      | Max (typical salon)       | Strategy                                                           |
| ----------- | ------------------------- | ------------------------------------------------------------------ |
| Staff       | 100                       | Loaded in full on mount. Single SELECT.                            |
| Assignments | 500                       | Loaded in full on mount. Single SELECT. Sections filter in memory. |
| Schedules   | 100 x 7 = 700 day records | Loaded in full on mount. Single SELECT.                            |
| Leaves      | Unbounded                 | Lazy query per selected staff. Never loaded in bulk.               |

At 100 staff, the domain query returns 3 recordsets totaling ~700 rows. React Query
caches it for 30s. Tab switches do not re-fetch. Only mutations cause refetch.

At 500 assignments, in-memory filtering (`Array.find`, `Array.filter`) on the
assignments array is O(n). For n=500 this is sub-millisecond. No pagination needed
at this scale.

Leave section is load-on-demand. A staff member with 200 leave records loads those
200 records only when selected. Zero leave data is loaded for the other 99 staff
members unless the owner navigates to them.

---

## Migration from Current Mock Controller

### Interface changes

| Mock property/method                     | New contract                                | Notes                                                         |
| ---------------------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| `domain.staff`                           | `ctrl.staff.data`                           | Same type                                                     |
| `domain.assignments`                     | `ctrl.assignments.data`                     | Same type                                                     |
| `domain.schedules`                       | `ctrl.schedules.data`                       | Same type                                                     |
| `domain.leaves`                          | `ctrl.leaves.data`                          | Scope-narrowed: selected staff only                           |
| `isDirty`                                | removed from top level                      | Schedules section manages local dirty state                   |
| `isSaving`                               | removed from top level                      | Each section exposes its own `isSaving`                       |
| `handleSave`                             | removed                                     | No global batch save                                          |
| `handleReset`                            | removed                                     | No global reset                                               |
| `addStaff(draft)`                        | `ctrl.staff.add(draft)`                     | Same signature                                                |
| `updateStaff(id, patch)`                 | `ctrl.staff.update(id, patch)`              | Same signature                                                |
| `deactivateStaff(id)`                    | `ctrl.staff.deactivate(id)`                 | Renamed only                                                  |
| `deleteStaff(id)`                        | `ctrl.staff.remove(id)`                     | Renamed only                                                  |
| `setAssignment(staffId, serviceIds)`     | `ctrl.assignments.set(staffId, serviceIds)` | Same signature                                                |
| `updateDaySchedule(staffId, day, patch)` | removed                                     | Section drafts locally, calls `ctrl.schedules.saveForStaff()` |
| `addLeave(draft)`                        | `ctrl.leaves.add(draft)`                    | Same signature                                                |
| `removeLeave(id)`                        | `ctrl.leaves.remove(id)`                    | Renamed only                                                  |

### Files that need updating when contract is implemented

| File                           | Change                                                                  |
| ------------------------------ | ----------------------------------------------------------------------- |
| `useTeamController.ts`         | Full rewrite -- replace mock state with tRPC queries + mutations        |
| `TeamPageClient.tsx`           | `useRegisterSettingsActions` with `isDirty: false` (no global save)     |
| `TeamForm.tsx`                 | Import type from `useTeamController.ts` -- no prop changes              |
| `StaffDirectorySection.tsx`    | `ctrl.domain.staff` → `ctrl.staff.data`, etc. (mechanical renames)      |
| `ServiceAssignmentSection.tsx` | `ctrl.domain.*` → section API, `setAssignment` → `ctrl.assignments.set` |
| `WeeklyScheduleSection.tsx`    | `ctrl.domain.*` → section API, local draft state, explicit save button  |
| `LeaveSection.tsx`             | `ctrl.domain.*` → section API, drive `ctrl.leaves.selectStaff` on mount |

`BaseSettingsController` import: remove entirely from `useTeamController.ts`. The new
`TeamController` interface does not extend it and has no `isDirty`, `handleSave`,
or `handleReset` properties.

### Callsite diff summary

StaffDirectorySection currently reads:

```typescript
ctrl.domain.staff          → ctrl.staff.data
ctrl.domain.assignments    → ctrl.assignments.data   (for badge count)
ctrl.domain.schedules      → ctrl.schedules.data     (for enabled-days count)
ctrl.addStaff              → ctrl.staff.add
ctrl.updateStaff           → ctrl.staff.update
ctrl.deactivateStaff       → ctrl.staff.deactivate
ctrl.deleteStaff           → ctrl.staff.remove
```

ServiceAssignmentSection currently reads:

```typescript
ctrl.domain.staff          → ctrl.staff.data
ctrl.domain.assignments    → ctrl.assignments.data
ctrl.setAssignment         → ctrl.assignments.set
```

WeeklyScheduleSection currently reads:

```typescript
ctrl.domain.staff          → ctrl.staff.data
ctrl.domain.schedules      → ctrl.schedules.data (seed local draft)
ctrl.updateDaySchedule     → removed; section calls ctrl.schedules.saveForStaff
```

LeaveSection currently reads:

```typescript
ctrl.domain.staff          → ctrl.staff.data
ctrl.domain.leaves         → ctrl.leaves.data (filtered by selectedStaffId)
ctrl.addLeave              → ctrl.leaves.add
ctrl.removeLeave           → ctrl.leaves.remove
+ new: ctrl.leaves.selectStaff(id)
+ new: ctrl.leaves.selectedStaffId
```
