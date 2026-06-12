'use client';

import { useCallback, useState } from 'react';
import {
  DEFAULT_BOOKING_APP_SETTINGS,
  type AuditAction,
  type AuditLogEntry,
  type BankAccount,
  type BookingAppSettings,
  type ConfirmationMode,
  type PaymentMethod,
} from '@/features/dashboard/components/settings/types/booking-app.types';

// Phase 1 mock. Phase 2: replace with Supabase auth session.
const CURRENT_USER_ID = 'owner-001';
const CURRENT_USER_ROLE = 'OWNER' as const;

export interface BookingAppController {
  settings: BookingAppSettings;
  auditLog: AuditLogEntry[];
  setPaymentMethod: (method: PaymentMethod, active: boolean) => void;
  setQrisImageUrl: (url: string | null, actorId: string) => void;
  addBankAccount: (account: Omit<BankAccount, 'id'>, actorId: string) => void;
  updateBankAccount: (id: string, patch: Partial<Omit<BankAccount, 'id'>>, actorId: string) => void;
  removeBankAccount: (id: string, actorId: string) => void;
  setConfirmationMode: (mode: ConfirmationMode) => void;
  setSalonPolicy: (text: string | null) => void;
}

export function useBookingAppController(): BookingAppController {
  const [settings, setSettings] = useState<BookingAppSettings>(DEFAULT_BOOKING_APP_SETTINGS);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  function appendAudit(action: AuditAction, actorId: string, metadata?: Record<string, string>) {
    const entry: AuditLogEntry = {
      id: crypto.randomUUID(),
      action,
      actor: actorId,
      actorRole: CURRENT_USER_ROLE,
      timestamp: new Date().toISOString(),
      metadata,
    };
    setAuditLog((prev) => [entry, ...prev]);
  }

  const setPaymentMethod = useCallback((method: PaymentMethod, active: boolean) => {
    setSettings((prev) => {
      const next = active
        ? prev.paymentMethods.includes(method)
          ? prev.paymentMethods
          : [...prev.paymentMethods, method]
        : prev.paymentMethods.filter((m) => m !== method);
      // Enforce: at least one method must remain active.
      if (next.length === 0) return prev;
      return { ...prev, paymentMethods: next };
    });
    appendAudit('payment_method_changed', CURRENT_USER_ID, { method, active: String(active) });
  }, []);

  const setQrisImageUrl = useCallback((url: string | null, actorId: string) => {
    setSettings((prev) => {
      const action: AuditAction =
        url === null
          ? 'qris_removed'
          : prev.qrisImageUrl === null
            ? 'qris_uploaded'
            : 'qris_replaced';
      appendAudit(action, actorId);
      return { ...prev, qrisImageUrl: url };
    });
  }, []);

  const addBankAccount = useCallback((account: Omit<BankAccount, 'id'>, actorId: string) => {
    const newAccount: BankAccount = { ...account, id: crypto.randomUUID() };
    setSettings((prev) => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, newAccount],
    }));
    appendAudit('bank_account_added', actorId, { bankName: account.bankName });
  }, []);

  const updateBankAccount = useCallback(
    (id: string, patch: Partial<Omit<BankAccount, 'id'>>, actorId: string) => {
      setSettings((prev) => ({
        ...prev,
        bankAccounts: prev.bankAccounts.map((acc) => (acc.id === id ? { ...acc, ...patch } : acc)),
      }));
      appendAudit('bank_account_edited', actorId, { id });
    },
    []
  );

  const removeBankAccount = useCallback((id: string, actorId: string) => {
    setSettings((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((acc) => acc.id !== id),
    }));
    appendAudit('bank_account_removed', actorId, { id });
  }, []);

  const setConfirmationMode = useCallback((mode: ConfirmationMode) => {
    setSettings((prev) => ({ ...prev, confirmationMode: mode }));
  }, []);

  const setSalonPolicy = useCallback((text: string | null) => {
    const trimmed = text?.trim() ?? null;
    const value = trimmed === '' ? null : trimmed;
    if (value !== null && value.length > 500) return;
    setSettings((prev) => ({ ...prev, salonPolicy: value }));
  }, []);

  return {
    settings,
    auditLog,
    setPaymentMethod,
    setQrisImageUrl,
    addBankAccount,
    updateBankAccount,
    removeBankAccount,
    setConfirmationMode,
    setSalonPolicy,
  };
}
