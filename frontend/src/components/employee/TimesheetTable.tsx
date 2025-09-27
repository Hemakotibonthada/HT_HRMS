import { Fragment } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { TimesheetEntry, UserRole } from '../../types/api';

const statusVariant: Record<TimesheetEntry['status'], 'info' | 'success' | 'danger'> = {
  PENDING: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
};

const formatDate = (value: string | undefined | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

interface TimesheetTableProps {
  timesheets: TimesheetEntry[];
  userRole: UserRole;
  onUpdateStatus: (id: string, status: TimesheetEntry['status']) => Promise<void>;
  isUpdatingId?: string | null;
  isLoading?: boolean;
}

export const TimesheetTable = ({ timesheets, userRole, onUpdateStatus, isUpdatingId, isLoading = false }: TimesheetTableProps) => {
  const canModerate = userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER';

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
        Syncing timesheets...
      </div>
    );
  }

  if (timesheets.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
        No timesheets logged yet. Submit your first entry to start tracking hours.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <table className="min-w-full divide-y divide-white/10 text-sm text-slate-200">
        <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-300">
          <tr>
            <th scope="col" className="px-4 py-3 text-left">Date</th>
            <th scope="col" className="px-4 py-3 text-left">Project</th>
            <th scope="col" className="px-4 py-3 text-left">Work Item</th>
            <th scope="col" className="px-4 py-3 text-left">Hours</th>
            <th scope="col" className="px-4 py-3 text-left">Status</th>
            <th scope="col" className="px-4 py-3 text-left">Approver</th>
            {canModerate && <th scope="col" className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {timesheets.map((entry) => {
            const isPending = entry.status === 'PENDING';
            const displayHours = Number.parseFloat(entry.hours ?? '0').toFixed(2);
            const approverName = entry.approvedBy?.profile
              ? `${entry.approvedBy.profile.firstName ?? ''} ${entry.approvedBy.profile.lastName ?? ''}`.trim()
              : entry.approvedBy?.email ?? '—';
            const workItemLabel = entry.workItem?.title ?? '—';
            return (
              <Fragment key={entry.id}>
                <tr className="hover:bg-white/5">
                  <td className="px-4 py-4 align-top">{formatDate(entry.workDate)}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{entry.project?.title ?? '—'}</span>
                      <span className="text-xs text-slate-400">{entry.project?.id.slice(0, 8) ?? ''}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">{workItemLabel}</td>
                  <td className="px-4 py-4 align-top">{displayHours}</td>
                  <td className="px-4 py-4 align-top">
                    <Badge variant={statusVariant[entry.status]}>{entry.status}</Badge>
                  </td>
                  <td className="px-4 py-4 align-top">{approverName || '—'}</td>
                  {canModerate && (
                    <td className="px-4 py-4 align-top text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          disabled={!isPending}
                          loading={isUpdatingId === entry.id}
                          onClick={() => onUpdateStatus(entry.id, 'APPROVED')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          disabled={!isPending}
                          loading={isUpdatingId === entry.id}
                          onClick={() => onUpdateStatus(entry.id, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
