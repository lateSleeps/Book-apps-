'use client';

import { X } from '@phosphor-icons/react';
import type { VisitRecord } from '../../types/history.types';
import { VisitDetailLeft } from './VisitDetailLeft';
import { VisitDetailRight } from './VisitDetailRight';

interface VisitDetailSidebarProps {
  visit: VisitRecord;
  onClose: () => void;
  onOpenProof: (url: string, label: string) => void;
}

export function VisitDetailSidebar({ visit, onClose, onOpenProof }: VisitDetailSidebarProps) {
  return (
    <div className="fixed inset-0 z-50 hidden items-center justify-end p-4 md:flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" onClick={onClose} />

      {/* Two-column floating panel */}
      <div className="relative z-10 flex h-full w-full max-w-[54rem] animate-sIn overflow-hidden rounded-r20 shadow-drawer">
        {/* Left panel — white, customer identity */}
        <div className="flex w-72 shrink-0 flex-col border-r border-bd-detail bg-bg-card">
          <VisitDetailLeft visit={visit} />
        </div>

        {/* Right panel — surface bg, scrollable content */}
        <div className="flex flex-1 flex-col bg-bg-surface">
          {/* Right panel header: service name + close */}
          <div className="flex shrink-0 items-center justify-between border-b border-bd-detail px-s20 py-s20">
            <h3 className="truncate text-ts-t2 font-bold text-tx-primary">{visit.serviceName}</h3>
            <button
              onClick={onClose}
              aria-label="Tutup detail"
              className="ml-s12 flex h-8 w-8 shrink-0 items-center justify-center rounded-r8 text-tx-secondary transition-colors hover:bg-bg-hover"
            >
              <X size={16} weight="duotone" />
            </button>
          </div>

          {/* Scrollable right content */}
          <div className="flex-1 overflow-y-auto px-s20 py-s16">
            <VisitDetailRight visit={visit} onOpenProof={onOpenProof} />
          </div>
        </div>
      </div>
    </div>
  );
}
