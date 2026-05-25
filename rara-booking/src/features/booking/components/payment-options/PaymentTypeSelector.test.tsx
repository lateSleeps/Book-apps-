import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../../../tests/test-utils';
import { PaymentTypeSelector } from './PaymentTypeSelector';

const mockSetPaymentType = vi.fn();
const mockUseBookingStore = vi.fn();

vi.mock('@/features/booking/hooks/use-booking-store', () => ({
  useBookingStore: (...args: unknown[]) => mockUseBookingStore(...args),
}));

vi.mock('@/features/booking/constants/booking.constants', () => ({
  DEPOSIT_AMOUNT: 20_000,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseBookingStore.mockReturnValue({
    paymentType: null,
    totalPrice: 100_000,
    setPaymentType: mockSetPaymentType,
    service: { serviceFlow: 'TREATMENT' },
  });
});

describe('PaymentTypeSelector', () => {
  it('renders both DEPOSIT and FULL options for TREATMENT service', () => {
    render(<PaymentTypeSelector />);
    expect(screen.getByText('Deposit (DP)')).toBeInTheDocument();
    expect(screen.getByText('Lunas')).toBeInTheDocument();
  });

  it('shows only DEPOSIT option for styling service', () => {
    mockUseBookingStore.mockReturnValue({
      paymentType: null,
      totalPrice: 100_000,
      setPaymentType: mockSetPaymentType,
      service: { serviceFlow: 'STYLING_HAIR' },
    });
    render(<PaymentTypeSelector />);
    expect(screen.getByText('Deposit (DP)')).toBeInTheDocument();
    expect(screen.queryByText('Lunas')).not.toBeInTheDocument();
  });

  it('calls setPaymentType when option clicked', () => {
    render(<PaymentTypeSelector />);
    fireEvent.click(screen.getByDisplayValue('DEPOSIT'));
    expect(mockSetPaymentType).toHaveBeenCalledWith('DEPOSIT');
  });

  it('calls setPaymentType with FULL when full option clicked', () => {
    render(<PaymentTypeSelector />);
    fireEvent.click(screen.getByDisplayValue('FULL'));
    expect(mockSetPaymentType).toHaveBeenCalledWith('FULL');
  });
});
