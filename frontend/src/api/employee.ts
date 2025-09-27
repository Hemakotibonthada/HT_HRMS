import { apiClient } from './client';
import type { OfferLetterPayload, OrgNode, PayslipEntry, TimesheetEntry } from '../types/api';

export const fetchTimesheets = async () => {
  const { data } = await apiClient.get<TimesheetEntry[]>('/employee/timesheets');
  return data;
};

export const submitTimesheet = async (payload: {
  projectId: string;
  workItemId?: string | null;
  workDate: string;
  hours: number;
  description?: string;
}) => {
  const { data } = await apiClient.post<TimesheetEntry>('/employee/timesheets', payload);
  return data;
};

export const updateTimesheetStatus = async (id: string, status: TimesheetEntry['status']) => {
  const { data } = await apiClient.patch<TimesheetEntry>(`/employee/timesheets/${id}/status`, { status });
  return data;
};

export const fetchPayslips = async (params?: { userId?: string }) => {
  const { data } = await apiClient.get<PayslipEntry[]>('/employee/payslips', { params });
  return data;
};

export const uploadPayslip = async (payload: { userId: string; month: number; year: number; file: File }) => {
  const body = new FormData();
  body.append('userId', payload.userId);
  body.append('month', String(payload.month));
  body.append('year', String(payload.year));
  body.append('file', payload.file);

  const { data } = await apiClient.post<PayslipEntry>('/employee/payslips', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
};

export const fetchOrgStructure = async () => {
  const { data } = await apiClient.get<OrgNode[]>('/employee/org-structure');
  return data;
};

export const generateOfferLetter = async (payload: OfferLetterPayload) => {
  const { data } = await apiClient.post<Blob>('/employee/offer-letters', payload, {
    responseType: 'blob',
  });
  return data;
};
