# Settings Icon Picker Report

Date: 2026-06-11

---

## 1. Summary

Replaced the emoji text input on `ServiceCategory` with a reusable Phosphor icon picker component.
Owners now click a trigger button to open a searchable grid of 28 icons and select one. The category
card in `ServicesAccordion` renders the icon directly from the stored `iconName` string.

---

## 2. Data Contract Change

| Before                                              | After                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `ServiceCategory.icon: string` (emoji, e.g. `'✂️'`) | `ServiceCategory.iconName: string` (Phosphor name, e.g. `'Scissors'`) |

The `icon` field is removed. `iconName` is required on all categories.

---

## 3. New Component: `SettingsIconPicker`

**Location:** `settings/components/shared/SettingsIconPicker.tsx`

**Props:**

```ts
interface SettingsIconPickerProps {
  value: string; // current iconName
  onChange: (iconName: string) => void;
}
```

**Behaviour:**

- Trigger: 40x40px button showing the current icon (falls back to `?` if unresolved)
- Click trigger: opens a 288px popover with a search bar + 6-column icon grid
- Search: filters by icon name and Indonesian/English keywords
- Select: calls `onChange(name)`, closes popover
- Outside click: closes popover

**Exported utilities:**

```ts
export function resolveIcon(name: string): PhosphorIcon  // resolves name -> component, falls back to Tag
export type PhosphorIcon  // component type for icon rendering
```

---

## 4. Icon Catalogue (28 icons)

| Name         | Keywords                                        |
| ------------ | ----------------------------------------------- |
| Scissors     | gunting, potong, rambut, hair, cut              |
| Drop         | tetes, warna, colour, color, keratin, treatment |
| Eye          | mata, bulu mata, lash, eye, face                |
| Flower       | bunga, spa, relaksasi, relaxation               |
| FlowerLotus  | lotus, spa, wellness                            |
| PaintBrush   | kuas, nail, kuku, art, brush                    |
| Sparkle      | kilap, highlight, glitter, special              |
| HandPalm     | tangan, pijat, massage, hand, body              |
| Heart        | hati, kecantikan, beauty, love                  |
| Crown        | mahkota, premium, vip, luxury                   |
| Leaf         | daun, organik, natural, organic                 |
| Sun          | matahari, glow, brightening, radiance           |
| Palette      | palet, warna, makeup, color                     |
| MaskHappy    | topeng, makeup, wajah, face, mask               |
| Feather      | bulu, ringan, gentle, soft                      |
| Tag          | tag, harga, price, label, umum                  |
| Star         | bintang, unggulan, featured                     |
| GenderFemale | wanita, perempuan, female, women                |
| Eyedropper   | pipet, warna, color picker, tint                |
| HairDryer    | blowdry, rambut, styling, dryer                 |
| Wind         | angin, blowdry, wavy                            |
| Smiley       | senyum, wajah, face, happy, skin                |
| Rainbow      | pelangi, warna-warni, colorful                  |
| Lightning    | kilat, express, cepat, fast                     |
| Shower       | mandi, cuci, wash, keramas, shampoo             |
| Butterfly    | kupu, transformasi, beauty                      |
| Coffee       | kopi, relaksasi, lounge                         |
| FirstAidKit  | pertolongan, treatment, medical, perawatan      |

Adding new icons: extend `ICON_LIST` in `SettingsIconPicker.tsx`. No other files need changing.

---

## 5. Files Changed

| File                                                | Change                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| `types/services.types.ts`                           | `icon: string` -> `iconName: string` (comment updated)               |
| `hooks/settings/useServicesController.ts`           | Mock data: emoji strings -> Phosphor icon names                      |
| `settings/components/shared/SettingsIconPicker.tsx` | NEW — reusable picker + `resolveIcon` utility                        |
| `settings/components/shared/index.ts`               | Export `SettingsIconPicker`, `resolveIcon`, `PhosphorIcon`           |
| `services/forms/CategoryForm.tsx`                   | `icon` state -> `iconName`, emoji input -> `SettingsIconPicker`      |
| `services/forms/ServiceForm.tsx`                    | Removed `c.icon` from category dropdown option (now shows name only) |
| `services/sections/ServicesAccordion.tsx`           | Removed `getCategoryIcon()`, renders via `resolveIcon(cat.iconName)` |

---

## 6. Reusability

`SettingsIconPicker` is domain-agnostic. Use it anywhere an `iconName: string` field exists:

```tsx
// In any form:
<SettingsIconPicker value={iconName} onChange={setIconName} />;

// To render the icon elsewhere:
import { resolveIcon } from "@/features/dashboard/components/settings/components/shared";
const Icon = resolveIcon(cat.iconName);
<Icon size={20} weight="duotone" />;
```

Suitable for: category forms, bundle forms, booking app service cards, any future domain
that stores a Phosphor icon name.

---

## 7. Customer App Impact

Zero. The customer app was not touched. The `iconName` field replaces `icon` only in the owner
dashboard types and controllers. Customer booking flow does not reference either field.
