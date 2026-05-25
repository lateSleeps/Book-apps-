import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../../tests/test-utils';
import { BottomCTA } from './BottomCTA';

describe('BottomCTA', () => {
  it('renders label text', () => {
    render(<BottomCTA label="Lanjutkan" />);
    expect(screen.getByText('Lanjutkan')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<BottomCTA label="Lanjutkan" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Lanjutkan'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<BottomCTA label="Lanjutkan" onClick={handleClick} disabled />);
    fireEvent.click(screen.getByText('Lanjutkan'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies ready variant styling', () => {
    render(<BottomCTA label="Lanjutkan" variant="ready" />);
    const button = screen.getByText('Lanjutkan');
    expect(button).toHaveClass('bg-label');
  });
});
