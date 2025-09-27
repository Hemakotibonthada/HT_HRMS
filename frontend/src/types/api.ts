export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'EMPLOYEE';

export type AttendanceMethod = 'BIOMETRIC' | 'GPS' | 'REMOTE';
export type AttendanceType = 'CHECK_IN' | 'CHECK_OUT';

export interface EmployeeProfile {
  id?: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  joiningDate: string;
  contactEmail: string;
  contactPhone?: string | null;
  emergencyContact?: string | null;
  reportingManager?: string | null;
  managerId?: string | null;
}

export interface AssignedProject {
  id: string;
  title: string;
  status: 'IN_PROGRESS' | 'COMPLETE' | 'ON_HOLD';
  role: 'MANAGER' | 'CONTRIBUTOR' | 'VIEWER';
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  profile?: EmployeeProfile | null;
  projects?: AssignedProject[];
}

export interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
}

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  status: 'IN_PROGRESS' | 'COMPLETE' | 'ON_HOLD';
  startDate?: string | null;
  dueDate?: string | null;
  managerId?: string;
  workItems?: WorkItem[];
  milestones?: Milestone[];
  members?: ProjectMember[];
}

export interface ProjectMembership {
  id: string;
  role: 'MANAGER' | 'CONTRIBUTOR' | 'VIEWER';
  userId: string;
  projectId: string;
}

export interface ProjectMember {
  id: string;
  role: ProjectMembership['role'];
  userId: string;
  projectId: string;
  user: MinimalUser;
}

export interface WorkItem {
  id: string;
  projectId: string;
  reporterId: string;
  assigneeId: string;
  title: string;
  description?: string | null;
  type: 'FEATURE' | 'BUG' | 'TASK';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  assignee?: MinimalUser;
  reporter?: MinimalUser;
  comments?: WorkItemComment[];
  history?: WorkItemHistory[];
}

export interface MinimalUser {
  id: string;
  email?: string;
  profile?: EmployeeProfile | null;
}

export interface WorkItemComment {
  id: string;
  workItemId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author?: MinimalUser;
}

export interface WorkItemHistory {
  id: string;
  workItemId: string;
  changedById: string;
  status: WorkItem['status'];
  changedAt: string;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  type: AttendanceType;
  method: AttendanceMethod;
  timestamp: string;
  deviceId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface AttendanceDaySummary {
  date: string;
  firstCheckIn: string | null;
  lastCheckOut: string | null;
  totalSessions: number;
  methodsUsed: AttendanceMethod[];
  totalDurationMinutes: number;
}

export interface AttendanceLogPayload {
  type: AttendanceType;
  method: AttendanceMethod;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  deviceId?: string;
  notes?: string;
  userId?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
}

export interface TimesheetEntry {
  id: string;
  userId: string;
  projectId: string;
  workItemId?: string | null;
  workDate: string;
  hours: string;
  description?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedById?: string | null;
  approvedAt?: string | null;
  submittedAt: string;
  project?: Pick<Project, 'id' | 'title' | 'managerId'>;
  workItem?: Pick<WorkItem, 'id' | 'title'>;
  user?: MinimalUser;
  approvedBy?: MinimalUser;
}

export interface ApiError {
  message: string;
  details?: unknown;
}

export interface PayslipEntry {
  id: string;
  userId: string;
  month: number;
  year: number;
  filePath: string;
  downloadUrl: string;
  createdAt: string;
}

export interface OrgNode {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  managerId?: string | null;
  children: OrgNode[];
}

export interface OfferLetterPayload {
  candidateName: string;
  title: string;
  salary: string;
  startDate: string;
  reportingManager: string;
  location: string;
  notes?: string;
}

export type BenefitType = 'HEALTH' | 'INSURANCE' | 'RETIREMENT' | 'WELLNESS' | 'OTHER';
export type BenefitEnrollmentStatus = 'ACTIVE' | 'PENDING' | 'CANCELLED';

export interface BenefitPlanSummary {
  id: string;
  name: string;
  description?: string | null;
  type: BenefitType;
  employeeContribution?: number | null;
  employerContribution?: number | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  createdAt: string;
  updatedAt: string;
  enrollment: BenefitEnrollmentPreview | null;
}

export interface BenefitEnrollmentPreview {
  id: string;
  status: BenefitEnrollmentStatus;
  effectiveDate?: string | null;
  endDate?: string | null;
  employeeContribution?: number | null;
  employerContribution?: number | null;
}

export interface BenefitEnrollmentRecord extends BenefitEnrollmentPreview {
  enrolledAt: string;
  plan: Pick<BenefitPlanSummary, 'id' | 'name' | 'description' | 'type'>;
}

export interface BenefitPlanPayload {
  name: string;
  description?: string;
  type: BenefitType;
  employeeContribution?: number;
  employerContribution?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface BenefitEnrollmentPayload {
  effectiveDate?: string;
  endDate?: string;
  employeeContribution?: number;
  employerContribution?: number;
  userId?: string;
}

export type PayrollStatus = 'DRAFT' | 'FINALIZED';

export interface PayrollEntry {
  id: string;
  userId: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  notes?: string | null;
  user?: MinimalUser;
}

export interface PayrollRunSummary {
  id: string;
  label?: string | null;
  month: number;
  year: number;
  status: PayrollStatus;
  processedAt?: string | null;
  totalGross: number;
  totalNet: number;
  createdAt: string;
  entries: PayrollEntry[];
}

export interface PayrollEntryDetail extends PayrollEntry {
  createdAt: string;
  payrollRun: Pick<PayrollRunSummary, 'id' | 'label' | 'month' | 'year' | 'status' | 'processedAt'>;
}

export interface PayrollRunPayload {
  label?: string;
  month: number;
  year: number;
  status: PayrollStatus;
  processedAt?: string;
  entries: Array<{
    userId: string;
    grossPay: number;
    deductions: number;
    netPay: number;
    notes?: string;
  }>;
}

export type PerformanceCycleStatus = 'UPCOMING' | 'ACTIVE' | 'CLOSED';
export type PerformanceGoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_TRACK' | 'AT_RISK' | 'COMPLETED';
export type PerformanceReviewStatus = 'DRAFT' | 'SUBMITTED' | 'ACKNOWLEDGED';
export type PerformanceRating = 'OUTSTANDING' | 'EXCEEDS' | 'MEETS' | 'DEVELOPING' | 'UNSATISFACTORY';

export interface PerformanceCycleSummary {
  id: string;
  name: string;
  status: PerformanceCycleStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceGoalRecord {
  id: string;
  ownerId: string;
  cycleId: string;
  title: string;
  description?: string | null;
  status: PerformanceGoalStatus;
  progress: number;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  cycle: Pick<PerformanceCycleSummary, 'id' | 'name' | 'status' | 'startDate' | 'endDate'>;
}

export interface PerformanceGoalPayload {
  cycleId: string;
  title: string;
  description?: string;
  status?: PerformanceGoalStatus;
  progress?: number;
  dueDate?: string;
  ownerId?: string;
}

export interface PerformanceReviewRecord {
  id: string;
  employee: MinimalUser;
  manager: MinimalUser;
  cycle: Pick<PerformanceCycleSummary, 'id' | 'name' | 'status' | 'startDate' | 'endDate'>;
  status: PerformanceReviewStatus;
  rating?: PerformanceRating | null;
  summary?: string | null;
  strengths?: string | null;
  growthAreas?: string | null;
  submittedAt?: string | null;
  acknowledgedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReviewPayload {
  employeeId: string;
  cycleId: string;
  managerId?: string;
  status?: PerformanceReviewStatus;
  rating?: PerformanceRating;
  summary?: string;
  strengths?: string;
  growthAreas?: string;
  submittedAt?: string;
  acknowledgedAt?: string;
}

export type JobStatus = 'OPEN' | 'CLOSED' | 'PAUSED';
export type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'INTERN';
export type RecruitmentStage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'ARCHIVED';

export interface JobOpeningSummary {
  id: string;
  title: string;
  department: string;
  location?: string | null;
  description?: string | null;
  employmentType: EmploymentType;
  status: JobStatus;
  openings: number;
  createdAt: string;
  updatedAt: string;
  totalCandidates: number;
  stageSummary: Record<RecruitmentStage, number>;
}

export interface CandidateStageHistoryEntry {
  id: string;
  fromStage?: RecruitmentStage | null;
  toStage: RecruitmentStage;
  note?: string | null;
  changedAt: string;
  changedBy?: MinimalUser | null;
}

export interface CandidateApplicationRecord {
  id: string;
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  resumeUrl?: string | null;
  source?: string | null;
  stage: RecruitmentStage;
  notes?: string | null;
  lastInteraction?: string | null;
  createdAt: string;
  updatedAt: string;
  history?: CandidateStageHistoryEntry[];
}

export interface JobWithCandidates extends JobOpeningSummary {
  candidates: CandidateApplicationRecord[];
}

export interface RecruitmentPipelineSummary extends JobOpeningSummary {
  totals: {
    totalCandidates: number;
    stageBreakdown: Record<RecruitmentStage, number>;
    lastCandidateAt?: string | null;
  };
}

export interface JobOpeningPayload {
  title: string;
  department: string;
  location?: string;
  description?: string;
  employmentType?: EmploymentType;
  status?: JobStatus;
  openings?: number;
}

export interface CandidatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  source?: string;
  notes?: string;
}

export interface UpdateCandidatePayload extends Partial<CandidatePayload> {
  stage?: RecruitmentStage;
  stageNote?: string;
  lastInteraction?: string;
}

export type ExpenseCategory = 'TRAVEL' | 'MEALS' | 'EQUIPMENT' | 'SOFTWARE' | 'OFFICE' | 'OTHER';
export type ExpenseStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';

export interface ExpenseClaimRecord {
  id: string;
  user: MinimalUser;
  title: string;
  description?: string | null;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  incurredOn: string;
  receiptUrl?: string | null;
  status: ExpenseStatus;
  submittedAt: string;
  approvedAt?: string | null;
  approvedBy?: MinimalUser | null;
  rejectionReason?: string | null;
  notes?: string | null;
}

export interface ExpenseClaimPayload {
  title: string;
  description?: string;
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  incurredOn: string;
  receiptUrl?: string;
  notes?: string;
}

export interface UpdateExpensePayload extends Partial<ExpenseClaimPayload> {
  status?: ExpenseStatus;
  rejectionReason?: string;
}

export interface ExpenseSummaryResponse {
  byStatus: Record<ExpenseStatus, { count: number; amount: number }>;
  approvedThisMonth: number;
}

export interface AnalyticsOverview {
  headcount: number;
  roleBreakdown: Record<UserRole, number> & Record<string, number>;
  activeProjects: number;
  attendance: {
    totalCheckIns: number;
    totalCheckOuts: number;
    byDay: Record<string, { checkIns: number; checkOuts: number }>;
  };
  recruitment: {
    openJobs: number;
    pipeline: Record<RecruitmentStage, number>;
  };
  expenses: Record<ExpenseStatus, { count: number; amount: number }>;
  payroll: {
    id: string;
    label?: string | null;
    month: number;
    year: number;
    status: PayrollStatus;
    processedAt?: string | null;
    totalGross: number;
    totalNet: number;
    entries: Array<{ id: string; userId: string; netPay: number }>;
  } | null;
  performance: Record<PerformanceCycleStatus, number> & Record<string, number>;
  generatedAt: string;
  period: {
    startOfMonth: string;
    last30DaysStart: string;
  };
}
