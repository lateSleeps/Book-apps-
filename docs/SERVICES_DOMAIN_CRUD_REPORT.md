# Services Domain CRUD — Implementation Report

## Scope

Full CRUD for the Layanan domain in the owner settings (`/dashboard/settings/services`).

## Architecture

```
types/
  services.types.ts            — ServicesDomain, ServiceCategory, ServiceItem, ServiceQuestion, etc.

hooks/settings/
  useServicesController.ts     — All state mutations (addCategory, updateCategory, archiveService, addQuestion, …)

components/settings/
  layout/
    SettingsEntitySheet.tsx    — Reusable overlay sheet: title + scrollable body + Save/Cancel footer
    index.ts                   — Exports SettingsEntitySheet

  components/services/
    ServicesPageClient.tsx     — Controller instantiation + tab state + action bar wiring
    ServicesForm.tsx           — SheetState orchestration + FormDraft + all CRUD wiring
    forms/
      CategoryForm.tsx         — name, description, icon, blobColor picker, isActive toggle
      ServiceForm.tsx          — name, description, categoryId, priceType, price, duration, serviceFlow, requiresSpecialist, isActive
      QuestionForm.tsx         — label, type (chips/photo/text), options[], required toggle
    sections/
      ServicesAccordion.tsx    — Category grid (edit/archive buttons) + service card grid (edit/archive)
      ConsultationQuestionsSection.tsx — Grouped by service, per-question edit/archive
```

## Discriminated Union Pattern

```ts
// ServicesForm.tsx
type SheetState =
  | { mode: "add-category" }
  | { mode: "edit-category"; category: ServiceCategory }
  | { mode: "add-service"; categoryId?: string }
  | { mode: "edit-service"; service: ServiceItem }
  | { mode: "add-question"; serviceId: string; serviceName: string }
  | { mode: "edit-question"; question: ServiceQuestion; serviceName: string };

type FormDraft =
  | { kind: "category"; value: CategoryFormDraft }
  | { kind: "service"; value: ServiceFormDraft }
  | { kind: "question"; value: QuestionFormDraft };
```

## CRUD Operations

| Entity   | Create | Edit | Archive | Archive Guard                      |
| -------- | ------ | ---- | ------- | ---------------------------------- |
| Category | ✅     | ✅   | ✅      | ✅ blocks if active services exist |
| Service  | ✅     | ✅   | ✅      | -                                  |
| Question | ✅     | ✅   | ✅      | -                                  |

## Architecture Rules Followed

- No inline modals or form state in UI components
- SheetState + FormDraft managed exclusively in `ServicesForm.tsx`
- `emit()` pattern with `useRef(onChange)` to avoid infinite useEffect loops
- `SettingsEntitySheet` reused for all 6 sheet modes
- ServiceFlow enum: STYLING_HAIR | STYLING_COLOUR | STYLING_NAIL | TREATMENT

## Pending (out of scope for this sprint)

- tRPC integration (all mutations are currently local mock state)
- Add-ons & Bundles CRUD (domain types exist, no UI yet)
- Drag-to-reorder sortOrder
