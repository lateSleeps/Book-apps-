import { User } from './user';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
