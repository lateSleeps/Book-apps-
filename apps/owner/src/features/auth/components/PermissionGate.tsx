'use client';

/**
 * Permission Gate Component
 * Conditionally renders content based on user permissions
 * Usage:
 *   <PermissionGate requires="manage_bookings">
 *     <ManageBookingsButton />
 *   </PermissionGate>
 */

import React from 'react';
import type { Permission } from '../types/permissions.types';
import { useHasPermission, useHasAnyPermission, useHasAllPermissions } from '../hooks/useAuth';

interface PermissionGateProps {
  children: React.ReactNode;
  requires?: Permission | Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  requires,
  requireAll = false,
  fallback = null,
}: PermissionGateProps) {
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
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Variant: Disables content instead of hiding it
 * Shows a tooltip or hint about missing permissions
 */
interface DisableablePermissionGateProps extends PermissionGateProps {
  disabledTitle?: string;
}

export function DisableablePermissionGate({
  children,
  requires,
  requireAll = false,
  disabledTitle = 'Anda tidak memiliki izin untuk mengakses fitur ini',
}: DisableablePermissionGateProps) {
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
    return (
      <div title={disabledTitle} className="opacity-50 cursor-not-allowed">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
