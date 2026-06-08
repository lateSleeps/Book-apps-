'use client';

import { ChatCircleText } from '@phosphor-icons/react';
import {
  SettingsListCard,
  SettingsEmptyState,
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
  onAddQuestion: (serviceId: string) => void;
}

export function ConsultationQuestionsSection({
  services,
  onAddQuestion,
}: ConsultationQuestionsSectionProps) {
  const servicesWithQuestions = services.filter((s) => s.questions.length > 0);
  const allQuestions: Array<ServiceQuestion & { serviceName: string }> =
    servicesWithQuestions.flatMap((s) => s.questions.map((q) => ({ ...q, serviceName: s.name })));

  return (
    <SettingsSection>
      <SettingsSectionHeader
        title="Pertanyaan Konsultasi"
        description="Pertanyaan yang ditampilkan saat pelanggan memilih layanan tertentu. Sumber kebenaran untuk customer app."
      />

      {services.length === 0 ? (
        <SettingsContentCard>
          <p className="text-ts-fn text-tx-secondary">
            Tambah layanan terlebih dahulu sebelum mengatur pertanyaan konsultasi.
          </p>
        </SettingsContentCard>
      ) : (
        <>
          <SettingsContentCard padding="none">
            {allQuestions.length === 0 ? (
              <SettingsEmptyState
                icon={<ChatCircleText size={24} weight="duotone" />}
                title="Belum ada pertanyaan konsultasi"
                description="Pertanyaan ditampilkan kepada pelanggan saat memilih layanan yang membutuhkan detail tambahan."
              />
            ) : (
              <div className="divide-y divide-bd-row">
                {allQuestions.map((q) => (
                  <SettingsListCard
                    key={q.id}
                    className="rounded-none border-0 shadow-none"
                    imageFallback={q.type === 'photo' ? '📷' : q.type === 'chips' ? '🔘' : '✏️'}
                    title={q.label}
                    description={q.serviceName}
                    badges={[
                      { label: QUESTION_TYPE_LABEL[q.type], variant: 'info' },
                      {
                        label: q.required ? 'Wajib' : 'Opsional',
                        variant: q.required ? 'warning' : 'default',
                      },
                    ]}
                  />
                ))}
              </div>
            )}
          </SettingsContentCard>

          <div className="flex flex-wrap gap-s8">
            {services.map((svc) => (
              <button
                key={svc.id}
                type="button"
                onClick={() => onAddQuestion(svc.id)}
                className="rounded-r10 border border-bd-card bg-bg-card px-s12 py-s8 text-ts-cap1 text-tx-control transition-colors hover:bg-bg-hover"
              >
                + Pertanyaan untuk {svc.name}
              </button>
            ))}
          </div>
        </>
      )}
    </SettingsSection>
  );
}
