import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../../../tests/test-utils';
import { FileUploader } from './FileUploader';

const mockSetProofImage = vi.fn();
const mockUseBookingStore = vi.fn();

vi.mock('@/features/booking/hooks/use-booking-store', () => ({
  useBookingStore: (...args: unknown[]) => mockUseBookingStore(...args),
}));

global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockUseBookingStore.mockReturnValue({ proofImageUrl: null, setProofImage: mockSetProofImage });
});

describe('FileUploader', () => {
  it('renders upload area when no image', () => {
    render(<FileUploader />);
    expect(screen.getByText(/Tap atau seret file ke sini/i)).toBeInTheDocument();
  });

  it('shows error for non-image file type', () => {
    render(<FileUploader />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['x'], 'doc.pdf', { type: 'application/pdf' })] } });
    expect(screen.getByText('Hanya format JPEG dan PNG yang diizinkan.')).toBeInTheDocument();
  });

  it('shows error for file exceeding 5MB', () => {
    render(<FileUploader />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File([new Uint8Array(6 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })] } });
    expect(screen.getByText('Ukuran file maksimal 5MB.')).toBeInTheDocument();
  });

  it('calls setProofImage with blob URL for valid jpeg file', () => {
    render(<FileUploader />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['img'], 'photo.jpg', { type: 'image/jpeg' })] } });
    expect(mockSetProofImage).toHaveBeenCalledWith('blob:mock-url');
  });

  it('shows image preview when proofImageUrl is set', () => {
    mockUseBookingStore.mockReturnValue({ proofImageUrl: 'blob:test', setProofImage: mockSetProofImage });
    render(<FileUploader />);
    const img = screen.getByAltText('Bukti pembayaran') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('blob:test');
  });

  it('calls setProofImage(null) when Ganti button clicked', () => {
    mockUseBookingStore.mockReturnValue({ proofImageUrl: 'blob:test', setProofImage: mockSetProofImage });
    render(<FileUploader />);
    fireEvent.click(screen.getByText('Ganti'));
    expect(mockSetProofImage).toHaveBeenCalledWith(null);
  });
});
