import { apiClient } from './client';
import type {
  CandidateApplicationRecord,
  CandidatePayload,
  CandidateStageHistoryEntry,
  EmployeeProfile,
  EmploymentType,
  JobOpeningPayload,
  JobOpeningSummary,
  JobStatus,
  JobWithCandidates,
  MinimalUser,
  RecruitmentPipelineSummary,
  RecruitmentStage,
  UpdateCandidatePayload,
} from '../types/api';

const recruitmentStages: RecruitmentStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'ARCHIVED'];
const employmentTypes: EmploymentType[] = ['FULL_TIME', 'CONTRACT', 'INTERN'];
const jobStatuses: JobStatus[] = ['OPEN', 'CLOSED', 'PAUSED'];
const FALLBACK_DATE = '1970-01-01T00:00:00.000Z';

const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
};

const toId = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toStringOrNull = (value: unknown): string | null => (typeof value === 'string' ? value : null);
const toOptionalString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

const toEnum = <T extends string>(value: unknown, values: readonly T[], fallback: T): T => {
  if (typeof value === 'string' && values.includes(value as T)) {
    return value as T;
  }
  return fallback;
};

const normalizeStageSummary = (summary: unknown): Record<RecruitmentStage, number> => {
  const summaryRecord = toRecord(summary);
  return recruitmentStages.reduce((acc, stage) => {
    acc[stage] = toNumber(summaryRecord[stage], 0);
    return acc;
  }, {} as Record<RecruitmentStage, number>);
};

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

const mapStageHistoryEntry = (value: unknown): CandidateStageHistoryEntry => {
  const record = toRecord(value);

  const fromStage = record.fromStage == null
    ? record.fromStage === undefined
      ? undefined
      : null
    : toEnum(record.fromStage, recruitmentStages, 'APPLIED');

  const changedBy = record.changedBy === undefined
    ? undefined
    : record.changedBy === null
      ? null
      : mapMinimalUser(record.changedBy);

  return {
    id: toId(record.id, 'unknown-history-entry'),
    fromStage: fromStage as CandidateStageHistoryEntry['fromStage'],
    toStage: toEnum(record.toStage, recruitmentStages, 'APPLIED'),
    note: toStringOrNull(record.note),
    changedAt: typeof record.changedAt === 'string' ? record.changedAt : FALLBACK_DATE,
    changedBy,
  };
};

const mapCandidate = (candidate: unknown): CandidateApplicationRecord => {
  const record = toRecord(candidate);

  return {
    id: toId(record.id, 'unknown-candidate'),
    jobId: toId(record.jobId, 'unknown-job'),
    firstName: typeof record.firstName === 'string' ? record.firstName : 'Candidate',
    lastName: typeof record.lastName === 'string' ? record.lastName : 'Applicant',
    email: typeof record.email === 'string' ? record.email : '',
    phone: toStringOrNull(record.phone),
    resumeUrl: toStringOrNull(record.resumeUrl),
    source: toStringOrNull(record.source),
    stage: toEnum(record.stage, recruitmentStages, 'APPLIED'),
    notes: toStringOrNull(record.notes),
    lastInteraction: toStringOrNull(record.lastInteraction),
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : FALLBACK_DATE,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : FALLBACK_DATE,
    history: Array.isArray(record.history) ? record.history.map(mapStageHistoryEntry) : [],
  };
};

const mapJobSummary = (job: unknown): JobOpeningSummary => {
  const record = toRecord(job);
  const counts = toRecord(record._count);
  const stageSource = record.stageSummary ?? record.stageCounts ?? record.stageBreakdown;

  return {
    id: toId(record.id, 'unknown-job'),
    title: typeof record.title === 'string' ? record.title : 'Untitled Role',
    department: typeof record.department === 'string' ? record.department : 'General',
    location: toStringOrNull(record.location),
    description: toStringOrNull(record.description),
    employmentType: toEnum(record.employmentType, employmentTypes, 'FULL_TIME'),
    status: toEnum(record.status, jobStatuses, 'OPEN'),
    openings: toNumber(record.openings, 0),
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : FALLBACK_DATE,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : FALLBACK_DATE,
    totalCandidates: toNumber(record.totalCandidates ?? counts.candidates, 0),
    stageSummary: normalizeStageSummary(stageSource),
  };
};

const mapRecruitmentTotals = (value: unknown): RecruitmentPipelineSummary['totals'] => {
  const totals = toRecord(value);
  return {
    totalCandidates: toNumber(totals.totalCandidates, 0),
    stageBreakdown: normalizeStageSummary(totals.stageBreakdown),
    lastCandidateAt: toStringOrNull(totals.lastCandidateAt),
  };
};

export const fetchJobOpenings = async (params?: { status?: string }) => {
  const { data } = await apiClient.get<unknown>('/recruitment/jobs', { params });
  return (Array.isArray(data) ? data : []).map(mapJobSummary);
};

export const createJobOpening = async (payload: JobOpeningPayload) => {
  const { data } = await apiClient.post<unknown>('/recruitment/jobs', payload);
  return mapJobSummary(data);
};

export const updateJobOpening = async (jobId: string, payload: Partial<JobOpeningPayload>) => {
  const { data } = await apiClient.patch<unknown>(`/recruitment/jobs/${jobId}`, payload);
  return mapJobSummary(data);
};

export const fetchJobWithCandidates = async (jobId: string): Promise<JobWithCandidates> => {
  const { data } = await apiClient.get<unknown>(`/recruitment/jobs/${jobId}/candidates`);
  const record = toRecord(data);
  return {
    ...mapJobSummary(record),
    candidates: Array.isArray(record.candidates) ? record.candidates.map(mapCandidate) : [],
  };
};

export const createCandidate = async (jobId: string, payload: CandidatePayload) => {
  const { data } = await apiClient.post<unknown>(`/recruitment/jobs/${jobId}/candidates`, payload);
  return mapCandidate(data);
};

export const updateCandidate = async (candidateId: string, payload: UpdateCandidatePayload) => {
  const { data } = await apiClient.patch<unknown>(`/recruitment/candidates/${candidateId}`, payload);
  return mapCandidate(data);
};

export const fetchRecruitmentPipeline = async (): Promise<RecruitmentPipelineSummary[]> => {
  const { data } = await apiClient.get<unknown>('/recruitment/pipeline');
  const jobs = Array.isArray(data) ? data : [];
  return jobs.map((job) => {
    const record = toRecord(job);
    return {
      ...mapJobSummary(record),
      totals: mapRecruitmentTotals(record.totals),
    };
  });
};
