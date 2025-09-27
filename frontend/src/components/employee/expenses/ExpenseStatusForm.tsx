import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../ui/Button';
import type { ExpenseStatus, UpdateExpensePayload } from '../../../types/api';

const statusOptions: ExpenseStatus[] = ['SUBMITTED', 'APPROVED', 'REJECTED', 'REIMBURSED'];

interface ExpenseStatusFormProps {
  initialStatus: ExpenseStatus;
  initialNotes?: string | null;
  initialRejectionReason?: string | null;
  onSubmit: (payload: UpdateExpensePayload) => Promise<void> | void;
  isSubmitting?: boolean;
}

export const ExpenseStatusForm = ({
  initialStatus,
  initialNotes,
  initialRejectionReason,
  onSubmit,
  isSubmitting,
}: ExpenseStatusFormProps) => {
  const [status, setStatus] = useState<ExpenseStatus>(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [rejectionReason, setRejectionReason] = useState(initialRejectionReason ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(initialStatus);
    setNotes(initialNotes ?? '');
    setRejectionReason(initialRejectionReason ?? '');
    setError(null);
  }, [initialStatus, initialNotes, initialRejectionReason]);

  const isRejected = useMemo(() => status === 'REJECTED', [status]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isRejected && rejectionReason.trim().length === 0) {
      setError('Add a short reason when rejecting an expense.');
      return;
    }

    const payload: UpdateExpensePayload = {
      status,
      notes: notes.trim() || undefined,
      rejectionReason: isRejected ? rejectionReason.trim() : undefined,
    };

    setError(null);
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Status</span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ExpenseStatus)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option} className="text-slate-900">
              {option.replace('_', ' ')}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Notes for claimant</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="h-28 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
          placeholder="Optional guidance, payout timelines, or follow-up questions"
        />
      </label>

      {isRejected && (
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Rejection reason</span>
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            className="h-24 w-full rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-white placeholder:text-rose-200 focus:border-rose-400 focus:outline-none"
            placeholder="Document why this expense cannot be approved"
          />
        </label>
      )}

      {error && <p className="text-xs text-rose-300">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={() => {
          setStatus(initialStatus);
          setNotes(initialNotes ?? '');
          setRejectionReason(initialRejectionReason ?? '');
          setError(null);
        }}>
          Reset
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Update status
        </Button>
      </div>
    </form>
  );
};
