import { render, screen } from '@testing-library/react';
import { BookingSummary } from './BookingSummary';
import type { Service, Stylist } from '@/features/booking/types/booking.types';

const mockService: Service = {
  id: 'svc-1',
  categoryId: 'cat-1',
  name: 'Potong Rambut Pendek',
  description: 'Potongan rapi',
  price: 65_000,
  duration: 30,
  serviceFlow: 'TREATMENT',
};

const mockStylist: Stylist = {
  id: 'sty-1',
  name: 'Dewi Rahayu',
  specialty: 'Coloring',
  avatarInitials: 'DR',
  avatarColor: '#ddedf8',
  bookedSlots: [],
};

describe('BookingSummary', () => {
  it('renders all booking details', () => {
    render(
      <BookingSummary
        date="2026-05-17"
        services={[mockService]}
        stylist={mockStylist}
        timeSlot="10:30"
        totalPrice={65_000}
      />
    );

    expect(screen.getByText('Potong Rambut Pendek')).toBeInTheDocument();
    expect(screen.getByText('Dewi Rahayu')).toBeInTheDocument();
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
    expect(screen.getByText(/30 menit/)).toBeInTheDocument();
  });

  it('renders dashes when data is null', () => {
    render(
      <BookingSummary
        date={null}
        services={[]}
        stylist={null}
        timeSlot={null}
        totalPrice={0}
      />
    );

    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
  });
});
