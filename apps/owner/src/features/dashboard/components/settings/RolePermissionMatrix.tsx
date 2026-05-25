'use client';

import { SettingsCard } from './shared/SettingsCard';
import { ROLE_PERMISSIONS_MAP, getRoleDisplayName } from '@/features/auth/utils/role-permissions';
import { Permission } from '@/features/auth/types/permissions.types';
import { getPermissionDisplayName } from '@/features/auth/utils/permission.utils';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * Role Permission Matrix
 * Displays all roles and their permissions in a matrix view
 */
export function RolePermissionMatrix() {
  const roles = ['OWNER', 'MANAGER', 'STYLIST', 'STAFF'];

  // Group permissions by category
  const permissionsByCategory = {
    Dashboard: [Permission.VIEW_DASHBOARD, Permission.VIEW_STATS],
    Pemesanan: [
      Permission.VIEW_BOOKINGS,
      Permission.CREATE_BOOKING,
      Permission.EDIT_BOOKING,
      Permission.CANCEL_BOOKING,
      Permission.MANAGE_PAYMENT,
    ],
    Jadwal: [
      Permission.VIEW_SCHEDULE,
      Permission.EDIT_SCHEDULE,
      Permission.MANAGE_STAFF_SCHEDULE,
      Permission.APPROVE_SCHEDULE,
    ],
    Klien: [
      Permission.VIEW_CLIENTS,
      Permission.CREATE_CLIENT,
      Permission.EDIT_CLIENT,
      Permission.DELETE_CLIENT,
      Permission.VIEW_CLIENT_HISTORY,
    ],
    Pengaturan: [
      Permission.VIEW_SETTINGS,
      Permission.EDIT_BUSINESS_INFO,
      Permission.MANAGE_SERVICES,
      Permission.MANAGE_ADDONS,
      Permission.MANAGE_STAFF,
      Permission.MANAGE_WORKING_HOURS,
      Permission.MANAGE_POLICIES,
    ],
    Admin: [
      Permission.MANAGE_USERS,
      Permission.MANAGE_ROLES,
      Permission.VIEW_ANALYTICS,
      Permission.EXPORT_DATA,
    ],
  };

  const hasPermission = (role: string, permission: Permission): boolean => {
    const rolePerms = ROLE_PERMISSIONS_MAP[role as keyof typeof ROLE_PERMISSIONS_MAP];
    return rolePerms ? rolePerms.includes(permission) : false;
  };

  return (
    <SettingsCard
      title="Peran & Izin"
      description="Matriks izin untuk setiap peran dalam sistem"
    >
      <div className="space-y-8">
        {Object.entries(permissionsByCategory).map(([category, permissions]) => (
          <div key={category}>
            <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-4 pb-2 border-b border-[#e8e8e6]">
              {category}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-[#f9f9f7]">
                    <th className="px-4 py-2 text-left font-semibold text-[#666] min-w-[200px]">
                      Izin
                    </th>
                    {roles.map((role) => (
                      <th
                        key={role}
                        className="px-4 py-2 text-center font-semibold text-[#1a1a1a] w-[100px]"
                      >
                        <div className="text-[11px]">{getRoleDisplayName(role)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr
                      key={permission}
                      className="border-b border-[#e8e8e6] hover:bg-[#f9f9f7] transition-colors"
                    >
                      <td className="px-4 py-3 text-[#666]">
                        {getPermissionDisplayName(permission)}
                      </td>
                      {roles.map((role) => {
                        const has = hasPermission(role, permission);
                        return (
                          <td key={`${role}-${permission}`} className="px-4 py-3 text-center">
                            {has ? (
                              <CheckCircleIcon className="w-5 h-5 text-[#16a34a] mx-auto" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-[#ddd] mx-auto"></div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#f9f9f7] border border-[#e8e8e6] rounded-lg p-4 mt-8">
        <p className="text-[12px] text-[#666]">
          <span className="font-medium">Catatan:</span> Matriks ini menunjukkan izin default untuk
          setiap peran. Sistem ini dirancang untuk fleksibilitas dan dapat diperluas di masa depan
          untuk mendukung peran khusus dengan kombinasi izin yang dapat disesuaikan. Pemilik salon
          memiliki akses penuh ke semua fitur, sedangkan peran lainnya memiliki akses terbatas
          sesuai dengan tanggung jawab mereka.
        </p>
      </div>
    </SettingsCard>
  );
}
