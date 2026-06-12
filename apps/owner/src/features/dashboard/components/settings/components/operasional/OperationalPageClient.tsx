'use client';

import { CaretRight } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import type {
  ActionItem,
  ConfirmPending,
} from '@/features/dashboard/components/settings/components/shared';
import {
  ConfirmDialog,
  EntityActionMenu,
  SettingsAddButton,
  SettingsFieldGroup,
  SettingsInput,
  SettingsSelect,
  TimeInputInline,
} from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsPageShell,
  SettingsSectionHeader,
  SettingsSideSheet,
  SettingsSubNav,
} from '@/features/dashboard/components/settings/layout';
import type {
  BookingPolicy,
  BusinessHoursDay,
  DayOfWeek,
  SlotIntervalMinutes,
} from '@/features/dashboard/components/settings/types/operational.types';
import {
  DAY_LABELS,
  WEEK_DAYS_ORDERED,
} from '@/features/dashboard/components/settings/types/operational.types';
import { useOperationalController } from '@/features/dashboard/hooks/settings/useOperationalController';

// ── Types ─────────────────────────────────────────────────────────────────────

type PolicyField = 'slot' | 'lead' | 'advance' | 'cancel';

type SheetState =
  | { kind: 'edit-hours' }
  | { kind: 'add-holiday' }
  | { kind: 'edit-holiday'; id: string }
  | { kind: 'policy'; field: PolicyField }
  | null;

// ── Constants ─────────────────────────────────────────────────────────────────

const SLOT_OPTIONS: { value: SlotIntervalMinutes; label: string }[] = [
  { value: 15, label: '15 Menit' },
  { value: 30, label: '30 Menit' },
  { value: 45, label: '45 Menit' },
  { value: 60, label: '60 Menit' },
];

const LEAD_OPTIONS = [
  { value: 0, label: 'Tidak ada batas' },
  { value: 1, label: '1 Jam Sebelumnya' },
  { value: 2, label: '2 Jam Sebelumnya' },
  { value: 4, label: '4 Jam Sebelumnya' },
  { value: 6, label: '6 Jam Sebelumnya' },
  { value: 12, label: '12 Jam Sebelumnya' },
  { value: 24, label: '1 Hari Sebelumnya' },
];

const ADVANCE_OPTIONS = [
  { value: 7, label: '7 Hari ke Depan' },
  { value: 14, label: '14 Hari ke Depan' },
  { value: 30, label: '30 Hari ke Depan' },
  { value: 60, label: '60 Hari ke Depan' },
  { value: 90, label: '90 Hari ke Depan' },
];

const CANCEL_OPTIONS = [
  { value: 0, label: 'Kapan Saja' },
  { value: 1, label: '1 Jam Sebelum Jadwal' },
  { value: 2, label: '2 Jam Sebelum Jadwal' },
  { value: 4, label: '4 Jam Sebelum Jadwal' },
  { value: 6, label: '6 Jam Sebelum Jadwal' },
  { value: 12, label: '12 Jam Sebelum Jadwal' },
  { value: 24, label: '1 Hari Sebelum Jadwal' },
  { value: 48, label: '2 Hari Sebelum Jadwal' },
];

const POLICY_META: Record<
  PolicyField,
  { title: string; description: string; options: { value: number; label: string }[] }
> = {
  slot: {
    title: 'Interval Booking',
    description: 'Jarak antar pilihan waktu yang tersedia untuk customer.',
    options: SLOT_OPTIONS,
  },
  lead: {
    title: 'Minimum Sebelum Booking',
    description: 'Berapa jam sebelumnya customer harus memesan.',
    options: LEAD_OPTIONS,
  },
  advance: {
    title: 'Booking Maksimal',
    description: 'Seberapa jauh ke depan customer bisa memesan.',
    options: ADVANCE_OPTIONS,
  },
  cancel: {
    title: 'Pembatalan',
    description: 'Batas waktu terakhir customer dapat membatalkan.',
    options: CANCEL_OPTIONS,
  },
};

// ── Schedule grouping ─────────────────────────────────────────────────────────

interface ScheduleGroup {
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
  days: DayOfWeek[];
}

function buildScheduleGroups(hours: BusinessHoursDay[]): ScheduleGroup[] {
  const map = new Map<string, ScheduleGroup>();
  for (const dow of WEEK_DAYS_ORDERED) {
    const h = hours.find((d) => d.dayOfWeek === dow);
    if (!h) continue;
    const key = h.isClosed ? '__closed__' : `${h.openTime ?? ''}|${h.closeTime ?? ''}`;
    if (!map.has(key)) {
      map.set(key, {
        isClosed: h.isClosed,
        openTime: h.openTime,
        closeTime: h.closeTime,
        days: [],
      });
    }
    map.get(key)!.days.push(dow);
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.isClosed && !b.isClosed) return 1;
    if (!a.isClosed && b.isClosed) return -1;
    return (a.openTime ?? '').localeCompare(b.openTime ?? '');
  });
}

function formatDayRange(days: DayOfWeek[]): string {
  if (days.length === 0) return '';
  if (days.length === 1) return DAY_LABELS[days[0]];
  const sorted = [...days].sort(
    (a, b) => WEEK_DAYS_ORDERED.indexOf(a) - WEEK_DAYS_ORDERED.indexOf(b)
  );
  const indices = sorted.map((d) => WEEK_DAYS_ORDERED.indexOf(d));
  const isConsecutive = indices.every((idx, i) => i === 0 || idx === indices[i - 1]! + 1);
  if (isConsecutive) {
    return `${DAY_LABELS[sorted[0]!]} – ${DAY_LABELS[sorted[sorted.length - 1]!]}`;
  }
  return sorted.map((d) => DAY_LABELS[d]).join(', ');
}

// ── Value formatters (bahasa bisnis) ──────────────────────────────────────────

function formatSlot(v: SlotIntervalMinutes): string {
  return `${v} Menit`;
}

function formatLeadTime(v: number): string {
  if (v === 0) return 'Tidak ada batas';
  if (v === 24) return '1 Hari Sebelumnya';
  return `${v} Jam Sebelumnya`;
}

function formatAdvance(v: number): string {
  return `${v} Hari ke Depan`;
}

function formatCancel(v: number): string {
  if (v === 0) return 'Kapan Saja';
  if (v === 24) return '1 Hari Sebelum Jadwal';
  if (v === 48) return '2 Hari Sebelum Jadwal';
  return `${v} Jam Sebelum Jadwal`;
}

function getPolicyDisplayValue(field: PolicyField, policy: BookingPolicy): string {
  switch (field) {
    case 'slot':
      return formatSlot(policy.slotIntervalMinutes);
    case 'lead':
      return formatLeadTime(policy.leadTimeHours);
    case 'advance':
      return formatAdvance(policy.advanceBookingDays);
    case 'cancel':
      return formatCancel(policy.cancellationWindowHours);
  }
}

function getPolicyCurrentValue(field: PolicyField, policy: BookingPolicy): number {
  switch (field) {
    case 'slot':
      return policy.slotIntervalMinutes;
    case 'lead':
      return policy.leadTimeHours;
    case 'advance':
      return policy.advanceBookingDays;
    case 'cancel':
      return policy.cancellationWindowHours;
  }
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatFullDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OperationalPageClient() {
  const ctrl = useOperationalController();

  // ── Sheet ──────────────────────────────────────────────────────────────────
  const [sheet, setSheet] = useState<SheetState>(null);

  // hours draft (edit-hours sheet)
  const [draftHours, setDraftHours] = useState<BusinessHoursDay[]>([]);

  // holiday draft (add-holiday / edit-holiday sheets)
  const [draftDate, setDraftDate] = useState('');
  const [draftLabel, setDraftLabel] = useState('Hari Libur');

  // policy draft (policy sheet)
  const [draftPolicyValue, setDraftPolicyValue] = useState<number>(0);

  // ── Confirm ────────────────────────────────────────────────────────────────
  const [confirmPending, setConfirmPending] = useState<ConfirmPending | null>(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  // ── Sheet handlers ─────────────────────────────────────────────────────────

  function openHoursSheet() {
    setDraftHours(ctrl.businessHours.data.map((h) => ({ ...h })));
    setSheet({ kind: 'edit-hours' });
  }

  function updateDraftHour(dow: DayOfWeek, patch: Partial<Omit<BusinessHoursDay, 'dayOfWeek'>>) {
    setDraftHours((prev) => prev.map((h) => (h.dayOfWeek === dow ? { ...h, ...patch } : h)));
  }

  async function handleHoursSave() {
    try {
      await ctrl.businessHours.save(draftHours);
      showToast('Jam operasional disimpan.');
      setSheet(null);
    } catch {
      showToast('Gagal menyimpan jam operasional. Coba lagi.');
    }
  }

  const canSaveHours = draftHours.every(
    (h) => h.isClosed || (h.openTime !== null && h.closeTime !== null)
  );

  function openAddHoliday() {
    setDraftDate('');
    setDraftLabel('Hari Libur');
    setSheet({ kind: 'add-holiday' });
  }

  function openEditHoliday(id: string) {
    const item = ctrl.specialClosingDates.data.find((d) => d.id === id);
    if (!item) return;
    setDraftDate(item.date);
    setDraftLabel(item.label);
    setSheet({ kind: 'edit-holiday', id });
  }

  function handleHolidaySave() {
    const label = draftLabel.trim() || 'Hari Libur';
    if (sheet?.kind === 'edit-holiday') {
      ctrl.specialClosingDates.update(sheet.id, { date: draftDate, label });
      showToast('Hari libur diperbarui.');
    } else {
      ctrl.specialClosingDates.add({ date: draftDate, label });
      showToast('Hari libur ditambahkan.');
    }
    setSheet(null);
  }

  const editingHoliday =
    sheet?.kind === 'edit-holiday'
      ? ctrl.specialClosingDates.data.find((d) => d.id === sheet.id)
      : undefined;

  const canSaveHoliday =
    draftDate.trim() !== '' &&
    (sheet?.kind === 'edit-holiday'
      ? draftDate !== editingHoliday?.date || draftLabel.trim() !== editingHoliday?.label
      : !ctrl.specialClosingDates.data.some((d) => d.date === draftDate));

  function openPolicySheet(field: PolicyField) {
    setDraftPolicyValue(getPolicyCurrentValue(field, ctrl.bookingPolicy.data));
    setSheet({ kind: 'policy', field });
  }

  function handlePolicySave() {
    if (sheet?.kind !== 'policy') return;
    const field = sheet.field;
    switch (field) {
      case 'slot':
        ctrl.bookingPolicy.update({ slotIntervalMinutes: draftPolicyValue as SlotIntervalMinutes });
        showToast(
          `Interval booking diubah. Customer bisa memilih slot setiap ${draftPolicyValue} menit.`
        );
        break;
      case 'lead':
        ctrl.bookingPolicy.update({ leadTimeHours: draftPolicyValue });
        showToast(
          draftPolicyValue === 0
            ? 'Customer bisa booking hingga menit terakhir.'
            : `Customer harus booking minimal ${formatLeadTime(draftPolicyValue).toLowerCase()}.`
        );
        break;
      case 'advance':
        ctrl.bookingPolicy.update({ advanceBookingDays: draftPolicyValue });
        showToast(`Customer hanya bisa memesan hingga ${draftPolicyValue} hari ke depan.`);
        break;
      case 'cancel':
        ctrl.bookingPolicy.update({ cancellationWindowHours: draftPolicyValue });
        showToast(
          draftPolicyValue === 0
            ? 'Customer bisa membatalkan booking kapan saja.'
            : `Pembatalan dibatasi hingga ${formatCancel(draftPolicyValue).toLowerCase()}.`
        );
        break;
    }
    setSheet(null);
  }

  const canSavePolicy =
    sheet?.kind === 'policy' &&
    draftPolicyValue !== getPolicyCurrentValue(sheet.field, ctrl.bookingPolicy.data);

  function requestDeleteHoliday(id: string) {
    const item = ctrl.specialClosingDates.data.find((d) => d.id === id);
    if (!item) return;
    setConfirmPending({
      title: 'Hapus Hari Libur?',
      message: `${formatFullDate(item.date)} — ${item.label} akan dihapus dari jadwal penutupan.`,
      confirmLabel: 'Hapus',
      variant: 'danger',
      onConfirm: () => {
        ctrl.specialClosingDates.remove(id);
        setConfirmPending(null);
        showToast('Hari libur dihapus.');
      },
    });
  }

  // ── Tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'ketersediaan' | 'booking'>('ketersediaan');

  // ── Derived ────────────────────────────────────────────────────────────────

  const today = todayIso();
  const scheduleGroups = buildScheduleGroups(ctrl.businessHours.data);
  const sortedHolidays = [...ctrl.specialClosingDates.data].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <SettingsPageShell>
        <div className="overflow-hidden rounded-r16 bg-bg-card shadow-card">
          {/* ── Tab nav ───────────────────────────────────────────────────── */}
          <div className="border-b border-bd-row px-s20 py-s16">
            <SettingsSubNav
              items={[
                { id: 'ketersediaan', label: 'Ketersediaan' },
                { id: 'booking', label: 'Aturan Booking' },
              ]}
              activeId={activeTab}
              onChange={(id) => setActiveTab(id as 'ketersediaan' | 'booking')}
            />
          </div>

          {/* ── Tab: Ketersediaan Salon ────────────────────────────────────── */}
          {activeTab === 'ketersediaan' && (
            <>
              <div className="px-s20 pb-s4 pt-s20">
                <SettingsSectionHeader
                  title="Ketersediaan Salon"
                  description="Jadwal buka salon dan tanggal penutupan khusus."
                  action={
                    <div className="flex items-center gap-s8">
                      <button
                        type="button"
                        onClick={openHoursSheet}
                        className="bg-bg-base flex shrink-0 items-center rounded-r10 border border-bd-card px-s12 py-s8 text-ts-fn font-medium text-tx-primary transition-colors hover:bg-bg-hover"
                      >
                        Ubah Jadwal
                      </button>
                      <SettingsAddButton onClick={openAddHoliday}>
                        Tambah Hari Libur
                      </SettingsAddButton>
                    </div>
                  }
                />
              </div>

              {/* Jam Operasional sub-label */}
              <div className="px-s20 pb-s8 pt-s16">
                <span className="text-ts-cap1 font-semibold text-tx-secondary">
                  Jam Operasional
                </span>
              </div>

              {scheduleGroups.map((group, i) => (
                <div key={i} className="flex items-baseline gap-s8 px-s20 py-s6 last:pb-s16">
                  <span className="w-32 shrink-0 text-ts-fn font-medium text-tx-primary">
                    {group.isClosed ? 'Tutup' : `${group.openTime} – ${group.closeTime}`}
                  </span>
                  <span className="text-tx-muted">•</span>
                  <span className="text-ts-fn text-tx-secondary">{formatDayRange(group.days)}</span>
                </div>
              ))}

              {/* Internal divider */}
              <div className="mx-s20 h-px bg-bd-row" />

              {/* Hari Libur sub-label */}
              <div className="px-s20 pb-s8 pt-s16">
                <span className="text-ts-cap1 font-semibold text-tx-secondary">Hari Libur</span>
              </div>

              {sortedHolidays.length === 0 ? (
                <div className="px-s20 pb-s16">
                  <span className="text-ts-cap1 text-tx-muted">
                    Belum ada hari libur yang ditambahkan.
                  </span>
                </div>
              ) : (
                sortedHolidays.map((item) => {
                  const isPast = item.date < today;
                  const actions: ActionItem[] = [
                    { label: 'Edit', onClick: () => openEditHoliday(item.id) },
                    {
                      label: 'Hapus',
                      variant: 'danger' as const,
                      onClick: () => requestDeleteHoliday(item.id),
                    },
                  ];
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-s16 border-t border-bd-row px-s20 py-s12 last:mb-s4 ${
                        isPast ? 'opacity-50' : ''
                      }`}
                    >
                      <span className="w-36 shrink-0 text-ts-fn font-medium text-tx-primary">
                        {formatShortDate(item.date)}
                      </span>
                      <span className="flex-1 text-ts-fn text-tx-secondary">{item.label}</span>
                      <EntityActionMenu actions={actions} />
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* ── Tab: Aturan Booking ────────────────────────────────────────── */}
          {activeTab === 'booking' && (
            <>
              <div className="px-s20 pb-s4 pt-s20">
                <SettingsSectionHeader
                  title="Aturan Booking"
                  description="Kapan dan bagaimana customer dapat membuat janji."
                />
              </div>

              {(
                [
                  { field: 'slot', label: 'Interval Booking' },
                  { field: 'lead', label: 'Minimum Sebelum Booking' },
                  { field: 'advance', label: 'Booking Maksimal' },
                  { field: 'cancel', label: 'Pembatalan' },
                ] as { field: PolicyField; label: string }[]
              ).map(({ field, label }) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => openPolicySheet(field)}
                  className="flex w-full items-center justify-between border-t border-bd-row px-s20 py-s14 transition-colors hover:bg-bg-hover"
                >
                  <div className="flex flex-col items-start gap-s2">
                    <span className="text-ts-cap1 text-tx-secondary">{label}</span>
                    <span className="text-ts-fn font-medium text-tx-primary">
                      {getPolicyDisplayValue(field, ctrl.bookingPolicy.data)}
                    </span>
                  </div>
                  <CaretRight size={14} weight="bold" className="shrink-0 text-tx-muted" />
                </button>
              ))}
            </>
          )}
        </div>
      </SettingsPageShell>

      {/* ── Sheet: Ubah Jadwal ─────────────────────────────────────────────── */}
      {sheet?.kind === 'edit-hours' && (
        <SettingsSideSheet
          title="Ubah Jadwal"
          description="Atur jam buka dan tutup untuk setiap hari."
          onClose={() => setSheet(null)}
          onSave={() => void handleHoursSave()}
          canSave={canSaveHours}
          isSaving={ctrl.businessHours.isSaving}
          saveLabel="Simpan"
        >
          <div className="flex flex-col gap-s16">
            {WEEK_DAYS_ORDERED.map((dow) => {
              const h = draftHours.find((d) => d.dayOfWeek === dow);
              if (!h) return null;
              return (
                <div key={dow} className="flex items-center gap-s12">
                  <input
                    type="checkbox"
                    checked={!h.isClosed}
                    onChange={(e) => updateDraftHour(dow, { isClosed: !e.target.checked })}
                    className="h-4 w-4 shrink-0 cursor-pointer accent-tx-secondary"
                  />
                  <span
                    className={`w-16 shrink-0 text-ts-fn ${
                      h.isClosed ? 'text-tx-muted' : 'text-tx-primary'
                    }`}
                  >
                    {DAY_LABELS[dow]}
                  </span>
                  {h.isClosed ? (
                    <span className="text-ts-fn text-tx-muted">Tutup</span>
                  ) : (
                    <div className="flex items-center gap-s8">
                      <TimeInputInline
                        value={h.openTime ?? ''}
                        onChange={(e) => updateDraftHour(dow, { openTime: e.target.value || null })}
                      />
                      <span className="text-ts-cap1 text-tx-muted">–</span>
                      <TimeInputInline
                        value={h.closeTime ?? ''}
                        onChange={(e) =>
                          updateDraftHour(dow, { closeTime: e.target.value || null })
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SettingsSideSheet>
      )}

      {/* ── Sheet: Tambah / Edit Hari Libur ───────────────────────────────── */}
      {(sheet?.kind === 'add-holiday' || sheet?.kind === 'edit-holiday') && (
        <SettingsSideSheet
          title={sheet.kind === 'edit-holiday' ? 'Edit Hari Libur' : 'Tambah Hari Libur'}
          description="Tanggal ini akan ditandai sebagai hari tutup di kalender booking."
          onClose={() => setSheet(null)}
          onSave={handleHolidaySave}
          canSave={canSaveHoliday}
          saveLabel={sheet.kind === 'edit-holiday' ? 'Simpan' : 'Tambah'}
        >
          <div className="flex flex-col gap-s16">
            <SettingsFieldGroup label="Tanggal" hint="Pilih tanggal hari tutup.">
              <SettingsInput
                type="date"
                value={draftDate}
                min={todayIso()}
                onChange={(e) => setDraftDate(e.target.value)}
              />
            </SettingsFieldGroup>
            <SettingsFieldGroup
              label="Keterangan"
              hint='Contoh: "Idul Fitri", "Renovasi", "Libur Nasional".'
            >
              <SettingsInput
                type="text"
                value={draftLabel}
                placeholder="Hari Libur"
                onChange={(e) => setDraftLabel(e.target.value)}
              />
            </SettingsFieldGroup>
          </div>
        </SettingsSideSheet>
      )}

      {/* ── Sheet: Edit Policy Field ───────────────────────────────────────── */}
      {sheet?.kind === 'policy' && (
        <SettingsSideSheet
          title={POLICY_META[sheet.field].title}
          description={POLICY_META[sheet.field].description}
          onClose={() => setSheet(null)}
          onSave={handlePolicySave}
          canSave={canSavePolicy}
          saveLabel="Simpan"
        >
          <SettingsFieldGroup label={POLICY_META[sheet.field].title}>
            <SettingsSelect
              value={draftPolicyValue}
              onChange={(e) => setDraftPolicyValue(Number(e.target.value))}
            >
              {POLICY_META[sheet.field].options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SettingsSelect>
          </SettingsFieldGroup>
        </SettingsSideSheet>
      )}

      {/* ── Confirm: Hapus Hari Libur ─────────────────────────────────────── */}
      {confirmPending && (
        <ConfirmDialog
          title={confirmPending.title}
          message={confirmPending.message}
          confirmLabel={confirmPending.confirmLabel}
          variant={confirmPending.variant}
          onConfirm={confirmPending.onConfirm}
          onCancel={() => setConfirmPending(null)}
        />
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-s24 right-s24 z-50 rounded-r12 bg-tx-primary px-s16 py-s12 shadow-card">
          <p className="text-bg-base text-ts-fn">{toast}</p>
        </div>
      )}
    </>
  );
}
