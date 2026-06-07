/**
 * @responsibility
 * Dropdown for selecting a history period preset.
 * Manages its own open/close state.
 *
 * @usedBy
 * HistoryHeader
 */

'use client';

import { CalendarBlank, CaretDown } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import type { HistoryPeriodPreset } from '../../types/history.types';

const PERIOD_OPTIONS: { value: HistoryPeriodPreset; label: string }[] = [
  { value: 'THIS_MONTH', label: 'Bulan Ini' },
  { value: '3_MONTHS', label: '3 Bulan Terakhir' },
  { value: '6_MONTHS', label: '6 Bulan Terakhir' },
  { value: '12_MONTHS', label: '12 Bulan Terakhir' },
  { value: 'CUSTOM', label: 'Custom Range' },
];

interface PeriodSelectorProps {
  value: HistoryPeriodPreset;
  onChange: (value: HistoryPeriodPreset) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLabel = PERIOD_OPTIONS.find((o) => o.value === value)?.label ?? 'Bulan Ini';

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 items-center gap-s8 rounded-r10 border border-bd-card bg-bg-input px-s12 text-ts-fn font-medium text-tx-primary transition-colors hover:bg-bg-hover"
      >
        <CalendarBlank size={14} weight="duotone" className="text-tx-secondary" />
        <span>{currentLabel}</span>
        <CaretDown
          size={12}
          weight="duotone"
          className={`text-tx-secondary transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1.5 min-w-[184px] animate-up rounded-r12 border border-bd-card bg-bg-card py-s8 shadow-dropdown">
          {PERIOD_OPTIONS.map((opt) => {
            const isActive = value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-s8 px-s16 py-s8 text-ts-fn transition-colors hover:bg-bg-hover ${
                  isActive ? 'font-semibold text-tx-primary' : 'text-tx-subtle'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? 'bg-ac-primary' : 'bg-transparent'}`}
                />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
