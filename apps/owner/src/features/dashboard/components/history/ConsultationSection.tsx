'use client';

import { MagnifyingGlassPlus } from '@phosphor-icons/react';
import type { ConsultationEntry } from '../../lib/parseConsultationNotes';

interface ConsultationSectionProps {
  entries: ConsultationEntry[];
  onOpenProof: (url: string, label: string) => void;
}

function isPhotoUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://');
}

function ChipAnswer({ answer }: { answer: string }) {
  const chips = answer.split(', ').filter(Boolean);
  return (
    <div className="flex flex-wrap justify-end gap-s4">
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-rF border border-bd-card bg-bg-surface px-s8 py-[3px] text-ts-cap2 text-tx-primary"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function PhotoAnswer({ url, label, onOpen }: { url: string; label: string; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group relative mt-s4 w-full overflow-hidden rounded-r12 border border-bd-card bg-bg-surface transition-colors hover:border-bd-card"
      aria-label={`Perbesar ${label}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={label}
        className="h-[100px] w-full object-cover transition-opacity group-hover:opacity-80"
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-rF bg-white/90 shadow-card">
          <MagnifyingGlassPlus size={16} weight="duotone" className="text-tx-primary" />
        </div>
      </div>
    </button>
  );
}

export function ConsultationSection({ entries, onOpenProof }: ConsultationSectionProps) {
  if (!entries.length) return null;

  return (
    <section>
      <p className="mb-s12 text-ts-cap2 font-semibold uppercase tracking-[0.06em] text-tx-secondary">
        Konsultasi
      </p>

      <dl className="flex flex-col gap-s12">
        {entries.map((entry, i) => (
          <div key={i}>
            {entry.type === 'photo' && isPhotoUrl(entry.answer) ? (
              <div>
                <dt className="mb-s4 text-ts-fn text-tx-secondary">{entry.question}</dt>
                <PhotoAnswer
                  url={entry.answer}
                  label={entry.question}
                  onOpen={() => onOpenProof(entry.answer, entry.question)}
                />
              </div>
            ) : (
              <div className="flex items-start justify-between gap-s8">
                <dt className="shrink-0 text-ts-fn text-tx-secondary">{entry.question}</dt>
                <dd className="text-right">
                  <ChipAnswer answer={entry.answer} />
                </dd>
              </div>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}
