'use client';

import { MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import type { BookingListState } from '../../hooks/overview/use-booking-list';
import type { VisitorTab } from '../../types/overview.types';

// Shared base style for the refresh and sort control buttons
const CTRL_BTN_BASE = {
  display: 'flex',
  alignItems: 'center',
  height: 32,
  borderRadius: 8,
  background: '#F2F2F7',
  border: 'none',
  color: '#3C3C43',
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
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: 12,
          padding: 4,
          backgroundColor: '#F2F2F7',
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
                style={{
                  whiteSpace: 'nowrap',
                  padding: '6px 14px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
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

      {/* Controls: refresh + sort + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh data"
          style={{
            ...CTRL_BTN_BASE,
            justifyContent: 'center',
            width: 32,
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            opacity: isRefreshing ? 0.5 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <ArrowPathIcon
            style={{
              width: 14,
              height: 14,
              color: '#3C3C43',
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            }}
          />
        </button>

        {/* Sort button */}
        <button
          onClick={() => list.setSortOrder(list.sortOrder === 'ASC' ? 'DESC' : 'ASC')}
          style={{
            ...CTRL_BTN_BASE,
            gap: 6,
            padding: '0 12px',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 36,
            padding: '0 12px',
            borderRadius: 10,
            background: '#F2F2F7',
            width: 220,
          }}
        >
          <MagnifyingGlassIcon style={{ width: 14, height: 14, color: '#8E8E93', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Cari pelanggan..."
            value={list.searchQuery}
            onChange={(e) => list.setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 13,
              color: '#1C1C1E',
            }}
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
              <XMarkIcon style={{ width: 12, height: 12, color: '#8E8E93' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
