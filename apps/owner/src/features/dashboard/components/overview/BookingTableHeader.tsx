'use client';

import { ArrowClockwise, MagnifyingGlass, X } from '@phosphor-icons/react';
import type { BookingListState } from '../../hooks/overview/use-booking-list';
import type { VisitorTab } from '../../types/overview.types';

// Shared base style for the refresh and sort control buttons
const CTRL_BTN_BASE = {
  display: 'flex',
  alignItems: 'center',
  height: 32,
  borderRadius: 8,
  border: 'none',
} as const;

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
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function BookingTableHeader({ list, onRefresh, isRefreshing }: BookingTableHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 16px',
      }}
    >
      {/* Segmented tabs — marginLeft:-4 compensates inner padding so text aligns with column headers */}
      <div
        className="bg-bg-control"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: 12,
          padding: 4,
          marginLeft: -4,
        }}
      >
        {TABS.map(({ key, label }) => {
          const active = list.activeTab === key;
          const showBadge = key === 'BOOKING' && list.pendingConfirmCount > 0;
          return (
            <div key={key} style={{ position: 'relative' }}>
              <button
                onClick={() => list.setActiveTab(key)}
                className={`text-ts-fn transition-all duration-150 ${active ? 'bg-bg-card font-semibold text-tx-primary shadow-tab' : 'font-normal text-tx-secondary'}`}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '6px 14px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {label}
                <span
                  className={`text-ts-cap2 ${active ? 'text-tx-secondary' : 'text-tx-muted'}`}
                  style={{ marginLeft: 5 }}
                >
                  {list.bookingCounts[key]}
                </span>
              </button>
              {showBadge && (
                <span className="animate-badge-shake pointer-events-none absolute -right-1.5 -top-2 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-rF bg-[#f59e0b] px-1 text-[0.625rem] font-bold text-white shadow-sm ring-2 ring-white">
                  {list.pendingConfirmCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Controls: refresh + sort + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh data"
          className="bg-bg-control text-tx-control"
          style={{
            ...CTRL_BTN_BASE,
            justifyContent: 'center',
            width: 32,
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            opacity: isRefreshing ? 0.5 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <ArrowClockwise
            size={14}
            weight="duotone"
            className="text-tx-control"
            style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
          />
        </button>

        {/* Sort button */}
        <button
          onClick={() => list.setSortOrder(list.sortOrder === 'ASC' ? 'DESC' : 'ASC')}
          className="bg-bg-control text-ts-fn font-medium text-tx-control"
          style={{
            ...CTRL_BTN_BASE,
            gap: 6,
            padding: '0 12px',
            cursor: 'pointer',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {list.sortOrder === 'ASC' ? (
              <>
                <path d="M4 3v10M4 13l-2.5-3M4 13l2.5-3" />
                <path d="M9 5h5M9 8h4M9 11h3" opacity="0.5" />
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
          className="bg-bg-control"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 36,
            padding: '0 12px',
            borderRadius: 10,
            width: 220,
          }}
        >
          <MagnifyingGlass size={14} weight="duotone" className="shrink-0 text-tx-secondary" />
          <input
            type="text"
            placeholder="Cari pelanggan..."
            value={list.searchQuery}
            onChange={(e) => list.setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-ts-fn text-tx-primary outline-none"
            style={{ border: 'none' }}
          />
          {list.searchQuery && (
            <button
              onClick={() => list.setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
              }}
            >
              <X size={12} weight="duotone" className="text-tx-secondary" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
