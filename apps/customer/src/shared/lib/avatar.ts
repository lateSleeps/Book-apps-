/**
 * Avatar utility — generates consistent initials and background colors
 * for stylists/users based on their name.
 *
 * Ported from apps/owner/src/shared/lib/avatar.ts — keep in sync.
 * Color is deterministic: same name always produces the same color.
 */

/** Soft pastel background colors (Apple-inspired, matches Owner app) */
export const AVATAR_BG_COLORS = [
  "#D1FAE5", // mint green
  "#DBEAFE", // soft blue
  "#FEF3C7", // soft amber
  "#FECACA", // soft coral
  "#E9D5FF", // soft lavender
  "#FFEDD5", // soft peach
  "#CCFBF1", // soft teal
  "#FEE2E2", // soft rose
] as const;

/** Avatar text color — always dark for contrast on all pastel backgrounds */
export const AVATAR_TEXT_COLOR = "#1C1C1E";

/**
 * Returns a deterministic background color for an avatar based on the name.
 * Same name → same color every time.
 */
export function avatarColor(name: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bg = AVATAR_BG_COLORS[Math.abs(hash) % AVATAR_BG_COLORS.length]!;
  return { bg, text: AVATAR_TEXT_COLOR };
}

/**
 * Returns 1–2 uppercase initials from a full name.
 * e.g. "Reni Anggraini" → "RA", "Siti" → "S"
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return (words[0]?.[0] ?? "").toUpperCase();
  return (
    (words[0]?.[0] ?? "") + (words[words.length - 1]?.[0] ?? "")
  ).toUpperCase();
}
