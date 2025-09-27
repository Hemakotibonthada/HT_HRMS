import { apiClient } from './client';
import type { AttendanceDaySummary, AttendanceLog, AttendanceLogPayload } from '../types/api';

export const fetchAttendanceLogs = async (params?: { from?: string; to?: string; method?: AttendanceLog['method']; userId?: string; limit?: number }) => {
  const { data } = await apiClient.get<AttendanceLog[]>('/attendance/logs', { params });
  return data;
};

export const fetchAttendanceSummary = async (params?: { from?: string; to?: string; userId?: string }) => {
  const { data } = await apiClient.get<AttendanceDaySummary[]>('/attendance/summary', { params });
  return data;
};

export const createAttendanceLog = async (payload: AttendanceLogPayload) => {
  const { data } = await apiClient.post<AttendanceLog>('/attendance/logs', payload);
  return data;
};
