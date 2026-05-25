'use client';

import { useState } from 'react';
import { useSalonSettings } from '@/features/dashboard/hooks/use-salon-settings';
import { SettingsCard } from './shared/SettingsCard';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export function ServicesSection() {
  const { settings, loading, error, deleteServiceCategory, deleteService } = useSalonSettings();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    settings?.serviceCategories[0]?.id || null
  );

  if (error) {
    return (
      <SettingsCard title="Layanan & Kategori" description="Kelola layanan dan kategori">
        <div className="text-red-600 text-[13px] p-4 bg-red-50 rounded-lg">
          <p>Error: {error}</p>
        </div>
      </SettingsCard>
    );
  }

  if (loading || !settings) {
    return (
      <SettingsCard title="Layanan & Kategori" description="Kelola layanan dan kategori">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
        </div>
      </SettingsCard>
    );
  }

  const { serviceCategories, services } = settings;

  const handleDeleteCategory = (id: string) => {
    if (confirm('Hapus kategori ini? Layanan yang terkait akan tetap ada.')) {
      deleteServiceCategory(id);
    }
  };

  const handleDeleteService = (id: string) => {
    if (confirm('Hapus layanan ini?')) {
      deleteService(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <SettingsCard
        title="Kategori Layanan"
        description="Kelompokkan layanan salon kamu"
      >
        <div className="space-y-3 mb-4">
          {serviceCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 bg-[#f9f9f7] rounded-lg border border-[#e8e8e6] hover:border-[#ddd] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon || '✨'}</span>
                <div>
                  <p className="text-[13px] font-medium text-[#1a1a1a]">{category.name}</p>
                  {category.description && (
                    <p className="text-[12px] text-[#999]">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white rounded-lg transition-colors">
                  <PencilIcon className="w-4 h-4 text-[#666]" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px] bg-[#16a34a] text-white hover:bg-[#15923f] transition-all duration-200">
          <PlusIcon className="w-4 h-4" />
          Tambah Kategori
        </button>
      </SettingsCard>

      {/* Services Section */}
      <SettingsCard
        title="Daftar Layanan"
        description="Kelola semua layanan yang ditawarkan"
      >
        <div className="space-y-4">
          {serviceCategories.map((category) => {
            const categoryServices = services.filter(s => s.categoryId === category.id);
            const isExpanded = expandedCategory === category.id;

            return (
              <div key={category.id} className="border border-[#e8e8e6] rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  className="w-full flex items-center justify-between p-4 bg-[#f9f9f7] hover:bg-[#f5f5f3] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category.icon || '✨'}</span>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-[#1a1a1a]">{category.name}</p>
                      <p className="text-[12px] text-[#999]">{categoryServices.length} layanan</p>
                    </div>
                  </div>
                  <div className="text-[#666]">
                    {isExpanded ? '−' : '+'}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 space-y-3 bg-white">
                    {categoryServices.length === 0 ? (
                      <p className="text-[12px] text-[#999] text-center py-4">Belum ada layanan di kategori ini</p>
                    ) : (
                      categoryServices.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between p-3 bg-[#f9f9f7] rounded-lg border border-[#e8e8e6] hover:border-[#ddd]"
                        >
                          <div className="flex-1">
                            <p className="text-[13px] font-medium text-[#1a1a1a]">{service.name}</p>
                            <p className="text-[12px] text-[#999] mt-0.5">
                              Rp {service.price.toLocaleString('id-ID')}
                            </p>
                            {service.description && (
                              <p className="text-[12px] text-[#666] mt-1.5 line-clamp-2">{service.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            <button className="p-2 hover:bg-white rounded-lg transition-colors">
                              <PencilIcon className="w-4 h-4 text-[#666]" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="p-2 hover:bg-white rounded-lg transition-colors"
                            >
                              <TrashIcon className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    <button className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-lg font-medium text-[13px] bg-[#f0f0ee] text-[#666] hover:bg-[#e8e8e6] transition-all duration-200">
                      <PlusIcon className="w-4 h-4" />
                      Tambah Layanan
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
}
