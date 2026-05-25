import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductUpsell } from './ProductUpsell';
import type { Product } from '@/features/booking/types/booking.types';

vi.mock('@/features/booking/hooks/use-booking-store', () => ({
  useBookingStore: () => ({
    addons: [],
    addAddon: vi.fn(),
    removeAddon: vi.fn(),
  }),
}));

const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Makarizo Shampoo', description: 'Shampoo 200ml', price: 45_000, imageEmoji: '🧴' },
  { id: 'prod-2', name: "L'Oreal Conditioner", description: 'Kondisioner 175ml', price: 55_000, imageEmoji: '💧' },
];

describe('ProductUpsell', () => {
  it('renders all products', () => {
    render(<ProductUpsell products={mockProducts} />);
    expect(screen.getByText('Makarizo Shampoo')).toBeInTheDocument();
    expect(screen.getByText("L'Oreal Conditioner")).toBeInTheDocument();
  });

  it('shows add buttons for each product', () => {
    render(<ProductUpsell products={mockProducts} />);
    const addButtons = screen.getAllByLabelText(/Tambah/);
    expect(addButtons).toHaveLength(2);
  });
});
