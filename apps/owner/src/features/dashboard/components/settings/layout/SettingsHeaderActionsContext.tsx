'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface SettingsActions {
  onSave: () => void;
  onCancel: () => void;
  isDirty: boolean;
  isSaving: boolean;
  saveLabel?: string;
}

interface SettingsHeaderActionsContextValue {
  actions: SettingsActions | null;
  register: (a: SettingsActions | null) => void;
}

const SettingsHeaderActionsContext = createContext<SettingsHeaderActionsContextValue>({
  actions: null,
  register: () => {},
});

export function SettingsHeaderActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<SettingsActions | null>(null);
  const register = useCallback((a: SettingsActions | null) => setActions(a), []);
  return (
    <SettingsHeaderActionsContext.Provider value={{ actions, register }}>
      {children}
    </SettingsHeaderActionsContext.Provider>
  );
}

/** Used by SettingsPageHeader to render the buttons. */
export function useSettingsHeaderActions() {
  return useContext(SettingsHeaderActionsContext).actions;
}

/** Used by each settings page to register its save/cancel handlers. */
export function useRegisterSettingsActions(actions: SettingsActions) {
  const { register } = useContext(SettingsHeaderActionsContext);
  useEffect(() => {
    register(actions);
    // re-register whenever dirty/saving state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions.isDirty, actions.isSaving]);
  useEffect(() => {
    return () => register(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
