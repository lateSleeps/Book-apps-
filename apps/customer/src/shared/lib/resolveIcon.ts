/**
 * resolveIcon — Customer App
 *
 * Resolves a Phosphor icon name string (stored in DB `categories.icon`)
 * to its Phosphor React component.
 *
 * Icon catalogue is identical to Owner App (SettingsIconPicker.tsx).
 * Falls back to Tag when name is not found.
 */
import {
  Butterfly,
  Coffee,
  Crown,
  Drop,
  Eye,
  Eyedropper,
  Feather,
  FirstAidKit,
  Flower,
  FlowerLotus,
  GenderFemale,
  HairDryer,
  HandPalm,
  Heart,
  Leaf,
  Lightning,
  MaskHappy,
  Scissors,
  Palette,
  PaintBrush,
  Rainbow,
  Shower,
  Smiley,
  Sparkle,
  Star,
  Sun,
  Tag,
  Wind,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";

const ICON_MAP: Record<string, PhosphorIcon> = {
  Scissors,
  Drop,
  Eye,
  Flower,
  FlowerLotus,
  PaintBrush,
  Sparkle,
  HandPalm,
  Heart,
  Crown,
  Leaf,
  Sun,
  Palette,
  MaskHappy,
  Feather,
  Tag,
  Star,
  GenderFemale,
  Eyedropper,
  HairDryer,
  Wind,
  Smiley,
  Rainbow,
  Lightning,
  Shower,
  Butterfly,
  Coffee,
  FirstAidKit,
};

export function resolveIcon(name?: string | null): PhosphorIcon {
  if (!name) return Tag;
  return ICON_MAP[name] ?? Tag;
}

// ── Slug-based fallback ───────────────────────────────────────────────────────
// Used when the DB `categories.icon` field is null/empty.
// Maps category slug → Phosphor icon so every category has a distinct identity.
const SLUG_MAP: Record<string, PhosphorIcon> = {
  // Hair
  hair: Scissors,
  barbershop: Scissors,
  beard: Scissors,
  // Face & eyes
  face: Eye,
  "face-lashes": Eye,
  lashes: Eye,
  eyelash: Eye,
  eyebrow: Eyedropper,
  facial: Drop,
  // Massage & body
  massage: HandPalm,
  body: HandPalm,
  "body-treatment": HandPalm,
  spa: FlowerLotus,
  // Colour & chemical treatments
  "colour-treatment": Palette,
  "color-treatment": Palette,
  colour: Palette,
  coloring: Palette,
  // Nail
  nail: PaintBrush,
  nails: PaintBrush,
  "nail-art": PaintBrush,
  // Skincare
  skin: Drop,
  skincare: Drop,
  waxing: Leaf,
  // Makeup
  makeup: MaskHappy,
};

/**
 * resolveIconBySlug — try icon string first, fall back to category slug map.
 * Use this for category list rows so every category shows a distinct icon
 * even when the owner hasn't set an explicit icon in settings.
 */
export function resolveIconBySlug(
  icon?: string | null,
  slug?: string | null,
): PhosphorIcon {
  if (icon && ICON_MAP[icon]) return ICON_MAP[icon];
  if (slug && SLUG_MAP[slug]) return SLUG_MAP[slug];
  return Tag;
}
