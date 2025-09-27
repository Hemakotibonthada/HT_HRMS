import { createContext } from 'react';
import type { AuthenticatedUser, LoginResponse } from '../types/api';

export type AuthState = {
  token: string;
  user: AuthenticatedUser;
};

export type AuthContextValue = {
  user: AuthenticatedUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  refreshProfile: () => Promise<AuthenticatedUser>;
};

export const STORAGE_KEY = 'ht-connect/auth-state';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
