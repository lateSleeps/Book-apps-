import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '../../../../../tests/test-utils';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders title', () => {
    render(<Toast title="Berhasil!" />);
    expect(screen.getByText('Berhasil!')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<Toast title="Info" description="Ini deskripsi" />);
    expect(screen.getByText('Ini deskripsi')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    render(<Toast title="Info" />);
    expect(screen.queryByText('Ini deskripsi')).not.toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(<Toast title="Info" onClose={handleClose} />);
    fireEvent.click(screen.getByLabelText('Tutup'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when onClose is not provided', () => {
    render(<Toast title="Info" />);
    expect(screen.queryByLabelText('Tutup')).not.toBeInTheDocument();
  });
});
