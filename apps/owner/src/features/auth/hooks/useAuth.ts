'use client';

// Temporary dummy auth hooks - will be replaced with real auth later

const DUMMY_USER = {
  id: 'dummy-user',
  email: 'owner@rarabeauty.com',
  role: 'OWNER',
  name: 'Sarah Owner',
  permissions: [] as string[],
};

export function useAuth() {
  return {
    currentUser: DUMMY_USER,
    isAuthenticated: true,
    isLoading: false,
    hasPermission: (_permission: string) => true,
    hasAnyPermission: (_permissions: string[]) => true,
    hasAllPermissions: (_permissions: string[]) => true,
    login: async () => {},
    logout: async () => {},
  };
}

export function useCurrentUser() {
  return DUMMY_USER;
}

export function useUserRole(): string {
  return 'OWNER';
}

export function useHasPermission(_permission: string): boolean {
  return true;
}

export function useHasAnyPermission(_permissions: string[]): boolean {
  return true;
}

export function useHasAllPermissions(_permissions: string[]): boolean {
  return true;
}

export function useCanAccess(_permission: string): boolean {
  return true;
}

export function usePermissions(): string[] {
  return [];
}

export function useIsAuthenticated(): boolean {
  return true;
}

export function useIsRole(role: string): boolean {
  return role === 'OWNER';
}

export function useIsOwner(): boolean {
  return true;
}

export function useIsManagerOrOwner(): boolean {
  return true;
}
