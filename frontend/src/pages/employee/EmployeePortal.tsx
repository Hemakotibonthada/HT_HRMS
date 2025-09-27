import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { TimesheetForm } from '../../components/employee/TimesheetForm';
import { TimesheetTable } from '../../components/employee/TimesheetTable';
import { PayslipList } from '../../components/employee/PayslipList';
import { OrgStructure } from '../../components/employee/OrgStructure';
import { OfferLetterForm } from '../../components/employee/OfferLetterForm';
import { AttendancePanel } from '../../components/employee/AttendancePanel';
import { BenefitsPanel } from '../../components/employee/BenefitsPanel';
import { PayrollPanel } from '../../components/employee/PayrollPanel';
import { PerformancePanel } from '../../components/employee/PerformancePanel';
import { RecruitmentBoard } from '../../components/employee/recruitment/RecruitmentBoard';
import { ExpensesPanel } from '../../components/employee/ExpensesPanel';
import { AnalyticsPanel } from '../../components/employee/AnalyticsPanel';
import { fetchProjects } from '../../api/work';
import {
  fetchExpenseClaims,
  fetchExpenseSummary,
  submitExpenseClaim,
  updateExpenseClaim,
} from '../../api/expenses';
import { fetchAnalyticsOverview } from '../../api/analytics';
import {
  fetchTimesheets,
  submitTimesheet,
  updateTimesheetStatus,
  fetchPayslips,
  uploadPayslip,
  fetchOrgStructure,
  generateOfferLetter,
} from '../../api/employee';
import { fetchAttendanceLogs, fetchAttendanceSummary, createAttendanceLog } from '../../api/attendance';
import {
  fetchBenefitPlans,
  fetchBenefitEnrollments,
  createBenefitPlan,
  enrollInBenefitPlan,
  cancelBenefitEnrollment,
  fetchPayrollRuns,
  createPayrollRun,
  fetchMyPayrollEntries,
  fetchPerformanceCycles,
  createPerformanceCycle,
  fetchPerformanceGoals,
  createPerformanceGoal,
  updatePerformanceGoal,
  fetchPerformanceReviews,
  updatePerformanceReview,
} from '../../api/hr';
import type {
  BenefitEnrollmentPayload,
  BenefitEnrollmentRecord,
  BenefitPlanPayload,
  BenefitPlanSummary,
  AttendanceDaySummary,
  AttendanceLog,
  AttendanceLogPayload,
  OfferLetterPayload,
  PayslipEntry,
  PayrollEntryDetail,
  PayrollRunPayload,
  PayrollRunSummary,
  PerformanceCycleSummary,
  PerformanceGoalPayload,
  PerformanceGoalRecord,
  PerformanceReviewPayload,
  PerformanceReviewRecord,
  Project,
  TimesheetEntry,
  ExpenseClaimPayload,
  ExpenseClaimRecord,
  ExpenseSummaryResponse,
  UpdateExpensePayload,
  AnalyticsOverview,
} from '../../types/api';
import type { AuthContextValue } from '../../context/AuthContext';

export const EmployeePortalPage = () => {
  const auth = useAuth() as AuthContextValue;
  const { user } = auth;
  const queryClient = useQueryClient();
  const userRole = user?.role ?? 'EMPLOYEE';
  const fullName = `${user?.profile?.firstName ?? ''} ${user?.profile?.lastName ?? ''}`.trim() || user?.email;

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const { data: timesheets = [], isLoading: isTimesheetsLoading } = useQuery({
    queryKey: ['employee', 'timesheets'],
    queryFn: fetchTimesheets,
  });

  const { data: payslips = [], isLoading: isPayslipsLoading } = useQuery({
    queryKey: ['employee', 'payslips'],
    queryFn: () => fetchPayslips(),
  });

  const { data: orgStructure = [], isLoading: isOrgStructureLoading } = useQuery({
    queryKey: ['employee', 'org-structure'],
    queryFn: fetchOrgStructure,
  });

  const { data: benefitPlans = [], isLoading: isBenefitPlansLoading } = useQuery<BenefitPlanSummary[]>({
    queryKey: ['hr', 'benefits', 'plans'],
    queryFn: fetchBenefitPlans,
  });

  const { data: benefitEnrollments = [], isLoading: isBenefitEnrollmentsLoading } = useQuery<BenefitEnrollmentRecord[]>({
    queryKey: ['hr', 'benefits', 'enrollments'],
    queryFn: fetchBenefitEnrollments,
  });

  const { data: payrollRuns = [], isLoading: isPayrollRunsLoading } = useQuery<PayrollRunSummary[]>({
    queryKey: ['hr', 'payroll', 'runs'],
    queryFn: fetchPayrollRuns,
  });

  const { data: payrollEntries = [], isLoading: isPayrollEntriesLoading } = useQuery<PayrollEntryDetail[]>({
    queryKey: ['hr', 'payroll', 'entries', 'me'],
    queryFn: fetchMyPayrollEntries,
    enabled: userRole !== 'ADMIN',
  });

  const { data: performanceCycles = [], isLoading: isPerformanceCyclesLoading } = useQuery<PerformanceCycleSummary[]>({
    queryKey: ['hr', 'performance', 'cycles'],
    queryFn: fetchPerformanceCycles,
  });

  const { data: performanceGoals = [], isLoading: isPerformanceGoalsLoading } = useQuery<PerformanceGoalRecord[]>({
    queryKey: ['hr', 'performance', 'goals'],
    queryFn: () => fetchPerformanceGoals(),
  });

  const { data: performanceReviews = [], isLoading: isPerformanceReviewsLoading } = useQuery<PerformanceReviewRecord[]>({
    queryKey: ['hr', 'performance', 'reviews'],
    queryFn: () => fetchPerformanceReviews(),
  });

  const attendanceRange = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from: from.toISOString(), to: to.toISOString() };
  }, []);

  const { data: attendanceLogs = [], isLoading: isAttendanceLoading } = useQuery<AttendanceLog[]>({
    queryKey: ['attendance', 'logs', attendanceRange],
    queryFn: () => fetchAttendanceLogs(attendanceRange),
  });

  const { data: attendanceSummary = [] } = useQuery<AttendanceDaySummary[]>({
    queryKey: ['attendance', 'summary', attendanceRange],
    queryFn: () => fetchAttendanceSummary(attendanceRange),
  });

  const { data: expenseClaims = [], isLoading: isExpenseClaimsLoading } = useQuery<ExpenseClaimRecord[]>({
    queryKey: ['expenses', 'claims', userRole === 'ADMIN' ? 'all' : user?.id],
    queryFn: () =>
      fetchExpenseClaims(userRole === 'ADMIN' ? undefined : { userId: user?.id }),
    enabled: !!user,
  });

  const { data: expenseSummary } = useQuery<ExpenseSummaryResponse>({
    queryKey: ['expenses', 'summary'],
    queryFn: fetchExpenseSummary,
  });

  const { data: analyticsOverview, isLoading: isAnalyticsLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview'],
    queryFn: fetchAnalyticsOverview,
    staleTime: 1000 * 60,
  });

  const createTimesheetMutation = useMutation<TimesheetEntry, unknown, { projectId: string; workItemId?: string; workDate: string; hours: number; description?: string }>({
    mutationFn: submitTimesheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', 'timesheets'] });
    },
  });

  const updateTimesheetMutation = useMutation<TimesheetEntry, unknown, { id: string; status: TimesheetEntry['status'] }>({
    mutationFn: ({ id, status }) => updateTimesheetStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', 'timesheets'] });
    },
  });

  const uploadPayslipMutation = useMutation<PayslipEntry, unknown, { userId: string; month: number; year: number; file: File }>({
    mutationFn: uploadPayslip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', 'payslips'] });
    },
  });

  const offerLetterMutation = useMutation({
    mutationFn: generateOfferLetter,
  });

  const attendanceMutation = useMutation({
    mutationFn: (payload: AttendanceLogPayload) => createAttendanceLog(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['attendance', 'logs'] }),
        queryClient.invalidateQueries({ queryKey: ['attendance', 'summary'] }),
      ]);
    },
  });

  const submitExpenseMutation = useMutation({
    mutationFn: (payload: ExpenseClaimPayload) => submitExpenseClaim(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExpensePayload }) => updateExpenseClaim(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const createBenefitPlanMutation = useMutation({
    mutationFn: (payload: BenefitPlanPayload) => createBenefitPlan(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['hr', 'benefits', 'plans'] }),
      ]);
    },
  });

  const enrollBenefitMutation = useMutation({
    mutationFn: ({ planId, payload }: { planId: string; payload?: BenefitEnrollmentPayload }) => enrollInBenefitPlan(planId, payload ?? {}),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['hr', 'benefits', 'plans'] }),
        queryClient.invalidateQueries({ queryKey: ['hr', 'benefits', 'enrollments'] }),
      ]);
    },
  });

  const cancelBenefitMutation = useMutation({
    mutationFn: (planId: string) => cancelBenefitEnrollment(planId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['hr', 'benefits', 'plans'] }),
        queryClient.invalidateQueries({ queryKey: ['hr', 'benefits', 'enrollments'] }),
      ]);
    },
  });

  const createPayrollRunMutation = useMutation({
    mutationFn: (payload: PayrollRunPayload) => createPayrollRun(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['hr', 'payroll', 'runs'] }),
        queryClient.invalidateQueries({ queryKey: ['hr', 'payroll', 'entries', 'me'] }),
      ]);
    },
  });

  const createPerformanceCycleMutation = useMutation({
    mutationFn: (payload: { name: string; status?: PerformanceCycleSummary['status']; startDate: string; endDate: string }) => createPerformanceCycle(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hr', 'performance', 'cycles'] });
    },
  });

  const createPerformanceGoalMutation = useMutation({
    mutationFn: (payload: PerformanceGoalPayload) => createPerformanceGoal(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hr', 'performance', 'goals'] });
    },
  });

  const updatePerformanceGoalMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PerformanceGoalPayload> }) => updatePerformanceGoal(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hr', 'performance', 'goals'] });
    },
  });

  const updatePerformanceReviewMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PerformanceReviewPayload> }) => updatePerformanceReview(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hr', 'performance', 'reviews'] });
    },
  });

  const pendingCount = useMemo(
    () => timesheets.filter((entry) => entry.status === 'PENDING').length,
    [timesheets],
  );

  const hoursThisMonth = useMemo(() => {
    if (!timesheets.length) return 0;
    const now = new Date();
    return timesheets
      .filter((entry) => {
        const date = new Date(entry.workDate);
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
      })
      .reduce((total, entry) => total + Number.parseFloat(entry.hours ?? '0'), 0);
  }, [timesheets]);

  const latestPayslip = payslips[0];
  const latestPayslipLabel = latestPayslip
    ? new Date(latestPayslip.year, latestPayslip.month - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })
    : 'None yet';

  const handleTimesheetSubmit = async (payload: { projectId: string; workItemId?: string; workDate: string; hours: number; description?: string }) => {
    await createTimesheetMutation.mutateAsync(payload);
  };

  const handleStatusUpdate = async (id: string, status: TimesheetEntry['status']) => {
    if (status === 'PENDING') return;
    await updateTimesheetMutation.mutateAsync({ id, status });
  };

  const handlePayslipUpload = async (payload: { userId: string; month: number; year: number; file: File }) => {
    await uploadPayslipMutation.mutateAsync(payload);
  };

  const handleOfferLetter = async (payload: OfferLetterPayload) => {
    const pdf = await offerLetterMutation.mutateAsync(payload);
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = payload.candidateName.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `${safeName}_Offer_Letter.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRecordAttendance = async (payload: AttendanceLogPayload) => {
    await attendanceMutation.mutateAsync(payload);
  };

  const handleCreateBenefitPlan = async (payload: BenefitPlanPayload) => {
    await createBenefitPlanMutation.mutateAsync(payload);
  };

  const handleEnrollBenefit = async (planId: string, payload?: BenefitEnrollmentPayload) => {
    await enrollBenefitMutation.mutateAsync({ planId, payload });
  };

  const handleCancelBenefit = async (planId: string) => {
    await cancelBenefitMutation.mutateAsync(planId);
  };

  const handleCreatePayrollRun = async (payload: PayrollRunPayload) => {
    await createPayrollRunMutation.mutateAsync(payload);
  };

  const handleSubmitExpense = async (payload: ExpenseClaimPayload) => {
    await submitExpenseMutation.mutateAsync(payload);
  };

  const handleUpdateExpense = async (id: string, payload: UpdateExpensePayload) => {
    await updateExpenseMutation.mutateAsync({ id, payload });
  };

  const handleRefreshExpenses = () => {
    void queryClient.invalidateQueries({ queryKey: ['expenses'] });
  };

  const handleRefreshAnalytics = () => {
    void queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] });
  };

  const handleCreatePerformanceCycle = async (payload: { name: string; status?: PerformanceCycleSummary['status']; startDate: string; endDate: string }) => {
    await createPerformanceCycleMutation.mutateAsync(payload);
  };

  const handleCreatePerformanceGoal = async (payload: PerformanceGoalPayload) => {
    await createPerformanceGoalMutation.mutateAsync(payload);
  };

  const handleUpdatePerformanceGoal = async (id: string, payload: Partial<PerformanceGoalPayload>) => {
    await updatePerformanceGoalMutation.mutateAsync({ id, payload });
  };

  const handleUpdatePerformanceReview = async (id: string, payload: Partial<PerformanceReviewPayload>) => {
    await updatePerformanceReviewMutation.mutateAsync({ id, payload });
  };

  const updatingId = (updateTimesheetMutation.variables as { id: string } | undefined)?.id ?? null;

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Employee Portal</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Personal &amp; HR Workspace</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Review personal details, submit weekly timesheets, and manage payroll documents. All data remains inside HT infrastructure.
            </p>
          </div>
          <Badge variant="info">Role: {userRole.replace('_', ' ')}</Badge>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card title="Profile Overview" subtitle="Synchronized from HR records">
          <dl className="grid grid-cols-1 gap-4 text-sm text-slate-100 md:grid-cols-2">
            <div>
              <dt className="text-slate-400">Name</dt>
              <dd className="mt-1 font-semibold">{fullName}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Department</dt>
              <dd className="mt-1 font-semibold">{user?.profile?.department ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Position</dt>
              <dd className="mt-1 font-semibold">{user?.profile?.position ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Reporting Manager</dt>
              <dd className="mt-1 font-semibold">{user?.profile?.reportingManager ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Joining Date</dt>
              <dd className="mt-1 font-semibold">
                {user?.profile?.joiningDate ? new Date(user.profile.joiningDate).toLocaleDateString() : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Contact</dt>
              <dd className="mt-1 font-semibold">{user?.profile?.contactEmail ?? '—'}</dd>
            </div>
          </dl>
        </Card>
        <Card title="Operations Snapshot" subtitle="Live metrics across HR workflows">
          <div className="grid gap-4 text-sm text-slate-200">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Timesheets Pending</p>
              <p className="mt-2 text-2xl font-semibold text-white">{pendingCount}</p>
              <p className="text-xs text-slate-400">Awaiting approval from managers</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Hours This Month</p>
              <p className="mt-2 text-2xl font-semibold text-white">{hoursThisMonth.toFixed(2)} hrs</p>
              <p className="text-xs text-slate-400">Across submitted entries</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Latest Payslip</p>
              <p className="mt-2 text-2xl font-semibold text-white">{latestPayslipLabel}</p>
              {latestPayslip && (
                <p className="text-xs text-slate-400">Uploaded {new Date(latestPayslip.createdAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <TimesheetForm
          projects={projects as Project[]}
          onSubmit={handleTimesheetSubmit}
          isSubmitting={createTimesheetMutation.isPending}
        />
        <Card title="Project Access" subtitle="Initiatives you are aligned to">
          {isProjectsLoading ? (
            <p className="text-sm text-slate-300">Loading assigned projects…</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-slate-300">You have not been assigned to any R&amp;D projects yet.</p>
          ) : (
            <ul className="space-y-3 text-sm text-slate-200">
              {projects.map((project) => (
                <li key={project.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                  <div>
                    <p className="font-semibold text-white">{project.title}</p>
                    <p className="text-xs text-slate-400">{project.status.replace('_', ' ')}</p>
                  </div>
                  <span className="text-xs text-slate-400">{project.workItems?.length ?? 0} work items</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <TimesheetTable
        timesheets={timesheets}
        userRole={userRole}
        onUpdateStatus={handleStatusUpdate}
        isUpdatingId={updatingId}
        isLoading={isTimesheetsLoading}
      />

      <AttendancePanel
        logs={attendanceLogs}
        summary={attendanceSummary}
        onRecord={handleRecordAttendance}
        isRecording={attendanceMutation.isPending}
        isLoading={isAttendanceLoading}
      />

      <BenefitsPanel
        plans={benefitPlans}
        enrollments={benefitEnrollments}
        userRole={userRole}
        isLoading={isBenefitPlansLoading || isBenefitEnrollmentsLoading}
        isSubmittingEnrollment={enrollBenefitMutation.isPending || cancelBenefitMutation.isPending}
        isCreatingPlan={createBenefitPlanMutation.isPending}
        onEnroll={handleEnrollBenefit}
        onCancel={handleCancelBenefit}
        onCreatePlan={userRole === 'ADMIN' ? handleCreateBenefitPlan : undefined}
      />

      <PayrollPanel
        runs={payrollRuns}
        myEntries={userRole === 'ADMIN' ? [] : payrollEntries}
        userRole={userRole}
        orgStructure={orgStructure}
        isLoading={isPayrollRunsLoading || (userRole !== 'ADMIN' && isPayrollEntriesLoading)}
        isCreatingRun={createPayrollRunMutation.isPending}
        onCreateRun={userRole === 'ADMIN' ? handleCreatePayrollRun : undefined}
      />

      <PerformancePanel
        cycles={performanceCycles}
        goals={performanceGoals}
        reviews={performanceReviews}
        userRole={userRole}
        isLoading={isPerformanceCyclesLoading || isPerformanceGoalsLoading || isPerformanceReviewsLoading}
        isSavingGoal={createPerformanceGoalMutation.isPending}
        isSavingCycle={createPerformanceCycleMutation.isPending}
        isSavingReview={updatePerformanceReviewMutation.isPending}
        onCreateGoal={handleCreatePerformanceGoal}
        onUpdateGoal={handleUpdatePerformanceGoal}
        onCreateCycle={userRole === 'ADMIN' ? handleCreatePerformanceCycle : undefined}
        onUpdateReview={userRole === 'EMPLOYEE' ? undefined : handleUpdatePerformanceReview}
      />

      <RecruitmentBoard />

      <ExpensesPanel
        claims={expenseClaims}
        summary={expenseSummary}
        userRole={userRole}
        isLoading={isExpenseClaimsLoading}
        isSubmitting={submitExpenseMutation.isPending}
        isUpdating={updateExpenseMutation.isPending}
        onSubmitClaim={handleSubmitExpense}
        onUpdateClaim={handleUpdateExpense}
        onRefresh={handleRefreshExpenses}
      />

      <AnalyticsPanel
        overview={analyticsOverview}
        isLoading={isAnalyticsLoading}
        onRefresh={handleRefreshAnalytics}
      />

      {isPayslipsLoading ? (
        <Card title="Payslips" subtitle="Secure payroll document vault">
          <p className="text-sm text-slate-300">Loading payslips…</p>
        </Card>
      ) : (
        <PayslipList
          payslips={payslips}
          userRole={userRole}
          orgStructure={orgStructure}
          onUpload={handlePayslipUpload}
          isUploading={uploadPayslipMutation.isPending}
        />
      )}

      {isOrgStructureLoading ? (
        <Card title="Org Structure" subtitle="Live reporting tree">
          <p className="text-sm text-slate-300">Loading organisation chart…</p>
        </Card>
      ) : (
        <OrgStructure structure={orgStructure} />
      )}

      {userRole === 'ADMIN' && (
        <OfferLetterForm onGenerate={handleOfferLetter} isGenerating={offerLetterMutation.isPending} />
      )}
    </div>
  );
};
