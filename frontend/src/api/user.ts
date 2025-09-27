import { apiClient } from './client';
import type { AuthenticatedUser } from '../types/api';

export const fetchProfile = async () => {
  const { data } = await apiClient.get<{
    id: string;
    email: string;
    role: AuthenticatedUser['role'];
    profile?: AuthenticatedUser['profile'];
    projects?: Array<{
      id: string;
      title: string;
      status: string;
      role: string;
    }>;
  }>('/user/profile');

  return data;
};
