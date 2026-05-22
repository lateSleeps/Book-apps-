import { describe, it, expect } from 'vitest';
import { validateUploadedFile, validateDateNotPast, validateDateNotClosed } from './validation';

describe('validateUploadedFile', () => {
  it('returns null for valid jpeg file under 5MB', () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    expect(validateUploadedFile(file)).toBeNull();
  });

  it('returns null for valid png file under 5MB', () => {
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    expect(validateUploadedFile(file)).toBeNull();
  });

  it('returns error for invalid file type', () => {
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    expect(validateUploadedFile(file)).toBe('Hanya JPG dan PNG yang diterima');
  });

  it('returns error for file exceeding 5MB', () => {
    const bigContent = new Uint8Array(6 * 1024 * 1024);
    const file = new File([bigContent], 'big.jpg', { type: 'image/jpeg' });
    expect(validateUploadedFile(file)).toBe('Ukuran file maksimal 5MB');
  });
});

describe('validateDateNotPast', () => {
  it('returns null for today', () => {
    const today = new Date();
    const iso = today.toISOString().split('T')[0] ?? '';
    expect(validateDateNotPast(iso)).toBeNull();
  });

  it('returns error for past date', () => {
    expect(validateDateNotPast('2020-01-01')).toBe('Tanggal sudah lewat');
  });
});

describe('validateDateNotClosed', () => {
  it('returns error for Monday (day 1)', () => {
    // Find a Monday
    const date = new Date('2026-05-18'); // Monday
    expect(validateDateNotClosed(date.toISOString().split('T')[0] ?? '', [1])).toBe('Salon tutup di hari ini');
  });

  it('returns null for a Tuesday', () => {
    const date = new Date('2026-05-19'); // Tuesday
    expect(validateDateNotClosed(date.toISOString().split('T')[0] ?? '', [1])).toBeNull();
  });
});
