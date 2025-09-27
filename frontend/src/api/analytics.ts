import { apiClient } from './client';
import type {
  AnalyticsOverview,
  ExpenseStatus,
  PayrollStatus,
  PerformanceCycleStatus,
  RecruitmentStage,
  UserRole,
} from '../types/api';

type AnalyticsResponse = Record<string, unknown>;

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toOptionalString = (value: unknown): string | null => (typeof value === 'string' ? value : null);

const toRecord = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' ? (value as Record<string, unknown>) : {});

const recruitmentStages: RecruitmentStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'ARCHIVED'];
const expenseStatuses: ExpenseStatus[] = ['SUBMITTED', 'APPROVED', 'REJECTED', 'REIMBURSED'];
const payrollStatuses: PayrollStatus[] = ['DRAFT', 'FINALIZED'];

const normalizeStagePipeline = (value: unknown): Record<RecruitmentStage, number> => {
  const record = toRecord(value);
  return recruitmentStages.reduce<Record<RecruitmentStage, number>>((acc, stage) => {
    acc[stage] = toNumber(record[stage], 0);
    return acc;
  }, {} as Record<RecruitmentStage, number>);
};

const normalizeExpenses = (value: unknown) => {
  const record = toRecord(value);
  return expenseStatuses.reduce<Record<ExpenseStatus, { count: number; amount: number }>>((acc, status) => {
    const entry = toRecord(record[status]);
    acc[status] = {
      count: toNumber(entry.count, 0),
      amount: toNumber(entry.amount, 0),
    };
    return acc;
  }, {} as Record<ExpenseStatus, { count: number; amount: number }>);
};

const normalizeAttendance = (value: unknown) => {
  const record = toRecord(value);
  const byDayRecord = toRecord(record.byDay);
  const byDay = Object.entries(byDayRecord).reduce<Record<string, { checkIns: number; checkOuts: number }>>((acc, [day, totals]) => {
    const totalsRecord = toRecord(totals);
    acc[day] = {
      checkIns: toNumber(totalsRecord.checkIns, 0),
      checkOuts: toNumber(totalsRecord.checkOuts, 0),
    };
    return acc;
  }, {});

  return {
    totalCheckIns: toNumber(record.totalCheckIns, 0),
    totalCheckOuts: toNumber(record.totalCheckOuts, 0),
    byDay,
  } satisfies AnalyticsOverview['attendance'];
};

const userRoles: UserRole[] = ['ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE'];

const normalizeRoleBreakdown = (value: unknown) => {
  const record = toRecord(value);
  const result = Object.entries(record).reduce<Record<string, number>>((acc, [role, count]) => {
    acc[role] = toNumber(count, 0);
    return acc;
  }, {});
  userRoles.forEach((role) => {
    if (result[role] == null) {
      result[role] = 0;
    }
  });
  return result as Record<UserRole, number> & Record<string, number>;
};

const performanceStatuses: PerformanceCycleStatus[] = ['UPCOMING', 'ACTIVE', 'CLOSED'];

const normalizePerformance = (value: unknown) => {
  const record = toRecord(value);
  const result = Object.entries(record).reduce<Record<string, number>>((acc, [key, entry]) => {
    acc[key] = toNumber(entry, 0);
    return acc;
  }, {});
  performanceStatuses.forEach((status) => {
    if (result[status] == null) {
      result[status] = 0;
    }
  });
  return result as Record<PerformanceCycleStatus, number> & Record<string, number>;
};

const normalizePayrollEntries = (entries: unknown): NonNullable<AnalyticsOverview['payroll']>['entries'] => {
  if (!Array.isArray(entries)) {
    return [];
  }
  return entries.map((entry) => {
    const record = toRecord(entry);
    const idValue = record.id;
    const userIdValue = record.userId;
    return {
      id: typeof idValue === 'string' ? idValue : String(idValue ?? ''),
      userId: typeof userIdValue === 'string' ? userIdValue : String(userIdValue ?? ''),
      netPay: toNumber(record.netPay, 0),
    };
  });
};

const normalizePayroll = (value: unknown): AnalyticsOverview['payroll'] => {
  const record = toRecord(value);
  const statusValue = record.status;
  const status = typeof statusValue === 'string' && payrollStatuses.includes(statusValue as PayrollStatus)
    ? (statusValue as PayrollStatus)
    : 'DRAFT';

  const month = toNumber(record.month, 0);
  const year = toNumber(record.year, 0);

  if (!record.id) {
    return null;
  }

  return {
    id: typeof record.id === 'string' ? record.id : String(record.id),
    label: toOptionalString(record.label),
    month,
    year,
    status,
    processedAt: toOptionalString(record.processedAt) ?? undefined,
    totalGross: toNumber(record.totalGross, 0),
    totalNet: toNumber(record.totalNet, 0),
    entries: normalizePayrollEntries(record.entries),
  } satisfies AnalyticsOverview['payroll'];
};

export const fetchAnalyticsOverview = async (): Promise<AnalyticsOverview> => {
  const { data } = await apiClient.get<AnalyticsResponse>('/analytics/overview');
  const raw = toRecord(data);
  const recruitmentRaw = toRecord(raw.recruitment);

  return {
    headcount: toNumber(raw.headcount, 0),
  roleBreakdown: normalizeRoleBreakdown(raw.roleBreakdown),
    activeProjects: toNumber(raw.activeProjects, 0),
    attendance: normalizeAttendance(raw.attendance),
    recruitment: {
      openJobs: toNumber(recruitmentRaw.openJobs, 0),
      pipeline: normalizeStagePipeline(recruitmentRaw.pipeline),
    },
    expenses: normalizeExpenses(raw.expenses),
    payroll: normalizePayroll(raw.payroll),
  performance: normalizePerformance(raw.performance),
    generatedAt: toOptionalString(raw.generatedAt) ?? new Date().toISOString(),
    period: {
      startOfMonth: toOptionalString(toRecord(raw.period).startOfMonth) ?? new Date().toISOString(),
      last30DaysStart: toOptionalString(toRecord(raw.period).last30DaysStart) ?? new Date().toISOString(),
    },
  };
};
