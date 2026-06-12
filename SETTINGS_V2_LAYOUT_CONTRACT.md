# Settings V2 Layout Contract

Mandatory reference for all Settings domains: Team, Operations, Booking App, Users & Access.

---

## 1. Page Shell Contract

Every domain page must use exactly this structure:

```
app/dashboard/settings/<domain>/page.tsx
  └── <DomainPageClient />          <- 'use client', < 50 lines

DomainPageClient
  useTeamController() | useBrandProfileController() | ...
  useServicesController()            <- only if domain reads services
  useRegisterSettingsActions({ onSave, onCancel, isDirty, isSaving })
  └── SettingsPageShell
        └── SettingsTabbedCard      <- if domain has sub-tabs (Services, Team)
              └── DomainForm
        OR
        └── SettingsPanel           <- if domain is single-scroll (Brand)
              └── DomainForm
```

Rules:

- Page file imports PageClient only. No logic in page.tsx.
- PageClient registers actions with useRegisterSettingsActions.
- PageClient owns controller instantiation.

---

## 2. Section Contract

Two patterns — pick based on outer wrapper:

### Inside SettingsTabbedCard (Services, Team)

Sections render WITHOUT their own padding wrapper:

```tsx
<div className="flex flex-col gap-s16">
  <SettingsSectionHeader title="..." description="..." />
  {/* content */}
</div>
```

Reason: SettingsTabbedCard already applies p-s20 md:p-s24.

### Inside SettingsPanel (Brand)

Sections use SettingsPanelSection which owns its own padding:

```tsx
<SettingsPanelSection title="..." description="...">
  {/* content */}
</SettingsPanelSection>
```

SettingsPanel adds divide-y dividers between sibling sections.

---

## 3. Card Contract

### SettingsContentCard

Use for contained form blocks, list panels, inline edit forms.
Variants: `padding="tight|default|loose|none"`.

### SettingsListCard

Use for every staff/item/leave row in a list.
Props: title, description, imageUrl, imageFallback, badges, actions, onClick.

### SettingsTabbedCard

Use when a domain has 2+ sub-sections that need tab navigation.
Props: tabs, activeTab, onTabChange, children.
Renders outer white card + tab bar + p-s20 md:p-s24 content area.

---

## 4. Action Bar Contract

Every domain controller must implement BaseSettingsController:

```ts
interface BaseSettingsController {
  isDirty: boolean;
  isSaving: boolean;
  handleSave: () => void;
  handleReset: () => void;
}
```

PageClient registers these via useRegisterSettingsActions. The header's Save/Cancel
buttons are driven by this context. Never render a custom save button inside a domain.

---

## 5. Controller Contract

Pattern (from useTeamController and useServicesController):

```ts
export interface DomainController extends BaseSettingsController {
  domain: DomainData;
  // mutation methods
}

export function useDomainController(): DomainController {
  const [domain, setDomain] = useState(MOCK_DOMAIN);
  const [savedDomain, setSavedDomain] = useState(MOCK_DOMAIN);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ... mutations via setDirtyDomain helper

  return {
    isDirty,
    isSaving,
    handleSave,
    handleReset,
    domain,
    // mutations
  };
}
```

Rules:

- Return object MUST include isDirty, isSaving, handleSave, handleReset.
- Mock data seeded at top of file with MOCK_DOMAIN constant.
- handleSave uses setTimeout(600) stub — replace with tRPC mutation.

---

## 6. Responsive Contract

All sections use Tailwind responsive prefixes only:

- Default: mobile-first (< md)
- `md:` breakpoint for desktop layout changes

Spacing tokens (4pt grid): s4, s8, s12, s16, s20, s24, s32, s40, s48.
Do NOT use arbitrary values. Map to nearest token.

Grid columns: `SettingsFormGrid cols={1|2}` — collapses to 1 on mobile automatically.

---

## 7. Shared Component Inventory

### Layout (settings/layout/)

| Component             | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| SettingsPageShell     | Outermost wrapper per domain page               |
| SettingsSection       | Float-card section group                        |
| SettingsSectionHeader | Title + description + optional action           |
| SettingsContentCard   | Generic white card with padding variants        |
| SettingsTabbedCard    | Sub-tab card (tab bar + content area)           |
| SettingsPanel         | Divider-separated grouped panel (Brand pattern) |
| SettingsPanelSection  | Padded section inside SettingsPanel             |
| SettingsSubNav        | Tab chip row                                    |
| SettingsActionBar     | Save/Cancel bar (used in header)                |

### Shared (settings/components/shared/)

| Component            | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| SettingsInput        | Controlled text input                              |
| SettingsTextarea     | Controlled textarea                                |
| SettingsUploadField  | File upload (variants: logo, cover, avatar, addon) |
| SettingsFieldGroup   | Label + hint + input wrapper                       |
| SettingsFormGrid     | 1 or 2-column form layout                          |
| SettingsListCard     | Row item with image, badges, actions               |
| SettingsAddButton    | Dashed add-row button                              |
| SettingsEmptyState   | Empty state with title + description               |
| SettingsDangerZone   | Red zone section for destructive actions           |
| SettingsPreviewPanel | Side preview panel                                 |

### Token Rules

- Colors: only tokens from tailwind.config.ts colors map.
  Danger actions: `text-ac-danger` / `bg-ac-danger`.
  Primary actions: `text-ac-primary`.
  No `text-red-*` or raw hex.
- No arbitrary values: `p-[10px]` is forbidden. Use `p-s8` or `p-s12`.
- Border: `border-bd-card` (default), `border-bd-row` (dividers).
- Input bg: `bg-bg-input`. Control bg: `bg-bg-control`. Hover: `bg-bg-hover`.
