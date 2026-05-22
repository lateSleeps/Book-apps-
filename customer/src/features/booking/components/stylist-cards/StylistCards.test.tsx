import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StylistCards } from './StylistCards';
import type { Stylist, TimeSlot } from '@/features/booking/types/booking.types';

const mockStylists: Stylist[] = [
  {
    id: 'sty-1',
    name: 'Dewi Rahayu',
    specialty: 'Coloring & Highlight',
    avatarInitials: 'DR',
    avatarColor: '#ddedf8',
    bookedSlots: [],
  },
  {
    id: 'sty-2',
    name: 'Sinta Wulandari',
    specialty: 'Perawatan & Keratin',
    avatarInitials: 'SW',
    avatarColor: '#d8f3ec',
    bookedSlots: ['09:00', '10:30', '12:00', '14:00', '16:00', '18:00', '20:00'],
  },
];

const mockSlots: TimeSlot[] = [
  { time: '09:00', session: 'PAGI', available: true },
  { time: '10:30', session: 'PAGI', available: false },
];

const getSlotsForStylist = (stylistId: string): TimeSlot[] => {
  const stylist = mockStylists.find((s) => s.id === stylistId);
  return mockSlots.map((slot) => ({
    ...slot,
    available: !(stylist?.bookedSlots ?? []).includes(slot.time),
  }));
};

describe('StylistCards', () => {
  const baseProps = {
    stylists: mockStylists,
    selectedStylist: null,
    selectedTime: null,
    getSlotsForStylist,
    onSelectStylist: vi.fn(),
    onSelectTime: vi.fn(),
    onFullyBookedTap: vi.fn(),
  };

  it('renders all stylists', () => {
    render(<StylistCards {...baseProps} />);
    expect(screen.getByText('Dewi Rahayu')).toBeInTheDocument();
    expect(screen.getByText('Sinta Wulandari')).toBeInTheDocument();
  });

  it('calls onSelectStylist when a stylist is clicked', () => {
    const onSelectStylist = vi.fn();
    render(<StylistCards {...baseProps} onSelectStylist={onSelectStylist} />);
    fireEvent.click(screen.getByText('Dewi Rahayu'));
    expect(onSelectStylist).toHaveBeenCalledWith(mockStylists[0]);
  });
});
