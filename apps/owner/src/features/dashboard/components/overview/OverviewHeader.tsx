'use client';

import { House } from '@phosphor-icons/react';
import { AddVisitDropdown } from './AddVisitDropdown';

interface OverviewHeaderProps {
  greeting: string;
  userName: string;
  isMobile: boolean;
  walkIn: {
    addDropdownOpen: boolean;
    setAddDropdownOpen: (open: boolean) => void;
    openDrawer: (type: 'WALK_IN' | 'BOOKING') => void;
    setDrawerServiceOpen: (open: boolean) => void;
    setDrawerServiceSearch: (q: string) => void;
  };
}

export function OverviewHeader({ greeting, userName, isMobile, walkIn }: OverviewHeaderProps) {
  return (
    <div className="greeting-section-mobile flex items-center justify-between gap-4">
      <div className="greeting-text-mobile flex flex-col gap-s32">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5">
          <House size={18} weight="duotone" className="text-tx-secondary" />
          <span className="text-ts-fn text-tx-secondary">Dashboard</span>
          <span className="text-ts-fn text-tx-muted">/</span>
          <span className="text-ts-fn font-medium text-tx-subtle">Overview</span>
        </div>

        {/* Greeting */}
        <h1 className="m-0 text-t32 font-bold leading-tight text-tx-primary">
          {greeting || 'Halo'}, {userName} 👋
        </h1>
      </div>

      <AddVisitDropdown
        addDropdownOpen={walkIn.addDropdownOpen}
        setAddDropdownOpen={walkIn.setAddDropdownOpen}
        openDrawer={walkIn.openDrawer}
        setDrawerServiceOpen={walkIn.setDrawerServiceOpen}
        setDrawerServiceSearch={walkIn.setDrawerServiceSearch}
        isMobile={isMobile}
      />
    </div>
  );
}
