'use client';

import { PlusIcon } from '@heroicons/react/24/solid';
import { CalendarCheck, PersonSimpleWalk } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/cn';

interface AddVisitDropdownProps {
  addDropdownOpen: boolean;
  setAddDropdownOpen: (open: boolean) => void;
  openDrawer: (type: 'WALK_IN' | 'BOOKING') => void;
  setDrawerServiceOpen: (open: boolean) => void;
  setDrawerServiceSearch: (q: string) => void;
  isMobile: boolean;
}

export function AddVisitDropdown({
  addDropdownOpen,
  setAddDropdownOpen,
  openDrawer,
  setDrawerServiceOpen,
  setDrawerServiceSearch,
  isMobile,
}: AddVisitDropdownProps) {
  function openWalkIn() {
    openDrawer('WALK_IN');
    setDrawerServiceOpen(false);
    setDrawerServiceSearch('');
  }

  function openBooking() {
    openDrawer('BOOKING');
    setDrawerServiceOpen(false);
    setDrawerServiceSearch('');
  }

  return (
    <div className="relative hidden shrink-0 sm:block">
      <button
        onClick={() => setAddDropdownOpen(!addDropdownOpen)}
        className="flex h-10 items-center gap-s8 rounded-r12 bg-tx-body px-s16 text-ts-t14 font-medium text-white transition-colors hover:bg-[#333333]"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        <span>Tambah Pelanggan</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('transition-transform', addDropdownOpen && 'rotate-180')}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {addDropdownOpen && (
        <>
          {isMobile && (
            <div className="fixed inset-0 z-30" onClick={() => setAddDropdownOpen(false)} />
          )}
          <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-[220px] overflow-hidden rounded-r14 bg-bg-card p-1.5 shadow-dropdown">
            <DropdownItem
              icon={
                <PersonSimpleWalk size={20} weight="duotone" className="shrink-0 text-tx-primary" />
              }
              label="Walk-in"
              sublabel="Datang langsung"
              onClick={openWalkIn}
            />
            <div className="mx-2.5 my-0.5 h-px bg-bd-row" />
            <DropdownItem
              icon={
                <CalendarCheck size={20} weight="duotone" className="shrink-0 text-tx-primary" />
              }
              label="Booking Online"
              sublabel="Sudah punya kode booking"
              onClick={openBooking}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ── Internal ──────────────────────────────────────────────────────────────────

interface DropdownItemProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  onClick: () => void;
}

function DropdownItem({ icon, label, sublabel, onClick }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-s12 rounded-r10 border-none bg-transparent px-s12 py-[10px] text-left transition-colors hover:bg-bg-hover"
    >
      {icon}
      <div>
        <p className="m-0 text-ts-t14 font-medium text-tx-primary">{label}</p>
        <p className="m-0 text-ts-cap1 text-tx-secondary">{sublabel}</p>
      </div>
    </button>
  );
}
