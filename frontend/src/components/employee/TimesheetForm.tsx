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
      <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2 group">
          <div className="flex items-center gap-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300 group-focus-within:text-blue-300 transition-colors duration-200">
              Project *
            </label>
            <Tooltip content="Select the project you worked on. This field is required.">
              <svg className="w-4 h-4 text-slate-400 hover:text-slate-300 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </Tooltip>
          </div>
          <div className="relative mt-2">
            <select
              value={values.projectId}
              onChange={handleChange('projectId')}
              className={`w-full rounded-xl border backdrop-blur-sm bg-white/10 px-4 py-3 text-sm text-white 
                       focus:outline-none focus:ring-2 focus:bg-white/15
                       hover:bg-white/15 transition-all duration-300 shadow-sm hover:shadow-md
                       appearance-none cursor-pointer ${
                         fieldErrors.projectId 
                           ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/25' 
                           : 'border-white/20 focus:border-blue-400 focus:ring-blue-400/25 hover:border-white/30'
                       }`}
              aria-describedby={fieldErrors.projectId ? 'project-error' : undefined}
              required
            >
              <option value="" className="bg-slate-800 text-white">Select a project...</option>
              {projects.length === 0 && <option value="" className="bg-slate-800 text-white" disabled>No projects available</option>}
              {projects.map((project) => (
                <option key={project.id} value={project.id} className="bg-slate-800 text-white">
                  {project.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
          {fieldErrors.projectId && (
            <p id="project-error" className="mt-1 text-xs text-red-300 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {fieldErrors.projectId}
            </p>
          )}
        </div>

        <div className="group">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300 group-focus-within:text-blue-300 transition-colors duration-200">
            Work item (optional)
          </label>
          <div className="relative mt-2">
            <select
              value={values.workItemId ?? ''}
              onChange={handleChange('workItemId')}
              className="w-full rounded-xl border border-white/20 backdrop-blur-sm bg-white/10 px-4 py-3 text-sm text-white 
                       focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25 focus:bg-white/15
                       hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-sm hover:shadow-md
                       appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-800 text-white">Unassigned</option>
              {workItems.map((item) => (
                <option key={item.id} value={item.id} className="bg-slate-800 text-white">
                  {item.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300 group-focus-within:text-blue-300 transition-colors duration-200">
            Work date
          </label>
          <div className="relative mt-2">
            <input
              type="date"
              value={values.workDate}
              onChange={handleChange('workDate')}
              className="w-full rounded-xl border border-white/20 backdrop-blur-sm bg-white/10 px-4 py-3 text-sm text-white 
                       focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25 focus:bg-white/15
                       hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-sm hover:shadow-md
                       [color-scheme:dark]"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>

        <div className="group">
          <div className="flex items-center gap-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300 group-focus-within:text-blue-300 transition-colors duration-200">
              Hours *
            </label>
            <Tooltip content="Enter hours worked (0.25 hour increments). Maximum 24 hours per day.">
              <svg className="w-4 h-4 text-slate-400 hover:text-slate-300 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </Tooltip>
          </div>
          <div className="relative mt-2">
            <input
              type="number"
              min="0"
              max="24"
              step="0.25"
              value={values.hours}
              onChange={handleChange('hours')}
              className={`w-full rounded-xl border backdrop-blur-sm bg-white/10 px-4 py-3 text-sm text-white 
                       focus:outline-none focus:ring-2 focus:bg-white/15
                       hover:bg-white/15 transition-all duration-300 shadow-sm hover:shadow-md
                       placeholder:text-slate-400 ${
                         fieldErrors.hours 
                           ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/25' 
                           : 'border-white/20 focus:border-blue-400 focus:ring-blue-400/25 hover:border-white/30'
                       }`}
              placeholder="8.0"
              aria-describedby={fieldErrors.hours ? 'hours-error' : 'hours-hint'}
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-xs text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200">hrs</span>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
          {fieldErrors.hours ? (
            <p id="hours-error" className="mt-1 text-xs text-red-300 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {fieldErrors.hours}
            </p>
          ) : (
            <p id="hours-hint" className="mt-1 text-xs text-slate-400">Use increments of 0.25 (15 minutes)</p>
          )}
        </div>

        <div className="sm:col-span-2 group">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300 group-focus-within:text-blue-300 transition-colors duration-200">
            Notes
          </label>
          <div className="relative mt-2">
            <textarea
              value={values.description}
              onChange={handleChange('description')}
              rows={3}
              className="w-full rounded-xl border border-white/20 backdrop-blur-sm bg-white/10 px-4 py-3 text-sm text-white 
                       focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25 focus:bg-white/15
                       hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-sm hover:shadow-md
                       placeholder:text-slate-400 resize-none"
              placeholder="Summarise the work you've completed"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>

        {error && (
          <div className="sm:col-span-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm animate-slide-up">
            <p className="text-sm text-red-300 font-medium flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        <div className="sm:col-span-2 flex justify-end">
          <Button 
            type="submit" 
            loading={isSubmitting} 
            disabled={projects.length === 0}
            className="relative overflow-hidden group hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
          >
            Submit Timesheet
          </Button>
        </div>
      </form>
    </Card>
  );
};
