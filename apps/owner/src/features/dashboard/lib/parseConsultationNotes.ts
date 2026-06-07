import type { ServiceQuestion } from '../types/dashboard.types';

export interface ConsultationEntry {
  question: string;
  type: 'chips' | 'photo';
  answer: string;
}

// Parses bookings.notes serialized by StepPayment.
// Format per line: "q1: Option1, Option2" or "q3: https://..."
// Lines are joined with \n. catatan_tambahan is never present (skipped at write time).
export function parseConsultationNotes(notes: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!notes) return result;
  for (const line of notes.split('\n')) {
    const sep = line.indexOf(': ');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 2).trim();
    if (key && value) result[key] = value;
  }
  return result;
}

export function buildConsultationEntries(
  serviceQuestions: ServiceQuestion[],
  notes: string | undefined
): ConsultationEntry[] {
  if (!notes || !serviceQuestions.length) return [];
  const parsed = parseConsultationNotes(notes);
  const entries: ConsultationEntry[] = [];
  for (const q of serviceQuestions) {
    const answer = parsed[q.id];
    if (!answer) continue;
    entries.push({ question: q.question, type: q.type, answer });
  }
  return entries;
}
