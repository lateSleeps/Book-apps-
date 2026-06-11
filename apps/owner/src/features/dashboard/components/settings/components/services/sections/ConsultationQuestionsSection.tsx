'use client';

import { ChatCircleText } from '@phosphor-icons/react';
import {
  EntityActionMenu,
  SettingsAddButton,
} from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsSection,
  SettingsSectionHeader,
  SettingsContentCard,
} from '@/features/dashboard/components/settings/layout';
import type {
  ServiceItem,
  ServiceQuestion,
} from '@/features/dashboard/components/settings/types/services.types';

const QUESTION_TYPE_LABEL: Record<ServiceQuestion['type'], string> = {
  chips: 'Pilihan',
  photo: 'Foto',
  text: 'Teks',
};

interface ConsultationQuestionsSectionProps {
  services: ServiceItem[];
  onAddQuestion: (serviceId: string, serviceName: string) => void;
  onEditQuestion: (question: ServiceQuestion, serviceName: string) => void;
  onDeleteQuestion: (question: ServiceQuestion) => void;
}

export function ConsultationQuestionsSection({
  services,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}: ConsultationQuestionsSectionProps) {
  const activeServices = services.filter((s) => s.isActive);

  return (
    <SettingsSection>
      <SettingsSectionHeader
        title="Pertanyaan Konsultasi"
        description="Pertanyaan yang ditampilkan saat pelanggan memilih layanan tertentu."
      />

      {activeServices.length === 0 ? (
        <SettingsContentCard>
          <p className="text-ts-fn text-tx-secondary">
            Tambah layanan terlebih dahulu sebelum mengatur pertanyaan konsultasi.
          </p>
        </SettingsContentCard>
      ) : (
        <div className="flex flex-col gap-s16">
          {activeServices.map((svc) => {
            const questions = svc.questions;
            return (
              <div
                key={svc.id}
                className="flex flex-col overflow-hidden rounded-r16 border border-bd-card bg-bg-card shadow-card"
              >
                {/* Service header */}
                <div className="flex items-center justify-between border-b border-bd-row px-s16 py-s12">
                  <div className="flex flex-col gap-s2">
                    <p className="m-0 text-ts-fn font-semibold text-tx-primary">{svc.name}</p>
                    <p className="m-0 text-ts-cap1 text-tx-muted">{questions.length} pertanyaan</p>
                  </div>
                  <SettingsAddButton onClick={() => onAddQuestion(svc.id, svc.name)}>
                    Tambah
                  </SettingsAddButton>
                </div>

                {/* Questions list */}
                {questions.length === 0 ? (
                  <div className="flex items-center gap-s12 px-s16 py-s16">
                    <ChatCircleText size={18} weight="duotone" className="shrink-0 text-tx-muted" />
                    <p className="m-0 text-ts-cap1 text-tx-secondary">
                      Belum ada pertanyaan untuk layanan ini.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-bd-row">
                    {questions.map((q) => (
                      <div key={q.id} className="flex items-center gap-s12 px-s16 py-s12">
                        {/* Type badge */}
                        <span className="shrink-0 rounded-r6 bg-bg-control px-s8 py-s4 text-ts-cap2 font-medium text-tx-secondary">
                          {QUESTION_TYPE_LABEL[q.type]}
                        </span>

                        {/* Label */}
                        <div className="flex flex-1 flex-col gap-s2 overflow-hidden">
                          <p className="m-0 truncate text-ts-fn font-medium text-tx-primary">
                            {q.label}
                          </p>
                          {q.type === 'chips' && q.options.length > 0 && (
                            <p className="m-0 truncate text-ts-cap1 text-tx-muted">
                              {q.options.join(' · ')}
                            </p>
                          )}
                        </div>

                        {/* Required badge */}
                        {q.required && (
                          <span className="shrink-0 rounded-r6 bg-ac-danger/10 px-s8 py-s4 text-ts-cap2 font-medium text-ac-danger">
                            Wajib
                          </span>
                        )}

                        {/* Kebab action menu */}
                        <EntityActionMenu
                          actions={[
                            { label: 'Edit', onClick: () => onEditQuestion(q, svc.name) },
                            {
                              label: 'Hapus',
                              variant: 'danger',
                              onClick: () => onDeleteQuestion(q),
                            },
                          ]}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SettingsSection>
  );
}
