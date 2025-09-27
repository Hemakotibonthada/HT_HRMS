import { useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { LoadingState } from '../ui/LoadingState';
import type { AnalyticsOverview, ExpenseStatus, RecruitmentStage } from '../../types/api';
import { ExpenseStatusBadge } from './expenses/ExpenseStatusBadge';
import { StageBadge } from './recruitment/StageBadge';

interface AnalyticsPanelProps {
  overview?: AnalyticsOverview | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

const recruitmentStages: RecruitmentStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'ARCHIVED'];
const expenseStatuses: ExpenseStatus[] = ['SUBMITTED', 'APPROVED', 'REJECTED', 'REIMBURSED'];

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const formatCurrency = (value: number, currency = 'INR') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

export const AnalyticsPanel = ({ overview, isLoading, onRefresh }: AnalyticsPanelProps) => {
  const attendanceTrend = useMemo(() => {
    if (!overview) return [] as Array<{ date: string; checkIns: number; checkOuts: number }>;
    return Object.entries(overview.attendance.byDay ?? {})
      .map(([date, totals]) => ({ date, checkIns: totals.checkIns, checkOuts: totals.checkOuts }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);
  }, [overview]);

  if (isLoading) {
    return (
      <Card title="Analytics" subtitle="Organisation-wide HR metrics">
        <LoadingState title="Fetching analytics" />
      </Card>
    );
  }

  if (!overview) {
    return (
      <Card title="Analytics" subtitle="Organisation-wide HR metrics">
        <EmptyState
          title="No analytics available"
          description="Refresh to load the latest HR analytics snapshot."
          actionLabel={onRefresh ? 'Refresh' : undefined}
          onAction={onRefresh}
        />
      </Card>
    );
  }

  const roleBreakdownEntries = Object.entries(overview.roleBreakdown ?? {})
    .map(([role, count]) => ({ role, count: Number(count ?? 0) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const performanceEntries = Object.entries(overview.performance ?? {})
    .map(([key, count]) => ({ key, count: Number(count ?? 0) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const expensesEntries = expenseStatuses.map((status) => ({
    status,
    count: Number(overview.expenses?.[status]?.count ?? 0),
    amount: Number(overview.expenses?.[status]?.amount ?? 0),
  }));

  const latestPayroll = overview.payroll;
  const lastUpdated = overview.generatedAt ? new Date(overview.generatedAt).toLocaleString() : null;

  const topMetrics = [
    {
      label: 'Headcount',
      value: overview.headcount.toString(),
      caption: 'Active employees',
    },
    {
      label: 'Active projects',
      value: overview.activeProjects.toString(),
      caption: 'In-flight initiatives',
    },
    {
      label: 'Open roles',
      value: overview.recruitment.openJobs.toString(),
      caption: 'Requisition pipeline',
    },
    {
      label: 'Check-ins (30d)',
      value: overview.attendance.totalCheckIns.toString(),
      caption: 'Attendance events',
    },
  ];

  return (
    <section className="space-y-6">
      <Card
        title="Analytics"
        subtitle="Organisation-wide HR metrics"
        action={
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            {lastUpdated && <span>Updated {lastUpdated}</span>}
            {onRefresh && (
              <Button size="sm" variant="outline" onClick={onRefresh}>
                Refresh
              </Button>
            )}
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topMetrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-200">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
              <p className="text-xs text-slate-400">{metric.caption}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card title="Role distribution" subtitle="Top roles by active headcount">
            {roleBreakdownEntries.length === 0 ? (
              <p className="text-sm text-slate-300">No role distribution available.</p>
            ) : (
              <ul className="space-y-3 text-sm text-slate-100">
                {roleBreakdownEntries.map((entry) => (
                  <li key={entry.role} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                    <span className="font-medium">{formatLabel(entry.role)}</span>
                    <span className="text-slate-300">{entry.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Recruitment pipeline" subtitle="Candidates by current stage">
            <div className="space-y-3 text-sm text-slate-100">
              {recruitmentStages.map((stage) => (
                <div key={stage} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                  <StageBadge stage={stage} />
                  <span className="text-sm font-semibold text-white">{overview.recruitment.pipeline?.[stage] ?? 0}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Expense status" subtitle="Finance movement across reimbursements">
            <div className="space-y-3 text-sm text-slate-100">
              {expensesEntries.map((entry) => (
                <div key={entry.status} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ExpenseStatusBadge status={entry.status} />
                    <span className="text-xs text-slate-300">{entry.count} claims</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{formatCurrency(entry.amount)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Attendance trend" subtitle="Most recent 7 days">
            {attendanceTrend.length === 0 ? (
              <p className="text-sm text-slate-300">Attendance data unavailable.</p>
            ) : (
              <ul className="space-y-2 text-sm text-slate-100">
                {attendanceTrend.map((entry) => (
                  <li key={entry.date} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-2">
                    <span className="font-medium">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span className="text-xs text-slate-300">
                      {entry.checkIns} check-ins · {entry.checkOuts} check-outs
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Performance insight" subtitle="Reviews and goals by status">
            {performanceEntries.length === 0 ? (
              <p className="text-sm text-slate-300">Performance data unavailable.</p>
            ) : (
              <ul className="space-y-2 text-sm text-slate-100">
                {performanceEntries.map((entry) => (
                  <li key={entry.key} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-2">
                    <span className="font-medium">{formatLabel(entry.key)}</span>
                    <span className="text-slate-300">{entry.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Latest payroll run" subtitle="Consolidated compensation summary">
            {latestPayroll ? (
              <div className="space-y-3 text-sm text-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Label</span>
                  <span className="font-semibold">{latestPayroll.label ?? 'Monthly payroll'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Period</span>
                  <span className="font-semibold">
                    {new Date(latestPayroll.year, latestPayroll.month - 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Status</span>
                  <span className="font-semibold">{formatLabel(latestPayroll.status)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Total net</span>
                  <span className="font-semibold">{formatCurrency(latestPayroll.totalNet)}</span>
                </div>
                {latestPayroll.processedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Processed</span>
                    <span className="font-semibold">{new Date(latestPayroll.processedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-300">No payroll run processed this cycle.</p>
            )}
          </Card>
        </div>
      </Card>
    </section>
  );
};
