import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../../tests/test-utils';
import { CategoryGrid } from './CategoryGrid';
import type { Category } from '../../types/booking.types';

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Potong Rambut', description: 'Desc', color: 'bg-c-peach', blobColor: '#f5c4ab', icon: '✂️' },
  { id: 'cat-2', name: 'Coloring', description: 'Desc', color: 'bg-c-blue', blobColor: '#b8d6f0', icon: '🎨' },
];

describe('CategoryGrid', () => {
  it('renders all categories', () => {
    render(<CategoryGrid categories={mockCategories} selectedCategory={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    expect(screen.getByText('Coloring')).toBeInTheDocument();
  });

  it('calls onSelect with category when clicked', () => {
    const onSelect = vi.fn();
    render(<CategoryGrid categories={mockCategories} selectedCategory={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Potong Rambut' }));
    expect(onSelect).toHaveBeenCalledWith(mockCategories[0]);
  });
});
