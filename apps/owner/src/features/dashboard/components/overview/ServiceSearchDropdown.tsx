'use client';

import { CaretDown } from '@phosphor-icons/react';
import type { WalkInFormData } from '../../types/overview.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyService = any;

interface ServiceSearchDropdownProps {
  walkInForm: WalkInFormData;
  setWalkInForm: React.Dispatch<React.SetStateAction<WalkInFormData>>;
  drawerServiceSearch: string;
  setDrawerServiceSearch: (q: string) => void;
  drawerServiceOpen: boolean;
  setDrawerServiceOpen: (open: boolean) => void;
  realServices: AnyService[];
}

export function ServiceSearchDropdown({
  walkInForm,
  setWalkInForm,
  drawerServiceSearch,
  setDrawerServiceSearch,
  drawerServiceOpen,
  setDrawerServiceOpen,
  realServices,
}: ServiceSearchDropdownProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#8E8E93',
        }}
      >
        Layanan <span style={{ color: '#ef4444' }}>*</span>
      </label>
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setDrawerServiceOpen(!drawerServiceOpen)}
          style={{
            width: '100%',
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 10,
            border: '1px solid #E5E5EA',
            background: '#F9F9FB',
            padding: '0 14px',
            fontSize: 14,
            color: walkInForm.serviceId ? '#1C1C1E' : '#C7C7CC',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'inherit',
          }}
        >
          <span>
            {walkInForm.serviceId
              ? (realServices as AnyService[]).find(
                  (s: AnyService) => s.id === walkInForm.serviceId
                )?.name
              : 'Pilih layanan...'}
          </span>
          <CaretDown
            size={12}
            weight="bold"
            color="#8E8E93"
            style={{
              flexShrink: 0,
              transform: drawerServiceOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s',
            }}
          />
        </button>

        {drawerServiceOpen && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '100%',
              marginTop: 4,
              background: 'white',
              borderRadius: 12,
              border: '1px solid #E5E5EA',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
              zIndex: 20,
              maxHeight: 280,
              overflowY: 'auto',
            }}
          >
            {/* Search input */}
            <div style={{ padding: '10px 12px 6px' }}>
              <input
                type="text"
                placeholder="Cari layanan..."
                autoFocus
                value={drawerServiceSearch}
                onChange={(e) => setDrawerServiceSearch(e.target.value)}
                style={{
                  width: '100%',
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid #E5E5EA',
                  background: '#F9F9FB',
                  padding: '0 12px',
                  fontSize: 13,
                  color: '#1C1C1E',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Options */}
            <div style={{ padding: '4px 0 8px' }}>
              {(() => {
                const q = drawerServiceSearch.toLowerCase();
                const filtered = (realServices as AnyService[]).filter(
                  (s: AnyService) =>
                    !q ||
                    s.name.toLowerCase().includes(q) ||
                    (s.categoryName ?? s.category?.name ?? '').toLowerCase().includes(q)
                );

                if (filtered.length === 0)
                  return (
                    <p
                      style={{
                        fontSize: 13,
                        color: '#8E8E93',
                        textAlign: 'center',
                        padding: '16px',
                        margin: 0,
                      }}
                    >
                      Layanan tidak ditemukan
                    </p>
                  );

                const grouped = filtered.reduce<Record<string, AnyService[]>>((acc, s) => {
                  const cat = s.categoryName ?? s.category?.name ?? 'Lainnya';
                  (acc[cat] = acc[cat] ?? []).push(s);
                  return acc;
                }, {});

                return Object.entries(grouped).map(([cat, svcs]) => (
                  <div key={cat}>
                    {!drawerServiceSearch && (
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: '#8E8E93',
                          padding: '10px 16px 4px',
                          margin: 0,
                        }}
                      >
                        {cat}
                      </p>
                    )}
                    {svcs.map((s) => {
                      const isActive = walkInForm.serviceId === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setWalkInForm((f) => ({ ...f, serviceId: s.id, stylistId: '' }));
                            setDrawerServiceSearch('');
                            setDrawerServiceOpen(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 16px',
                            border: 'none',
                            background: isActive ? '#F2F2F7' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontFamily: 'inherit',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              color: '#1C1C1E',
                              fontWeight: isActive ? 600 : 400,
                            }}
                          >
                            {s.name}
                          </span>
                          <span style={{ fontSize: 13, color: '#8E8E93' }}>{s.duration}m</span>
                        </button>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
