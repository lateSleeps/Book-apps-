import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../../tests/test-utils';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with role status', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<LoadingSpinner label="Memuat..." />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Memuat...');
  });
});
