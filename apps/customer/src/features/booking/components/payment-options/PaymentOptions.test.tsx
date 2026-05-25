import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaymentOptions } from './PaymentOptions';

vi.mock('@/features/booking/hooks/use-booking-store', () => ({
  useBookingStore: () => ({
    paymentType: null,
    totalPrice: 65_000,
    depositAmount: 20_000,
    setPaymentType: vi.fn(),
    proofImageUrl: null,
    setProofImage: vi.fn(),
    service: { id: 'svc-1', name: 'Potong Pendek', price: 65_000, duration: 30, categoryId: 'cat-1', description: '', serviceFlow: 'TREATMENT' },
  }),
}));

vi.mock('@/features/booking/constants/booking.constants', () => ({
  DEPOSIT_AMOUNT: 20_000,
}));

describe('PaymentOptions', () => {
  it('renders payment type selector', () => {
    render(<PaymentOptions />);
    expect(screen.getByText('Metode Pembayaran')).toBeInTheDocument();
  });

  it('renders deposit and full payment options', () => {
    render(<PaymentOptions />);
    expect(screen.getByText(/Deposit/)).toBeInTheDocument();
    expect(screen.getByText('Lunas')).toBeInTheDocument();
  });
});
