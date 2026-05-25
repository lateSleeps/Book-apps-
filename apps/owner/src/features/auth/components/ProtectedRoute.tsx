'use client';

/**
 * Protected Route Component
 * Wraps routes and sections to prevent unauthorized access
 * Shows "Access Denied" page if user lacks required permissions
 */

import React from 'react';
import type { Permission } from '../types/permissions.types';
import { useHasPermission, useHasAnyPermission, useHasAllPermissions } from '../hooks/useAuth';
import { LockClosedIcon } from '@heroicons/react/24/outline';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requires?: Permission | Permission[];
  requireAll?: boolean;
}

export function ProtectedRoute({
  children,
  requires,
  requireAll = false,
}: ProtectedRouteProps) {
  let hasAccess = false;

  if (!requires) {
    hasAccess = true;
  } else if (Array.isArray(requires)) {
    if (requireAll) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      hasAccess = useHasAllPermissions(requires);
    } else {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      hasAccess = useHasAnyPermission(requires);
    }
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    hasAccess = useHasPermission(requires);
  }

  if (!hasAccess) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
}

/**
 * Access Denied page component
 */
function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafaf8]">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
          <LockClosedIcon className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Akses Ditolak</h1>
        <p className="text-[13px] text-[#666] max-w-sm">
          Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
        </p>
        <div className="pt-4">
          <a
            href="/dashboard/overview"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px] bg-[#16a34a] text-white hover:bg-[#15923f] transition-all duration-200"
          >
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
