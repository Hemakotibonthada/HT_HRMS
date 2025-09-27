import { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { LoadingState } from '../ui/LoadingState';
import { DataTable } from '../ui/DataTable.tsx';
import type { DataTableColumn } from '../ui/DataTable.tsx';
import { useModal } from '../../hooks/useModal';
import type {
  ExpenseClaimPayload,
  ExpenseClaimRecord,
  ExpenseStatus,
  ExpenseSummaryResponse,
  UpdateExpensePayload,
  UserRole,
} from '../../types/api';
import { ExpenseForm } from './expenses/ExpenseForm';
import { ExpenseStatusForm } from './expenses/ExpenseStatusForm';
import { ExpenseStatusBadge } from './expenses/ExpenseStatusBadge';

interface ExpensesPanelProps {
  claims: ExpenseClaimRecord[];
  summary?: ExpenseSummaryResponse | null;
  userRole: UserRole;
  isLoading: boolean;
  isSubmitting: boolean;
  isUpdating: boolean;
  onSubmitClaim: (payload: ExpenseClaimPayload) => Promise<void>;
  onUpdateClaim: (id: string, payload: UpdateExpensePayload) => Promise<void>;
  onRefresh?: () => void;
}

type StatusFilter = ExpenseStatus | 'ALL';

const expenseStatuses: ExpenseStatus[] = ['SUBMITTED', 'APPROVED', 'REJECTED', 'REIMBURSED'];

const emptySummary: Record<ExpenseStatus, { count: number; amount: number }> = {
  SUBMITTED: { count: 0, amount: 0 },
  APPROVED: { count: 0, amount: 0 },
  REJECTED: { count: 0, amount: 0 },
  REIMBURSED: { count: 0, amount: 0 },
};

const formatCurrency = (value: number, currency = 'INR') =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);

const getEmployeeName = (record: ExpenseClaimRecord) => {
  const { user } = record;
  const profile = user?.profile;
  if (profile) {
    const full = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    if (full) return full;
  }
  return user?.email ?? 'Unknown';
};

export const ExpensesPanel = ({
  claims,
  summary,
  userRole,
  isLoading,
  isSubmitting,
  isUpdating,
  onSubmitClaim,
  onUpdateClaim,
  onRefresh,
}: ExpensesPanelProps) => {
  const baseCurrency = claims[0]?.currency ?? 'INR';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const [newExpenseModal, openNewExpenseModal, closeNewExpenseModal] = useModal();
  const [reviewModal, openReviewModal, closeReviewModal] = useModal<{ expense: ExpenseClaimRecord }>();
  const [detailModal, openDetailModal, closeDetailModal] = useModal<{ expense: ExpenseClaimRecord }>();

  const summaryByStatus = useMemo(() => {
    if (!summary?.byStatus) return emptySummary;
    return {
      SUBMITTED: summary.byStatus.SUBMITTED ?? emptySummary.SUBMITTED,
      APPROVED: summary.byStatus.APPROVED ?? emptySummary.APPROVED,
      REJECTED: summary.byStatus.REJECTED ?? emptySummary.REJECTED,
      REIMBURSED: summary.byStatus.REIMBURSED ?? emptySummary.REIMBURSED,
    } satisfies typeof emptySummary;
  }, [summary]);

  const filteredClaims = useMemo(
    () =>
      statusFilter === 'ALL'
        ? claims
        : claims.filter((claim) => claim.status === statusFilter),
    [claims, statusFilter],
  );

  const expenseColumns: DataTableColumn<ExpenseClaimRecord>[] = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Employee',
        cell: (row: ExpenseClaimRecord) => getEmployeeName(row),
      },
      {
        header: 'Category',
        cell: (row: ExpenseClaimRecord) => row.category.replace('_', ' '),
      },
      {
        header: 'Amount',
        cell: (row: ExpenseClaimRecord) => formatCurrency(row.amount, row.currency),
      },
      {
        header: 'Incurred',
        cell: (row: ExpenseClaimRecord) => new Date(row.incurredOn).toLocaleDateString(),
      },
      {
        header: 'Status',
        cell: (row: ExpenseClaimRecord) => <ExpenseStatusBadge status={row.status} />,
      },
      {
        header: 'Actions',
        cell: (row: ExpenseClaimRecord) => (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => openDetailModal({ expense: row })}>
              View
            </Button>
            {userRole === 'ADMIN' && (
              <Button size="sm" variant="ghost" onClick={() => openReviewModal({ expense: row })}>
                Review
              </Button>
            )}
          </div>
        ),
      },
    ],
    [userRole, openDetailModal, openReviewModal],
  );

  return (
    <section className="space-y-6">
      <Card
        title="Expenses"
        subtitle="Submit reimbursements, monitor approvals, and keep finance in sync"
        action={
          <div className="flex flex-wrap items-center gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
                Refresh
              </Button>
            )}
            <Button size="sm" onClick={() => openNewExpenseModal()}>
              Submit expense
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {expenseStatuses.map((status) => {
            const entry = summaryByStatus[status] ?? { count: 0, amount: 0 };
            return (
              <div key={status} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300">
                  <span>{status.replace('_', ' ')}</span>
                  <span>{entry.count}</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(entry.amount, baseCurrency)}</p>
                <p className="text-xs text-slate-400">Total amount</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {(['ALL', ...expenseStatuses] as StatusFilter[]).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'secondary' : 'ghost'}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'ALL' ? 'All' : status.replace('_', ' ')}
            </Button>
          ))}
        </div>

        <div className="mt-4">
          {isLoading ? (
            <LoadingState title="Loading expenses" />
          ) : filteredClaims.length === 0 ? (
            <EmptyState
              title="No expenses yet"
              description="Submit a claim or adjust the filter to see past reimbursements."
              actionLabel={userRole === 'ADMIN' ? undefined : 'Submit expense'}
              onAction={userRole === 'ADMIN' ? undefined : () => openNewExpenseModal()}
            />
          ) : (
            <DataTable
              data={filteredClaims}
              getRowId={(row: ExpenseClaimRecord) => row.id}
              columns={expenseColumns}
              emptyMessage="No expenses match this filter."
            />
          )}
        </div>
      </Card>

      <Modal open={newExpenseModal.isOpen} onOpenChange={closeNewExpenseModal} title="Submit expense claim">
        <ExpenseForm
          isSubmitting={isSubmitting}
          onSubmit={async (payload) => {
            await onSubmitClaim(payload);
            closeNewExpenseModal();
          }}
        />
      </Modal>

      <Modal
        open={reviewModal.isOpen}
        onOpenChange={closeReviewModal}
        title="Update expense status"
      >
        {reviewModal.data?.expense ? (
          <ExpenseStatusForm
            initialStatus={reviewModal.data.expense.status}
            initialNotes={reviewModal.data.expense.notes}
            initialRejectionReason={reviewModal.data.expense.rejectionReason}
            isSubmitting={isUpdating}
            onSubmit={async (payload) => {
              await onUpdateClaim(reviewModal.data!.expense.id, payload);
              closeReviewModal();
            }}
          />
        ) : (
          <EmptyState title="No expense selected" description="Choose an expense to review." />
        )}
      </Modal>

      <Modal
        open={detailModal.isOpen}
        onOpenChange={closeDetailModal}
        title={detailModal.data?.expense ? detailModal.data.expense.title : 'Expense details'}
      >
        {detailModal.data?.expense ? (
          <ExpenseDetails expense={detailModal.data.expense} />
        ) : (
          <EmptyState title="No expense selected" description="Open an expense to view full information." />
        )}
      </Modal>
    </section>
  );
};

const ExpenseDetails = ({ expense }: { expense: ExpenseClaimRecord }) => (
  <div className="space-y-4 text-sm text-slate-200">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Employee</p>
        <p className="text-base font-semibold text-white">{getEmployeeName(expense)}</p>
      </div>
      <ExpenseStatusBadge status={expense.status} />
    </div>

    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Amount</p>
        <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(expense.amount, expense.currency)}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Incurred on</p>
        <p className="mt-1 font-semibold">{new Date(expense.incurredOn).toLocaleString()}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Category</p>
        <p className="mt-1 font-semibold">{expense.category.replace('_', ' ')}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Submitted at</p>
        <p className="mt-1 font-semibold">{new Date(expense.submittedAt).toLocaleString()}</p>
      </div>
    </div>

    {expense.approvedBy && (
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Approved by</p>
          <p className="mt-1 font-semibold">{getEmployeeName({ ...expense, user: expense.approvedBy })}</p>
        </div>
        {expense.approvedAt && (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Approved at</p>
            <p className="mt-1 font-semibold">{new Date(expense.approvedAt).toLocaleString()}</p>
          </div>
        )}
      </div>
    )}

    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Description</p>
      <p className="mt-2 whitespace-pre-wrap text-slate-100">{expense.description ?? '—'}</p>
    </div>

    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Notes</p>
      <p className="mt-2 whitespace-pre-wrap text-slate-100">{expense.notes ?? '—'}</p>
    </div>

    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Rejection reason</p>
      <p className="mt-2 whitespace-pre-wrap text-slate-100">{expense.rejectionReason ?? '—'}</p>
    </div>

    {expense.receiptUrl && (
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Receipt</p>
        <a
          href={expense.receiptUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-blue-200 underline hover:text-blue-100"
        >
          View receipt
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h4a.75.75 0 0 1 0 1.5h-4a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-4a.75.75 0 0 1 1.5 0v4A2 2 0 0 1 15.5 18h-11A2 2 0 0 1 2 16V5.5A1.5 1.5 0 0 1 3 4.5Z" />
            <path d="M11.75 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.56l-7.72 7.72a.75.75 0 1 1-1.06-1.06l7.72-7.72h-1.94A.75.75 0 0 1 11.75 3Z" />
          </svg>
        </a>
      </div>
    )}
  </div>
);
