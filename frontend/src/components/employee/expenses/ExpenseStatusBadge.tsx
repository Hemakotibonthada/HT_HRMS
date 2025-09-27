import { Badge } from '../../ui/Badge';
import type { ExpenseStatus } from '../../../types/api';

const statusVariant: Record<ExpenseStatus, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
  SUBMITTED: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
  REIMBURSED: 'warning',
};

const formatLabel = (status: ExpenseStatus) =>
  status
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export const ExpenseStatusBadge = ({ status }: { status: ExpenseStatus }) => (
  <Badge variant={statusVariant[status] ?? 'default'}>{formatLabel(status)}</Badge>
);
