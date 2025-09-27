import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { AuthenticatedUser } from '../types/api';
import { login as loginRequest } from '../api/auth';
import { fetchProfile } from '../api/user';
import type { AssignedProject } from '../types/api';
import { setAuthToken } from '../api/client';
import { AuthContext, STORAGE_KEY, type AuthContextValue, type AuthState } from './AuthContext';

const getInitialState = (): AuthState | null => {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthState;
    return parsed;
  } catch (error) {
    console.warn('Failed to parse auth state', error);
    return null;
  }
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<AuthState | null>(() => getInitialState());

  useEffect(() => {
    if (state?.token) {
      setAuthToken(state.token);
    }
  }, [state?.token]);

  useEffect(() => {
    if (state) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [state]);

  const logout = useCallback(() => {
    setState(null);
    setAuthToken(undefined);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest({ email, password });
    setAuthToken(response.token);

    const profile = await fetchProfile();
    const projects: AssignedProject[] = (profile.projects ?? []).map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status as AssignedProject['status'],
      role: project.role as AssignedProject['role'],
    }));

    const authState: AuthState = {
      token: response.token,
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        profile: profile.profile ?? response.user.profile,
        projects,
      },
    };
    setState(authState);
    return {
      token: response.token,
      user: authState.user,
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await fetchProfile();
    let nextUser: AuthenticatedUser | null = null;

    setState((prev) => {
      if (!prev) return prev;

      nextUser = {
        ...prev.user,
        id: profile.id,
        email: profile.email,
        role: profile.role,
        profile: profile.profile ?? prev.user.profile,
        projects: (profile.projects ?? prev.user.projects ?? []).map((project) => ({
          id: project.id,
          title: project.title,
          status: project.status as AssignedProject['status'],
          role: project.role as AssignedProject['role'],
        })),
      };

      return {
        ...prev,
        user: nextUser!,
      };
    });

    return (
      nextUser ?? {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        profile: profile.profile,
        projects: (profile.projects ?? []).map((project) => ({
          id: project.id,
          title: project.title,
          status: project.status as AssignedProject['status'],
          role: project.role as AssignedProject['role'],
        })),
      }
    );
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: state?.user ?? null,
    token: state?.token ?? null,
    isAuthenticated: Boolean(state?.token),
    login,
    logout,
    refreshProfile,
  }), [login, logout, refreshProfile, state?.token, state?.user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
