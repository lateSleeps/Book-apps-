'use client';

import { useCallback } from 'react';
import type {
  BankAccount,
  ConfirmationMode,
  PaymentMethod,
} from '@/features/dashboard/components/settings/types/booking-app.types';
import { trpc } from '@/lib/trpc';

// ── Public interface ──────────────────────────────────────────────────────────
// Section-based ownership — canonical pattern for multi-section domains.
// See SPRINT1_1_1_CLEANUP_REPORT.md for rationale.
//
// Each section owns its data and mutations. Mutations fire immediately to DB
// (no staged draft in controller). Draft state lives in the page component.

export interface BookingAppController {
  paymentMethods: {
    /** Active methods and QRIS image URL from DB. */
    data: {
      methods: PaymentMethod[];
      qrisImageUrl: string | null;
    };
    isLoading: boolean;
    isSaving: boolean;
    /**
     * Toggle a payment method on/off. Fires immediately to DB.
     * Enforces: at least one method must remain active.
     */
    setMethod: (method: PaymentMethod, active: boolean) => void;
    /**
     * Persist a QRIS image URL.
     * null = explicit removal (written to DB).
     * https:// URL = written to DB.
     * blob: / data: URL = silently ignored (upload deferred to Sprint 4).
     */
    setQrisImageUrl: (url: string | null) => void;
  };
  bankAccounts: {
    data: BankAccount[];
    isLoading: boolean;
    isSaving: boolean;
    add: (account: Omit<BankAccount, 'id'>) => void;
    update: (id: string, patch: Partial<Omit<BankAccount, 'id'>>) => void;
    remove: (id: string) => void;
  };
  confirmation: {
    data: ConfirmationMode;
    isLoading: boolean;
    isSaving: boolean;
    save: (mode: ConfirmationMode) => void;
  };
  salonPolicy: {
    data: string | null;
    isLoading: boolean;
    isSaving: boolean;
    save: (text: string | null) => void;
  };
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_PAYMENT_DATA = {
  methods: ['qris', 'transfer'] as PaymentMethod[],
  qrisImageUrl: null as string | null,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBookingAppController(): BookingAppController {
  const utils = trpc.useUtils();

  // ── Single shared query ───────────────────────────────────────────────────
  const { data: settingsFromDb, isLoading } =
    trpc.settings.bookingApp.getBookingAppSettings.useQuery(undefined, {
      staleTime: 30_000,
    });

  // Convenience: after each mutation, invalidate the shared query.
  const invalidate = useCallback(() => {
    void utils.settings.bookingApp.getBookingAppSettings.invalidate();
  }, [utils]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const { mutateAsync: setPaymentMethodsMutation, isLoading: isSavingPaymentMethods } =
    trpc.settings.bookingApp.setPaymentMethods.useMutation({ onSuccess: invalidate });

  const { mutateAsync: setQrisImageUrlMutation, isLoading: isSavingQris } =
    trpc.settings.bookingApp.setQrisImageUrl.useMutation({ onSuccess: invalidate });

  const { mutateAsync: setConfirmationModeMutation, isLoading: isSavingConfirmation } =
    trpc.settings.bookingApp.setConfirmationMode.useMutation({ onSuccess: invalidate });

  const { mutateAsync: setSalonPolicyMutation, isLoading: isSavingSalonPolicy } =
    trpc.settings.bookingApp.setSalonPolicy.useMutation({ onSuccess: invalidate });

  const { mutateAsync: addBankAccountMutation, isLoading: isAddingBank } =
    trpc.settings.bookingApp.addBankAccount.useMutation({ onSuccess: invalidate });

  const { mutateAsync: updateBankAccountMutation, isLoading: isUpdatingBank } =
    trpc.settings.bookingApp.updateBankAccount.useMutation({ onSuccess: invalidate });

  const { mutateAsync: removeBankAccountMutation, isLoading: isRemovingBank } =
    trpc.settings.bookingApp.removeBankAccount.useMutation({ onSuccess: invalidate });

  // ── Derived data ──────────────────────────────────────────────────────────

  const currentMethods = settingsFromDb?.paymentMethods ?? DEFAULT_PAYMENT_DATA.methods;
  const currentBankAccounts = settingsFromDb?.bankAccounts ?? [];

  // ── paymentMethods actions ────────────────────────────────────────────────

  const setMethod = useCallback(
    (method: PaymentMethod, active: boolean) => {
      const next = active
        ? currentMethods.includes(method)
          ? currentMethods
          : [...currentMethods, method]
        : currentMethods.filter((m) => m !== method);

      // Enforce: at least one method must remain active.
      if (next.length === 0) return;

      void setPaymentMethodsMutation({ methods: next });
    },
    [setPaymentMethodsMutation, currentMethods]
  );

  const setQrisImageUrl = useCallback(
    (url: string | null) => {
      // Blob/data URLs are local-only previews — cannot be persisted.
      // null = explicit removal → write to DB.
      // https:// = real URL (Sprint 4 upload result) → write to DB.
      if (url !== null && !url.startsWith('https://')) return;

      void setQrisImageUrlMutation({ url });
    },
    [setQrisImageUrlMutation]
  );

  // ── bankAccounts actions ──────────────────────────────────────────────────

  const addBankAccount = useCallback(
    (account: Omit<BankAccount, 'id'>) => {
      void addBankAccountMutation({
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountHolderName: account.accountHolderName,
        isActive: account.isActive,
        sortOrder: currentBankAccounts.length,
      });
    },
    [addBankAccountMutation, currentBankAccounts.length]
  );

  const updateBankAccount = useCallback(
    (id: string, patch: Partial<Omit<BankAccount, 'id'>>) => {
      void updateBankAccountMutation({ id, patch });
    },
    [updateBankAccountMutation]
  );

  const removeBankAccount = useCallback(
    (id: string) => {
      void removeBankAccountMutation({ id });
    },
    [removeBankAccountMutation]
  );

  // ── confirmation action ───────────────────────────────────────────────────

  const saveConfirmationMode = useCallback(
    (mode: ConfirmationMode) => {
      void setConfirmationModeMutation({ mode });
    },
    [setConfirmationModeMutation]
  );

  // ── salonPolicy action ────────────────────────────────────────────────────

  const saveSalonPolicy = useCallback(
    (text: string | null) => {
      const trimmed = text?.trim() ?? null;
      void setSalonPolicyMutation({ policy: trimmed === '' ? null : trimmed });
    },
    [setSalonPolicyMutation]
  );

  // ── Assemble ──────────────────────────────────────────────────────────────

  return {
    paymentMethods: {
      data: {
        methods: currentMethods,
        qrisImageUrl: settingsFromDb?.qrisImageUrl ?? null,
      },
      isLoading,
      isSaving: isSavingPaymentMethods || isSavingQris,
      setMethod,
      setQrisImageUrl,
    },
    bankAccounts: {
      data: currentBankAccounts,
      isLoading,
      isSaving: isAddingBank || isUpdatingBank || isRemovingBank,
      add: addBankAccount,
      update: updateBankAccount,
      remove: removeBankAccount,
    },
    confirmation: {
      data: settingsFromDb?.confirmationMode ?? 'auto',
      isLoading,
      isSaving: isSavingConfirmation,
      save: saveConfirmationMode,
    },
    salonPolicy: {
      data: settingsFromDb?.salonPolicy ?? null,
      isLoading,
      isSaving: isSavingSalonPolicy,
      save: saveSalonPolicy,
    },
  };
}
