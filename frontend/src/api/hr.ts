import { apiClient } from './client';
import type {
  BenefitEnrollmentPayload,
  BenefitEnrollmentRecord,
  BenefitEnrollmentStatus,
  BenefitPlanPayload,
  BenefitPlanSummary,
  BenefitType,
  EmployeeProfile,
  MinimalUser,
  PerformanceCycleSummary,
  PerformanceCycleStatus,
  PerformanceGoalPayload,
  PerformanceGoalRecord,
  PerformanceGoalStatus,
  PerformanceReviewPayload,
  PerformanceReviewRecord,
  PerformanceReviewStatus,
  PerformanceRating,
  PayrollEntryDetail,
  PayrollRunPayload,
  PayrollRunSummary,
  PayrollStatus,
} from '../types/api';

const FALLBACK_DATE = '1970-01-01T00:00:00.000Z';
const FALLBACK_MONTH = 1;
const FALLBACK_YEAR = 1970;

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toNumberOrNull = (value: unknown): number | null => {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const toStringOrNull = (value: unknown): string | null => (typeof value === 'string' ? value : null);
const toOptionalString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

const toId = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
};

const toEnum = <T extends string>(value: unknown, values: readonly T[], fallback: T): T => {
  if (typeof value === 'string' && values.includes(value as T)) {
    return value as T;
  }
  return fallback;
};

const benefitTypes: BenefitType[] = ['HEALTH', 'INSURANCE', 'RETIREMENT', 'WELLNESS', 'OTHER'];
const benefitEnrollmentStatuses: BenefitEnrollmentStatus[] = ['ACTIVE', 'PENDING', 'CANCELLED'];
const payrollStatuses: PayrollStatus[] = ['DRAFT', 'FINALIZED'];
const performanceCycleStatuses: PerformanceCycleStatus[] = ['UPCOMING', 'ACTIVE', 'CLOSED'];
const performanceGoalStatuses: PerformanceGoalStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'ON_TRACK', 'AT_RISK', 'COMPLETED'];
const performanceReviewStatuses: PerformanceReviewStatus[] = ['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED'];
const performanceRatings: PerformanceRating[] = ['OUTSTANDING', 'EXCEEDS', 'MEETS', 'DEVELOPING', 'UNSATISFACTORY'];

const mapEmployeeProfile = (value: unknown): EmployeeProfile | null => {
  const record = toRecord(value);
  const firstName = toOptionalString(record.firstName);
  const lastName = toOptionalString(record.lastName);
  const position = toOptionalString(record.position);
  const department = toOptionalString(record.department);
  const joiningDate = toOptionalString(record.joiningDate);
  const contactEmail = toOptionalString(record.contactEmail);

  if (!firstName || !lastName || !position || !department || !joiningDate || !contactEmail) {
    return null;
  }

  const profile: EmployeeProfile = {
    id: toOptionalString(record.id),
    firstName,
    lastName,
    position,
    department,
    joiningDate,
    contactEmail,
  };

  if (record.contactPhone !== undefined) {
    profile.contactPhone = record.contactPhone == null ? null : toOptionalString(record.contactPhone) ?? null;
  }

  if (record.emergencyContact !== undefined) {
    profile.emergencyContact = record.emergencyContact == null ? null : toOptionalString(record.emergencyContact) ?? null;
  }

  if (record.reportingManager !== undefined) {
    profile.reportingManager = record.reportingManager == null ? null : toOptionalString(record.reportingManager) ?? null;
  }

  if (record.managerId !== undefined) {
    profile.managerId = record.managerId == null ? null : toOptionalString(record.managerId) ?? null;
  }

  return profile;
};

const mapMinimalUser = (value: unknown): MinimalUser => {
  const record = toRecord(value);
  const minimal: MinimalUser = {
    id: toId(record.id, 'unknown-user'),
  };

  const email = toOptionalString(record.email);
  if (email) minimal.email = email;

  const profile = mapEmployeeProfile(record.profile);
  if (profile !== null) {
    minimal.profile = profile;
  } else if (record.profile !== undefined) {
    minimal.profile = null;
  }

  return minimal;
};

const mapPlan = (plan: unknown): BenefitPlanSummary => {
  const record = toRecord(plan);
  const enrollmentRecord = record.enrollment != null ? toRecord(record.enrollment) : null;

  return {
    id: toId(record.id, 'unknown-benefit-plan'),
    name: typeof record.name === 'string' ? record.name : 'Benefit Plan',
    description: toStringOrNull(record.description),
    type: toEnum(record.type, benefitTypes, 'OTHER'),
    employeeContribution: toNumberOrNull(record.employeeContribution),
    employerContribution: toNumberOrNull(record.employerContribution),
    effectiveFrom: toStringOrNull(record.effectiveFrom),
    effectiveTo: toStringOrNull(record.effectiveTo),
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : FALLBACK_DATE,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : FALLBACK_DATE,
    enrollment: enrollmentRecord
      ? {
          id: toId(enrollmentRecord.id, 'unknown-benefit-enrollment'),
          status: toEnum(enrollmentRecord.status, benefitEnrollmentStatuses, 'PENDING'),
          effectiveDate: toStringOrNull(enrollmentRecord.effectiveDate),
          endDate: toStringOrNull(enrollmentRecord.endDate),
          employeeContribution: toNumberOrNull(enrollmentRecord.employeeContribution),
          employerContribution: toNumberOrNull(enrollmentRecord.employerContribution),
        }
      : null,
  };
};

const mapEnrollment = (value: unknown): BenefitEnrollmentRecord => {
  const record = toRecord(value);
  const planRecord = toRecord(record.plan);

  return {
    id: toId(record.id, 'unknown-benefit-enrollment'),
    status: toEnum(record.status, benefitEnrollmentStatuses, 'PENDING'),
    enrolledAt: typeof record.enrolledAt === 'string' ? record.enrolledAt : FALLBACK_DATE,
    effectiveDate: toStringOrNull(record.effectiveDate),
    endDate: toStringOrNull(record.endDate),
    employeeContribution: toNumberOrNull(record.employeeContribution),
    employerContribution: toNumberOrNull(record.employerContribution),
    plan: {
      id: toId(planRecord.id, 'unknown-benefit-plan'),
      name: typeof planRecord.name === 'string' ? planRecord.name : 'Benefit Plan',
      description: toStringOrNull(planRecord.description),
      type: toEnum(planRecord.type, benefitTypes, 'OTHER'),
    },
  };
};

const mapPayrollRun = (value: unknown): PayrollRunSummary => {
  const record = toRecord(value);
  const entries = Array.isArray(record.entries) ? record.entries : [];

  return {
    id: toId(record.id, 'unknown-payroll-run'),
    label: toStringOrNull(record.label),
    month: toNumber(record.month, FALLBACK_MONTH),
    year: toNumber(record.year, FALLBACK_YEAR),
    status: toEnum(record.status, payrollStatuses, 'DRAFT'),
    processedAt: toStringOrNull(record.processedAt),
    totalGross: toNumber(record.totalGross, 0),
    totalNet: toNumber(record.totalNet, 0),
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : FALLBACK_DATE,
    entries: entries.map((entry) => {
      const entryRecord = toRecord(entry);
      const userRecord = toRecord(entryRecord.user);

      const userId = typeof entryRecord.userId === 'string'
        ? entryRecord.userId
        : typeof userRecord.id === 'string'
          ? userRecord.id
          : toId(entryRecord.userId ?? userRecord.id, 'unknown-user');

      return {
        id: toId(entryRecord.id, 'unknown-payroll-entry'),
        userId,
        user: entryRecord.user ? mapMinimalUser(entryRecord.user) : undefined,
        grossPay: toNumber(entryRecord.grossPay, 0),
        deductions: toNumber(entryRecord.deductions, 0),
        netPay: toNumber(entryRecord.netPay, 0),
        notes: toStringOrNull(entryRecord.notes),
      };
    }),
  };
};

const mapPayrollEntryDetail = (value: unknown): PayrollEntryDetail => {
  const record = toRecord(value);
  const payrollRunRecord = toRecord(record.payrollRun);
  const userRecord = toRecord(record.user);

  const userId = typeof record.userId === 'string'
    ? record.userId
    : typeof userRecord.id === 'string'
      ? userRecord.id
      : toId(record.userId ?? userRecord.id, 'unknown-user');

  return {
    id: toId(record.id, 'unknown-payroll-entry'),
    userId,
    grossPay: toNumber(record.grossPay, 0),
    deductions: toNumber(record.deductions, 0),
    netPay: toNumber(record.netPay, 0),
    notes: toStringOrNull(record.notes),
    user: record.user ? mapMinimalUser(record.user) : undefined,
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : FALLBACK_DATE,
    payrollRun: {
      id: toId(payrollRunRecord.id, 'unknown-payroll-run'),
      label: toStringOrNull(payrollRunRecord.label),
      month: toNumber(payrollRunRecord.month, FALLBACK_MONTH),
      year: toNumber(payrollRunRecord.year, FALLBACK_YEAR),
      status: toEnum(payrollRunRecord.status, payrollStatuses, 'DRAFT'),
      processedAt: toStringOrNull(payrollRunRecord.processedAt),
    },
  };
};

const mapPerformanceCycle = (value: unknown): PerformanceCycleSummary => {
  const record = toRecord(value);

  return {
    id: toId(record.id, 'unknown-performance-cycle'),
    name: typeof record.name === 'string' ? record.name : 'Performance Cycle',
    status: toEnum(record.status, performanceCycleStatuses, 'UPCOMING'),
    startDate: typeof record.startDate === 'string' ? record.startDate : FALLBACK_DATE,
    endDate: typeof record.endDate === 'string' ? record.endDate : FALLBACK_DATE,
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : FALLBACK_DATE,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : FALLBACK_DATE,
  };
};

const mapPerformanceGoal = (value: unknown): PerformanceGoalRecord => {
  const record = toRecord(value);
  const cycleRecord = toRecord(record.cycle);

  const cycleId = typeof record.cycleId === 'string'
    ? record.cycleId
    : toId(cycleRecord.id, 'unknown-performance-cycle');

  const cycleStart = typeof cycleRecord.startDate === 'string'
    ? cycleRecord.startDate
    : typeof record.cycleStartDate === 'string'
      ? record.cycleStartDate
      : FALLBACK_DATE;

  const cycleEnd = typeof cycleRecord.endDate === 'string'
    ? cycleRecord.endDate
    : typeof record.cycleEndDate === 'string'
      ? record.cycleEndDate
      : FALLBACK_DATE;

  return {
    id: toId(record.id, 'unknown-performance-goal'),
    ownerId: toId(record.ownerId, 'unknown-user'),
    cycleId,
    title: typeof record.title === 'string' ? record.title : 'Goal',
    description: toStringOrNull(record.description),
    status: toEnum(record.status, performanceGoalStatuses, 'NOT_STARTED'),
    progress: toNumber(record.progress, 0),
    dueDate: toStringOrNull(record.dueDate),
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : FALLBACK_DATE,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : FALLBACK_DATE,
    cycle: {
      id: typeof cycleRecord.id === 'string' ? cycleRecord.id : cycleId,
      name: typeof cycleRecord.name === 'string'
        ? cycleRecord.name
        : typeof record.cycleName === 'string'
          ? record.cycleName
          : 'Performance Cycle',
      status: toEnum(cycleRecord.status ?? record.cycleStatus, performanceCycleStatuses, 'UPCOMING'),
      startDate: cycleStart,
      endDate: cycleEnd,
    },
  };
};

const mapPerformanceReview = (value: unknown): PerformanceReviewRecord => {
  const record = toRecord(value);
  const cycleRecord = toRecord(record.cycle);

  const cycleId = typeof record.cycleId === 'string'
    ? record.cycleId
    : toId(cycleRecord.id, 'unknown-performance-cycle');

  const cycleStart = typeof cycleRecord.startDate === 'string'
    ? cycleRecord.startDate
    : typeof record.cycleStartDate === 'string'
      ? record.cycleStartDate
      : FALLBACK_DATE;

  const cycleEnd = typeof cycleRecord.endDate === 'string'
    ? cycleRecord.endDate
    : typeof record.cycleEndDate === 'string'
      ? record.cycleEndDate
      : FALLBACK_DATE;

  return {
    id: toId(record.id, 'unknown-performance-review'),
    employee: mapMinimalUser(record.employee),
    manager: mapMinimalUser(record.manager),
    cycle: {
      id: typeof cycleRecord.id === 'string' ? cycleRecord.id : cycleId,
      name: typeof cycleRecord.name === 'string'
        ? cycleRecord.name
        : typeof record.cycleName === 'string'
          ? record.cycleName
          : 'Performance Cycle',
      status: toEnum(cycleRecord.status ?? record.cycleStatus, performanceCycleStatuses, 'UPCOMING'),
      startDate: cycleStart,
      endDate: cycleEnd,
    },
    status: toEnum(record.status, performanceReviewStatuses, 'DRAFT'),
    rating: record.rating == null ? null : toEnum(record.rating, performanceRatings, 'MEETS'),
    summary: toStringOrNull(record.summary),
    strengths: toStringOrNull(record.strengths),
    growthAreas: toStringOrNull(record.growthAreas),
    submittedAt: toStringOrNull(record.submittedAt),
    acknowledgedAt: toStringOrNull(record.acknowledgedAt),
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : FALLBACK_DATE,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : FALLBACK_DATE,
  };
};

export const fetchBenefitPlans = async () => {
  const { data } = await apiClient.get<unknown>('/hr/benefits/plans');
  return (Array.isArray(data) ? data : []).map(mapPlan);
};

export const createBenefitPlan = async (payload: BenefitPlanPayload) => {
  const { data } = await apiClient.post<unknown>('/hr/benefits/plans', payload);
  return mapPlan(data);
};

export const updateBenefitPlan = async (planId: string, payload: Partial<BenefitPlanPayload>) => {
  const { data } = await apiClient.patch<unknown>(`/hr/benefits/plans/${planId}`, payload);
  return mapPlan(data);
};

export const enrollInBenefitPlan = async (planId: string, payload: BenefitEnrollmentPayload) => {
  const body = {
    action: 'ENROLL',
    ...payload,
  };
  const { data } = await apiClient.post<unknown>(`/hr/benefits/plans/${planId}/enroll`, body);
  return mapEnrollment(data);
};

export const cancelBenefitEnrollment = async (planId: string, payload?: { userId?: string; endDate?: string }) => {
  const { data } = await apiClient.post<unknown>(`/hr/benefits/plans/${planId}/enroll`, {
    action: 'CANCEL',
    ...payload,
  });
  return mapEnrollment(data);
};

export const fetchBenefitEnrollments = async () => {
  const { data } = await apiClient.get<unknown>('/hr/benefits/enrollments');
  return (Array.isArray(data) ? data : []).map(mapEnrollment);
};

export const fetchPayrollRuns = async () => {
  const { data } = await apiClient.get<unknown>('/hr/payroll/runs');
  return (Array.isArray(data) ? data : []).map(mapPayrollRun);
};

export const createPayrollRun = async (payload: PayrollRunPayload) => {
  const { data } = await apiClient.post<unknown>('/hr/payroll/runs', payload);
  const record = toRecord(data);
  const entries = Array.isArray(record.entries) ? record.entries : [];
  return mapPayrollRun({ ...record, entries });
};

export const fetchMyPayrollEntries = async () => {
  const { data } = await apiClient.get<unknown>('/hr/payroll/entries/me');
  return (Array.isArray(data) ? data : []).map(mapPayrollEntryDetail);
};

export const fetchPerformanceCycles = async () => {
  const { data } = await apiClient.get<unknown>('/hr/performance/cycles');
  return (Array.isArray(data) ? data : []).map(mapPerformanceCycle);
};

export const createPerformanceCycle = async (payload: {
  name: string;
  status?: PerformanceCycleStatus;
  startDate: string;
  endDate: string;
}) => {
  const { data } = await apiClient.post<unknown>('/hr/performance/cycles', payload);
  return mapPerformanceCycle(data);
};

export const updatePerformanceCycle = async (
  id: string,
  payload: Partial<{ name: string; status: PerformanceCycleStatus; startDate: string; endDate: string }>,
) => {
  const { data } = await apiClient.patch<unknown>(`/hr/performance/cycles/${id}`, payload);
  return mapPerformanceCycle(data);
};

export const fetchPerformanceGoals = async (params?: { cycleId?: string; userId?: string }) => {
  const { data } = await apiClient.get<unknown>('/hr/performance/goals', { params });
  return (Array.isArray(data) ? data : []).map(mapPerformanceGoal);
};

export const createPerformanceGoal = async (payload: PerformanceGoalPayload) => {
  const { data } = await apiClient.post<unknown>('/hr/performance/goals', payload);
  return mapPerformanceGoal(data);
};

export const updatePerformanceGoal = async (id: string, payload: Partial<PerformanceGoalPayload>) => {
  const { data } = await apiClient.patch<unknown>(`/hr/performance/goals/${id}`, payload);
  return mapPerformanceGoal(data);
};

export const fetchPerformanceReviews = async (params?: { cycleId?: string }) => {
  const { data } = await apiClient.get<unknown>('/hr/performance/reviews', { params });
  return (Array.isArray(data) ? data : []).map(mapPerformanceReview);
};

export const upsertPerformanceReview = async (payload: PerformanceReviewPayload) => {
  const { data } = await apiClient.post<unknown>('/hr/performance/reviews', payload);
  return mapPerformanceReview(data);
};

export const updatePerformanceReview = async (id: string, payload: Partial<PerformanceReviewPayload>) => {
  const { data } = await apiClient.patch<unknown>(`/hr/performance/reviews/${id}`, payload);
  return mapPerformanceReview(data);
};
