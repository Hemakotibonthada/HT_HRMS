import { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { WorkItem, WorkItemComment } from '../../types/api';
import clsx from 'clsx';

interface WorkItemDetailsProps {
  workItem?: WorkItem | null;
  onAddComment: (body: string) => Promise<void>;
}

const statusColors: Record<WorkItem['status'], string> = {
  TODO: 'bg-slate-100 text-slate-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  REVIEW: 'bg-blue-100 text-blue-700',
  DONE: 'bg-emerald-100 text-emerald-700',
};

const priorityCopy: Record<WorkItem['priority'], string> = {
  HIGH: 'High priority',
  MEDIUM: 'Medium priority',
  LOW: 'Low priority',
};

const typeCopy: Record<WorkItem['type'], string> = {
  FEATURE: 'Feature',
  BUG: 'Bug',
  TASK: 'Task',
};

export const WorkItemDetails = ({ workItem, onAddComment }: WorkItemDetailsProps) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!workItem) {
    return (
      <Card title="Work Item" subtitle="Select a work item from the board">
        <p className="text-sm text-slate-200">Pick an item to see detailed history, comments, and metadata.</p>
      </Card>
    );
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card title={workItem.title} subtitle={`Work item details · ${workItem.id.slice(0, 8)}`}>
      <div className="space-y-6 text-sm text-slate-200">
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-[0.3em] text-blue-200">Summary</h3>
            {workItem.description ? (
              <p className="text-sm leading-relaxed text-slate-200">{workItem.description}</p>
            ) : (
              <p className="text-sm text-slate-400">No description provided yet.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge className={clsx('text-xs font-semibold', statusColors[workItem.status])}>{workItem.status}</Badge>
            <Badge variant="info">{typeCopy[workItem.type]}</Badge>
            <Badge variant={workItem.priority === 'HIGH' ? 'warning' : workItem.priority === 'MEDIUM' ? 'info' : 'success'}>
              {priorityCopy[workItem.priority]}
            </Badge>
          </div>
        </section>

        <section className="grid gap-4 text-xs text-slate-300 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-slate-200">Reporter</p>
            <p className="mt-1 text-base font-semibold text-white">{workItem.reporter?.profile?.firstName ?? '—'}</p>
            <p className="text-xs text-slate-400">{workItem.reporter?.profile?.department ?? 'R&D'}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-slate-200">Assignee</p>
            <p className="mt-1 text-base font-semibold text-white">{workItem.assignee?.profile?.firstName ?? 'Unassigned'}</p>
            <p className="text-xs text-slate-400">{workItem.assignee?.profile?.department ?? '—'}</p>
          </div>
        </section>

        <section>
          <h3 className="text-xs uppercase tracking-[0.3em] text-blue-200">History</h3>
          <ul className="mt-3 space-y-3 text-xs text-slate-300">
            {workItem.history?.map((entry) => (
              <li key={entry.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-slate-200">Status changed to {entry.status}</p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">
                  {new Date(entry.changedAt).toLocaleString()}
                </p>
              </li>
            )) ?? <p>No history available.</p>}
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs uppercase tracking-[0.3em] text-blue-200">Comments</h3>
          <div className="space-y-3">
            {workItem.comments?.length ? (
              workItem.comments.map((comment: WorkItemComment) => (
                <div key={comment.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white">{comment.body}</p>
                  <p className="mt-2 text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No comments yet.</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Share an update for the team"
              className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <Button variant="secondary" onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()}>
              Comment
            </Button>
          </div>
        </section>
      </div>
    </Card>
  );
};
