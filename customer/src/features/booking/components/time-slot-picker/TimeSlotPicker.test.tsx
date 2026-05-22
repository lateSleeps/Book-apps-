import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../../tests/test-utils';
import { TimeSlotPicker } from './TimeSlotPicker';
import type { TimeSlot } from '../../types/booking.types';

const slots: TimeSlot[] = [
  { time: '09:00', session: 'PAGI', available: true },
  { time: '10:30', session: 'PAGI', available: false },
  { time: '12:00', session: 'SIANG', available: true },
];

describe('TimeSlotPicker', () => {
  it('renders session labels', () => {
    render(<TimeSlotPicker slots={slots} selectedTime={null} onSelect={vi.fn()} />);
    expect(screen.getByText('PAGI')).toBeInTheDocument();
    expect(screen.getByText('SIANG')).toBeInTheDocument();
  });

  it('calls onSelect when available slot clicked', () => {
    const onSelect = vi.fn();
    render(<TimeSlotPicker slots={slots} selectedTime={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: '09:00' }));
    expect(onSelect).toHaveBeenCalledWith('09:00');
  });

  it('does not call onSelect for booked slot', () => {
    const onSelect = vi.fn();
    render(<TimeSlotPicker slots={slots} selectedTime={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: '10:30 (penuh)' }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
