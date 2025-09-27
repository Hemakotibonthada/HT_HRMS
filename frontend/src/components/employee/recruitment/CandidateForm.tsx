import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { Button } from '../../ui/Button';
import type {
  CandidateApplicationRecord,
  CandidatePayload,
  RecruitmentStage,
  UpdateCandidatePayload,
} from '../../../types/api';

const candidateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  stage: z.enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'ARCHIVED']).optional(),
  stageNote: z.string().optional(),
  lastInteraction: z.string().optional(),
});

const stageOptions: RecruitmentStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'ARCHIVED'];

type CandidateFormValues = (CandidatePayload & { stage?: RecruitmentStage; stageNote?: string; lastInteraction?: string }) | UpdateCandidatePayload;

interface CandidateFormProps {
  initialValues?: CandidateApplicationRecord;
  onSubmit: (values: CandidateFormValues) => void;
  isSubmitting?: boolean;
}

export const CandidateForm = ({ initialValues, onSubmit, isSubmitting }: CandidateFormProps) => {
  const defaults = useMemo(() => ({
    firstName: initialValues?.firstName ?? '',
    lastName: initialValues?.lastName ?? '',
    email: initialValues?.email ?? '',
    phone: initialValues?.phone ?? '',
    resumeUrl: initialValues?.resumeUrl ?? '',
    source: initialValues?.source ?? '',
    notes: initialValues?.notes ?? '',
    stage: initialValues?.stage ?? 'APPLIED',
    stageNote: '',
    lastInteraction: initialValues?.lastInteraction ?? '',
  }), [initialValues]);

  const [values, setValues] = useState(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues(defaults);
    setErrors({});
  }, [defaults]);

  const handleChange = (field: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = candidateSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]?.toString() ?? 'form'] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const payload: CandidateFormValues = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      resumeUrl: values.resumeUrl.trim() || undefined,
      source: values.source.trim() || undefined,
      notes: values.notes.trim() || undefined,
      stage: values.stage,
      stageNote: values.stageNote?.trim() || undefined,
      lastInteraction: values.lastInteraction ? new Date(values.lastInteraction).toISOString() : undefined,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">First name</span>
          <input
            type="text"
            value={values.firstName}
            onChange={handleChange('firstName')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
          />
          {errors.firstName && <p className="text-xs text-rose-300">{errors.firstName}</p>}
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Last name</span>
          <input
            type="text"
            value={values.lastName}
            onChange={handleChange('lastName')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
          />
          {errors.lastName && <p className="text-xs text-rose-300">{errors.lastName}</p>}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Email</span>
          <input
            type="email"
            value={values.email}
            onChange={handleChange('email')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
          />
          {errors.email && <p className="text-xs text-rose-300">{errors.email}</p>}
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Phone</span>
          <input
            type="tel"
            value={values.phone}
            onChange={handleChange('phone')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            placeholder="Optional"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Resume URL</span>
          <input
            type="url"
            value={values.resumeUrl}
            onChange={handleChange('resumeUrl')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            placeholder="https://drive.google.com/..."
          />
          {errors.resumeUrl && <p className="text-xs text-rose-300">{errors.resumeUrl}</p>}
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Source</span>
          <input
            type="text"
            value={values.source}
            onChange={handleChange('source')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            placeholder="Referral, LinkedIn, etc."
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Stage</span>
          <select
            value={values.stage}
            onChange={handleChange('stage')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
          >
            {stageOptions.map((option) => (
              <option key={option} value={option} className="text-slate-900">
                {option.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Last interaction</span>
          <input
            type="datetime-local"
            value={values.lastInteraction ? values.lastInteraction.slice(0, 16) : ''}
            onChange={handleChange('lastInteraction')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Stage note</span>
        <input
          type="text"
          value={values.stageNote}
          onChange={handleChange('stageNote')}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
          placeholder="Optional message when updating stage"
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Notes</span>
        <textarea
          value={values.notes}
          onChange={handleChange('notes')}
          className="h-32 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
          placeholder="Key takeaways, interview feedback, or reminders"
        />
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={() => setValues(defaults)}>
          Reset
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {initialValues ? 'Save candidate' : 'Add candidate'}
        </Button>
      </div>
    </form>
  );
};
