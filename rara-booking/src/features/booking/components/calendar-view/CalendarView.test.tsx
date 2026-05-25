import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../../tests/test-utils';
import { CalendarView } from './CalendarView';

describe('CalendarView', () => {
  it('renders day labels', () => {
    render(<CalendarView selectedDate={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Sen')).toBeInTheDocument();
    expect(screen.getByText('Min')).toBeInTheDocument();
  });

  it('calls onSelect when a valid date is clicked', () => {
    const onSelect = vi.fn();
    render(<CalendarView selectedDate={null} onSelect={onSelect} />);
    // Find a future enabled date button
    const buttons = screen.getAllByRole('button');
    const dateButton = buttons.find((btn) => {
      const ariaLabel = btn.getAttribute('aria-label');
      return ariaLabel && ariaLabel.match(/^\d{4}-\d{2}-\d{2}$/) && !btn.hasAttribute('disabled');
    });
    if (dateButton) {
      fireEvent.click(dateButton);
      expect(onSelect).toHaveBeenCalled();
    }
  });

  it('renders month navigation buttons', () => {
    render(<CalendarView selectedDate={null} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Bulan sebelumnya' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bulan berikutnya' })).toBeInTheDocument();
  });
});
