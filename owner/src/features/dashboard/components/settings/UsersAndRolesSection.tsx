'use client';

import { useState } from 'react';
import { SettingsCard } from './shared/SettingsCard';
import { RoleBadgeWithIcon } from '@/features/auth/components/RoleBadge';
import { getAllMockUsers } from '@/features/auth/mocks/auth-mock';
import { PlusIcon, PencilIcon, TrashIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { RolePermissionMatrix } from './RolePermissionMatrix';

export function UsersAndRolesSection() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users] = useState(() => getAllMockUsers());

  const handleAddUser = () => {
    // TODO: Implement add user modal
    alert('Fitur tambah pengguna akan segera hadir');
  };

  const handleEditUser = (userId: string) => {
    // TODO: Implement edit user modal
    alert(`Edit pengguna: ${userId}`);
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (confirm(`Hapus pengguna "${name}"?`)) {
      // TODO: Implement delete user
      alert(`Pengguna ${name} dihapus`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-[#e8e8e6]">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'text-[#1a1a1a] border-[#16a34a]'
              : 'text-[#999] border-transparent hover:text-[#666]'
          }`}
        >
          Pengguna ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'text-[#1a1a1a] border-[#16a34a]'
              : 'text-[#999] border-transparent hover:text-[#666]'
          }`}
        >
          Peran & Izin
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <SettingsCard
            title="Kelola Pengguna"
            description="Tambah, edit, atau hapus pengguna salon"
          >
            <div className="mb-6">
              <button
                onClick={handleAddUser}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px] bg-[#16a34a] text-white hover:bg-[#15923f] transition-all duration-200"
              >
                <PlusIcon className="w-4 h-4" />
                Tambah Pengguna
              </button>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[13px] text-[#999]">Belum ada pengguna terdaftar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#e8e8e6] bg-[#f9f9f7]">
                      <th className="px-4 py-3 text-left font-semibold text-[#1a1a1a]">Nama</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#1a1a1a]">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#1a1a1a]">Peran</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#1a1a1a]">Kontak</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#1a1a1a]">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#1a1a1a]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-[#e8e8e6] hover:bg-[#f9f9f7] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{user.avatar}</span>
                            <span className="font-medium text-[#1a1a1a]">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#666]">{user.email}</td>
                        <td className="px-4 py-3">
                          <RoleBadgeWithIcon role={user.role} size="sm" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-[#666]">
                            {user.phone && (
                              <span className="flex items-center gap-1" title={user.phone}>
                                <PhoneIcon className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {user.isActive ? (
                            <span className="px-2 py-1 bg-green-100 rounded text-[10px] font-medium text-green-700">
                              Aktif
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-medium text-gray-700">
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditUser(user.id)}
                              className="p-2 hover:bg-white rounded-lg transition-colors"
                              title="Edit pengguna"
                            >
                              <PencilIcon className="w-4 h-4 text-[#666]" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="p-2 hover:bg-white rounded-lg transition-colors"
                              title="Hapus pengguna"
                            >
                              <TrashIcon className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-[#f9f9f7] border border-[#e8e8e6] rounded-lg p-4 mt-6">
              <p className="text-[12px] text-[#666]">
                <span className="font-medium">Info:</span> Pengguna dengan peran Pemilik memiliki
                akses penuh ke semua fitur. Manajer memiliki akses hampir semua fitur kecuali
                manajemen pengguna dan peran. Stylist dan Staf memiliki akses terbatas sesuai
                dengan peran mereka.
              </p>
            </div>
          </SettingsCard>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && <RolePermissionMatrix />}
    </div>
  );
}
