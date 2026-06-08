import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type Cols = 1 | 2 | 3;

interface SettingsFormGridProps {
  children: ReactNode;
  cols?: Cols;
  className?: string;
}

const COLS_CLASS: Record<Cols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

export function SettingsFormGrid({ children, cols = 2, className }: SettingsFormGridProps) {
  return <div className={cn('grid gap-s16', COLS_CLASS[cols], className)}>{children}</div>;
}
