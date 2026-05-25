'use client';

import { useEffect } from 'react';
import { DashboardSidebar } from '../sidebar/DashboardSidebar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop - Only visible on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        />
      )}

      {/* Drawer - Only visible on mobile */}
      <div
        className={`fixed left-0 top-0 h-full w-[280px] bg-[#fafaf8] z-50 md:hidden transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          boxShadow: isOpen ? '2px 0 8px rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <DashboardSidebar />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
