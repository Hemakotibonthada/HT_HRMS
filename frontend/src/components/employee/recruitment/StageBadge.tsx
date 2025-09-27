import { Badge } from '../../ui/Badge';
import type { JobStatus, RecruitmentStage } from '../../../types/api';

const stageVariant: Record<RecruitmentStage, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
  APPLIED: 'info',
  SCREENING: 'warning',
  INTERVIEW: 'info',
  OFFER: 'success',
  HIRED: 'success',
  ARCHIVED: 'danger',
};

const statusVariant: Record<JobStatus, 'info' | 'success' | 'warning'> = {
  OPEN: 'success',
  PAUSED: 'warning',
  CLOSED: 'info',
};

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export const StageBadge = ({ stage }: { stage: RecruitmentStage | JobStatus }) => {
  const variant =
    (stageVariant as Record<string, 'info' | 'success' | 'warning' | 'danger' | 'default'>)[stage] ??
    (statusVariant as Record<string, 'info' | 'success' | 'warning' | 'danger' | 'default'>)[stage] ??
    'default';

  return <Badge variant={variant}>{formatLabel(stage)}</Badge>;
};
