import { Card } from '../ui/Card';
import type { Project } from '../../types/api';

interface ProjectTimelineProps {
  project?: Project;
}

const toDate = (value?: string | null) => (value ? new Date(value) : undefined);

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : 'TBD');

export const ProjectTimeline = ({ project }: ProjectTimelineProps) => {
  if (!project) {
    return (
      <Card title="Timeline" subtitle="Select a project to visualise the plan">
        <p className="text-sm text-slate-200">Milestones and task timelines appear here for the chosen project.</p>
      </Card>
    );
  }

  const start = toDate(project.startDate) ?? new Date();
  const end = toDate(project.dueDate) ?? new Date(start.getTime() + 1000 * 60 * 60 * 24 * 30);
  const totalDuration = end.getTime() - start.getTime() || 1;

  const milestones = (project.milestones ?? []).map((milestone) => {
    const milestoneStart = toDate(milestone.startDate) ?? start;
    const milestoneEnd = toDate(milestone.dueDate) ?? milestoneStart;
    const offset = ((milestoneStart.getTime() - start.getTime()) / totalDuration) * 100;
    const width = Math.max(((milestoneEnd.getTime() - milestoneStart.getTime()) / totalDuration) * 100, 8);
    return {
      ...milestone,
      offset: Math.max(0, Math.min(100, offset)),
      width: Math.min(100, Math.max(8, width)),
    };
  });

  return (
    <Card title="Project Timeline" subtitle={`${formatDate(project.startDate)} → ${formatDate(project.dueDate)}`}>
      <div className="space-y-6 text-sm text-slate-200">
        <div className="relative h-28 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="absolute left-4 right-4 top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-blue-500/60 via-sky-400/60 to-emerald-400/60" />
          {milestones.length === 0 ? (
            <p className="text-center text-xs text-slate-300">No milestones defined yet.</p>
          ) : (
            milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-blue-500/80"
                style={{
                  left: `${milestone.offset}%`,
                  width: `${milestone.width}%`,
                  minWidth: '2.5rem',
                }}
              >
                <span className="absolute -top-8 left-0 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-100">
                  {milestone.title}
                </span>
              </div>
            ))
          )}
        </div>
        <ul className="grid gap-4 text-xs text-slate-300 md:grid-cols-2">
          <li className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-slate-200">Start date</p>
            <p className="mt-1 text-base font-semibold text-white">{formatDate(project.startDate)}</p>
          </li>
          <li className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-slate-200">Due date</p>
            <p className="mt-1 text-base font-semibold text-white">{formatDate(project.dueDate)}</p>
          </li>
        </ul>
      </div>
    </Card>
  );
};
