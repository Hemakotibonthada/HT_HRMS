import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { Button } from '../../ui/Button';
import type { EmploymentType, JobOpeningPayload, JobStatus } from '../../../types/api';

const jobSchema = z.object({
  title: z.string().min(3),
  department: z.string().min(2),
  location: z.string().optional(),
  description: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'CONTRACT', 'INTERN']),
  status: z.enum(['OPEN', 'CLOSED', 'PAUSED']).optional(),
  openings: z.coerce.number().int().min(1).max(99),
});

interface JobFormProps {
  initialValues?: Partial<JobOpeningPayload> & { status?: JobStatus };
  onSubmit: (values: JobOpeningPayload) => void;
  isSubmitting?: boolean;
}

const employmentOptions: EmploymentType[] = ['FULL_TIME', 'CONTRACT', 'INTERN'];
const statusOptions: JobStatus[] = ['OPEN', 'PAUSED', 'CLOSED'];

export const JobForm = ({ initialValues, onSubmit, isSubmitting }: JobFormProps) => {
  const defaults = useMemo(() => ({
    title: initialValues?.title ?? '',
    department: initialValues?.department ?? '',
    location: initialValues?.location ?? '',
    description: initialValues?.description ?? '',
    employmentType: (initialValues?.employmentType ?? 'FULL_TIME') as EmploymentType,
    status: (initialValues?.status ?? 'OPEN') as JobStatus,
    openings: initialValues?.openings ?? 1,
  }), [initialValues]);

  const [values, setValues] = useState(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues(defaults);
    setErrors({});
  }, [defaults]);

  const handleChange = (field: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = field === 'openings' ? Number.parseInt(event.target.value, 10) || 1 : event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = jobSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]?.toString() ?? 'form'] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const payload: JobOpeningPayload = {
      title: values.title.trim(),
      department: values.department.trim(),
      location: values.location.trim() || undefined,
      description: values.description.trim() || undefined,
      employmentType: values.employmentType,
      status: values.status,
      openings: values.openings,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Title</span>
          <input
            type="text"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            value={values.title}
            onChange={handleChange('title')}
            placeholder="Senior Product Designer"
          />
          {errors.title && <p className="text-xs text-rose-300">{errors.title}</p>}
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Department</span>
          <input
            type="text"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            value={values.department}
            onChange={handleChange('department')}
            placeholder="Product Design"
          />
          {errors.department && <p className="text-xs text-rose-300">{errors.department}</p>}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Location</span>
          <input
            type="text"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            value={values.location}
            onChange={handleChange('location')}
            placeholder="Remote or On-site"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Employment Type</span>
          <select
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
            value={values.employmentType}
            onChange={handleChange('employmentType')}
          >
            {employmentOptions.map((option) => (
              <option key={option} value={option} className="text-slate-900">
                {option.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Status</span>
          <select
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
            value={values.status}
            onChange={handleChange('status')}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option} className="text-slate-900">
                {option.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Openings</span>
          <input
            type="number"
            min={1}
            max={99}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
            value={values.openings}
            onChange={handleChange('openings')}
          />
          {errors.openings && <p className="text-xs text-rose-300">{errors.openings}</p>}
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Description</span>
        <textarea
          className="h-32 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
          value={values.description}
          onChange={handleChange('description')}
          placeholder="Share mission, responsibilities, and culture notes"
        />
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={() => setValues(defaults)}>
          Reset
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {initialValues?.title ? 'Save changes' : 'Create job'}
        </Button>
      </div>
    </form>
  );
};
