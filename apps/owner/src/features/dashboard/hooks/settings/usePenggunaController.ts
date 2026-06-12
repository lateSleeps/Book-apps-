'use client';

import { useCallback, useContext } from 'react';
import { AuthContext } from '@/features/auth/context/AuthContext';
import type { User } from '@/features/auth/types/auth.types';
import { trpc } from '@/lib/trpc';

// ── Types ─────────────────────────────────────────────────────────────────────

export type InvitableRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface InviteUserDraft {
  name: string;
  email: string;
  role: InvitableRole;
}

export interface PenggunaController {
  users: User[];
  isLoading: boolean;
  currentUserId: string;
  inviteUser: (draft: InviteUserDraft) => void;
  updateRole: (userId: string, role: InvitableRole) => void;
  deactivateUser: (userId: string) => void;
  reactivateUser: (userId: string) => void;
  revokeUser: (userId: string) => void;
  resendInvite: (userId: string) => void;
  cancelInvite: (userId: string) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePenggunaController(): PenggunaController {
  const auth = useContext(AuthContext);
  const currentUserId = auth?.currentUser?.id ?? '';

  const utils = trpc.useUtils();

  // ── Query ────────────────────────────────────────────────────────────────

  const { data: users = [], isLoading } = trpc.settings.pengguna.getUsers.useQuery(undefined, {
    staleTime: 30_000,
    placeholderData: [],
  });

  // ── Invalidation ─────────────────────────────────────────────────────────

  const invalidate = useCallback(() => {
    void utils.settings.pengguna.getUsers.invalidate();
  }, [utils]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const { mutateAsync: inviteUserMutation } = trpc.settings.pengguna.inviteUser.useMutation({
    onSuccess: invalidate,
  });

  const { mutateAsync: updateRoleMutation } = trpc.settings.pengguna.updateRole.useMutation({
    onSuccess: invalidate,
  });

  const { mutateAsync: deactivateMutation } = trpc.settings.pengguna.deactivateUser.useMutation({
    onSuccess: invalidate,
  });

  const { mutateAsync: reactivateMutation } = trpc.settings.pengguna.reactivateUser.useMutation({
    onSuccess: invalidate,
  });

  const { mutateAsync: revokeMutation } = trpc.settings.pengguna.revokeUser.useMutation({
    onSuccess: invalidate,
  });

  const { mutateAsync: resendMutation } = trpc.settings.pengguna.resendInvite.useMutation({
    onSuccess: invalidate,
  });

  const { mutateAsync: cancelMutation } = trpc.settings.pengguna.cancelInvite.useMutation({
    onSuccess: invalidate,
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  const inviteUser = useCallback(
    (draft: InviteUserDraft) => {
      void inviteUserMutation(draft);
    },
    [inviteUserMutation]
  );

  const updateRole = useCallback(
    (userId: string, role: InvitableRole) => {
      void updateRoleMutation({ userId, role });
    },
    [updateRoleMutation]
  );

  const deactivateUser = useCallback(
    (userId: string) => {
      void deactivateMutation({ userId });
    },
    [deactivateMutation]
  );

  const reactivateUser = useCallback(
    (userId: string) => {
      void reactivateMutation({ userId });
    },
    [reactivateMutation]
  );

  const revokeUser = useCallback(
    (userId: string) => {
      void revokeMutation({ userId });
    },
    [revokeMutation]
  );

  const resendInvite = useCallback(
    (userId: string) => {
      void resendMutation({ userId });
    },
    [resendMutation]
  );

  const cancelInvite = useCallback(
    (userId: string) => {
      void cancelMutation({ userId });
    },
    [cancelMutation]
  );

  return {
    users,
    isLoading,
    currentUserId,
    inviteUser,
    updateRole,
    deactivateUser,
    reactivateUser,
    revokeUser,
    resendInvite,
    cancelInvite,
  };
}
