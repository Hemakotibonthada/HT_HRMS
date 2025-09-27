import { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type {
  PerformanceCycleStatus,
  PerformanceCycleSummary,
  PerformanceGoalPayload,
  PerformanceGoalRecord,
  PerformanceGoalStatus,
  PerformanceReviewPayload,
  PerformanceReviewRecord,
  PerformanceReviewStatus,
  PerformanceRating,
  UserRole,
} from '../../types/api';

interface PerformancePanelProps {
  cycles: PerformanceCycleSummary[];
  goals: PerformanceGoalRecord[];
  reviews: PerformanceReviewRecord[];
  userRole: UserRole;
  isLoading: boolean;
  isSavingGoal: boolean;
  isSavingCycle: boolean;
  isSavingReview: boolean;
  onCreateGoal: (payload: PerformanceGoalPayload) => Promise<void>;
  onUpdateGoal: (id: string, payload: Partial<PerformanceGoalPayload>) => Promise<void>;
  onCreateCycle?: (payload: { name: string; status?: PerformanceCycleStatus; startDate: string; endDate: string }) => Promise<void>;
  onUpdateReview?: (id: string, payload: Partial<PerformanceReviewPayload>) => Promise<void>;
}

const STATUS_COPY: Record<PerformanceGoalStatus, { label: string; color: string }> = {
  NOT_STARTED: { label: 'Not started', color: 'text-slate-300' },
  IN_PROGRESS: { label: 'In progress', color: 'text-blue-200' },
  ON_TRACK: { label: 'On track', color: 'text-emerald-200' },
  AT_RISK: { label: 'At risk', color: 'text-amber-200' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-300' },
};

const REVIEW_STATUS_COPY: Record<PerformanceReviewStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  ACKNOWLEDGED: 'Acknowledged',
};

const RATING_COPY: Record<PerformanceRating, string> = {
  OUTSTANDING: 'Outstanding',
  EXCEEDS: 'Exceeds Expectations',
  MEETS: 'Meets Expectations',
  DEVELOPING: 'Developing',
  UNSATISFACTORY: 'Unsatisfactory',
};

const GOAL_STATUSES: PerformanceGoalStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'ON_TRACK', 'AT_RISK', 'COMPLETED'];
const REVIEW_STATUSES: PerformanceReviewStatus[] = ['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED'];
const REVIEW_RATINGS: PerformanceRating[] = ['OUTSTANDING', 'EXCEEDS', 'MEETS', 'DEVELOPING', 'UNSATISFACTORY'];

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

const sortCycles = (cycles: PerformanceCycleSummary[]) =>
  [...cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

export const PerformancePanel = ({
  cycles,
  goals,
  reviews,
  userRole,
  isLoading,
  isSavingGoal,
  isSavingCycle,
  isSavingReview,
  onCreateGoal,
  onUpdateGoal,
  onCreateCycle,
  onUpdateReview,
}: PerformancePanelProps) => {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<string | undefined>(
    cycles.find((cycle) => cycle.status === 'ACTIVE')?.id ?? cycles[0]?.id,
  );
  const [goalForm, setGoalForm] = useState<PerformanceGoalPayload>({
    cycleId: selectedCycleId ?? '',
    title: '',
    description: '',
    status: 'NOT_STARTED',
    progress: 0,
    dueDate: undefined,
  });
  const [cycleForm, setCycleForm] = useState({
    name: '',
    status: 'UPCOMING' as PerformanceCycleStatus,
    startDate: '',
    endDate: '',
  });
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, {
    status: PerformanceReviewStatus;
    rating?: PerformanceRating | '';
    summary?: string;
    strengths?: string;
    growthAreas?: string;
    submittedAt?: string;
    acknowledgedAt?: string;
  }>>({});
  const [goalError, setGoalError] = useState<string | null>(null);
  const [cycleError, setCycleError] = useState<string | null>(null);

  const orderedCycles = useMemo(() => sortCycles(cycles), [cycles]);
  const activeCycle = orderedCycles.find((cycle) => cycle.id === selectedCycleId) ?? orderedCycles[0] ?? null;

  const filteredGoals = useMemo(() => {
    if (!activeCycle) return goals;
    return goals.filter((goal) => goal.cycleId === activeCycle.id);
  }, [activeCycle, goals]);

  const averageProgress = filteredGoals.length
    ? Math.round(filteredGoals.reduce((total, goal) => total + goal.progress, 0) / filteredGoals.length)
    : 0;

  const handleCreateGoal = async () => {
    if (!goalForm.title.trim()) {
      setGoalError('Give the goal a clear title before submitting.');
      return;
    }

    if (!goalForm.cycleId) {
      setGoalError('Select the performance cycle this goal belongs to.');
      return;
    }

    setGoalError(null);

    await onCreateGoal({
      cycleId: goalForm.cycleId,
      title: goalForm.title.trim(),
      description: goalForm.description?.trim() ? goalForm.description.trim() : undefined,
      status: goalForm.status,
      progress: goalForm.progress,
      dueDate: goalForm.dueDate,
    });

    setGoalForm({
      cycleId: goalForm.cycleId,
      title: '',
      description: '',
      status: 'NOT_STARTED',
      progress: 0,
      dueDate: undefined,
    });
    setShowGoalForm(false);
  };

  const handleCreateCycle = async () => {
    if (!onCreateCycle) return;

    if (!cycleForm.name.trim()) {
      setCycleError('Name your performance cycle to help everyone identify it.');
      return;
    }

    if (!cycleForm.startDate || !cycleForm.endDate) {
      setCycleError('Set both a start and end date for the cycle.');
      return;
    }

    if (new Date(cycleForm.endDate) < new Date(cycleForm.startDate)) {
      setCycleError('End date must be after the start date.');
      return;
    }

    setCycleError(null);

    await onCreateCycle({
      name: cycleForm.name.trim(),
      status: cycleForm.status,
      startDate: cycleForm.startDate,
      endDate: cycleForm.endDate,
    });

    setCycleForm({ name: '', status: 'UPCOMING', startDate: '', endDate: '' });
    setShowCycleForm(false);
  };

  const handleDraftChange = (
    reviewId: string,
    changes: Partial<{
      status: PerformanceReviewStatus;
      rating: PerformanceRating | '';
      summary: string;
      strengths: string;
      growthAreas: string;
      submittedAt: string;
      acknowledgedAt: string;
    }>,
  ) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [reviewId]: {
        status: changes.status ?? prev[reviewId]?.status ?? 'DRAFT',
        rating: changes.rating ?? prev[reviewId]?.rating ?? '',
        summary: changes.summary ?? prev[reviewId]?.summary,
        strengths: changes.strengths ?? prev[reviewId]?.strengths,
        growthAreas: changes.growthAreas ?? prev[reviewId]?.growthAreas,
        submittedAt: changes.submittedAt ?? prev[reviewId]?.submittedAt,
        acknowledgedAt: changes.acknowledgedAt ?? prev[reviewId]?.acknowledgedAt,
      },
    }));
  };

  const handleSaveReview = async (review: PerformanceReviewRecord) => {
    if (!onUpdateReview) return;

    const draft = reviewDrafts[review.id];
    if (!draft) return;

    await onUpdateReview(review.id, {
      status: draft.status,
      rating: draft.rating || undefined,
      summary: draft.summary?.trim() || undefined,
      strengths: draft.strengths?.trim() || undefined,
      growthAreas: draft.growthAreas?.trim() || undefined,
      submittedAt: draft.submittedAt || undefined,
      acknowledgedAt: draft.acknowledgedAt || undefined,
    });

    setReviewDrafts((prev) => {
      const next = { ...prev };
      delete next[review.id];
      return next;
    });
  };

  return (
    <Card
      title="Performance"
      subtitle="Set goals, track cycles, and keep review history transparent"
      action={
        <Badge variant={activeCycle?.status === 'ACTIVE' ? 'success' : 'info'}>
          {activeCycle ? `${activeCycle.name} · ${activeCycle.status.toLowerCase()}` : 'No cycle'}
        </Badge>
      }
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Cycles</p>
              <p className="text-sm text-slate-300">Align feedback across consistent review periods.</p>
            </div>
            {userRole === 'ADMIN' && onCreateCycle ? (
              <Button variant="ghost" onClick={() => setShowCycleForm((value) => !value)}>
                {showCycleForm ? 'Close' : 'New cycle'}
              </Button>
            ) : null}
          </div>

          {showCycleForm && onCreateCycle ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                  Name
                  <input
                    value={cycleForm.name}
                    onChange={(event) => setCycleForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="2025 Mid-Year"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </label>
                <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                  Status
                  <select
                    value={cycleForm.status}
                    onChange={(event) => setCycleForm((prev) => ({ ...prev, status: event.target.value as PerformanceCycleStatus }))}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                  Start date
                  <input
                    type="date"
                    value={cycleForm.startDate}
                    onChange={(event) => setCycleForm((prev) => ({ ...prev, startDate: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </label>
                <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                  End date
                  <input
                    type="date"
                    value={cycleForm.endDate}
                    onChange={(event) => setCycleForm((prev) => ({ ...prev, endDate: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </label>
              </div>

              {cycleError ? <p className="mt-3 text-sm text-red-300">{cycleError}</p> : null}

              <div className="mt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowCycleForm(false)} disabled={isSavingCycle}>
                  Cancel
                </Button>
                <Button type="button" variant="secondary" onClick={handleCreateCycle} loading={isSavingCycle}>
                  Create cycle
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {orderedCycles.map((cycle) => (
              <button
                key={cycle.id}
                type="button"
                onClick={() => {
                  setSelectedCycleId(cycle.id);
                  setGoalForm((prev) => ({ ...prev, cycleId: cycle.id }));
                }}
                className={`rounded-2xl border px-4 py-3 text-left text-xs transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  selectedCycleId === cycle.id
                    ? 'border-blue-400/70 bg-blue-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-blue-300/40'
                }`}
              >
                <p className="font-semibold text-sm text-white">{cycle.name}</p>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.3em] text-blue-200">{cycle.status.toLowerCase()}</p>
                <p className="mt-1 text-xs text-slate-300">
                  {formatDate(cycle.startDate)} – {formatDate(cycle.endDate)}
                </p>
              </button>
            ))}
            {orderedCycles.length === 0 ? (
              <p className="text-sm text-slate-300">No performance cycles yet.</p>
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Goals</p>
              <p className="text-sm text-slate-300">Track outcomes and keep momentum visible.</p>
            </div>
            <Badge variant="info">Average progress {averageProgress}%</Badge>
            <Button variant="ghost" onClick={() => setShowGoalForm((value) => !value)}>
              {showGoalForm ? 'Close' : 'New goal'}
            </Button>
          </div>

          {showGoalForm ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                  Title
                  <input
                    value={goalForm.title}
                    onChange={(event) => setGoalForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Deliver AI-driven reporting dashboard"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </label>
                <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                  Cycle
                  <select
                    value={goalForm.cycleId}
                    onChange={(event) => setGoalForm((prev) => ({ ...prev, cycleId: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="">Select cycle</option>
                    {orderedCycles.map((cycle) => (
                      <option key={cycle.id} value={cycle.id}>
                        {cycle.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-4 block space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                Description
                <textarea
                  value={goalForm.description ?? ''}
                  onChange={(event) => setGoalForm((prev) => ({ ...prev, description: event.target.value }))}
                  rows={3}
                  placeholder="Outline impact, milestones, or success metrics."
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </label>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                  Status
                  <select
                    value={goalForm.status ?? 'NOT_STARTED'}
                    onChange={(event) => setGoalForm((prev) => ({ ...prev, status: event.target.value as PerformanceGoalStatus }))}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {GOAL_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_COPY[status].label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                  Progress
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={goalForm.progress ?? 0}
                    onChange={(event) => setGoalForm((prev) => ({ ...prev, progress: Number(event.target.value) }))}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </label>
                <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                  Due date
                  <input
                    type="date"
                    value={goalForm.dueDate ?? ''}
                    onChange={(event) => setGoalForm((prev) => ({ ...prev, dueDate: event.target.value || undefined }))}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </label>
              </div>

              {goalError ? <p className="mt-3 text-sm text-red-300">{goalError}</p> : null}

              <div className="mt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowGoalForm(false)} disabled={isSavingGoal}>
                  Cancel
                </Button>
                <Button type="button" variant="secondary" onClick={handleCreateGoal} loading={isSavingGoal}>
                  Create goal
                </Button>
              </div>
            </div>
          ) : null}

          {isLoading ? (
            <p className="text-sm text-slate-300">Loading performance data…</p>
          ) : filteredGoals.length === 0 ? (
            <p className="text-sm text-slate-300">No goals captured for this cycle yet.</p>
          ) : (
            <div className="space-y-4">
              {filteredGoals.map((goal) => (
                <div key={goal.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                      <p className="text-xs text-slate-400">{STATUS_COPY[goal.status].label}</p>
                    </div>
                    <Badge variant="success">{goal.progress}%</Badge>
                  </div>
                  {goal.description ? <p className="mt-3 text-sm text-slate-300">{goal.description}</p> : null}

                  <div className="mt-4 grid gap-3 text-xs text-slate-300 md:grid-cols-3">
                    <div>
                      <p className="uppercase tracking-[0.3em] text-blue-200">Cycle</p>
                      <p className="mt-1 text-sm text-white">{goal.cycle.name}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.3em] text-blue-200">Due</p>
                      <p className="mt-1 text-sm text-white">{formatDate(goal.dueDate ?? null)}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.3em] text-blue-200">Updated</p>
                      <p className="mt-1 text-sm text-white">{formatDate(goal.updatedAt)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label className="text-xs uppercase tracking-[0.3em] text-blue-200">
                      Status
                      <select
                        value={goal.status}
                        onChange={(event) => onUpdateGoal(goal.id, { status: event.target.value as PerformanceGoalStatus })}
                        className="mt-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      >
                        {GOAL_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_COPY[status].label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs uppercase tracking-[0.3em] text-blue-200">
                      Progress
                      <input
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={goal.progress}
                        onBlur={(event) => {
                          const value = Number(event.target.value);
                          if (Number.isNaN(value)) return;
                          onUpdateGoal(goal.id, { progress: value });
                        }}
                        className="mt-2 w-24 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Reviews</p>
              <p className="text-sm text-slate-300">Close the loop on feedback and document recognition.</p>
            </div>
            {reviews.length ? (
              <Badge variant="info">{reviews.length} record{reviews.length === 1 ? '' : 's'}</Badge>
            ) : null}
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-300">Loading review history…</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-slate-300">No review summaries available yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const editable = userRole !== 'EMPLOYEE' && onUpdateReview;

                return (
                  <div key={review.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{review.cycle.name}</h3>
                        <p className="text-xs text-slate-400">
                          {review.employee.profile?.firstName
                            ? `${review.employee.profile.firstName} ${review.employee.profile.lastName ?? ''}`.trim()
                            : review.employee.email ?? 'Employee'}
                        </p>
                      </div>
                      <Badge variant={review.status === 'ACKNOWLEDGED' ? 'success' : 'warning'}>
                        {REVIEW_STATUS_COPY[review.status]}
                      </Badge>
                    </div>

                    <dl className="mt-4 grid gap-3 text-xs text-slate-300 md:grid-cols-3">
                      <div>
                        <dt className="uppercase tracking-[0.3em] text-blue-200">Manager</dt>
                        <dd className="mt-1 text-sm text-white">
                          {review.manager.profile?.firstName
                            ? `${review.manager.profile.firstName} ${review.manager.profile.lastName ?? ''}`.trim()
                            : review.manager.email ?? '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-[0.3em] text-blue-200">Rating</dt>
                        <dd className="mt-1 text-sm text-white">{review.rating ? RATING_COPY[review.rating] : '—'}</dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-[0.3em] text-blue-200">Submitted</dt>
                        <dd className="mt-1 text-sm text-white">{formatDate(review.submittedAt)}</dd>
                      </div>
                    </dl>

                    {review.summary ? (
                      <div className="mt-4 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-200">
                        <p className="uppercase text-[0.65rem] tracking-[0.3em] text-blue-200">Summary</p>
                        <p className="mt-2 text-slate-200">{review.summary}</p>
                      </div>
                    ) : null}

                    {editable ? (
                      <div className="mt-5 space-y-4 rounded-2xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Update review</p>
                        <div className="grid gap-4 md:grid-cols-3">
                          <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                            Status
                            <select
                              defaultValue={review.status}
                              onChange={(event) => handleDraftChange(review.id, { status: event.target.value as PerformanceReviewStatus })}
                              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            >
                              {REVIEW_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {REVIEW_STATUS_COPY[status]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                            Rating
                            <select
                              defaultValue={review.rating ?? ''}
                              onChange={(event) => handleDraftChange(review.id, { rating: event.target.value as PerformanceRating | '' })}
                              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            >
                              <option value="">Select rating</option>
                              {REVIEW_RATINGS.map((rating) => (
                                <option key={rating} value={rating}>
                                  {RATING_COPY[rating]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                            Submitted on
                            <input
                              type="date"
                              defaultValue={review.submittedAt ? review.submittedAt.slice(0, 10) : ''}
                              onBlur={(event) => handleDraftChange(review.id, { submittedAt: event.target.value || undefined })}
                              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                          </label>
                        </div>

                        <label className="block space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                          Summary
                          <textarea
                            defaultValue={review.summary ?? ''}
                            onBlur={(event) => handleDraftChange(review.id, { summary: event.target.value })}
                            rows={3}
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          />
                        </label>

                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                            Strengths
                            <textarea
                              defaultValue={review.strengths ?? ''}
                              onBlur={(event) => handleDraftChange(review.id, { strengths: event.target.value })}
                              rows={2}
                              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                          </label>
                          <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-blue-200">
                            Growth areas
                            <textarea
                              defaultValue={review.growthAreas ?? ''}
                              onBlur={(event) => handleDraftChange(review.id, { growthAreas: event.target.value })}
                              rows={2}
                              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                          </label>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="secondary"
                            loading={isSavingReview}
                            onClick={() => handleSaveReview(review)}
                          >
                            Save changes
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Card>
  );
};
