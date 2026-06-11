import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Custom twMerge that understands the project's Design System token namespaces.
 *
 * Problem: tailwind-merge v2 treats all unknown `text-*` classes as a single
 * conflict group (via `isAny` in the built-in text-color group). Without this
 * config, `text-ts-fn` (font-size token) is silently dropped when it appears
 * alongside `text-tx-primary` (color token) because both start with `text-`
 * and the last one wins.
 *
 * Root cause: regex validators in custom class groups do NOT trigger conflict
 * detection between two classes that match the same regex — only explicit
 * string entries do. Solution: enumerate all known token names as strings.
 *
 * Fix: override font-size and text-color with explicit string lists so that:
 *   text-ts-* / legacy text-t{n}  → font-size group  (conflict with each other)
 *   text-tx-* / text-st-* / etc.  → text-color group (conflict with each other)
 *   font-size token ≠ text-color token               (no cross-group conflict)
 */
const twMerge = extendTailwindMerge({
  override: {
    classGroups: {
      // ── font-size ─────────────────────────────────────────────────────────
      // Design System type scale (ts-*) + legacy numeric aliases (t12…t32)
      // + standard Tailwind sizes kept so text-sm / text-lg still conflict
      'font-size': [
        {
          text: [
            // DS type scale
            'ts-micro',
            'ts-cap2',
            'ts-cap1',
            'ts-fn',
            'ts-fn-tight',
            'ts-sub',
            'ts-body',
            'ts-head',
            'ts-t3',
            'ts-t2',
            'ts-t1',
            'ts-hero',
            'ts-t14',
            // Legacy numeric aliases
            't12',
            't13',
            't14',
            't16',
            't18',
            't20',
            't24',
            't28',
            't32',
            // Standard Tailwind sizes (preserve conflict behaviour)
            'xs',
            'sm',
            'base',
            'lg',
            'xl',
            '2xl',
            '3xl',
            '4xl',
            '5xl',
            '6xl',
            '7xl',
            '8xl',
            '9xl',
          ],
        },
      ],

      // ── text-color ────────────────────────────────────────────────────────
      // All DS color token prefixes enumerated as strings so same-prefix
      // tokens conflict with each other (e.g. tx-primary vs tx-secondary).
      'text-color': [
        {
          text: [
            // tx-* text colors
            'tx-primary',
            'tx-body',
            'tx-secondary',
            'tx-subtle',
            'tx-muted',
            'tx-control',
            // st-* status colors (text only — *-bg handled by bg-color group)
            'st-upcoming',
            'st-confirmed',
            'st-in-progress',
            'st-completed',
            'st-cancelled',
            'st-no-show',
            // py-* payment colors (text)
            'py-paid',
            'py-deposit',
            'py-unpaid',
            // vt-* visitor type colors (text)
            'vt-walkin-text',
            'vt-booking-text',
            // ac-* action colors
            'ac-primary',
            'ac-danger',
            'ac-wa',
            'ac-ios-blue',
            'ac-ios-red',
            'ac-ios-green',
            // CSS keywords
            'inherit',
            'current',
            'transparent',
            'black',
            'white',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
