'use client';

import { usePathname } from 'next/navigation';

const PAGE_LABELS: Record<string, string> = {
  '/dashboard/overview': 'Overview',
  '/dashboard/bookings': 'Bookings',
  '/dashboard/schedule': 'Jadwal',
  '/dashboard/clients': 'Klien',
  '/dashboard/settings': 'Pengaturan',
};

function HomeIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.5 6L6.5 1.5 11.5 6V11.5a.5.5 0 01-.5.5H8.5V8H4.5v4H2a.5.5 0 01-.5-.5V6z" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 2l3 3-3 3" />
    </svg>
  );
}

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const pageLabel = (pathname ? PAGE_LABELS[pathname] : null) ?? 'Dashboard';

  return (
    <div className="flex h-[40px] flex-shrink-0 items-center gap-[6px] border-b border-sep bg-surface px-6">
      <span className="text-label3">
        <HomeIcon />
      </span>
      <span className="text-label3">
        <ChevronRight />
      </span>
      <span className="text-[12px] text-label3">Rara Beauty</span>
      <span className="text-label3">
        <ChevronRight />
      </span>
      <span className="text-[12px] font-medium text-label">{pageLabel}</span>
    </div>
  );
}
