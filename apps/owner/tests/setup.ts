import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/book/rara-beauty-jakarta',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/font/google
vi.mock('next/font/google', () => ({
  DM_Sans: () => ({
    style: { fontFamily: 'DM Sans' },
    variable: '--font-dm-sans',
    className: 'dm-sans',
  }),
}));
