'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { MobileDrawer } from '@/features/dashboard/components/mobile-drawer/MobileDrawer';
import { MobileHeader } from '@/features/dashboard/components/mobile-header/MobileHeader';
import { DashboardSidebar } from '@/features/dashboard/components/sidebar/DashboardSidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F2F2F7' }}>
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Mobile Drawer (hidden for now, focus on content) */}
      {/* <MobileHeader onMenuOpen={() => setIsSidebarOpen(true)} />
      <MobileDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} /> */}

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
