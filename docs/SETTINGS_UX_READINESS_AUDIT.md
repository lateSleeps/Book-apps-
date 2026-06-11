# Settings UX Readiness Audit

**Date:** 2026-06-11
**Method:** Browser DOM inspection (accessibility tree) + component code review, evaluated as a first-time salon owner.
**Scope:** Brand & Profil, Layanan, Produk & Paket

---

## UX Score: 67 / 100

| Area           | Score  | Notes                                              |
| -------------- | ------ | -------------------------------------------------- |
| Brand & Profil | 62/100 | Long form, save too far, upload terminology wrong  |
| Layanan        | 65/100 | 2-step service discovery, empty-category dead ends |
| Produk & Paket | 72/100 | Cleanest flow; missing active/inactive visibility  |
| Consistency    | 70/100 | Two card patterns for similar data (grid vs. list) |
| Empty States   | 60/100 | Three empty states have no CTA                     |

---

## Step 1 — Owner Journey

### 1. How do I edit salon information?

**Works.** Land on Brand & Profil → fields are editable immediately. The section descriptions ("Muncul di halaman utama booking") are helpful. The hint text under each field is genuinely useful.

**Problem:** Owner edits "Lokasi" at the bottom of the page, then discovers the Simpan Perubahan button is at the top of the entire page — completely off-screen. There is no sticky save bar, no per-section save, no bottom action. The form is five sections tall.

### 2. How do I add a category?

**Works.** "Tambah Kategori" button is visible in the Kategori section header immediately. Click → side sheet opens → fill form → save. Straightforward.

### 3. How do I add a service?

**Broken discovery.** The "Tambah Layanan" button does not exist on page load. It only appears after the owner clicks a category card to select it. There is no instruction telling the owner to select a category first before the add button appears.

First-time owner flow: land on Layanan → see categories → see "Layanan: Pilih kategori terlebih dahulu" → try to find "Tambah Layanan" → not visible → confused.

### 4. How do I edit a service?

**Works, but hidden.** Select a category → click the `•••` menu on a service card → "Edit Layanan". The edit action is inside a kebab menu on a small card, which means it is invisible until the owner hovers over the card and notices the three dots.

### 5. How do I delete a service?

**Works.** Same `•••` → "Hapus Permanen" → confirmation dialog. The confirmation copy is clear and correctly alarming.

**Problem:** The label "Hapus Permanen" in the kebab menu is both accurate and high-anxiety. An owner who just wants to temporarily remove a service has no "Nonaktifkan" option — only hard delete. For categories this is an even bigger problem (deleting a category deletes all its services silently, per the controller logic).

### 6. How do I add an add-on product?

**Works.** Land on Produk & Paket → "Tambah Produk" is visible at the top of the list. Click → side sheet → fill → save. Best-discovered action in the entire Settings area.

### 7. How do I create a bundle?

**Works, with a prerequisite trap.** Navigate to "Paket Bundle" tab → click "Buat Paket" → side sheet opens → service selector appears. If the owner hasn't added services yet, the selector is empty and the form cannot be completed. There is no guard or message directing them to set up services first.

---

## Step 2 — Action Discoverability

### Primary Actions

| Action          | Discoverable?               | Notes                                                             |
| --------------- | --------------------------- | ----------------------------------------------------------------- |
| Tambah Kategori | ✅ Immediately visible      | Top-right of Kategori section                                     |
| Tambah Layanan  | ❌ Hidden (2-step)          | Only visible after selecting a category                           |
| Tambah Produk   | ✅ Immediately visible      | Top of list section                                               |
| Buat Paket      | ✅ Visible after tab switch | Top of Bundles section                                            |
| Edit (all)      | ⚠️ Hidden in kebab          | `•••` icon is low contrast and small (7×7px hit area via h-7 w-7) |
| Delete (all)    | ⚠️ Hidden in kebab          | Same as edit                                                      |

### The `•••` (EntityActionMenu) Assessment

The `DotsThreeVertical` icon renders correctly and the dropdown works. Three issues:

1. **Hit target is 28×28px** (h-7 w-7). Usability guidelines recommend 44×44px minimum. An owner with a trackpad will miss it.

2. **Visual salience is low** — `text-tx-muted` color means the icon is intentionally de-emphasized. On a card with no other interactive elements, the only action is the least visible thing.

3. **On service cards, the `•••` is the ONLY thing in the top row of the card.** The layout renders a full flex row containing just the menu button, top-right. The card feels like it has dead space in the top portion.

### What should NOT be hidden

These actions are frequent enough to be inline:

- **Edit** on product add-on cards — these are list cards (not grids), there's room for an "Edit" text link in the actions slot
- **Tambah Layanan** — should be inline inside an empty category's area, not only in the section header

---

## Step 3 — Empty States

| Empty State                              | Explains what to do?                                                      | Has CTA?     | Verdict                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------ |
| Layanan — no categories                  | "Tambah kategori untuk mengelompokkan layanan salon."                     | ❌ No button | ⚠️ Icon + text, no button                                          |
| Layanan — category selected, no services | "Tambah layanan pertama untuk kategori ini."                              | ❌ No button | ❌ Owner has to look up to find "Tambah Layanan" in section header |
| Layanan — no category selected           | "Klik salah satu kategori di atas untuk menampilkan layanan."             | ❌ No button | ✅ Good instruction, no CTA needed here                            |
| Produk — no addons                       | (Not seen — mock data has products)                                       | —            | —                                                                  |
| Bundle — no bundles                      | "Buat paket untuk menawarkan kombinasi layanan dengan harga lebih hemat." | ❌ No button | ⚠️ Aspirational copy, no CTA                                       |
| Konsultasi — no services                 | "Tambah layanan terlebih dahulu sebelum mengatur pertanyaan."             | ❌ No button | ⚠️ Good instruction, no direct link                                |

**Pattern failure:** `SettingsEmptyState` accepts `icon`, `title`, and `description` props but has no `action` prop. All empty states across Layanan and Produk & Paket are dead ends — they tell the owner what to do but don't give a button to do it.

---

## Step 4 — Information Hierarchy

### Category Cards (Layanan)

```
[ Icon with colored bg ]  [ ••• menu ]
[ Name — semibold ]
[ Description — 2 line clamp ]
[ — divider — ]
[ N layanan ]   [ ✓ if selected ]
```

**Good:** Icon + color visually differentiates categories. Service count is useful at a glance.
**Problem:** The selection affordance is weak. The card doesn't visually say "I am clickable to filter." The `✓` only appears after selection — there is no pre-click affordance indicating this is a filter, not just a display card.
**Problem:** `cursor-pointer` is set via Tailwind but a new owner using only visual cues (no pointer inspection) has no indication the card is interactive except the subtle hover shadow change.

### Service Cards (Layanan)

```
[ empty row with ••• at right ]
[ Name — bold ]
[ Description — 3 line clamp ]
[ — divider — ]
[ Price — bold ]
[ Clock icon · Duration ]
```

**Good:** Price and duration in the footer are exactly right for a service menu.
**Problem:** Top row is entirely empty except the `•••` menu. This wastes vertical space and creates visual imbalance. Service cards have no active/inactive status.
**Missing:** No indicator of which services require a specialist (requiresSpecialist flag is in data but not shown).

### Product Cards (Produk & Paket)

```
[ Name — medium ]  ← from SettingsListCard
[ Description ]
[ Price — in description area via SettingsListCard ]  ← actually third line?
[ Badges ]
[ Edit · Delete ]
```

Wait — looking at AddOnsSection code, it renders SettingsListCard with `title={addon.name}`, `description={addon.description}`, and `actions` containing EntityActionMenu. The price is shown separately. Let me reconsider.

From browser DOM: "Makarizo Shampoo / Shampoo rambut sehat 200ml / Rp 45.000" — so price is being rendered as a separate item after the description. Looking at AddOnsSection:
<br>

**Actual hierarchy:**

- Name (bold, via SettingsListCard title)
- Description (secondary, via SettingsListCard description)
- Price (shown via separate element below the ListCard? or inside?)

The price is the most decision-relevant information for an owner managing products (is this priced correctly?), but it appears third after name and description.

**Missing:** No active/inactive badge on product cards. `isActive` exists in `AddOnProduct` but is never rendered. Owner cannot see which products are live in the booking flow.

### Bundle Cards (Produk & Paket)

```
[ Cover image or Package icon placeholder ]
[ ••• menu (top-right of content area) ]
[ Name ]
[ Included services — comma list, 2 line clamp ]
[ — divider — ]
[ Bundle price (bold) ]  [ Original price (strikethrough) ]
[ "Hemat Rp X" badge ]
[ "N layanan" badge ]
```

**Good:** Savings calculation and strikethrough original price is excellent — this communicates value immediately.
**Problem:** `•••` menu placement at top-right of the content section (after the image) is visually odd — it appears before the bundle name in the DOM flow.
**Problem:** No active/inactive status on bundles either.

---

## Step 5 — Consistency

### What is consistent ✅

- All confirmation dialogs use the same `ConfirmDialog` component — language, button positions, danger variant all match.
- All side sheets use `SettingsSideSheet` — consistent header, footer, backdrop.
- All "Tambah X" buttons use `SettingsAddButton` — same visual weight.
- Section headers use `SettingsSectionHeader` everywhere.
- Navigation selected state behavior is identical across all pages.

### What is inconsistent ⚠️

| Element             | Brand & Profil         | Layanan              | Produk & Paket          |
| ------------------- | ---------------------- | -------------------- | ----------------------- |
| Entity list format  | Inline form (vertical) | Grid cards           | Horizontal list cards   |
| Add action position | N/A                    | Section header right | Section header right ✅ |
| Edit action         | Direct inline form     | Kebab menu           | Kebab menu              |
| Active status shown | N/A                    | ❌ No                | ❌ No                   |
| Empty state CTA     | N/A                    | ❌ No button         | ❌ No button            |

**Layanan uses grid cards for services; Produk & Paket uses horizontal SettingsListCard rows for add-ons.** These represent the same type of entity (named item with price + description) but display differently. When an owner moves between tabs, the interaction model shifts.

---

## Top 10 Usability Issues

### 1. Save button is off-screen for Brand & Profil

**Severity: High.**
Brand & Profil has 5 long sections. The only save mechanism is Simpan Perubahan in the page header at the top. An owner who edits the Lokasi section (last section) and then scrolls to the save button has to travel the full page height. No sticky bar, no per-section save, no bottom action.

### 2. "Tambah Layanan" is not visible on page load

**Severity: High.**
The button only appears after the owner clicks a category card. First-time owners do not know that categories are interactive filters. The page gives no upfront signal that "click a category to unlock service management."

### 3. Empty states have no action buttons

**Severity: Medium-High.**
Every empty state in Layanan (no services in category, no categories) and Produk & Paket (no bundles) describes what to do in words but does not provide a button. Owner reads "Tambah layanan pertama untuk kategori ini" and then has to look elsewhere for the actual button.

### 4. Category cards show no "add service" affordance when count is 0

**Severity: Medium-High.**
Categories with "0 layanan" are the most in need of action. But clicking them shows an empty state with no button — the add button is only in the Layanan section header above. The connection is not obvious.

### 5. Active/inactive status is invisible on product and bundle cards

**Severity: Medium.**
`AddOnProduct.isActive` and `ServiceBundle.isActive` exist in the data but are never rendered in the list. An owner enabling/disabling products during a promo has no way to confirm the state without editing.

### 6. Category deletion silently removes all services inside

**Severity: Medium.**
`deleteCategory` in `useServicesController` filters out all services with that `categoryId`. The ConfirmDialog message only says "Hapus kategori" — it does not mention that all services in that category will also be deleted. An owner who deletes "Hair" (which has 2 services) expects only the category to go.

**Current confirm message:** Not yet reviewed in detail — but the deletion handler does not appear to inject the service count into the warning.

### 7. Service cards have an empty top row

**Severity: Low-Medium.**
The service grid card layout places `EntityActionMenu` in a top-right row with nothing else. Visually, the top quarter of each service card is dead space with a small `•••` floating in the corner. This looks unfinished and wastes card real estate.

### 8. Bundle creation requires services to exist — no guard

**Severity: Medium.**
Clicking "Buat Paket" opens a form with a service selector. If the owner hasn't added services, the selector is empty and the form can never be completed. No warning is shown before opening the sheet, and no message appears inside the empty selector.

### 9. "Hapus Permanen" is the only removal option for services and categories

**Severity: Low-Medium.**
There is no "Nonaktifkan" option for services (unlike staff, which has deactivate). An owner who wants to temporarily suspend a service during low season has no choice but hard delete. `ServiceItem.isActive` exists but there is no toggle in the UI.

### 10. Save/Cancel disabled state is silent

**Severity: Low.**
On page load, both Batal and Simpan Perubahan are disabled (opacity-40, cursor-not-allowed). A first-time owner may click Simpan Perubahan expecting to confirm initial values, get no response, and think something is wrong. There is no tooltip, no caption like "Belum ada perubahan."

---

## Quick Wins (under 1 hour each)

### QW-1: Add `action` prop to `SettingsEmptyState`

Add an optional `action?: ReactNode` prop to `SettingsEmptyState`. Then pass `<SettingsAddButton>` directly into the empty state for the "no services in category" case. One prop, one component change, fixes issues #3 and #4.

### QW-2: Show active/inactive badge on AddOnsSection list cards

`AddOnProduct.isActive` is already in the data. Add a `badge` to `SettingsListCard`:

```tsx
badges={[
  addon.isActive ? { label: 'Aktif', variant: 'success' } : { label: 'Nonaktif', variant: 'default' },
]}
```

Fixes issue #5. Zero architecture change.

### QW-3: Include service count in category delete confirmation

In `ServicesForm`, when `handleDeleteCategory` is called, count how many services are in that category and inject into the message:

```
"Kategori 'Hair' berisi 2 layanan. Semua layanan di dalamnya juga akan dihapus permanen."
```

Fixes issue #6. One string change.

### QW-4: Add a title row to service cards (move something meaningful into the top slot)

Move the `requiresSpecialist` indicator or active status into the top row of the service card so the `•••` isn't floating alone. A small badge like "Perlu Spesialis" would fill that dead space and surface useful information. Fixes issue #7.

### QW-5: Add tooltip/caption near disabled save buttons

Below the Batal/Simpan row, add a small caption: `"Ubah informasi di bawah untuk mengaktifkan tombol simpan."` shown when `!isDirty`. Visible only when buttons are disabled. Fixes issue #10.

### QW-6: Guard "Buat Paket" when services list is empty

Before opening the BundleForm sheet, check `services.length === 0`. If true, show a `ConfirmDialog`-style informational message instead: "Tambah layanan terlebih dahulu sebelum membuat paket bundle." Fixes issue #8. One `if` check.

---

## Medium Improvements

### M-1: Sticky save bar for Brand & Profil

Within the existing layout system (the `SettingsPageShell`'s scrollable content area), add a sticky bar at the bottom of the scrollable div that appears when `isDirty`. The bar would replicate the Batal/Simpan buttons. The top header buttons remain — the bar is additive, not a replacement.

This requires a new primitive (`SettingsStickyBar` or reusing `SettingsActionBar`) rendered by `BrandPageClient` when `ctrl.isDirty` is true. No layout changes needed.

### M-2: Add an affordance that category cards are selectable filters

Current: Cards look like informational tiles. Selection only becomes visible on hover (shadow change) or after click (border change + ✓).

Within the existing card layout, add a small "Lihat layanan →" or just an arrow icon at the bottom when `!isSelected`, that disappears on selection. This is a single `{!isSelected && <ArrowDown size={12} />}` addition — no card redesign.

### M-3: Show "Tambah Layanan" inside empty category selected state

When a category is selected and has zero services, the SettingsEmptyState appears with no CTA. The solution is QW-1 (adding `action` to SettingsEmptyState), then wiring up:

```tsx
<SettingsEmptyState
  icon={<Scissors />}
  title="Belum ada layanan"
  description="Tambah layanan pertama untuk kategori ini."
  action={
    <SettingsAddButton onClick={() => onAddService(selectedCatId)}>
      Tambah Layanan
    </SettingsAddButton>
  }
/>
```

### M-4: Add "Nonaktifkan" option for services alongside "Hapus Permanen"

In `ServicesAccordion`, add `onToggleService: (svc: ServiceItem) => void` prop and wire it to `updateService(id, { isActive: !svc.isActive })`. Then add it as the first item in the service card EntityActionMenu: "Nonaktifkan" (or "Aktifkan"). Show active status as a badge on service cards. This gives owners a reversible action before the permanent delete.

---

## Step 6 — Team Domain UX Guidelines

### Patterns Team Domain SHOULD inherit

**Pattern 1: SettingsSideSheet for all add/edit**
The side sheet pattern (focused overlay, sticky header + footer, Batal/Simpan) works well. Every team action that requires filling a form — add staff, edit schedule, assign services — should use SettingsSideSheet. Never use inline forms for complex data.

**Pattern 2: ConfirmDialog before all destructive actions**
`deactivateStaff` now correctly uses ConfirmDialog (from the cleanup session). All team actions that are hard to reverse — removing leave, resetting schedule — should follow this pattern. The confirmation copy must include consequences, not just "Are you sure?".

**Pattern 3: SettingsSectionHeader with action prop**
The `action={<SettingsAddButton>}` pattern in `SettingsSectionHeader` is the right way to position add buttons. Team sections (staff list, leave list, schedule list) should all place their "Tambah X" via this prop.

**Pattern 4: SettingsListCard for staff rows**
Staff directory already uses `SettingsListCard` with `thumbnailSize="lg"`. This is the right primitive. Assignment and leave sections should use consistent row format.

**Pattern 5: SettingsTabbedCard with tab per concern**
Team already has 4 tabs (Direktori, Penugasan, Jadwal, Cuti). This is the right way to organize a complex domain without overwhelming the owner on first load.

### Patterns Team Domain SHOULD AVOID

**Avoid: EntityActionMenu as the only interactive element on a row/card**
The Layanan problem (issue #7) would be worse on the Team domain because staff management actions are more critical. Edit, deactivate, view schedule — these should be visible at a glance. Use inline text links ("Edit", "Lihat Jadwal") in the `actions` slot of SettingsListCard, not just the `•••` menu.

**Avoid: 2-step discovery for primary actions**
The Layanan pattern (select category → then add appears) should not be repeated for Team. The "Tambah Staff" button should always be visible at the top of the staff list, never gated.

**Avoid: Empty states without CTAs**
Every Team empty state (no staff, no assignments, no schedule entries, no leave) must include an action button. Use QW-1's solution once implemented.

**Avoid: Missing status visibility**
Staff `isActive` badge must be shown inline on every staff card — the team domain has a "Nonaktifkan" action, so the result of that action must be immediately visible in the list.

**Avoid: Ambiguous delete language**
"Hapus Permanen" is correct for categories and products but wrong for staff. Staff are soft-deleted (deactivated, not removed). The deactivation confirmation should say "Nonaktifkan" not "Hapus". Scheduled items (leave) can be truly deleted — use "Hapus Cuti" with appropriate warning copy.
