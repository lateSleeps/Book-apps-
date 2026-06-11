'use client';

import { useCallback, useState } from 'react';
import { CategoryForm } from './forms/CategoryForm';
import type { CategoryFormDraft } from './forms/CategoryForm';
import { QuestionForm } from './forms/QuestionForm';
import type { QuestionFormDraft } from './forms/QuestionForm';
import { ServiceForm } from './forms/ServiceForm';
import type { ServiceFormDraft } from './forms/ServiceForm';
import { ConsultationQuestionsSection } from './sections/ConsultationQuestionsSection';
import { ServicesAccordion } from './sections/ServicesAccordion';
import type { ConfirmPending } from '@/features/dashboard/components/settings/components/shared';
import { ConfirmDialog } from '@/features/dashboard/components/settings/components/shared';
import { SettingsSideSheet } from '@/features/dashboard/components/settings/layout';
import type {
  ServiceCategory,
  ServiceItem,
  ServiceQuestion,
} from '@/features/dashboard/components/settings/types/services.types';
import type { ServicesController } from '@/features/dashboard/hooks/settings/useServicesController';

// ── Sheet state ───────────────────────────────────────────────────────────────

type SheetState =
  | { mode: 'add-category' }
  | { mode: 'edit-category'; category: ServiceCategory }
  | { mode: 'add-service'; categoryId?: string }
  | { mode: 'edit-service'; service: ServiceItem }
  | { mode: 'add-question'; serviceId: string; serviceName: string }
  | { mode: 'edit-question'; question: ServiceQuestion; serviceName: string };

type FormDraft =
  | { kind: 'category'; value: CategoryFormDraft }
  | { kind: 'service'; value: ServiceFormDraft }
  | { kind: 'question'; value: QuestionFormDraft };

// ── Sheet title helper ────────────────────────────────────────────────────────

function sheetTitle(s: SheetState): string {
  switch (s.mode) {
    case 'add-category':
      return 'Tambah Kategori';
    case 'edit-category':
      return `Edit ${s.category.name}`;
    case 'add-service':
      return 'Tambah Layanan';
    case 'edit-service':
      return `Edit ${s.service.name}`;
    case 'add-question':
      return `Tambah Pertanyaan — ${s.serviceName}`;
    case 'edit-question':
      return 'Edit Pertanyaan';
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ServicesFormProps {
  ctrl: ServicesController;
  activeTab: string;
}

export function ServicesForm({ ctrl, activeTab }: ServicesFormProps) {
  const { domain } = ctrl;

  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [currentDraft, setDraft] = useState<FormDraft | null>(null);
  const [confirm, setConfirm] = useState<ConfirmPending | null>(null);

  function closeSheet() {
    setSheet(null);
    setDraft(null);
  }

  function openSheet(next: SheetState) {
    setDraft(null);
    setSheet(next);
  }

  function handleSave() {
    if (!currentDraft || !sheet) return;
    switch (sheet.mode) {
      case 'add-category':
        if (currentDraft.kind === 'category') ctrl.addCategory(currentDraft.value);
        break;
      case 'edit-category':
        if (currentDraft.kind === 'category')
          ctrl.updateCategory(sheet.category.id, currentDraft.value);
        break;
      case 'add-service':
        if (currentDraft.kind === 'service') ctrl.addService(currentDraft.value);
        break;
      case 'edit-service':
        if (currentDraft.kind === 'service')
          ctrl.updateService(sheet.service.id, currentDraft.value);
        break;
      case 'add-question':
        if (currentDraft.kind === 'question') ctrl.addQuestion(currentDraft.value);
        break;
      case 'edit-question':
        if (currentDraft.kind === 'question')
          ctrl.updateQuestion(sheet.question.id, currentDraft.value);
        break;
    }
    closeSheet();
  }

  // ── Stable onChange callbacks ─────────────────────────────────────────────

  const onCategoryChange = useCallback((d: CategoryFormDraft | null) => {
    setDraft(d ? { kind: 'category', value: d } : null);
  }, []);

  const onServiceChange = useCallback((d: ServiceFormDraft | null) => {
    setDraft(d ? { kind: 'service', value: d } : null);
  }, []);

  const onQuestionChange = useCallback((d: QuestionFormDraft | null) => {
    setDraft(d ? { kind: 'question', value: d } : null);
  }, []);

  // ── Delete handlers ───────────────────────────────────────────────────────

  function handleDeleteCategory(cat: ServiceCategory) {
    const serviceCount = domain.services.filter((s) => s.categoryId === cat.id).length;
    const message =
      serviceCount > 0
        ? `Kategori "${cat.name}" masih memiliki ${serviceCount} layanan. Menghapus kategori akan menghapus seluruh layanan di dalamnya. Tindakan ini tidak dapat dibatalkan.`
        : `Kategori "${cat.name}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`;

    setConfirm({
      title: 'Hapus kategori?',
      message,
      confirmLabel: 'Hapus Permanen',
      variant: 'danger',
      onConfirm: () => {
        ctrl.deleteCategory(cat.id);
        setConfirm(null);
      },
    });
  }

  function handleDeleteService(svc: ServiceItem) {
    setConfirm({
      title: 'Hapus layanan?',
      message: `Layanan "${svc.name}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: 'Hapus Permanen',
      variant: 'danger',
      onConfirm: () => {
        ctrl.deleteService(svc.id);
        setConfirm(null);
      },
    });
  }

  function handleDeleteQuestion(q: ServiceQuestion) {
    setConfirm({
      title: 'Hapus pertanyaan?',
      message: `"${q.label}" akan dihapus permanen.`,
      confirmLabel: 'Hapus',
      variant: 'danger',
      onConfirm: () => {
        ctrl.deleteQuestion(q.id);
        setConfirm(null);
      },
    });
  }

  // ── Sheet content ─────────────────────────────────────────────────────────

  function renderSheetContent() {
    if (!sheet) return null;
    switch (sheet.mode) {
      case 'add-category':
        return <CategoryForm onChange={onCategoryChange} />;
      case 'edit-category':
        return <CategoryForm initial={sheet.category} onChange={onCategoryChange} />;
      case 'add-service':
        return (
          <ServiceForm
            initial={sheet.categoryId ? { categoryId: sheet.categoryId } : undefined}
            categories={domain.categories}
            onChange={onServiceChange}
          />
        );
      case 'edit-service':
        return (
          <ServiceForm
            initial={sheet.service}
            categories={domain.categories}
            onChange={onServiceChange}
          />
        );
      case 'add-question':
        return <QuestionForm serviceId={sheet.serviceId} onChange={onQuestionChange} />;
      case 'edit-question':
        return (
          <QuestionForm
            serviceId={sheet.question.serviceId}
            initial={sheet.question}
            onChange={onQuestionChange}
          />
        );
    }
  }

  return (
    <>
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          variant={confirm.variant}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {sheet && (
        <SettingsSideSheet
          title={sheetTitle(sheet)}
          onClose={closeSheet}
          onSave={handleSave}
          canSave={currentDraft !== null}
        >
          {renderSheetContent()}
        </SettingsSideSheet>
      )}

      {activeTab === 'services' && (
        <ServicesAccordion
          categories={domain.categories}
          services={domain.services}
          onAddCategory={() => openSheet({ mode: 'add-category' })}
          onEditCategory={(cat) => openSheet({ mode: 'edit-category', category: cat })}
          onDeleteCategory={handleDeleteCategory}
          onAddService={(categoryId) => openSheet({ mode: 'add-service', categoryId })}
          onEditService={(svc) => openSheet({ mode: 'edit-service', service: svc })}
          onDeleteService={handleDeleteService}
        />
      )}

      {activeTab === 'questions' && (
        <ConsultationQuestionsSection
          services={domain.services}
          onAddQuestion={(serviceId, serviceName) =>
            openSheet({ mode: 'add-question', serviceId, serviceName })
          }
          onEditQuestion={(question, serviceName) =>
            openSheet({ mode: 'edit-question', question, serviceName })
          }
          onDeleteQuestion={handleDeleteQuestion}
        />
      )}
    </>
  );
}
