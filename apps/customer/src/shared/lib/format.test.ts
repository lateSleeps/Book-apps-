import { describe, it, expect } from 'vitest';
import { formatRupiah, formatDuration, formatCountdown } from './format';

describe('formatRupiah', () => {
  it('formats 65000 correctly', () => {
    expect(formatRupiah(65000)).toBe('Rp 65.000');
  });

  it('formats 200000 correctly', () => {
    expect(formatRupiah(200000)).toBe('Rp 200.000');
  });

  it('formats 20000 correctly', () => {
    expect(formatRupiah(20000)).toBe('Rp 20.000');
  });
});

describe('formatDuration', () => {
  it('formats minutes under 60', () => {
    expect(formatDuration(30)).toBe('30 mnt');
  });

  it('formats exactly 60 minutes', () => {
    expect(formatDuration(60)).toBe('1 jam');
  });

  it('formats 90 minutes', () => {
    expect(formatDuration(90)).toBe('1 jam 30 mnt');
  });
});

describe('formatCountdown', () => {
  it('formats 300 as 05:00', () => {
    expect(formatCountdown(300)).toBe('05:00');
  });

  it('formats 65 as 01:05', () => {
    expect(formatCountdown(65)).toBe('01:05');
  });

  it('formats 0 as 00:00', () => {
    expect(formatCountdown(0)).toBe('00:00');
  });
});
