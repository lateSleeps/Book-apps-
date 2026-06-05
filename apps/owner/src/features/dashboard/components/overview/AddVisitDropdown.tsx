'use client';

import { PlusIcon } from '@heroicons/react/24/solid';
import { CalendarCheck, PersonSimpleWalk } from '@phosphor-icons/react';

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
    setAddDropdownOpen(false);
  }

  function openBooking() {
    openDrawer('BOOKING');
    setDrawerServiceOpen(false);
    setDrawerServiceSearch('');
    setAddDropdownOpen(false);
  }

  return (
    <div
      style={{ position: 'relative', flexShrink: 0, display: 'block' }}
      className="hidden sm:block"
    >
      {/* Trigger button */}
      <button
        onClick={() => setAddDropdownOpen(!addDropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 40,
          padding: '0 16px',
          borderRadius: 12,
          background: '#1a1a1a',
          border: 'none',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          color: 'white',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#333333')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#1a1a1a')}
      >
        <PlusIcon style={{ width: 14, height: 14 }} />
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
          style={{
            transition: 'transform 0.15s',
            transform: addDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {addDropdownOpen && (
        <>
          {/* Backdrop — tutup dropdown saat klik di luar (mobile) */}
          {isMobile && (
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 30 }}
              onClick={() => setAddDropdownOpen(false)}
            />
          )}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              zIndex: 40,
              width: 220,
              background: 'white',
              borderRadius: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              overflow: 'hidden',
              padding: 6,
            }}
          >
            {/* Walk-in */}
            <button
              onClick={openWalkIn}
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F7')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <PersonSimpleWalk
                size={20}
                weight="duotone"
                color="#1C1C1E"
                style={{ flexShrink: 0 }}
              />
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1C1E', margin: 0 }}>
                  Walk-in
                </p>
                <p style={{ fontSize: 12, color: '#8E8E93', margin: 0 }}>Datang langsung</p>
              </div>
            </button>

            {/* Divider */}
            <div style={{ height: 1, background: '#F2F2F7', margin: '2px 10px' }} />

            {/* Booking Online */}
            <button
              onClick={openBooking}
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F7')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <CalendarCheck size={20} weight="duotone" color="#1C1C1E" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1C1E', margin: 0 }}>
                  Booking Online
                </p>
                <p style={{ fontSize: 12, color: '#8E8E93', margin: 0 }}>
                  Sudah punya kode booking
                </p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
