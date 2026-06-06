'use client';

import { CaretDown } from '@phosphor-icons/react';
import type { DashboardBooking } from '../../types/dashboard.types';
import type { WalkInFormData } from '../../types/overview.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyService = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyStylist = any;

interface StylistTimeSelectorProps {
  walkInForm: WalkInFormData;
  setWalkInForm: React.Dispatch<React.SetStateAction<WalkInFormData>>;
  expandedStylistSlots: Record<string, boolean>;
  toggleStylistSlots: (stylistId: string) => void;
  realServices: AnyService[];
  realStylists: AnyStylist[];
  effectiveBookings: DashboardBooking[];
  bookingStatusMap: Record<string, string>;
}

const ALL_SLOTS: string[] = [];
for (let h = 8; h < 20; h++) {
  ALL_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  ALL_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

export function StylistTimeSelector({
  walkInForm,
  setWalkInForm,
  expandedStylistSlots,
  toggleStylistSlots,
  realServices,
  realStylists,
  effectiveBookings,
  bookingStatusMap,
}: StylistTimeSelectorProps) {
  const today = new Date().toISOString().slice(0, 10);
  const svcDuration =
    (realServices as AnyService[]).find((s: AnyService) => s.id === walkInForm.serviceId)
      ?.duration ?? 60;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#8E8E93',
        }}
      >
        Stylist &amp; Jam <span style={{ color: '#ef4444' }}>*</span>
      </label>

      {(realStylists as AnyStylist[]).map((s: AnyService) => {
        const name = s.user?.full_name ?? s.name ?? 'Stylist';
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        const isSelected = walkInForm.stylistId === s.id;

        const todayBookings = effectiveBookings.filter(
          (b) =>
            b.stylistName === name &&
            b.date === today &&
            (bookingStatusMap[b.id] ?? b.status) !== 'CANCELLED'
        );

        const slots = ALL_SLOTS.map((time) => {
          const [h, m] = time.split(':').map(Number);
          const start = h * 60 + m;
          const end = start + svcDuration;
          const booked = todayBookings.some((b) => {
            const [bh, bm] = (b.timeSlot || '00:00').split(':').map(Number);
            const [eh, em] = (b.endTime || '00:00').split(':').map(Number);
            return start < eh * 60 + em && end > bh * 60 + bm;
          });
          return { time, available: !booked };
        });

        const availableSlots = slots.filter((sl) => sl.available);
        const isFullyBooked = availableSlots.length === 0;

        return (
          <div
            key={s.id}
            style={{
              borderRadius: 16,
              border: isSelected ? '2px solid #1C1C1E' : '1px solid #F0F0F3',
              background: 'white',
              opacity: isFullyBooked ? 0.45 : 1,
              overflow: 'hidden',
              transition: 'border 0.15s',
            }}
          >
            {/* Row: avatar + name + slot chips */}
            <div
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px' }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#c8ede2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#1C1C1E',
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>

              {/* Name + chips */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1E', margin: 0 }}>
                    {name}
                  </p>
                  {isFullyBooked ? (
                    <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 500 }}>Penuh</span>
                  ) : (
                    <span style={{ fontSize: 11, color: '#8E8E93' }}>
                      {availableSlots.length} slot
                    </span>
                  )}
                </div>

                {!isFullyBooked && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {/* Preview chips (3) or selected chip */}
                    {(isSelected
                      ? [{ time: walkInForm.time, available: true }]
                      : availableSlots.slice(0, 3)
                    ).map((sl) => (
                      <button
                        key={sl.time}
                        type="button"
                        onClick={() =>
                          setWalkInForm((f) => ({ ...f, stylistId: s.id, time: sl.time }))
                        }
                        style={{
                          padding: '6px 13px',
                          borderRadius: 999,
                          border: 'none',
                          fontSize: 13,
                          fontWeight: 600,
                          background: isSelected ? '#1C1C1E' : '#F2F2F7',
                          color: isSelected ? 'white' : '#1C1C1E',
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                          flexShrink: 0,
                        }}
                      >
                        {sl.time}
                      </button>
                    ))}

                    {/* Toggle all slots */}
                    <button
                      type="button"
                      onClick={() => toggleStylistSlots(s.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#007AFF',
                        cursor: 'pointer',
                        padding: '6px 2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        flexShrink: 0,
                      }}
                    >
                      {expandedStylistSlots[s.id] ? 'Sembunyikan' : 'Lihat semua'}
                      <CaretDown
                        size={9}
                        weight="bold"
                        color="#007AFF"
                        style={{
                          transform: expandedStylistSlots[s.id] ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.15s',
                        }}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Accordion: full slot grid */}
            {!isFullyBooked && expandedStylistSlots[s.id] && (
              <div
                style={{
                  borderTop: '1px solid #F2F2F7',
                  padding: '12px 16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {slots.map((sl) => {
                  const isChipSelected = isSelected && walkInForm.time === sl.time;
                  return (
                    <button
                      key={sl.time}
                      type="button"
                      disabled={!sl.available}
                      onClick={() =>
                        setWalkInForm((f) => ({ ...f, stylistId: s.id, time: sl.time }))
                      }
                      style={{
                        padding: '6px 13px',
                        borderRadius: 999,
                        border: 'none',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: sl.available ? 'pointer' : 'default',
                        background: isChipSelected
                          ? '#1C1C1E'
                          : sl.available
                            ? '#F2F2F7'
                            : '#F5F5F7',
                        color: isChipSelected ? 'white' : sl.available ? '#1C1C1E' : '#C7C7CC',
                        textDecoration: sl.available ? 'none' : 'line-through',
                        transition: 'all 0.12s',
                      }}
                    >
                      {sl.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
