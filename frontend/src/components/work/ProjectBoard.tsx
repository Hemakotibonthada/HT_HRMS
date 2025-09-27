import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { Project } from '../../types/api';
import clsx from 'clsx';

const badgeVariants = {
  info: 'info',
  success: 'success',
  warning: 'warning',
} as const;

const statusCopy: Record<Project['status'], { label: string; badge: keyof typeof badgeVariants }> = {
  IN_PROGRESS: { label: 'In Progress', badge: 'info' },
  COMPLETE: { label: 'Complete', badge: 'success' },
  ON_HOLD: { label: 'On Hold', badge: 'warning' },
};

interface ProjectBoardProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelectProject: (projectId: string) => void;
}

export const ProjectBoard = ({ projects, selectedProjectId, onSelectProject }: ProjectBoardProps) => {
  if (projects.length === 0) {
    return (
      <Card title="Project Board" subtitle="No projects assigned yet">
        <p className="text-sm text-slate-200">Your assigned projects will appear here once you join an initiative.</p>
      </Card>
    );
  }

  return (
    <Card title="Project Board" subtitle="Assigned initiatives and health">
      <div className="grid gap-6 lg:grid-cols-3">
        {projects.map((project) => {
          const isSelected = project.id === selectedProjectId;
          const status = statusCopy[project.status];
          return (
            <button
              key={project.id}
              type="button"
              onClick={() => onSelectProject(project.id)}
              className={clsx(
                'group rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-blue-400/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400',
                isSelected && 'border-blue-500/70 bg-blue-500/10',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-300">{project.id.slice(0, 8)}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{project.title}</h3>
                </div>
                <Badge variant={badgeVariants[status.badge]}>{status.label}</Badge>
              </div>
              {project.description && <p className="mt-3 text-sm text-slate-200 line-clamp-3">{project.description}</p>}
              <dl className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-300">
                <div>
                  <dt>Start date</dt>
                  <dd className="mt-1 text-sm text-white">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}
                  </dd>
                </div>
                <div>
                  <dt>Due date</dt>
                  <dd className="mt-1 text-sm text-white">
                    {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'TBD'}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                <span>{project.workItems?.length ?? 0} work items</span>
                <span className="text-blue-200 group-hover:text-white">Select project</span>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
