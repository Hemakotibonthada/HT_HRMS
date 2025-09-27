import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { OfferLetterPayload } from '../../types/api';

interface OfferLetterFormProps {
  onGenerate: (payload: OfferLetterPayload) => Promise<void>;
  isGenerating?: boolean;
}

const initialState: OfferLetterPayload = {
  candidateName: '',
  title: 'R&D Engineer',
  salary: '₹18,00,000 per annum',
  startDate: new Date().toISOString().slice(0, 10),
  reportingManager: 'Priya Manager',
  location: 'HT R&D Labs, Bangalore',
  notes: '',
};

export const OfferLetterForm = ({ onGenerate, isGenerating = false }: OfferLetterFormProps) => {
  const [values, setValues] = useState<OfferLetterPayload>(initialState);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof OfferLetterPayload) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!values.candidateName.trim()) {
      setError('Candidate name is required');
      return;
    }

    await onGenerate({
      ...values,
      notes: values.notes?.trim() || undefined,
    });
  };

  return (
    <Card title="Offer Letter Generator" subtitle="Admin-only template rendering">
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Candidate Name</label>
          <input
            type="text"
            value={values.candidateName}
            onChange={handleChange('candidateName')}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            placeholder="Full legal name"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Title</label>
          <input
            type="text"
            value={values.title}
            onChange={handleChange('title')}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Compensation</label>
          <input
            type="text"
            value={values.salary}
            onChange={handleChange('salary')}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Start Date</label>
          <input
            type="date"
            value={values.startDate}
            onChange={handleChange('startDate')}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Reporting Manager</label>
          <input
            type="text"
            value={values.reportingManager}
            onChange={handleChange('reportingManager')}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Location</label>
          <input
            type="text"
            value={values.location}
            onChange={handleChange('location')}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Notes (optional)</label>
          <textarea
            value={values.notes ?? ''}
            onChange={handleChange('notes')}
            rows={3}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            placeholder="Any additional clauses or clarifications"
          />
        </div>
        {error && <p className="md:col-span-2 text-sm text-rose-300">{error}</p>}
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" loading={isGenerating}>
            Generate PDF
          </Button>
        </div>
      </form>
    </Card>
  );
};
