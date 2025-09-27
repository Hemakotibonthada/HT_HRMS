import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { Button } from '../../ui/Button';
import type { ExpenseCategory, ExpenseClaimPayload } from '../../../types/api';

const expenseCategories: ExpenseCategory[] = ['TRAVEL', 'MEALS', 'EQUIPMENT', 'SOFTWARE', 'OFFICE', 'OTHER'];

const expenseSchema = z.object({
  title: z.string().min(3, 'Add a descriptive title.'),
  description: z.string().optional(),
  category: z.enum(['TRAVEL', 'MEALS', 'EQUIPMENT', 'SOFTWARE', 'OFFICE', 'OTHER']),
  amount: z.coerce.number().positive('Enter a positive amount.'),
  currency: z.string().min(3).max(3).optional(),
  incurredOn: z.string().regex(/\d{4}-\d{2}-\d{2}/, 'Select the date of the expense.'),
  receiptUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

interface ExpenseFormProps {
  initialValues?: Partial<ExpenseClaimPayload>;
  onSubmit: (payload: ExpenseClaimPayload) => Promise<void> | void;
  isSubmitting?: boolean;
}

export const ExpenseForm = ({ initialValues, onSubmit, isSubmitting }: ExpenseFormProps) => {
  const defaults = useMemo(
    () => ({
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      category: initialValues?.category ?? 'OTHER',
      amount: initialValues?.amount?.toString() ?? '',
      currency: (initialValues?.currency ?? 'INR').toUpperCase(),
      incurredOn: initialValues?.incurredOn ? initialValues.incurredOn.slice(0, 10) : new Date().toISOString().slice(0, 10),
      receiptUrl: initialValues?.receiptUrl ?? '',
      notes: initialValues?.notes ?? '',
    }),
    [initialValues],
  );

  const [values, setValues] = useState(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues(defaults);
    setErrors({});
  }, [defaults]);

  const handleChange = (
    field: keyof typeof values,
  ) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setValues((current) => ({ ...current, [field]: value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = expenseSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() ?? 'form';
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const parsed = result.data;
    const payload: ExpenseClaimPayload = {
      title: parsed.title.trim(),
      description: parsed.description?.trim() || undefined,
      category: parsed.category,
      amount: parsed.amount,
      currency: parsed.currency?.trim().toUpperCase() || 'INR',
      incurredOn: new Date(parsed.incurredOn).toISOString(),
      receiptUrl: parsed.receiptUrl?.trim() || undefined,
      notes: parsed.notes?.trim() || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Title</span>
          <input
            type="text"
            value={values.title}
            onChange={handleChange('title')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            placeholder="Client site travel"
          />
          {errors.title && <p className="text-xs text-rose-300">{errors.title}</p>}
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Category</span>
          <select
            value={values.category}
            onChange={handleChange('category')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
          >
            {expenseCategories.map((category) => (
              <option key={category} value={category} className="text-slate-900">
                {category.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.amount}
            onChange={handleChange('amount')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
            placeholder="0.00"
          />
          {errors.amount && <p className="text-xs text-rose-300">{errors.amount}</p>}
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Currency</span>
          <input
            type="text"
            value={values.currency}
            onChange={handleChange('currency')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
            placeholder="INR"
            maxLength={3}
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Incurred On</span>
          <input
            type="date"
            value={values.incurredOn}
            onChange={handleChange('incurredOn')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
          />
          {errors.incurredOn && <p className="text-xs text-rose-300">{errors.incurredOn}</p>}
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Description</span>
        <textarea
          value={values.description}
          onChange={handleChange('description')}
          className="h-28 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
          placeholder="Provide context for the expense"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Receipt URL</span>
          <input
            type="url"
            value={values.receiptUrl}
            onChange={handleChange('receiptUrl')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            placeholder="https://drive.google.com/..."
          />
          {errors.receiptUrl && <p className="text-xs text-rose-300">{errors.receiptUrl}</p>}
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-blue-200">Notes</span>
          <textarea
            value={values.notes}
            onChange={handleChange('notes')}
            className="h-28 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            placeholder="Internal notes for finance team"
          />
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={() => setValues(defaults)}>
          Reset
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {initialValues ? 'Update expense' : 'Submit expense'}
        </Button>
      </div>
    </form>
  );
};
