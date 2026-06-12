# Team Domain Implementation Report

## 1. Component Tree

```
app/dashboard/settings/tim/page.tsx          (4 lines)
  └── TeamPageClient                          (42 lines, 'use client')
        useTeamController()
        useServicesController()               <- consumes services, no duplication
        useRegisterSettingsActions(...)
        └── SettingsPageShell
              └── SettingsTabbedCard (4 tabs)
                    └── TeamForm
                          ├── StaffDirectorySection    (tab: directory)
                          ├── ServiceAssignmentSection (tab: assignment)
                          ├── WeeklyScheduleSection    (tab: schedule)
                          └── LeaveSection             (tab: leave)
```

## 2. Domain Ownership

Team Domain OWNS:

- StaffMember (fullName, phone, role, specialty, avatar, isActive)
- ServiceAssignment (staffId -> serviceIds[])
- WeeklySchedule (staffId -> DaySchedule[7])
- StaffLeave (staffId, type, date, note)

Team Domain does NOT own:

- Bookings / appointments
- Availability engine or slot generation
- Calendar
- Service definitions (read-only from Services domain)

## 3. Data Contracts

File: `apps/owner/src/features/dashboard/components/settings/types/team.types.ts`

```ts
StaffRole    = 'OWNER' | 'STYLIST' | 'COLORIST' | 'NAIL_ARTIST' | 'THERAPIST' | 'RECEPTIONIST'
StaffSpecialty = 'HAIR_STYLIST' | 'COLORIST' | 'NAIL_ARTIST' | 'THERAPIST'
LeaveType    = 'LEAVE' | 'SICK' | 'HOLIDAY' | 'UNAVAILABLE'
WeekDay      = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

StaffMember      { id, fullName, phone, role, specialty, avatarUrl, avatarColor, isActive }
ServiceAssignment { staffId, serviceIds: string[] }
DaySchedule      { day, enabled, startTime, endTime }
WeeklySchedule   { staffId, days: DaySchedule[7] }
StaffLeave       { id, staffId, type, date, note }
TeamDomain       { staff, assignments, schedules, leaves }
```

## 4. Services Dependency Mapping

ServiceAssignmentSection receives `services: ServiceItem[]` from TeamPageClient,
which instantiates useServicesController() independently.

ServiceFlow -> StaffSpecialty routing (from services.types.ts comments):
| ServiceFlow | Required StaffSpecialty |
|----------------|------------------------|
| STYLING_HAIR | HAIR_STYLIST |
| STYLING_COLOUR | COLORIST |
| STYLING_NAIL | NAIL_ARTIST |
| TREATMENT | THERAPIST (optional) |

No duplication: service names/prices/durations live only in Services domain.
Team domain stores only serviceIds[] per staff member.

## 5. Customer App Dependency Map

| Customer App Field | Current Source              | Required Source (Team Domain)      |
| ------------------ | --------------------------- | ---------------------------------- |
| Stylist name       | stylists.users.full_name    | StaffMember.fullName               |
| Stylist specialty  | stylists.role/title         | StaffMember.specialty              |
| Avatar initials    | computed from name          | computed from StaffMember.fullName |
| Avatar color       | stylists.color/avatar_color | StaffMember.avatarColor            |
| Active filter      | stylists.isActive           | StaffMember.isActive               |
| Booked slots       | trpc.stylists.getBySalon    | NOT owned by Team Domain           |

The customer app `mapStylist()` function in StepStylist.tsx handles multiple
field name aliases (full_name/name, role/title, etc.) — Team Domain aligns with
the canonical names (full_name -> fullName, role/specialty).

## 6. Design System Compliance

Layout components used:

- SettingsPageShell ✓
- SettingsTabbedCard ✓
- SettingsSectionHeader ✓ (direct, no double-padding)
- SettingsContentCard ✓
- SettingsSectionHeader ✓

Shared components used:

- SettingsInput ✓
- SettingsTextarea ✓
- SettingsUploadField (avatar variant) ✓
- SettingsFieldGroup ✓
- SettingsFormGrid ✓
- SettingsListCard ✓
- SettingsAddButton ✓
- SettingsEmptyState ✓

Color tokens: all valid (ac-danger, ac-primary, tx-primary, tx-secondary,
bg-bg-card, bg-bg-input, bg-bg-control, bg-bg-hover, bd-card, bd-row).
Spacing tokens: s4, s8, s12, s16, s20, s24 only.
No hardcoded hex, no magic spacing values.

## 7. Layout Contract Compliance

- Page < 50 lines: tim/page.tsx = 4 lines ✓
- Form = orchestration only (TeamForm = 22 lines) ✓
- Sections isolated: each section is self-contained with own state ✓
- Controllers isolated: useTeamController.ts ✓
- No double-padding: sections use div.flex-col.gap-s16, not SettingsPanelSection ✓
- BaseSettingsController: isDirty, isSaving, handleSave, handleReset all returned ✓

## 8. Responsive Verification

- Staff selector chips: `flex-wrap gap-s8` — wraps on narrow screens ✓
- Form grids: SettingsFormGrid cols={2} — collapses to 1 col on mobile ✓
- Day schedule rows: horizontal time inputs, no fixed widths ✓
- Tab bar: SettingsSubNav uses `overflow-x-auto` (inherited from SettingsTabbedCard) ✓

## 9. Future Scheduling Readiness

Team Domain currently supports future:

| Future Module          | Current Field                           | Missing / To Add                      |
| ---------------------- | --------------------------------------- | ------------------------------------- |
| Availability Engine    | DaySchedule.enabled, startTime, endTime | Break times, slot duration            |
| Calendar Module        | WeeklySchedule per staff                | Exceptions, date-specific overrides   |
| Appointment Assignment | ServiceAssignment.serviceIds            | Concurrent booking limit, booking_lag |

Fields NOT in Team Domain (by design, metadata only):

- slot generation logic
- booking capacity per time block
- real-time availability state

## 10. Legacy Settings Audit

Routes found but lacking full Settings V2 implementation:

| Route                            | File                  | Status                                     |
| -------------------------------- | --------------------- | ------------------------------------------ |
| /dashboard/settings/operasional  | operasional/page.tsx  | Placeholder — needs Operations domain      |
| /dashboard/settings/booking      | booking/page.tsx      | Placeholder — needs Booking App domain     |
| /dashboard/settings/pengguna     | pengguna/page.tsx     | Placeholder — needs Users & Access domain  |
| /dashboard/settings/produk-addon | produk-addon/page.tsx | Orphaned route — no tab in SettingsTopTabs |

`produk-addon` route exists but has no corresponding tab in SettingsTopTabs.tsx.
Either add a tab or remove the route. Do NOT delete until confirmed.

Do not delete any of these files yet — audit only.

---

## Final Verdict

**READY FOR OPERATIONS DOMAIN**

All Team Domain requirements fulfilled:

- Data contracts: team.types.ts ✓
- Controller: useTeamController with BaseSettingsController ✓
- 4 sections: StaffDirectory, ServiceAssignment, WeeklySchedule, Leave ✓
- Services consumed without duplication ✓
- Design system compliance: all shared components used ✓
- Layout contract: matches Brand & Services reference ✓
- Page architecture: Page 4 lines, Form 22 lines, sections isolated ✓
- isDirty/isSaving flow: verified in return object ✓
