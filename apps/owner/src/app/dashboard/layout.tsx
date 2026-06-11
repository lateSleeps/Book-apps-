'use client';

import type { ReactNode } from 'react';
import { DashboardSidebar } from '@/features/dashboard/components/sidebar/DashboardSidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F2F2F7' }}>
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
