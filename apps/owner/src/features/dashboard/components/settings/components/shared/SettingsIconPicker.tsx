'use client';

import {
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
  MagnifyingGlass,
  X,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PhosphorIcon = React.ComponentType<{
  size?: number | string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  color?: string;
  className?: string;
}>;

interface IconEntry {
  name: string;
  Icon: PhosphorIcon;
  keywords: string[];
}

// ── Icon catalogue ────────────────────────────────────────────────────────────
// Add more entries here as new domains (bundles, booking) need them.

const ICON_LIST: IconEntry[] = [
  { name: 'Scissors', Icon: Scissors, keywords: ['gunting', 'potong', 'rambut', 'hair', 'cut'] },
  {
    name: 'Drop',
    Icon: Drop,
    keywords: ['tetes', 'warna', 'colour', 'color', 'keratin', 'treatment'],
  },
  { name: 'Eye', Icon: Eye, keywords: ['mata', 'bulu mata', 'lash', 'eye', 'face'] },
  { name: 'Flower', Icon: Flower, keywords: ['bunga', 'spa', 'relaksasi', 'relaxation'] },
  { name: 'FlowerLotus', Icon: FlowerLotus, keywords: ['lotus', 'spa', 'wellness', 'relaksasi'] },
  { name: 'PaintBrush', Icon: PaintBrush, keywords: ['kuas', 'nail', 'kuku', 'art', 'brush'] },
  {
    name: 'Sparkle',
    Icon: Sparkle,
    keywords: ['kilap', 'highlight', 'glitter', 'special', 'shine'],
  },
  { name: 'HandPalm', Icon: HandPalm, keywords: ['tangan', 'pijat', 'massage', 'hand', 'body'] },
  { name: 'Heart', Icon: Heart, keywords: ['hati', 'kecantikan', 'beauty', 'love', 'care'] },
  { name: 'Crown', Icon: Crown, keywords: ['mahkota', 'premium', 'vip', 'luxury'] },
  { name: 'Leaf', Icon: Leaf, keywords: ['daun', 'organik', 'natural', 'organic'] },
  { name: 'Sun', Icon: Sun, keywords: ['matahari', 'glow', 'brightening', 'radiance'] },
  { name: 'Palette', Icon: Palette, keywords: ['palet', 'warna', 'makeup', 'color'] },
  { name: 'MaskHappy', Icon: MaskHappy, keywords: ['topeng', 'makeup', 'wajah', 'face', 'mask'] },
  { name: 'Feather', Icon: Feather, keywords: ['bulu', 'ringan', 'gentle', 'soft', 'light'] },
  { name: 'Tag', Icon: Tag, keywords: ['tag', 'harga', 'price', 'label', 'umum', 'general'] },
  { name: 'Star', Icon: Star, keywords: ['bintang', 'unggulan', 'featured', 'star'] },
  {
    name: 'GenderFemale',
    Icon: GenderFemale,
    keywords: ['wanita', 'perempuan', 'female', 'women'],
  },
  { name: 'Eyedropper', Icon: Eyedropper, keywords: ['pipet', 'warna', 'color picker', 'tint'] },
  {
    name: 'HairDryer',
    Icon: HairDryer,
    keywords: ['blowdry', 'rambut', 'styling', 'dryer', 'hair', 'pengering'],
  },
  { name: 'Wind', Icon: Wind, keywords: ['angin', 'blowdry', 'wavy', 'blow dry'] },
  { name: 'Smiley', Icon: Smiley, keywords: ['senyum', 'wajah', 'face', 'happy', 'skin'] },
  { name: 'Rainbow', Icon: Rainbow, keywords: ['pelangi', 'warna-warni', 'colorful', 'rainbow'] },
  { name: 'Lightning', Icon: Lightning, keywords: ['kilat', 'express', 'cepat', 'fast'] },
  { name: 'Shower', Icon: Shower, keywords: ['mandi', 'cuci', 'wash', 'keramas', 'shampoo'] },
  { name: 'Butterfly', Icon: Butterfly, keywords: ['kupu', 'transformasi', 'beauty', 'butterfly'] },
  { name: 'Coffee', Icon: Coffee, keywords: ['kopi', 'relaksasi', 'lounge', 'break'] },
  {
    name: 'FirstAidKit',
    Icon: FirstAidKit,
    keywords: ['pertolongan', 'treatment', 'medical', 'health', 'perawatan'],
  },
];

// ── Exports ───────────────────────────────────────────────────────────────────

/** Resolve an iconName string to its Phosphor component. Falls back to Tag. */
export function resolveIcon(name: string): PhosphorIcon {
  return ICON_LIST.find((e) => e.name === name)?.Icon ?? Tag;
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface SettingsIconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export function SettingsIconPicker({ value, onChange }: SettingsIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const currentEntry = ICON_LIST.find((e) => e.name === value);
  const filtered = ICON_LIST.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.keywords.some((k) => k.includes(q));
  });

  // close on outside click
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  function handleSelect(name: string) {
    onChange(name);
    setOpen(false);
    setSearch('');
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        title={currentEntry?.name ?? 'Pilih ikon'}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-r10 border transition-colors',
          open
            ? 'border-tx-primary bg-bg-input'
            : 'border-bd-card bg-bg-input hover:border-tx-secondary'
        )}
      >
        {currentEntry ? (
          <currentEntry.Icon size={20} weight="duotone" />
        ) : (
          <span className="text-ts-cap1 text-tx-muted">?</span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute left-0 top-12 z-50 w-72 rounded-r12 border border-bd-card bg-bg-card shadow-dropdown">
          {/* Search bar */}
          <div className="py-s10 flex items-center gap-s8 border-b border-bd-card px-s12">
            <MagnifyingGlass size={14} className="shrink-0 text-tx-muted" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ikon..."
              className="min-w-0 flex-1 bg-transparent text-ts-fn text-tx-primary outline-none placeholder:text-tx-muted"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="shrink-0 text-tx-muted hover:text-tx-primary"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Icon grid */}
          <div className="grid max-h-52 grid-cols-6 gap-s4 overflow-y-auto p-s12">
            {filtered.length === 0 ? (
              <p className="col-span-6 py-s8 text-center text-ts-cap1 text-tx-muted">
                Tidak ditemukan
              </p>
            ) : (
              filtered.map((entry) => {
                const selected = entry.name === value;
                return (
                  <button
                    key={entry.name}
                    type="button"
                    title={entry.name}
                    onClick={() => handleSelect(entry.name)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-r8 transition-colors',
                      selected
                        ? 'bg-tx-primary text-white'
                        : 'text-tx-secondary hover:bg-bg-control hover:text-tx-primary'
                    )}
                  >
                    <entry.Icon size={18} weight={selected ? 'fill' : 'duotone'} />
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
