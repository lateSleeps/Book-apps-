'use client';

import { useSalonSettings } from '@/features/dashboard/hooks/use-salon-settings';
import { SettingsCard } from './shared/SettingsCard';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export function AddOnsSection() {
  const { settings, loading, error, deleteAddOn } = useSalonSettings();

  if (error) {
    return (
      <SettingsCard title="Produk Add-On" description="Produk tambahan yang dapat ditambahkan ke layanan utama">
        <div className="text-red-600 text-[13px] p-4 bg-red-50 rounded-lg">
          <p>Error: {error}</p>
        </div>
      </SettingsCard>
    );
  }

  if (loading || !settings) {
    return (
      <SettingsCard title="Produk Add-On" description="Produk tambahan yang dapat ditambahkan ke layanan utama">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
        </div>
      </SettingsCard>
    );
  }

  const { addOns } = settings;

  const handleDeleteAddOn = (id: string, name: string) => {
    if (confirm(`Hapus produk add-on "${name}"?`)) {
      deleteAddOn(id);
    }
  };

  // Group by category
  const groupedAddOns: Record<string, typeof addOns> = {};
  addOns.forEach((addon) => {
    const category = addon.category || 'Lainnya';
    if (!groupedAddOns[category]) {
      groupedAddOns[category] = [];
    }
    const categoryArray = groupedAddOns[category];
    if (categoryArray) {
      categoryArray.push(addon);
    }
  });

  return (
    <SettingsCard
      title="Produk Add-On"
      description="Produk tambahan yang dapat ditambahkan ke layanan utama"
    >
      <div className="mb-6">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px] bg-[#16a34a] text-white hover:bg-[#15923f] transition-all duration-200">
          <PlusIcon className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      {addOns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[13px] text-[#999]">Belum ada produk add-on terdaftar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAddOns).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-[13px] font-semibold text-[#666] mb-3 px-1">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((addon) => (
                  <div
                    key={addon.id}
                    className="p-4 bg-[#f9f9f7] border border-[#e8e8e6] rounded-lg hover:border-[#ddd] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[13px] font-semibold text-[#1a1a1a]">{addon.name}</p>
                          {addon.isActive && (
                            <span className="px-2 py-0.5 bg-green-100 rounded text-[10px] font-medium text-green-700">
                              Aktif
                            </span>
                          )}
                          {!addon.isActive && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-700">
                              Nonaktif
                            </span>
                          )}
                        </div>
                        {addon.description && (
                          <p className="text-[12px] text-[#999] mb-2">{addon.description}</p>
                        )}
                        <p className="text-[14px] font-semibold text-[#16a34a]">
                          Rp {addon.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button className="p-2 hover:bg-white rounded-lg transition-colors">
                          <PencilIcon className="w-4 h-4 text-[#666]" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddOn(addon.id, addon.name)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#f9f9f7] border border-[#e8e8e6] rounded-lg p-4 mt-6">
        <p className="text-[12px] text-[#666]">
          <span className="font-medium">Tip:</span> Add-on adalah produk atau layanan tambahan yang dapat ditambahkan ke layanan utama, seperti hair mask, nail art design, atau face mask treatment. Harga add-on akan ditambahkan ke total booking.
        </p>
      </div>
    </SettingsCard>
  );
}
