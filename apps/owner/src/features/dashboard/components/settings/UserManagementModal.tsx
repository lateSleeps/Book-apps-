'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

import type { User } from '@/features/auth/types/auth.types';
import { ROLE_PERMISSIONS_MAP } from '@/features/auth/utils/role-permissions';

interface UserManagementModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  user?: User;
  onClose: () => void;
  onSave: (user: User) => void;
}

export function UserManagementModal({ isOpen, mode, user, onClose, onSave }: UserManagementModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'STAFF',
    phone: '',
    isActive: true,
  });

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData(user);
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'STAFF',
        phone: '',
        isActive: true,
      });
    }
  }, [mode, user, isOpen]);

  const roles = ['OWNER', 'MANAGER', 'STYLIST', 'STAFF'] as const;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as User['role'];
    setFormData({
      ...formData,
      role: newRole,
      permissions: ROLE_PERMISSIONS_MAP[newRole],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role) {
      alert('Mohon isi semua field yang wajib');
      return;
    }

    const newUser: User = {
      id: mode === 'add' ? `user-${Date.now()}` : (user?.id || ''),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: ROLE_PERMISSIONS_MAP[formData.role],
      phone: formData.phone || '',
      isActive: formData.isActive ?? true,
      salonId: user?.salonId || 'salon-001',
      joinDate: user?.joinDate || (new Date().toISOString().split('T')[0] as string),
      avatar: user?.avatar || '👤',
    };

    onSave(newUser);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#e8e8e6] flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#1a1a1a]">
            {mode === 'add' ? 'Tambah Pengguna' : 'Edit Pengguna'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#f0f0ee] rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-[#666]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-medium text-[#666] mb-2">
              Nama <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nama pengguna"
              className="w-full px-3 py-2 border border-[#e8e8e6] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[12px] font-medium text-[#666] mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              className="w-full px-3 py-2 border border-[#e8e8e6] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-[12px] font-medium text-[#666] mb-2">
              Peran <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role || 'STAFF'}
              onChange={handleRoleChange}
              className="w-full px-3 py-2 border border-[#e8e8e6] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role === 'OWNER'
                    ? 'Pemilik'
                    : role === 'MANAGER'
                      ? 'Manajer'
                      : role === 'STYLIST'
                        ? 'Stylist'
                        : 'Staf'}
                </option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[12px] font-medium text-[#666] mb-2">
              Nomor Telepon
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+62812345678"
              className="w-full px-3 py-2 border border-[#e8e8e6] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive ?? true}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-[#e8e8e6] text-[#16a34a] focus:ring-[#16a34a]"
            />
            <label htmlFor="isActive" className="text-[13px] font-medium text-[#1a1a1a]">
              Pengguna Aktif
            </label>
          </div>

          {/* Permission Info */}
          {formData.role && (
            <div className="bg-[#f9f9f7] border border-[#e8e8e6] rounded-lg p-3 mt-4">
              <p className="text-[11px] text-[#666]">
                <span className="font-medium">
                  Izin untuk peran &quot;
                  {formData.role === 'OWNER'
                    ? 'Pemilik'
                    : formData.role === 'MANAGER'
                      ? 'Manajer'
                      : formData.role === 'STYLIST'
                        ? 'Stylist'
                        : 'Staf'}
                  &quot;:{' '}
                </span>
                {formData.role === 'OWNER'
                  ? 'Akses penuh ke semua fitur'
                  : formData.role === 'MANAGER'
                    ? 'Akses hampir semua fitur kecuali manajemen pengguna dan peran'
                    : formData.role === 'STYLIST'
                      ? 'Akses terbatas untuk jadwal dan pemesanan'
                      : 'Akses view-only untuk fitur utama'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#e8e8e6] rounded-lg text-[13px] font-medium text-[#1a1a1a] hover:bg-[#f9f9f7] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#16a34a] text-white rounded-lg text-[13px] font-medium hover:bg-[#15923f] transition-colors"
            >
              {mode === 'add' ? 'Tambah' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
