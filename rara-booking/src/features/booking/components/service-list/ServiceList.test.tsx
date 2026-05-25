import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../../tests/test-utils';
import { ServiceList } from './ServiceList';
import type { Service } from '../../types/booking.types';

const services: Service[] = [
  { id: 'svc-1', categoryId: 'cat-1', name: 'Potong Pendek', description: 'Desc', price: 65000, duration: 30, serviceFlow: 'TREATMENT' },
  { id: 'svc-2', categoryId: 'cat-1', name: 'Potong Panjang', description: 'Desc', price: 85000, duration: 45, serviceFlow: 'TREATMENT' },
];

describe('ServiceList', () => {
  it('renders all services', () => {
    render(<ServiceList services={services} selectedService={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Potong Pendek')).toBeInTheDocument();
    expect(screen.getByText('Potong Panjang')).toBeInTheDocument();
  });

  it('shows price formatted as Rupiah', () => {
    render(<ServiceList services={services} selectedService={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Rp 65.000')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<ServiceList services={services} selectedService={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Potong Pendek').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(services[0]);
  });
});
