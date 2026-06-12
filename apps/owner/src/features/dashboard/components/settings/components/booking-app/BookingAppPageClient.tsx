'use client';

import { Bank, CaretRight, Warning } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import type {
  ActionItem,
  ConfirmPending,
} from '@/features/dashboard/components/settings/components/shared';
import {
  ConfirmDialog,
  EntityActionMenu,
  SettingsAddButton,
  SettingsEmptyState,
  SettingsFieldGroup,
  SettingsInput,
  SettingsSelect,
  SettingsTextarea,
  SettingsUploadField,
} from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsPageShell,
  SettingsSideSheet,
} from '@/features/dashboard/components/settings/layout';
import type { BankAccount } from '@/features/dashboard/components/settings/types/booking-app.types';
import { useBookingAppController } from '@/features/dashboard/hooks/settings/useBookingAppController';
import { ToggleSwitch } from '@/shared/components/ui/toggle-switch';

// ── Types ─────────────────────────────────────────────────────────────────────

type SheetState =
  | { kind: 'qris-upload' }
  | { kind: 'add-bank' }
  | { kind: 'edit-bank'; id: string }
  | { kind: 'confirmation' }
  | { kind: 'policy' }
  | null;

// ── Constants ─────────────────────────────────────────────────────────────────

const BANK_OPTIONS = [
  'BCA',
  'Mandiri',
  'BNI',
  'BRI',
  'CIMB Niaga',
  'Danamon',
  'Permata',
  'BTN',
  'Maybank',
  'OCBC NISP',
  'Bank Jago',
  'SeaBank',
  'Blu BCA',
];

// ── Component ─────────────────────────────────────────────────────────────────

export function BookingAppPageClient() {
  const ctrl = useBookingAppController();

  const [sheet, setSheet] = useState<SheetState>(null);
  const [confirmPending, setConfirmPending] = useState<ConfirmPending | null>(null);

  // ── Draft: QRIS ──────────────────────────────────────────────────────────
  const [qrisPreviewUrl, setQrisPreviewUrl] = useState<string | null>(null);

  // ── Draft: Bank account ──────────────────────────────────────────────────
  const [draftBankName, setDraftBankName] = useState('BCA');
  const [draftAccountNumber, setDraftAccountNumber] = useState('');
  const [draftAccountHolder, setDraftAccountHolder] = useState('');

  // ── Draft: Confirmation mode ──────────────────────────────────────────────
  const [draftConfirmationMode, setDraftConfirmationMode] = useState(ctrl.confirmation.data);

  // ── Draft: Policy ────────────────────────────────────────────────────────
  const [draftPolicy, setDraftPolicy] = useState('');

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  // ── QRIS handlers ─────────────────────────────────────────────────────────

  function handleQrisRowClick() {
    if (ctrl.paymentMethods.data.qrisImageUrl) {
      // Already has QRIS — confirm before replace
      setConfirmPending({
        title: 'Ganti Foto QRIS?',
        message:
          'Foto QRIS lama akan digantikan. Pastikan foto baru terlihat jelas sebelum menyimpan.',
        confirmLabel: 'Lanjut Ganti',
        variant: 'warning',
        onConfirm: () => {
          setConfirmPending(null);
          setQrisPreviewUrl(ctrl.paymentMethods.data.qrisImageUrl);
          setSheet({ kind: 'qris-upload' });
        },
      });
    } else {
      setQrisPreviewUrl(null);
      setSheet({ kind: 'qris-upload' });
    }
  }

  function handleQrisSave() {
    if (!qrisPreviewUrl) return;
    // Blob URLs (local file picker) are silently ignored by setQrisImageUrl.
    // Real persistence happens in Sprint 4 after Supabase Storage upload.
    ctrl.paymentMethods.setQrisImageUrl(qrisPreviewUrl);
    showToast('Foto QRIS berhasil diperbarui.');
    setSheet(null);
  }

  function handleQrisRemove() {
    setConfirmPending({
      title: 'Hapus Foto QRIS?',
      message: 'Customer tidak bisa scan QRIS sampai Anda mengunggah foto baru.',
      confirmLabel: 'Hapus',
      variant: 'danger',
      onConfirm: () => {
        ctrl.paymentMethods.setQrisImageUrl(null);
        setConfirmPending(null);
        showToast('Foto QRIS dihapus.');
      },
    });
  }

  // ── Bank account handlers ─────────────────────────────────────────────────

  function openAddBank() {
    setDraftBankName('BCA');
    setDraftAccountNumber('');
    setDraftAccountHolder('');
    setSheet({ kind: 'add-bank' });
  }

  function openEditBank(id: string) {
    const acc = ctrl.bankAccounts.data.find((a) => a.id === id);
    if (!acc) return;
    setDraftBankName(acc.bankName);
    setDraftAccountNumber(acc.accountNumber);
    setDraftAccountHolder(acc.accountHolderName);
    setSheet({ kind: 'edit-bank', id });
  }

  function handleBankSave() {
    const account: Omit<BankAccount, 'id'> = {
      bankName: draftBankName,
      accountNumber: draftAccountNumber.trim(),
      accountHolderName: draftAccountHolder.trim(),
      isActive: true,
    };
    if (sheet?.kind === 'edit-bank') {
      ctrl.bankAccounts.update(sheet.id, account);
      showToast('Rekening bank diperbarui.');
    } else {
      ctrl.bankAccounts.add(account);
      showToast('Rekening bank ditambahkan.');
    }
    setSheet(null);
  }

  function requestDeleteBank(id: string) {
    const acc = ctrl.bankAccounts.data.find((a) => a.id === id);
    if (!acc) return;
    setConfirmPending({
      title: 'Hapus Rekening?',
      message: `${acc.bankName} ${acc.accountNumber} — ${acc.accountHolderName} akan dihapus.`,
      confirmLabel: 'Hapus',
      variant: 'danger',
      onConfirm: () => {
        ctrl.bankAccounts.remove(id);
        setConfirmPending(null);
        showToast('Rekening bank dihapus.');
      },
    });
  }

  const canSaveBank = draftAccountNumber.trim().length > 0 && draftAccountHolder.trim().length > 0;

  // ── Confirmation mode handlers ────────────────────────────────────────────

  function openConfirmationSheet() {
    setDraftConfirmationMode(ctrl.confirmation.data);
    setSheet({ kind: 'confirmation' });
  }

  function handleConfirmationSave() {
    ctrl.confirmation.save(draftConfirmationMode);
    showToast(
      draftConfirmationMode === 'auto'
        ? 'Booking dikonfirmasi otomatis.'
        : 'Booking harus dikonfirmasi manual.'
    );
    setSheet(null);
  }

  const canSaveConfirmation = draftConfirmationMode !== ctrl.confirmation.data;

  // ── Policy handlers ───────────────────────────────────────────────────────

  function openPolicySheet() {
    setDraftPolicy(ctrl.salonPolicy.data ?? '');
    setSheet({ kind: 'policy' });
  }

  function handlePolicySave() {
    ctrl.salonPolicy.save(draftPolicy);
    showToast('Kebijakan salon disimpan.');
    setSheet(null);
  }

  const canSavePolicy = draftPolicy.trim() !== (ctrl.salonPolicy.data ?? '');

  // ── Derived ───────────────────────────────────────────────────────────────

  const { methods: paymentMethods, qrisImageUrl } = ctrl.paymentMethods.data;
  const bankAccounts = ctrl.bankAccounts.data;
  const confirmationMode = ctrl.confirmation.data;
  const salonPolicy = ctrl.salonPolicy.data;

  const qrisActive = paymentMethods.includes('qris');
  const transferActive = paymentMethods.includes('transfer');
  const cashActive = paymentMethods.includes('cash');
  const noMethodActive = paymentMethods.length === 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <SettingsPageShell>
        {/* ── Section A: Metode Pembayaran ───────────────────────────────── */}
        <div className="overflow-hidden rounded-r16 bg-bg-card shadow-card">
          <div className="border-b border-bd-row px-s20 py-s16">
            <p className="text-ts-sub font-bold text-tx-primary">Metode Pembayaran</p>
            <p className="mt-s4 text-ts-fn text-tx-secondary">
              Cara customer membayar di halaman booking.
            </p>
          </div>
          {noMethodActive && (
            <div className="flex items-center gap-s8 border-b border-bd-row px-s20 py-s12">
              <Warning size={16} weight="duotone" className="text-ac-warning shrink-0" />
              <p className="text-ac-warning text-ts-fn">
                Minimal satu metode pembayaran harus aktif. Customer tidak bisa booking saat ini.
              </p>
            </div>
          )}

          {/* QRIS row */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-s20 py-s14">
              <div>
                <p className="text-ts-fn font-medium text-tx-primary">QRIS</p>
                <p className="text-ts-cap1 text-tx-secondary">Semua e-wallet dan mobile banking</p>
              </div>
              <ToggleSwitch
                checked={qrisActive}
                onChange={(v) => ctrl.paymentMethods.setMethod('qris', v)}
                aria-label="Toggle QRIS"
              />
            </div>

            {qrisActive && (
              <button
                type="button"
                onClick={handleQrisRowClick}
                className="bg-bg-base flex w-full items-center justify-between border-t border-bd-row px-s20 py-s12 transition-colors hover:bg-bg-hover"
              >
                <div className="flex items-center gap-s12">
                  {qrisImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrisImageUrl}
                      alt="Foto QRIS"
                      className="h-12 w-12 rounded-r8 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-r8 bg-bg-control">
                      <Warning size={16} weight="duotone" className="text-ac-warning" />
                    </div>
                  )}
                  <div className="flex flex-col items-start gap-s2">
                    <p className="text-ts-cap1 text-tx-secondary">Foto QRIS</p>
                    <p className="text-ts-fn font-medium text-tx-primary">
                      {qrisImageUrl ? 'Sudah diunggah' : 'Belum ada foto'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-s8">
                  {qrisImageUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQrisRemove();
                      }}
                      className="px-s10 rounded-r8 py-s6 text-ts-cap1 text-ac-danger transition-colors hover:bg-bg-hover"
                    >
                      Hapus
                    </button>
                  )}
                  <CaretRight size={14} weight="duotone" className="shrink-0 text-tx-muted" />
                </div>
              </button>
            )}
          </div>

          {/* Transfer Bank row */}
          <div className="flex flex-col border-t border-bd-row">
            <div className="flex items-center justify-between px-s20 py-s14">
              <div>
                <p className="text-ts-fn font-medium text-tx-primary">Transfer Bank</p>
                <p className="text-ts-cap1 text-tx-secondary">Customer transfer ke rekening Anda</p>
              </div>
              <ToggleSwitch
                checked={transferActive}
                onChange={(v) => ctrl.paymentMethods.setMethod('transfer', v)}
                aria-label="Toggle Transfer Bank"
              />
            </div>

            {transferActive && (
              <div className="bg-bg-base border-t border-bd-row">
                <div className="flex items-center justify-between px-s20 py-s12">
                  <p className="text-ts-cap1 font-semibold text-tx-secondary">Rekening Bank</p>
                  <SettingsAddButton onClick={openAddBank}>Tambah Rekening</SettingsAddButton>
                </div>

                {bankAccounts.length === 0 ? (
                  <div className="px-s20 pb-s16">
                    <SettingsEmptyState
                      icon={<Bank size={20} weight="duotone" className="text-tx-secondary" />}
                      title="Belum ada rekening bank"
                      description="Customer tidak bisa melihat tujuan transfer sampai Anda menambahkan rekening."
                    />
                  </div>
                ) : (
                  bankAccounts.map((acc) => {
                    const actions: ActionItem[] = [
                      { label: 'Edit', onClick: () => openEditBank(acc.id) },
                      {
                        label: 'Hapus',
                        variant: 'danger' as const,
                        onClick: () => requestDeleteBank(acc.id),
                      },
                    ];
                    return (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between border-t border-bd-row px-s20 py-s12 last:mb-s4"
                      >
                        <div className="flex flex-col gap-s2">
                          <p className="text-ts-fn font-medium text-tx-primary">{acc.bankName}</p>
                          <p className="text-ts-cap1 text-tx-secondary">
                            {acc.accountNumber} &middot; {acc.accountHolderName}
                          </p>
                        </div>
                        <EntityActionMenu actions={actions} />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Tunai row */}
          <div className="flex items-center justify-between border-t border-bd-row px-s20 py-s14">
            <div>
              <p className="text-ts-fn font-medium text-tx-primary">Tunai</p>
              <p className="text-ts-cap1 text-tx-secondary">Bayar langsung di salon</p>
            </div>
            <ToggleSwitch
              checked={cashActive}
              onChange={(v) => ctrl.paymentMethods.setMethod('cash', v)}
              aria-label="Toggle Tunai"
            />
          </div>
        </div>

        {/* ── Section B: Konfirmasi Booking ─────────────────────────────── */}
        <div className="overflow-hidden rounded-r16 bg-bg-card shadow-card">
          <div className="border-b border-bd-row px-s20 py-s16">
            <p className="text-ts-sub font-bold text-tx-primary">Konfirmasi Booking</p>
            <p className="mt-s4 text-ts-fn text-tx-secondary">
              Bagaimana setiap booking yang masuk dikonfirmasi.
            </p>
          </div>
          <button
            type="button"
            onClick={openConfirmationSheet}
            className="flex w-full items-center justify-between px-s20 py-s14 transition-colors hover:bg-bg-hover"
          >
            <div className="flex flex-col items-start gap-s2">
              <p className="text-ts-cap1 text-tx-secondary">Mode Konfirmasi</p>
              <p className="text-ts-fn font-medium text-tx-primary">
                {confirmationMode === 'auto' ? 'Otomatis dikonfirmasi' : 'Saya konfirmasi sendiri'}
              </p>
            </div>
            <CaretRight size={14} weight="duotone" className="shrink-0 text-tx-muted" />
          </button>
        </div>

        {/* ── Section C: Kebijakan Salon ─────────────────────────────────── */}
        <div className="overflow-hidden rounded-r16 bg-bg-card shadow-card">
          <div className="border-b border-bd-row px-s20 py-s16">
            <p className="text-ts-sub font-bold text-tx-primary">Kebijakan Salon</p>
            <p className="mt-s4 text-ts-fn text-tx-secondary">
              Aturan yang ditampilkan ke customer sebelum booking dikonfirmasi.
            </p>
          </div>
          <button
            type="button"
            onClick={openPolicySheet}
            className="flex w-full items-center justify-between px-s20 py-s14 transition-colors hover:bg-bg-hover"
          >
            <div className="flex flex-col items-start gap-s2">
              <p className="text-ts-cap1 text-tx-secondary">Kebijakan</p>
              <p className="text-ts-fn font-medium text-tx-primary">
                {salonPolicy
                  ? salonPolicy.substring(0, 60) + (salonPolicy.length > 60 ? '...' : '')
                  : 'Belum ada kebijakan'}
              </p>
            </div>
            <CaretRight size={14} weight="duotone" className="shrink-0 text-tx-muted" />
          </button>
        </div>
      </SettingsPageShell>

      {/* ── Sheet: Upload / Ganti QRIS ────────────────────────────────────── */}
      {sheet?.kind === 'qris-upload' && (
        <SettingsSideSheet
          title={ctrl.paymentMethods.data.qrisImageUrl ? 'Ganti Foto QRIS' : 'Upload Foto QRIS'}
          description="Pastikan kode QR terlihat jelas sebelum menyimpan."
          onClose={() => setSheet(null)}
          onSave={handleQrisSave}
          canSave={
            qrisPreviewUrl !== null && qrisPreviewUrl !== ctrl.paymentMethods.data.qrisImageUrl
          }
          saveLabel="Simpan"
        >
          <SettingsUploadField
            variant="qris"
            value={qrisPreviewUrl}
            onChange={(_file, previewUrl) => {
              setQrisPreviewUrl(previewUrl);
            }}
            onRemove={() => {
              setQrisPreviewUrl(null);
            }}
          />
        </SettingsSideSheet>
      )}

      {/* ── Sheet: Tambah / Edit Rekening Bank ───────────────────────────── */}
      {(sheet?.kind === 'add-bank' || sheet?.kind === 'edit-bank') && (
        <SettingsSideSheet
          title={sheet.kind === 'edit-bank' ? 'Edit Rekening' : 'Tambah Rekening'}
          onClose={() => setSheet(null)}
          onSave={handleBankSave}
          canSave={canSaveBank}
          saveLabel={sheet.kind === 'edit-bank' ? 'Simpan' : 'Tambah'}
        >
          <div className="flex flex-col gap-s16">
            <SettingsFieldGroup label="Nama Bank">
              <SettingsSelect
                value={draftBankName}
                onChange={(e) => setDraftBankName(e.target.value)}
              >
                {BANK_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </SettingsSelect>
            </SettingsFieldGroup>
            <SettingsFieldGroup label="Nomor Rekening">
              <SettingsInput
                type="text"
                inputMode="numeric"
                value={draftAccountNumber}
                onChange={(e) => setDraftAccountNumber(e.target.value)}
                placeholder="Contoh: 1234567890"
              />
            </SettingsFieldGroup>
            <SettingsFieldGroup label="Nama Pemilik Rekening">
              <SettingsInput
                type="text"
                value={draftAccountHolder}
                onChange={(e) => setDraftAccountHolder(e.target.value)}
                placeholder="Sesuai buku tabungan"
              />
            </SettingsFieldGroup>
          </div>
        </SettingsSideSheet>
      )}

      {/* ── Sheet: Mode Konfirmasi ────────────────────────────────────────── */}
      {sheet?.kind === 'confirmation' && (
        <SettingsSideSheet
          title="Mode Konfirmasi"
          description="Tentukan bagaimana booking yang masuk dikonfirmasi."
          onClose={() => setSheet(null)}
          onSave={handleConfirmationSave}
          canSave={canSaveConfirmation}
          isSaving={ctrl.confirmation.isSaving}
          saveLabel="Simpan"
        >
          <SettingsFieldGroup
            label="Setiap booking yang masuk..."
            hint={
              draftConfirmationMode === 'auto'
                ? 'Booking dikonfirmasi otomatis setelah pembayaran terverifikasi.'
                : 'Anda harus membuka dashboard dan konfirmasi setiap booking secara manual.'
            }
          >
            <SettingsSelect
              value={draftConfirmationMode}
              onChange={(e) => setDraftConfirmationMode(e.target.value as 'auto' | 'manual')}
            >
              <option value="auto">Otomatis dikonfirmasi</option>
              <option value="manual">Saya konfirmasi sendiri</option>
            </SettingsSelect>
          </SettingsFieldGroup>
        </SettingsSideSheet>
      )}

      {/* ── Sheet: Kebijakan Salon ────────────────────────────────────────── */}
      {sheet?.kind === 'policy' && (
        <SettingsSideSheet
          title="Kebijakan Salon"
          description="Ditampilkan ke customer sebelum booking dikonfirmasi."
          onClose={() => setSheet(null)}
          onSave={handlePolicySave}
          canSave={canSavePolicy}
          isSaving={ctrl.salonPolicy.isSaving}
          saveLabel="Simpan"
        >
          <SettingsFieldGroup label="Kebijakan" hint={`${draftPolicy.length}/500`}>
            <SettingsTextarea
              value={draftPolicy}
              onChange={(e) => setDraftPolicy(e.target.value)}
              maxLength={500}
              rows={6}
              placeholder="Contoh: Keterlambatan lebih dari 15 menit dianggap cancel. Deposit tidak dapat dikembalikan."
            />
          </SettingsFieldGroup>
        </SettingsSideSheet>
      )}

      {/* ── ConfirmDialog ─────────────────────────────────────────────────── */}
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
        <div className="py-s10 fixed bottom-s20 left-1/2 z-[70] -translate-x-1/2 rounded-r12 bg-tx-primary px-s16 shadow-dialog">
          <p className="text-ts-fn font-medium text-bg-card">{toast}</p>
        </div>
      )}
    </>
  );
}
