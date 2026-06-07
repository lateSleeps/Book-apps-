'use client';

import { buildConsultationEntries } from '../../lib/parseConsultationNotes';
import type { VisitRecord } from '../../types/history.types';
import { AddOnSection } from './AddOnSection';
import { ConsultationSection } from './ConsultationSection';
import { PaymentProofSection } from './PaymentProofSection';
import { PaymentSummarySection } from './PaymentSummarySection';
import { TreatmentSection } from './TreatmentSection';
import { VisitInformationSection } from './VisitInformationSection';

interface VisitDetailBodyProps {
  visit: VisitRecord;
  onOpenProof: (url: string, label: string) => void;
}

export function VisitDetailBody({ visit, onOpenProof }: VisitDetailBodyProps) {
  const consultationEntries = buildConsultationEntries(visit.serviceQuestions ?? [], visit.notes);

  return (
    <>
      <VisitInformationSection visit={visit} />
      <TreatmentSection visit={visit} hideNotes={consultationEntries.length > 0} />
      {consultationEntries.length > 0 && (
        <ConsultationSection entries={consultationEntries} onOpenProof={onOpenProof} />
      )}
      {visit.addOns && visit.addOns.length > 0 && <AddOnSection addOns={visit.addOns} />}
      <PaymentSummarySection visit={visit} />
      <PaymentProofSection
        paymentProofUrl={visit.paymentProofUrl}
        settlementProofUrl={visit.settlementProofUrl}
        onOpenProof={onOpenProof}
      />
    </>
  );
}
