import type { ReactNode } from 'react';

interface BookingLayoutProps {
  children: ReactNode;
}

export default function BookingLayout({ children }: BookingLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-start justify-center md:pt-10 md:px-4">
      <div className={[
        'relative w-full max-w-[480px] bg-bg',
        'flex flex-col',
        'h-screen md:h-[calc(100vh-40px)]',
        'md:rounded-t-[28px] md:overflow-hidden',
        'md:shadow-[0_12px_48px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.06)]',
        'md:ring-1 md:ring-black/[0.06]',
      ].join(' ')}>
        {children}
      </div>
    </div>
  );
}
