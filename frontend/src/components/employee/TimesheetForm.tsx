import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Project, WorkItem } from '../../types/api';

interface TimesheetFormValues {
  projectId: string;
  workItemId?: string;
  workDate: string;
  hours: string;
  description: string;
}

interface TimesheetFormProps {
  projects: Project[];
  onSubmit: (payload: { projectId: string; workItemId?: string; workDate: string; hours: number; description?: string }) => Promise<void>;
  isSubmitting?: boolean;
}

const getInitialValues = (projects: Project[]): TimesheetFormValues => ({
  projectId: projects[0]?.id ?? '',
  workItemId: undefined,
  workDate: new Date().toISOString().slice(0, 10),
  hours: '8',
  description: '',
});

export const TimesheetForm = ({ projects, onSubmit, isSubmitting = false }: TimesheetFormProps) => {
  const [values, setValues] = useState<TimesheetFormValues>(() => getInitialValues(projects));
  const [error, setError] = useState<string | null>(null);

  const selectedProject = useMemo(() => projects.find((project) => project.id === values.projectId), [projects, values.projectId]);
  const workItems: WorkItem[] = useMemo(() => selectedProject?.workItems ?? [], [selectedProject]);

  useEffect(() => {
    if (projects.length === 0) return;
    setValues((prev) => {
      if (prev.projectId && projects.some((project) => project.id === prev.projectId)) {
        return prev;
      }
      return {
        ...prev,
        projectId: projects[0].id,
        workItemId: undefined,
      };
    });
  }, [projects]);

  const handleChange = (field: keyof TimesheetFormValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!values.projectId) {
      setError('Select a project to log time against.');
      return;
    }

    const numericHours = Number.parseFloat(values.hours);
    if (Number.isNaN(numericHours) || numericHours <= 0) {
      setError('Enter a valid number of hours.');
      return;
    }

    await onSubmit({
      projectId: values.projectId,
      workItemId: values.workItemId || undefined,
      workDate: values.workDate,
      hours: numericHours,
      description: values.description || undefined,
    });

    setValues(getInitialValues(projects));
  };

  return (
    <Card
      title="Log Timesheet"
      subtitle="Submit hours against an R&D initiative"
    >
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Project</label>
          <select
            value={values.projectId}
            onChange={handleChange('projectId')}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            {projects.length === 0 && <option value="">No projects available</option>}
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Work item (optional)</label>
          <select
            value={values.workItemId ?? ''}
            onChange={handleChange('workItemId')}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="">Unassigned</option>
            {workItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Work date</label>
          <input
            type="date"
            value={values.workDate}
            onChange={handleChange('workDate')}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Hours</label>
          <input
            type="number"
            min="0"
            step="0.25"
            value={values.hours}
            onChange={handleChange('hours')}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            placeholder="8.0"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Notes</label>
          <textarea
            value={values.description}
            onChange={handleChange('description')}
            rows={3}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            placeholder="Summarise the work you've completed"
          />
        </div>
        {error && (
          <p className="sm:col-span-2 text-sm text-rose-300">{error}</p>
        )}
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" loading={isSubmitting} disabled={projects.length === 0}>
            Submit Timesheet
          </Button>
        </div>
      </form>
    </Card>
  );
};
