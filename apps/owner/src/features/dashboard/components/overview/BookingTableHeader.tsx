/**
 * @responsibility
 * Booking table header: segmented filter tabs, sort button, search input,
 * and the "+" add button with Walk-in/Booking dropdown.
 *
 * @usedBy
 * BookingTable.tsx
 *
 * @notes
 * - Presentation only — no local state.
 * - All state lives in use-booking-list and use-walk-in-flow via controller.
 */

'use client';

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';
import {
  CaretDown,
  PersonSimpleWalk,
  CalendarCheck,
  PlusIcon as PhPlusIcon,
} from '@phosphor-icons/react';
import type { BookingListState } from '../../hooks/overview/use-booking-list';
import type { VisitorTab } from '../../types/overview.types';

const TABS: { key: VisitorTab; label: string }[] = [
  { key: 'ALL', label: 'Semua' },
  { key: 'BOOKING', label: 'Booking' },
  { key: 'WALK_IN', label: 'Datang Langsung' },
  { key: 'COMPLETED', label: 'Selesai' },
];

interface BookingTableHeaderProps {
  list: Pick<
    BookingListState,
    | 'activeTab'
    | 'setActiveTab'
    | 'bookingCounts'
    | 'pendingConfirmCount'
    | 'searchQuery'
    | 'setSearchQuery'
    | 'sortOrder'
    | 'setSortOrder'
  >;
  addDropdownOpen: boolean;
  setAddDropdownOpen: (open: boolean) => void;
  onOpenDrawer: (type: 'WALK_IN' | 'BOOKING') => void;
}

export function BookingTableHeader({
  list,
  addDropdownOpen,
  setAddDropdownOpen,
  onOpenDrawer,
}: BookingTableHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem 0.5rem',
      }}
    >
      {/* Segmented tabs */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: '0.75rem',
          padding: '0.25rem',
          backgroundColor: '#F2F2F7',
        }}
      >
        {TABS.map(({ key, label }) => {
          const active = list.activeTab === key;
          const showBadge = key === 'BOOKING' && list.pendingConfirmCount > 0;
          return (
            <div key={key} style={{ position: 'relative' }}>
              <button
                onClick={() => list.setActiveTab(key)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '0.625rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: active ? 600 : 400,
                  transition: 'all 0.15s',
                  backgroundColor: active ? '#FFFFFF' : 'transparent',
                  color: active ? '#1C1C1E' : '#8E8E93',
                  boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {label}
                <span
                  style={{ marginLeft: 5, fontSize: 11, color: active ? '#8E8E93' : '#C7C7CC' }}
                >
                  {list.bookingCounts[key]}
                </span>
              </button>
              {showBadge && (
                <span className="animate-badge-shake pointer-events-none absolute -right-1.5 -top-2 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-[#f59e0b] px-1 text-[0.625rem] font-bold text-white shadow-sm ring-2 ring-white">
                  {list.pendingConfirmCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Sort button */}
        <button
          onClick={() => list.setSortOrder(list.sortOrder === 'ASC' ? 'DESC' : 'ASC')}
          className="flex h-8 items-center gap-1.5 rounded-r8 border border-bd-card bg-bg-card px-2.5 text-ts-cap1 font-medium text-tx-secondary transition-colors hover:bg-bg-surface"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {list.sortOrder === 'DESC' ? (
              <>
                <path d="M4 3v10M4 13l-2.5-3M4 13l2.5-3" />
                <path d="M9 5h3M9 8h4M9 11h5" opacity="0.5" />
              </>
            ) : (
              <>
                <path d="M4 13V3M4 3l-2.5 3M4 3l2.5 3" />
                <path d="M9 5h3M9 8h4M9 11h5" opacity="0.5" />
              </>
            )}
          </svg>
          {list.sortOrder === 'DESC' ? 'Terbaru' : 'Terlama'}
        </button>

        {/* Search */}
        <div
          className="flex h-8 items-center gap-1.5 rounded-r8 border border-bd-card bg-bg-control px-2.5"
          style={{ width: 160 }}
        >
          <MagnifyingGlassIcon style={{ width: 13, height: 13, color: '#8E8E93', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Cari pelanggan..."
            value={list.searchQuery}
            onChange={(e) => list.setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-ts-cap1 text-tx-primary outline-none placeholder:text-tx-secondary"
          />
          {list.searchQuery && (
            <button onClick={() => list.setSearchQuery('')} className="flex p-0">
              <XMarkIcon style={{ width: 12, height: 12, color: '#8E8E93' }} />
            </button>
          )}
        </div>

        {/* Add button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setAddDropdownOpen(!addDropdownOpen)}
            className="flex h-8 items-center gap-1 rounded-r8 bg-tx-primary px-3 text-ts-cap1 font-semibold text-white transition-colors hover:opacity-90"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M5.5 1v9M1 5.5h9" />
            </svg>
            Tambah
            <CaretDown
              size={10}
              weight="bold"
              color="white"
              className={`transition-transform ${addDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {addDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setAddDropdownOpen(false)} />
              <div className="absolute right-0 top-full z-40 mt-1 w-52 overflow-hidden rounded-r12 border border-bd-card bg-white shadow-card">
                <button
                  onClick={() => {
                    onOpenDrawer('WALK_IN');
                    setAddDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-bg-surface"
                >
                  <PersonSimpleWalk size={18} weight="duotone" color="#1C1C1E" />
                  <div>
                    <p className="text-ts-fn font-medium text-tx-primary">Datang Langsung</p>
                    <p className="text-ts-cap1 text-tx-secondary">Walk-in baru</p>
                  </div>
                </button>
                <div className="mx-2.5 h-px bg-bd-row" />
                <button
                  onClick={() => {
                    onOpenDrawer('BOOKING');
                    setAddDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-bg-surface"
                >
                  <CalendarCheck size={18} weight="duotone" color="#1C1C1E" />
                  <div>
                    <p className="text-ts-fn font-medium text-tx-primary">Booking Online</p>
                    <p className="text-ts-cap1 text-tx-secondary">Sudah punya kode booking</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// suppress unused import warning
void PhPlusIcon;
