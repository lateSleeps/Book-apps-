import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DigitalTicket } from './DigitalTicket';

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => <div data-testid="qr-code" data-value={value} />,
}));

vi.mock('@/features/booking/hooks/use-booking-store', () => ({
  useBookingStore: () => ({
    bookingCode: 'RARA-0517-1234',
    pin: '1234',
    date: '2026-05-17',
    service: { id: 'svc-1', name: 'Potong Rambut Pendek', price: 65_000, duration: 30, categoryId: 'cat-1', description: '' },
    stylist: { id: 'sty-1', name: 'Dewi Rahayu', specialty: 'Coloring', avatarInitials: 'DR', avatarColor: '#ddedf8', bookedSlots: [] },
    timeSlot: '10:30',
    totalPrice: 65_000,
    paymentType: 'DEPOSIT',
    depositAmount: 20_000,
  }),
}));

describe('DigitalTicket', () => {
  it('renders booking code', () => {
    render(<DigitalTicket />);
    expect(screen.getAllByText('RARA-0517-1234').length).toBeGreaterThan(0);
  });

  it('renders QR code', () => {
    render(<DigitalTicket />);
    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
  });

  it('renders PIN', () => {
    render(<DigitalTicket />);
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders booking details', () => {
    render(<DigitalTicket />);
    expect(screen.getByText('Potong Rambut Pendek')).toBeInTheDocument();
    expect(screen.getByText(/Dewi Rahayu/)).toBeInTheDocument();
  });
});
