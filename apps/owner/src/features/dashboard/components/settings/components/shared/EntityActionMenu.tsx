'use client';

import { DotsThreeVertical } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';

export interface ActionItem {
  label: string;
  variant?: 'default' | 'danger';
  onClick: () => void;
}

interface EntityActionMenuProps {
  actions: ActionItem[];
  /** Stop click from propagating to parent (e.g. card select) */
  stopPropagation?: boolean;
}

export function EntityActionMenu({ actions, stopPropagation = true }: EntityActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      <button
        type="button"
        aria-label="Aksi"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-r6 text-tx-muted transition-colors hover:bg-bg-hover hover:text-tx-primary"
      >
        <DotsThreeVertical size={16} weight="bold" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-s4 min-w-[140px] overflow-hidden rounded-r10 border border-bd-card bg-bg-card shadow-dropdown">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                setOpen(false);
                action.onClick();
              }}
              className={`w-full px-s12 py-s8 text-left text-ts-fn transition-colors hover:bg-bg-hover ${
                action.variant === 'danger' ? 'text-ac-danger' : 'text-tx-primary'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
