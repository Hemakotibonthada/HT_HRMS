import { apiClient } from './client';
import type {
  ExpenseClaimPayload,
  ExpenseClaimRecord,
  ExpenseStatus,
  ExpenseSummaryResponse,
  MinimalUser,
  UpdateExpensePayload,
} from '../types/api';

const expenseStatuses: ExpenseStatus[] = ['SUBMITTED', 'APPROVED', 'REJECTED', 'REIMBURSED'];

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toStringOrNull = (value: unknown): string | null => (typeof value === 'string' ? value : null);

const toRecord = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' ? (value as Record<string, unknown>) : {});

const toMinimalUser = (value: unknown): MinimalUser => {
  const record = toRecord(value);
  const idValue = record.id;
  const emailValue = record.email;
  const profileValue = record.profile;
  return {
    id: typeof idValue === 'string' ? idValue : String(idValue ?? ''),
    email: typeof emailValue === 'string' ? emailValue : undefined,
    profile: profileValue && typeof profileValue === 'object' ? (profileValue as MinimalUser['profile']) : null,
  };
};

const normalizeStatus = (value: unknown): ExpenseStatus => {
  if (typeof value === 'string' && expenseStatuses.includes(value as ExpenseStatus)) {
    return value as ExpenseStatus;
  }
  return 'SUBMITTED';
};

const mapExpense = (claim: unknown): ExpenseClaimRecord => {
  const record = toRecord(claim);
  return {
    id: typeof record.id === 'string' ? record.id : String(record.id ?? ''),
    user: toMinimalUser(record.user),
    title: typeof record.title === 'string' ? record.title : 'Expense',
    description: toStringOrNull(record.description),
    category: (record.category as ExpenseClaimRecord['category']) ?? 'OTHER',
    amount: toNumber(record.amount, 0),
    currency: typeof record.currency === 'string' ? record.currency : 'INR',
    incurredOn: typeof record.incurredOn === 'string' ? record.incurredOn : new Date().toISOString(),
    receiptUrl: toStringOrNull(record.receiptUrl),
    status: normalizeStatus(record.status),
    submittedAt: typeof record.submittedAt === 'string' ? record.submittedAt : new Date().toISOString(),
    approvedAt: toStringOrNull(record.approvedAt),
    approvedBy: record.approvedBy ? toMinimalUser(record.approvedBy) : null,
    rejectionReason: toStringOrNull(record.rejectionReason),
    notes: toStringOrNull(record.notes),
  } satisfies ExpenseClaimRecord;
};

const normalizeSummary = (value: unknown): Record<ExpenseStatus, { count: number; amount: number }> => {
  const summaryRecord = toRecord(value);
  return expenseStatuses.reduce<Record<ExpenseStatus, { count: number; amount: number }>>((acc, status) => {
    const entry = toRecord(summaryRecord[status]);
    acc[status] = {
      count: toNumber(entry.count, 0),
      amount: toNumber(entry.amount, 0),
    };
    return acc;
  }, {} as Record<ExpenseStatus, { count: number; amount: number }>);
};

export const fetchExpenseClaims = async (params?: { status?: ExpenseStatus; userId?: string }) => {
  const { data } = await apiClient.get<unknown>('/expenses', { params });
  return (Array.isArray(data) ? data : []).map(mapExpense);
};

export const submitExpenseClaim = async (payload: ExpenseClaimPayload) => {
  const { data } = await apiClient.post<unknown>('/expenses', payload);
  return mapExpense(data);
};

export const updateExpenseClaim = async (id: string, payload: UpdateExpensePayload) => {
  const { data } = await apiClient.patch<unknown>(`/expenses/${id}`, payload);
  return mapExpense(data);
};

export const fetchExpenseSummary = async () => {
  const { data } = await apiClient.get<unknown>('/expenses/summary');
  const record = toRecord(data);
  return {
    byStatus: normalizeSummary(record.byStatus),
    approvedThisMonth: toNumber(record.approvedThisMonth, 0),
  } satisfies ExpenseSummaryResponse;
};
