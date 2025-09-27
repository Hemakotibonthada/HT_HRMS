import { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type {
  OrgNode,
  PayrollEntryDetail,
  PayrollRunPayload,
  PayrollRunSummary,
  PayrollStatus,
  UserRole,
} from '../../types/api';

interface PayrollPanelProps {
  runs: PayrollRunSummary[];
  myEntries: PayrollEntryDetail[];
  userRole: UserRole;
  orgStructure: OrgNode[];
  isLoading: boolean;
  isCreatingRun: boolean;
  onCreateRun?: (payload: PayrollRunPayload) => Promise<void>;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const flattenOrgNodes = (nodes: OrgNode[]): OrgNode[] => {
  const result: OrgNode[] = [];
  const stack = [...nodes];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    result.push(current);
    stack.push(...current.children);
  }
  return result;
};

interface DraftEntry {
  userId: string;
  grossPay: string;
  deductions: string;
  netPay: string;
  notes: string;
}

export const PayrollPanel = ({
  runs,
  myEntries,
  userRole,
  orgStructure,
  isLoading,
  isCreatingRun,
  onCreateRun,
}: PayrollPanelProps) => {
  const now = new Date();
  const [label, setLabel] = useState('');
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [status, setStatus] = useState<PayrollStatus>('DRAFT');
  const [processedAt, setProcessedAt] = useState<string>('');
  const [entries, setEntries] = useState<DraftEntry[]>([
    { userId: '', grossPay: '', deductions: '', netPay: '', notes: '' },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  const employees = useMemo(() => flattenOrgNodes(orgStructure), [orgStructure]);
  const totalGross = useMemo(
    () => entries.reduce((total, entry) => total + (Number.parseFloat(entry.grossPay) || 0), 0),
    [entries],
  );
  const totalNet = useMemo(
    () => entries.reduce((total, entry) => total + (Number.parseFloat(entry.netPay) || 0), 0),
    [entries],
  );

  const handleAddEntry = () => {
    setEntries((prev) => [...prev, { userId: '', grossPay: '', deductions: '', netPay: '', notes: '' }]);
  };

  const handleRemoveEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleEntryChange = (index: number, field: keyof DraftEntry, value: string) => {
    setEntries((prev) => prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)));
  };

  const handleSubmit = async () => {
    if (!onCreateRun) return;

    if (!entries.every((entry) => entry.userId && entry.grossPay && entry.netPay)) {
      setFormError('Each entry must include an employee, gross pay, and net pay.');
      return;
    }

    const payload: PayrollRunPayload = {
      label: label.trim() || undefined,
      month,
      year,
      status,
      processedAt: processedAt || undefined,
      entries: entries.map((entry) => ({
        userId: entry.userId,
        grossPay: Number.parseFloat(entry.grossPay),
        deductions: entry.deductions ? Number.parseFloat(entry.deductions) : 0,
        netPay: Number.parseFloat(entry.netPay),
        notes: entry.notes.trim() || undefined,
      })),
    };

    setFormError(null);
    await onCreateRun(payload);
    setLabel('');
    setProcessedAt('');
    setStatus('DRAFT');
    setEntries([{ userId: '', grossPay: '', deductions: '', netPay: '', notes: '' }]);
  };

  const adminView = userRole === 'ADMIN' && onCreateRun;

  return (
    <Card
      title="Payroll"
      subtitle="Track payroll runs and net payouts"
      action={<Badge variant="info">{runs.length} run{runs.length === 1 ? '' : 's'}</Badge>}
    >
      <div className="space-y-8">
        {adminView ? (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Create payroll run</p>
                <p className="text-xs text-slate-400">Compile current month payouts and deductions across teams.</p>
              </div>
              <Badge variant="success">Gross {formatCurrency(totalGross)} · Net {formatCurrency(totalNet)}</Badge>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                Label
                <input
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="September 2025 Payroll"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </label>
              <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                Processed at
                <input
                  type="date"
                  value={processedAt}
                  onChange={(event) => setProcessedAt(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                Month
                <select
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {MONTHS.map((label, index) => (
                    <option key={label} value={index + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                Year
                <input
                  type="number"
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value) || year)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </label>
              <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                Status
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as PayrollStatus)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="FINALIZED">Finalized</option>
                </select>
              </label>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Entries</p>
                <Button type="button" variant="ghost" onClick={handleAddEntry}>
                  Add employee
                </Button>
              </div>

              <div className="space-y-4">
                {entries.map((entry, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-3">
                        <label className="block text-xs uppercase tracking-[0.3em] text-blue-200">
                          Employee
                          <select
                            value={entry.userId}
                            onChange={(event) => handleEntryChange(index, 'userId', event.target.value)}
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          >
                            <option value="">Select employee</option>
                            {employees.map((employee) => (
                              <option key={employee.id} value={employee.id}>
                                {employee.name} · {employee.title}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="grid gap-3 md:grid-cols-3">
                          <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                            Gross pay
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={entry.grossPay}
                              onChange={(event) => handleEntryChange(index, 'grossPay', event.target.value)}
                              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                          </label>
                          <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                            Deductions
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={entry.deductions}
                              onChange={(event) => handleEntryChange(index, 'deductions', event.target.value)}
                              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                          </label>
                          <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                            Net pay
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={entry.netPay}
                              onChange={(event) => handleEntryChange(index, 'netPay', event.target.value)}
                              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                          </label>
                        </div>
                        <label className="block text-xs uppercase tracking-[0.3em] text-blue-200">
                          Notes
                          <textarea
                            value={entry.notes}
                            onChange={(event) => handleEntryChange(index, 'notes', event.target.value)}
                            rows={2}
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          />
                        </label>
                      </div>
                      {entries.length > 1 ? (
                        <Button type="button" variant="ghost" onClick={() => handleRemoveEntry(index)}>
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {formError ? <p className="text-sm text-red-300">{formError}</p> : null}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setEntries([{ userId: '', grossPay: '', deductions: '', netPay: '', notes: '' }])} disabled={isCreatingRun}>
                  Reset
                </Button>
                <Button type="button" variant="secondary" onClick={handleSubmit} loading={isCreatingRun}>
                  Publish run
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Recent runs</p>
          {isLoading ? (
            <p className="text-sm text-slate-300">Loading payroll runs…</p>
          ) : runs.length === 0 ? (
            <p className="text-sm text-slate-300">No payroll runs captured yet.</p>
          ) : (
            <div className="space-y-4">
              {runs.map((run) => (
                <div key={run.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{run.label ?? `${MONTHS[run.month - 1]} ${run.year}`}</h3>
                      <p className="text-xs text-slate-400">
                        {MONTHS[run.month - 1]} {run.year} · {run.status.toLowerCase()}
                      </p>
                    </div>
                    <Badge variant={run.status === 'FINALIZED' ? 'success' : 'warning'}>
                      Net {formatCurrency(run.totalNet)}
                    </Badge>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-xs text-slate-300">
                      <thead>
                        <tr className="text-[0.65rem] uppercase tracking-[0.3em] text-blue-200">
                          <th className="py-2">Employee</th>
                          <th>Gross</th>
                          <th>Deductions</th>
                          <th>Net</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {run.entries.map((entry) => (
                          <tr key={entry.id} className="border-b border-white/5">
                            <td className="py-2 text-white">
                              {entry.user?.profile?.firstName
                                ? `${entry.user.profile.firstName} ${entry.user.profile.lastName ?? ''}`.trim()
                                : entry.user?.email ?? '—'}
                            </td>
                            <td>{formatCurrency(entry.grossPay)}</td>
                            <td>{formatCurrency(entry.deductions)}</td>
                            <td>{formatCurrency(entry.netPay)}</td>
                            <td>{entry.notes ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {userRole !== 'ADMIN' ? (
          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200">My payslips</p>
            {myEntries.length === 0 ? (
              <p className="text-sm text-slate-300">No payroll entries available yet.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto pr-1">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="text-[0.65rem] uppercase tracking-[0.3em] text-blue-200">
                      <th className="py-2">Period</th>
                      <th>Net pay</th>
                      <th>Status</th>
                      <th>Processed</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-white/5">
                        <td className="py-2 text-white">
                          {MONTHS[entry.payrollRun.month - 1]} {entry.payrollRun.year}
                        </td>
                        <td>{formatCurrency(entry.netPay)}</td>
                        <td>{entry.payrollRun.status.toLowerCase()}</td>
                        <td>{entry.payrollRun.processedAt ? new Date(entry.payrollRun.processedAt).toLocaleDateString() : '—'}</td>
                        <td>{entry.notes ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </Card>
  );
};
