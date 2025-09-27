import { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type {
  BenefitPlanPayload,
  BenefitPlanSummary,
  BenefitEnrollmentPayload,
  BenefitEnrollmentRecord,
  BenefitType,
  UserRole,
} from '../../types/api';

interface BenefitsPanelProps {
  plans: BenefitPlanSummary[];
  enrollments: BenefitEnrollmentRecord[];
  userRole: UserRole;
  isLoading: boolean;
  isSubmittingEnrollment: boolean;
  isCreatingPlan: boolean;
  onEnroll: (planId: string, payload?: BenefitEnrollmentPayload) => Promise<void>;
  onCancel: (planId: string) => Promise<void>;
  onCreatePlan?: (payload: BenefitPlanPayload) => Promise<void>;
}

const formatCurrency = (value?: number | null) => {
  if (value == null) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
};

const BENEFIT_TYPE_COPY: Record<BenefitType, string> = {
  HEALTH: 'Health',
  INSURANCE: 'Insurance',
  RETIREMENT: 'Retirement',
  WELLNESS: 'Wellness',
  OTHER: 'Other',
};

export const BenefitsPanel = ({
  plans,
  enrollments,
  userRole,
  isLoading,
  isSubmittingEnrollment,
  isCreatingPlan,
  onEnroll,
  onCancel,
  onCreatePlan,
}: BenefitsPanelProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<BenefitPlanPayload>({
    name: '',
    description: '',
    type: 'OTHER',
    employeeContribution: undefined,
    employerContribution: undefined,
    effectiveFrom: undefined,
    effectiveTo: undefined,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const activeEnrollments = useMemo(
    () => enrollments.filter((record) => record.status !== 'CANCELLED'),
    [enrollments],
  );

  const handleCreatePlan = async () => {
    if (!onCreatePlan) return;
    if (!form.name.trim()) {
      setFormError('Provide a plan name.');
      return;
    }
    setFormError(null);
    await onCreatePlan({
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() ? form.description.trim() : undefined,
      effectiveFrom: form.effectiveFrom || undefined,
      effectiveTo: form.effectiveTo || undefined,
      employeeContribution: form.employeeContribution ?? undefined,
      employerContribution: form.employerContribution ?? undefined,
    });
    setForm({
      name: '',
      description: '',
      type: 'OTHER',
      employeeContribution: undefined,
      employerContribution: undefined,
      effectiveFrom: undefined,
      effectiveTo: undefined,
    });
    setShowCreateForm(false);
  };

  return (
    <Card
      title="Benefits"
      subtitle="Manage employee benefit plans and enrollment status"
      action={
        <Badge variant={activeEnrollments.length > 0 ? 'success' : 'info'}>
          {activeEnrollments.length} active enrollment{activeEnrollments.length === 1 ? '' : 's'}
        </Badge>
      }
    >
      <div className="space-y-8">
        {userRole === 'ADMIN' && onCreatePlan ? (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Plan catalogue</p>
                <p className="mt-1 text-base text-slate-200">Create new benefits for employees to join.</p>
              </div>
              <Button variant="ghost" onClick={() => setShowCreateForm((value) => !value)}>
                {showCreateForm ? 'Close' : 'New plan'}
              </Button>
            </div>

            {showCreateForm ? (
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                    Name
                    <input
                      value={form.name}
                      onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Health insurance premium"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </label>
                  <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                    Type
                    <select
                      value={form.type}
                      onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as BenefitType }))}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      {(['HEALTH', 'INSURANCE', 'RETIREMENT', 'WELLNESS', 'OTHER'] as BenefitType[]).map((option) => (
                        <option key={option} value={option}>
                          {BENEFIT_TYPE_COPY[option]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                  Description
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    rows={3}
                    placeholder="Coverage and eligibility details"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                    Employee contribution (monthly)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.employeeContribution ?? ''}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, employeeContribution: event.target.value ? Number(event.target.value) : undefined }))
                      }
                      placeholder="1500"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </label>
                  <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                    Employer contribution (monthly)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.employerContribution ?? ''}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, employerContribution: event.target.value ? Number(event.target.value) : undefined }))
                      }
                      placeholder="2500"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                    Effective from
                    <input
                      type="date"
                      value={form.effectiveFrom ?? ''}
                      onChange={(event) => setForm((prev) => ({ ...prev, effectiveFrom: event.target.value || undefined }))}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </label>
                  <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                    Effective to
                    <input
                      type="date"
                      value={form.effectiveTo ?? ''}
                      onChange={(event) => setForm((prev) => ({ ...prev, effectiveTo: event.target.value || undefined }))}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </label>
                </div>

                {formError ? <p className="text-sm text-red-300">{formError}</p> : null}

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)} disabled={isCreatingPlan}>
                    Cancel
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleCreatePlan} loading={isCreatingPlan}>
                    Create plan
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Available plans</p>
          {isLoading ? (
            <p className="text-sm text-slate-300">Loading benefit plans…</p>
          ) : plans.length === 0 ? (
            <p className="text-sm text-slate-300">No benefit plans configured yet.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {plans.map((plan) => {
                const isEnrolled = plan.enrollment && plan.enrollment.status === 'ACTIVE';
                const isPending = plan.enrollment && plan.enrollment.status === 'PENDING';
                const disabled = isSubmittingEnrollment;

                return (
                  <div key={plan.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                        <p className="text-xs text-slate-400">{BENEFIT_TYPE_COPY[plan.type]}</p>
                      </div>
                      {plan.enrollment ? (
                        <Badge variant={isEnrolled ? 'success' : isPending ? 'warning' : 'info'}>
                          {plan.enrollment.status.toLowerCase()}
                        </Badge>
                      ) : null}
                    </div>
                    {plan.description ? <p className="mt-3 text-sm text-slate-300">{plan.description}</p> : null}
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
                      <div>
                        <dt className="uppercase tracking-[0.3em] text-blue-200">Employee</dt>
                        <dd className="mt-1 text-sm text-white">{formatCurrency(plan.employeeContribution)}</dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-[0.3em] text-blue-200">Employer</dt>
                        <dd className="mt-1 text-sm text-white">{formatCurrency(plan.employerContribution)}</dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-[0.3em] text-blue-200">Effective from</dt>
                        <dd className="mt-1 text-sm text-white">{plan.effectiveFrom ? new Date(plan.effectiveFrom).toLocaleDateString() : '—'}</dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-[0.3em] text-blue-200">Effective to</dt>
                        <dd className="mt-1 text-sm text-white">{plan.effectiveTo ? new Date(plan.effectiveTo).toLocaleDateString() : '—'}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex justify-end gap-3">
                      {plan.enrollment ? (
                        <Button
                          variant="ghost"
                          onClick={() => onCancel(plan.id)}
                          disabled={disabled}
                          loading={disabled}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() => onEnroll(plan.id)}
                          disabled={disabled}
                          loading={disabled}
                        >
                          Enroll
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Enrollment history</p>
          {enrollments.length === 0 ? (
            <p className="text-sm text-slate-300">No enrollment records yet.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto pr-1">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="text-[0.65rem] uppercase tracking-[0.3em] text-blue-200">
                    <th className="py-2">Plan</th>
                    <th>Status</th>
                    <th>Effective</th>
                    <th>Ended</th>
                    <th>Employee</th>
                    <th>Employer</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b border-white/5">
                      <td className="py-2 text-white">{enrollment.plan.name}</td>
                      <td>{enrollment.status.toLowerCase()}</td>
                      <td>{enrollment.effectiveDate ? new Date(enrollment.effectiveDate).toLocaleDateString() : '—'}</td>
                      <td>{enrollment.endDate ? new Date(enrollment.endDate).toLocaleDateString() : '—'}</td>
                      <td>{formatCurrency(enrollment.employeeContribution)}</td>
                      <td>{formatCurrency(enrollment.employerContribution)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Card>
  );
};
