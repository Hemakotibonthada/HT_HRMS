import { apiClient } from './client';
import type { LoginResponse } from '../types/api';

interface LoginPayload {
  email: string;
  password: string;
}

export const login = async (payload: LoginPayload) => {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
  return data;
};
