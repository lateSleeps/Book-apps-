# Team Mutation Policy

**Date:** 2026-06-12
**Applies to:** `useTeamController` and all Team section components
**Authority:** Supersedes any prior save-behavior decisions in Team domain docs

---

## Rule

Every mutation in the Team domain is either **Immediate** or **Explicit Save**.
No third category exists. When adding a new action, assign it to one of the two.

**Immediate** -- fires a tRPC mutation the moment the user completes the action.
No save button. No dirty state. No cancel.

**Explicit Save** -- section holds a local draft. User must confirm with a save action.
Draft is discarded on cancel or navigation away.

---

## Policy Table

| Action                               | Policy        | Guard                  |
| ------------------------------------ | ------------- | ---------------------- |
| Staff -- create                      | Immediate     | Modal submission       |
| Staff -- update                      | Immediate     | Modal submission       |
| Staff -- deactivate                  | Immediate     | ConfirmDialog          |
| Staff -- delete                      | Immediate     | ConfirmDialog          |
| Assignments -- toggle service        | Immediate     | none                   |
| Assignments -- select all (category) | Immediate     | none                   |
| Assignments -- clear all (category)  | Immediate     | none                   |
| Schedule -- save staff week          | Explicit Save | Save button in section |
| Leave -- create                      | Immediate     | Form submission        |
| Leave -- delete                      | Immediate     | ConfirmDialog          |

---

## Rationale Per Action

### Staff -- create (Immediate)

The add-staff modal is the confirmation step. The owner fills in name, role, phone,
then clicks "Tambah". That click is an explicit commit. A second save action after
modal close would be redundant confirmation of a decision already made.

### Staff -- update (Immediate)

Same reasoning as create. The edit modal collects the full patch. Submit = intent
confirmed. A staged draft outside the modal adds no value and delays the feedback loop.

### Staff -- deactivate (Immediate + ConfirmDialog)

Deactivation hides the staff member from new bookings. It is reversible (re-activating
is an update), but the consequence is significant enough to require one confirmation.
The ConfirmDialog is the guard. Once confirmed, the mutation fires immediately.

Do not add a second save step after the dialog. The dialog IS the confirmation.

### Staff -- delete (Immediate + ConfirmDialog)

Hard delete. Cascades to assignments, schedules, and leaves. Irreversible from the UI.
ConfirmDialog is mandatory. Mutation fires on dialog confirm. No additional save step.

### Assignments -- toggle service (Immediate)

A checkbox toggle represents a discrete, complete state change: "this staff can / cannot
perform this service." There is no intermediate state between checked and unchecked.
The owner's intent is unambiguous at the moment of the click. Buffering this into a
draft and requiring a save button adds friction without protecting against any real error.

### Assignments -- select all / clear all (Immediate)

Bulk operations on a category. The category accordion header makes the scope visible
before the action. The operation is reversible (clear all can be undone by select all).
No ConfirmDialog needed. Fires immediately.

### Schedule -- save staff week (Explicit Save)

Weekly schedule editing involves time pickers with start and end fields. During editing,
the schedule passes through states that are temporarily invalid or incomplete -- for
example, start time entered but end time not yet updated, or a day enabled with default
times before the owner adjusts them. Firing a mutation on every field change would
persist intermediate invalid states to the DB.

The section holds a local draft. The owner edits the full week, then clicks
"Simpan Jadwal". One mutation. Clean final state.

Each staff member's schedule is saved independently. Selecting a different staff member
discards the current draft without saving.

**Do not convert schedule updates to immediate.** The time picker interaction pattern
is the reason explicit save exists in this domain.

### Leave -- create (Immediate)

The add-leave form collects date, type, and note. Form submission is the confirmation
step, same as staff create. A single-record create with a bounded input set does not
benefit from a draft layer.

### Leave -- delete (Immediate + ConfirmDialog)

Leave records are date-specific entries in the staff's availability history. Deleting
one affects booking availability for that date. ConfirmDialog guards the action.
Mutation fires on confirm. No additional save step.

---

## What This Policy Prohibits

**No global batch save for Team.** `useRegisterSettingsActions` in `TeamPageClient`
registers `isDirty: false` permanently. There is no page-level "Simpan Perubahan"
button for Team. Each section is self-contained.

**No optimistic updates.** All sections invalidate and refetch after mutation.
Consistent with the rest of the settings persistence architecture.

**No rollback on assignment toggle.** Because assignments are immediate, there is no
cancel path after a toggle. If this becomes a UX concern, the solution is undo (a
timed toast with a reverse mutation), not a draft + save pattern.

**No debounce on schedule time fields.** Time fields do not fire mutations -- they
update local draft state only. The debounce question does not arise because nothing
hits the DB until the save button is clicked.

**No ConfirmDialog on assignment clear-all.** The operation is scoped to one category
and is reversible. Adding a dialog here would make bulk onboarding (assigning all
services on first setup) tedious without meaningful protection.

---

## Adding New Actions

When adding a new mutation to the Team domain, answer these questions in order:

1. Does the action collect multiple fields before committing? -- If yes, Explicit Save.
2. Does the action pass through intermediate invalid states during input? -- If yes, Explicit Save.
3. Is the action irreversible from the UI? -- If yes, Immediate + ConfirmDialog.
4. Otherwise -- Immediate.

If neither Explicit Save nor Immediate fits cleanly, the action probably belongs in
a modal (which acts as its own confirmation boundary), making it Immediate on submit.
