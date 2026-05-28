'use client';

import {
  CheckCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect, useMemo } from 'react';
import { SettingsCard } from './shared/SettingsCard';
import { useSalonSettings } from '@/features/dashboard/hooks/use-salon-settings';
import type {
  Service,
  ServiceQuestion,
  ServiceCategory,
} from '@/features/dashboard/types/settings.types';
import { useSalons } from '@/hooks/useSalons';
import { trpc } from '@/lib/trpc';

// Shape returned by trpc.services.getBySalon
type RawService = {
  id: string;
  name: string;
  description?: string | null;
  base_price: number;
  duration_minutes: number;
  category_id: string;
  is_active: boolean;
  requires_specialist?: boolean | null;
  service_questions?: ServiceQuestion[] | null;
  category?: {
    id: string;
    name: string;
    icon?: string | null;
    description?: string | null;
  } | null;
};

function mapRawService(raw: RawService): Service {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? undefined,
    price: raw.base_price,
    duration: raw.duration_minutes,
    categoryId: raw.category_id,
    isActive: raw.is_active,
    requires_specialist: raw.requires_specialist ?? false,
    service_questions: raw.service_questions ?? [],
  };
}

// ─── Service Edit Modal ───────────────────────────────────────────────────────

interface ServiceModalProps {
  service: Service | null; // null = new service
  categoryId: string;
  isSaving: boolean;
  onSave: (data: Omit<Service, 'id'>) => void;
  onClose: () => void;
}

function ServiceModal({ service, categoryId, isSaving, onSave, onClose }: ServiceModalProps) {
  const [name, setName] = useState(service?.name ?? '');
  const [description, setDescription] = useState(service?.description ?? '');
  const [price, setPrice] = useState(String(service?.price ?? ''));
  const [duration, setDuration] = useState(String(service?.duration ?? ''));
  const [requiresSpecialist, setRequiresSpecialist] = useState(
    service?.requires_specialist ?? false
  );
  const [questions, setQuestions] = useState<ServiceQuestion[]>(service?.service_questions ?? []);

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { id: `q-${Date.now()}`, question: '', type: 'chips', required: false, options: [] },
    ]);
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, patch: Partial<ServiceQuestion>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function addOption(questionId: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, options: [...q.options, ''] } : q))
    );
  }

  function updateOption(questionId: string, idx: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.map((o, i) => (i === idx ? value : o)) }
          : q
      )
    );
  }

  function removeOption(questionId: string, idx: number) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, options: q.options.filter((_, i) => i !== idx) } : q
      )
    );
  }

  function handleSave() {
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price) || 0,
      duration: Number(duration) || 0,
      categoryId,
      isActive: service?.isActive ?? true,
      requires_specialist: requiresSpecialist,
      service_questions: requiresSpecialist ? questions : [],
    });
  }

  const canSave = name.trim().length > 0 && Number(price) >= 0 && Number(duration) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative mx-4 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e6] px-6 py-4">
          <h2 className="text-[16px] font-semibold text-[#1a1a1a]">
            {service ? 'Edit Layanan' : 'Tambah Layanan'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-[#f0f0ee]"
          >
            <XMarkIcon className="h-5 w-5 text-[#666]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#999]">
              Nama Layanan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Haircut & Blow Dry"
              className="w-full rounded-xl border border-[#e8e8e6] bg-[#fafaf8] px-3 py-2.5 text-[13px] text-[#1a1a1a] transition-colors placeholder:text-[#bbb] focus:border-[#1a1a1a] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#999]">
              Deskripsi <span className="font-normal normal-case text-[#bbb]">(opsional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Deskripsi singkat layanan..."
              className="w-full resize-none rounded-xl border border-[#e8e8e6] bg-[#fafaf8] px-3 py-2.5 text-[13px] text-[#1a1a1a] transition-colors placeholder:text-[#bbb] focus:border-[#1a1a1a] focus:outline-none"
            />
          </div>

          {/* Price + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#999]">
                Harga (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150000"
                className="w-full rounded-xl border border-[#e8e8e6] bg-[#fafaf8] px-3 py-2.5 text-[13px] text-[#1a1a1a] transition-colors placeholder:text-[#bbb] focus:border-[#1a1a1a] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#999]">
                Durasi (menit)
              </label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                className="w-full rounded-xl border border-[#e8e8e6] bg-[#fafaf8] px-3 py-2.5 text-[13px] text-[#1a1a1a] transition-colors placeholder:text-[#bbb] focus:border-[#1a1a1a] focus:outline-none"
              />
            </div>
          </div>

          {/* Requires Specialist Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-[#e8e8e6] bg-[#fafaf8] p-3">
            <div>
              <p className="text-[13px] font-medium text-[#1a1a1a]">Butuh Detail Sebelum Booking</p>
              <p className="mt-0.5 text-[12px] text-[#999]">
                Tampilkan form pertanyaan ke pelanggan sebelum memilih stylist
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRequiresSpecialist((v) => !v)}
              className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${
                requiresSpecialist ? 'bg-[#16a34a]' : 'bg-[#d1d5db]'
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  requiresSpecialist ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Service Questions */}
          {requiresSpecialist && (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#999]">
                Pertanyaan untuk Pelanggan
              </p>

              {questions.map((q, qi) => (
                <div
                  key={q.id}
                  className="space-y-2.5 rounded-xl border border-[#e8e8e6] bg-[#fafaf8] p-3"
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                      placeholder={`Pertanyaan ${qi + 1}`}
                      className="flex-1 rounded-lg border border-[#e8e8e6] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] transition-colors placeholder:text-[#bbb] focus:border-[#1a1a1a] focus:outline-none"
                    />
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-white"
                    >
                      <TrashIcon className="h-4 w-4 text-red-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Type selector */}
                    <div className="flex overflow-hidden rounded-lg border border-[#e8e8e6] text-[12px] font-medium">
                      {(['chips', 'photo'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => updateQuestion(q.id, { type: t })}
                          className={`px-3 py-1.5 transition-colors ${
                            q.type === t
                              ? 'bg-[#1a1a1a] text-white'
                              : 'bg-white text-[#666] hover:bg-[#f0f0ee]'
                          }`}
                        >
                          {t === 'chips' ? 'Pilihan' : 'Foto'}
                        </button>
                      ))}
                    </div>

                    {/* Required toggle */}
                    <label className="flex cursor-pointer select-none items-center gap-1.5 text-[12px] text-[#666]">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                        className="rounded"
                      />
                      Wajib
                    </label>
                  </div>

                  {/* Options (chips type only) */}
                  {q.type === 'chips' && (
                    <div className="space-y-1.5">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(q.id, oi, e.target.value)}
                            placeholder={`Opsi ${oi + 1}`}
                            className="flex-1 rounded-lg border border-[#e8e8e6] bg-white px-3 py-1.5 text-[12px] text-[#1a1a1a] transition-colors placeholder:text-[#bbb] focus:border-[#1a1a1a] focus:outline-none"
                          />
                          <button
                            onClick={() => removeOption(q.id, oi)}
                            className="p-1 text-[#bbb] transition-colors hover:text-red-400"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(q.id)}
                        className="text-[12px] font-medium text-[#16a34a] hover:underline"
                      >
                        + Tambah opsi
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={addQuestion}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#16a34a] hover:underline"
              >
                <PlusIcon className="h-4 w-4" />
                Tambah pertanyaan
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e6] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-[13px] font-medium text-[#666] transition-colors hover:bg-[#f0f0ee]"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className="flex min-w-[80px] items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              'Simpan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Edit Modal ──────────────────────────────────────────────────────

interface CategoryModalProps {
  category: { id: string; name: string; icon?: string; description?: string } | null;
  onSave: (data: { name: string; icon?: string; description?: string }) => void;
  onClose: () => void;
}

function CategoryModal({ category, onSave, onClose }: CategoryModalProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState(category?.icon ?? '');
  const [description, setDescription] = useState(category?.description ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e8e8e6] px-6 py-4">
          <h2 className="text-[16px] font-semibold text-[#1a1a1a]">
            {category ? 'Edit Kategori' : 'Tambah Kategori'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-[#f0f0ee]"
          >
            <XMarkIcon className="h-5 w-5 text-[#666]" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#999]">
              Nama Kategori
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Rambut"
              className="w-full rounded-xl border border-[#e8e8e6] bg-[#fafaf8] px-3 py-2.5 text-[13px] text-[#1a1a1a] transition-colors placeholder:text-[#bbb] focus:border-[#1a1a1a] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#999]">
                Ikon (emoji)
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="✂️"
                className="w-full rounded-xl border border-[#e8e8e6] bg-[#fafaf8] px-3 py-2.5 text-[13px] text-[#1a1a1a] transition-colors placeholder:text-[#bbb] focus:border-[#1a1a1a] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#999]">
                Deskripsi
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Opsional"
                className="w-full rounded-xl border border-[#e8e8e6] bg-[#fafaf8] px-3 py-2.5 text-[13px] text-[#1a1a1a] transition-colors placeholder:text-[#bbb] focus:border-[#1a1a1a] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e6] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-[13px] font-medium text-[#666] transition-colors hover:bg-[#f0f0ee]"
          >
            Batal
          </button>
          <button
            onClick={() =>
              onSave({
                name: name.trim(),
                icon: icon || undefined,
                description: description.trim() || undefined,
              })
            }
            disabled={!name.trim()}
            className="rounded-xl bg-[#1a1a1a] px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

type ServiceModal =
  | { type: 'edit'; service: Service; categoryId: string }
  | { type: 'add'; categoryId: string };

type CategoryModalState =
  | { type: 'edit'; category: { id: string; name: string; icon?: string; description?: string } }
  | { type: 'add' };

type Toast = { type: 'success' | 'error'; message: string };

export function ServicesSection() {
  // Keep useSalonSettings only for category CRUD (add/update/delete) — not for list data
  const { addServiceCategory, updateServiceCategory, deleteServiceCategory } = useSalonSettings();

  // Real data sources
  const { salons, isLoading: salonsLoading } = useSalons();
  const salonId = salons[0]?.id ?? '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

  console.log('[ServicesSection] salons:', salons, 'salonId:', salonId);

  const {
    data: rawServices,
    isLoading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
  } = trpc.services.getBySalon.useQuery({ salonId }, { enabled: !!salonId });

  console.log('[ServicesSection] query:', { rawServices, servicesLoading, servicesError });

  const updateServiceMutation = trpc.services.update.useMutation();

  // Derive categories and mapped services from real data
  const services: Service[] = useMemo(
    () => ((rawServices ?? []) as RawService[]).map(mapRawService),
    [rawServices]
  );

  const serviceCategories: ServiceCategory[] = useMemo(() => {
    const seen = new Set<string>();
    const cats: ServiceCategory[] = [];
    for (const raw of (rawServices ?? []) as RawService[]) {
      if (raw.category && !seen.has(raw.category.id)) {
        seen.add(raw.category.id);
        cats.push({
          id: raw.category.id,
          name: raw.category.name,
          icon: raw.category.icon ?? undefined,
          description: raw.category.description ?? undefined,
        });
      }
    }
    return cats;
  }, [rawServices]);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [serviceModal, setServiceModal] = useState<ServiceModal | null>(null);
  const [categoryModal, setCategoryModal] = useState<CategoryModalState | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  // Auto-expand first category once data loads
  useEffect(() => {
    if (serviceCategories.length > 0 && !expandedCategory) {
      setExpandedCategory(serviceCategories[0].id);
    }
  }, [serviceCategories, expandedCategory]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (servicesError) {
    return (
      <SettingsCard title="Layanan & Kategori" description="Kelola layanan dan kategori">
        <div className="rounded-lg bg-red-50 p-4 text-[13px] text-red-600">
          <p>Error: {servicesError.message}</p>
        </div>
      </SettingsCard>
    );
  }

  if (salonsLoading || servicesLoading) {
    return (
      <SettingsCard title="Layanan & Kategori" description="Kelola layanan dan kategori">
        <div className="animate-pulse space-y-4">
          <div className="h-10 rounded bg-[#f0f0ee]"></div>
          <div className="h-10 rounded bg-[#f0f0ee]"></div>
          <div className="h-10 rounded bg-[#f0f0ee]"></div>
        </div>
      </SettingsCard>
    );
  }

  const handleSaveService = async (data: Omit<Service, 'id'>) => {
    if (!serviceModal) return;

    if (serviceModal.type === 'edit') {
      try {
        await updateServiceMutation.mutateAsync({
          id: serviceModal.service.id,
          name: data.name,
          description: data.description,
          base_price: data.price,
          duration_minutes: data.duration,
          requires_specialist: data.requires_specialist ?? false,
          service_questions: data.service_questions ?? [],
        });
        await refetchServices();
        setToast({ type: 'success', message: 'Layanan berhasil disimpan' });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal menyimpan layanan';
        setToast({ type: 'error', message: msg });
        return;
      }
    }
    setServiceModal(null);
  };

  const handleSaveCategory = async (data: {
    name: string;
    icon?: string;
    description?: string;
  }) => {
    if (!categoryModal) return;
    if (categoryModal.type === 'edit') {
      await updateServiceCategory(categoryModal.category.id, {
        ...categoryModal.category,
        ...data,
      });
    } else {
      await addServiceCategory(data);
    }
    setCategoryModal(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Hapus kategori ini? Layanan yang terkait akan tetap ada.')) {
      deleteServiceCategory(id);
    }
  };

  const handleDeleteService = (_id: string) => {
    if (confirm('Hapus layanan ini?')) {
      // TODO: wire delete mutation when ready
    }
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] font-medium shadow-lg transition-all ${
            toast.type === 'success' ? 'bg-[#16a34a] text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' && <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />}
          {toast.message}
        </div>
      )}

      {serviceModal && (
        <ServiceModal
          service={serviceModal.type === 'edit' ? serviceModal.service : null}
          categoryId={serviceModal.categoryId}
          isSaving={updateServiceMutation.isLoading}
          onSave={handleSaveService}
          onClose={() => setServiceModal(null)}
        />
      )}
      {categoryModal && (
        <CategoryModal
          category={categoryModal.type === 'edit' ? categoryModal.category : null}
          onSave={handleSaveCategory}
          onClose={() => setCategoryModal(null)}
        />
      )}

      <div className="space-y-6">
        {/* Categories Section */}
        <SettingsCard title="Kategori Layanan" description="Kelompokkan layanan salon kamu">
          <div className="mb-4 space-y-3">
            {serviceCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg border border-[#e8e8e6] bg-[#f9f9f7] p-4 transition-colors hover:border-[#ddd]"
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
                  <button
                    onClick={() => setCategoryModal({ type: 'edit', category })}
                    className="rounded-lg p-2 transition-colors hover:bg-white"
                  >
                    <PencilIcon className="h-4 w-4 text-[#666]" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="rounded-lg p-2 transition-colors hover:bg-white"
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCategoryModal({ type: 'add' })}
            className="flex items-center gap-2 rounded-lg bg-[#16a34a] px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-[#15923f]"
          >
            <PlusIcon className="h-4 w-4" />
            Tambah Kategori
          </button>
        </SettingsCard>

        {/* Services Section */}
        <SettingsCard title="Daftar Layanan" description="Kelola semua layanan yang ditawarkan">
          <div className="space-y-4">
            {serviceCategories.map((category) => {
              const categoryServices = services.filter((s) => s.categoryId === category.id);
              const isExpanded = expandedCategory === category.id;

              return (
                <div
                  key={category.id}
                  className="overflow-hidden rounded-lg border border-[#e8e8e6]"
                >
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="flex w-full items-center justify-between bg-[#f9f9f7] p-4 transition-colors hover:bg-[#f5f5f3]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon || '✨'}</span>
                      <div className="text-left">
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">{category.name}</p>
                        <p className="text-[12px] text-[#999]">{categoryServices.length} layanan</p>
                      </div>
                    </div>
                    <div className="text-[#666]">{isExpanded ? '−' : '+'}</div>
                  </button>

                  {isExpanded && (
                    <div className="space-y-3 bg-white p-4">
                      {categoryServices.length === 0 ? (
                        <p className="py-4 text-center text-[12px] text-[#999]">
                          Belum ada layanan di kategori ini
                        </p>
                      ) : (
                        categoryServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between rounded-lg border border-[#e8e8e6] bg-[#f9f9f7] p-3 hover:border-[#ddd]"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-[13px] font-medium text-[#1a1a1a]">
                                  {service.name}
                                </p>
                                {service.requires_specialist && (
                                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                    Detail
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-[12px] text-[#999]">
                                Rp {service.price.toLocaleString('id-ID')} · {service.duration}{' '}
                                menit
                              </p>
                              {service.description && (
                                <p className="mt-1.5 line-clamp-2 text-[12px] text-[#666]">
                                  {service.description}
                                </p>
                              )}
                            </div>
                            <div className="ml-3 flex flex-shrink-0 items-center gap-2">
                              <button
                                onClick={() =>
                                  setServiceModal({
                                    type: 'edit',
                                    service,
                                    categoryId: category.id,
                                  })
                                }
                                className="rounded-lg p-2 transition-colors hover:bg-white"
                              >
                                <PencilIcon className="h-4 w-4 text-[#666]" />
                              </button>
                              <button
                                onClick={() => handleDeleteService(service.id)}
                                className="rounded-lg p-2 transition-colors hover:bg-white"
                              >
                                <TrashIcon className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                      <button
                        onClick={() => setServiceModal({ type: 'add', categoryId: category.id })}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f0f0ee] p-3 text-[13px] font-medium text-[#666] transition-all duration-200 hover:bg-[#e8e8e6]"
                      >
                        <PlusIcon className="h-4 w-4" />
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
    </>
  );
}
