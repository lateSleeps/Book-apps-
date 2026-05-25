import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../../tests/test-utils';
import { NavigationButtons } from './NavigationButtons';

describe('NavigationButtons', () => {
  it('renders primary button', () => {
    render(<NavigationButtons primaryLabel="Lanjut" onPrimary={vi.fn()} />);
    expect(screen.getByText('Lanjut')).toBeInTheDocument();
  });

  it('calls onPrimary when clicked', () => {
    const onPrimary = vi.fn();
    render(<NavigationButtons primaryLabel="Lanjut" onPrimary={onPrimary} />);
    fireEvent.click(screen.getByText('Lanjut'));
    expect(onPrimary).toHaveBeenCalledOnce();
  });

  it('primary button disabled when primaryDisabled', () => {
    render(<NavigationButtons primaryLabel="Lanjut" onPrimary={vi.fn()} primaryDisabled />);
    expect(screen.getByRole('button', { name: 'Lanjut' })).toBeDisabled();
  });

  it('shows back button when showBack=true', () => {
    render(
      <NavigationButtons primaryLabel="Lanjut" onPrimary={vi.fn()} showBack onBack={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: 'Kembali' })).toBeInTheDocument();
  });
});
