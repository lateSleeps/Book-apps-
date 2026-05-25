'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { DashboardSidebar } from '@/features/dashboard/components/sidebar/DashboardSidebar';
import { MobileHeader } from '@/features/dashboard/components/mobile-header/MobileHeader';
import { MobileDrawer } from '@/features/dashboard/components/mobile-drawer/MobileDrawer';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#fafaf8' }}>
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Mobile Drawer (hidden for now, focus on content) */}
      {/* <MobileHeader onMenuOpen={() => setIsSidebarOpen(true)} />
      <MobileDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} /> */}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
