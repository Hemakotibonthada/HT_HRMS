import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { useSuccessToast, useErrorToast } from '../ui/Toast';
import type { Project, WorkItem } from '../../types/api';

interface EnhancedTimesheetFormValues {
  projectId: string;
  workItemId?: string;
  workDate: string;
  hours: string;
  description: string;
}

interface FieldError {
  message: string;
  type: 'error' | 'warning';
}

interface EnhancedTimesheetFormProps {
  projects: Project[];
  workItems?: WorkItem[];
  onSubmit: (payload: { 
    projectId: string; 
    workItemId?: string; 
    workDate: string; 
    hours: number; 
    description?: string; 
  }) => Promise<void>;
  isSubmitting?: boolean;
  onSuccess?: () => void;
}

const getInitialValues = (projects: Project[]): EnhancedTimesheetFormValues => ({
  projectId: projects[0]?.id ?? '',
  workItemId: undefined,
  workDate: new Date().toISOString().split('T')[0],
  hours: '',
  description: '',
});

export const EnhancedTimesheetForm: React.FC<EnhancedTimesheetFormProps> = ({
  projects,
  workItems = [],
  onSubmit,
  isSubmitting = false,
  onSuccess,
}) => {
  const [values, setValues] = useState<EnhancedTimesheetFormValues>(() => getInitialValues(projects));
  const [fieldErrors, setFieldErrors] = useState<Record<string, FieldError>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  // Auto-save to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('timesheet-draft', JSON.stringify(values));
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [values]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('timesheet-draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setValues(prev => ({ ...prev, ...parsedDraft }));
      } catch (e) {
        console.warn('Failed to load timesheet draft');
      }
    }
  }, []);

  const validateField = useCallback((field: keyof EnhancedTimesheetFormValues, value: any): FieldError | null => {
    switch (field) {
      case 'projectId':
        if (!value) return { message: 'Please select a project', type: 'error' };
        return null;
        
      case 'workDate':
        if (!value) return { message: 'Please select a work date', type: 'error' };
        const date = new Date(value);
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 1);
        
        if (date > maxDate) {
          return { message: 'Work date cannot be more than 1 day in the future', type: 'error' };
        }
        
        const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 30) {
          return { message: 'Work date is more than 30 days old. Please verify.', type: 'warning' };
        }
        return null;
        
      case 'hours':
        const hours = parseFloat(value);
        if (!value || isNaN(hours)) return { message: 'Please enter valid hours', type: 'error' };
        if (hours <= 0) return { message: 'Hours must be greater than 0', type: 'error' };
        if (hours > 24) return { message: 'Hours cannot exceed 24 per day', type: 'error' };
        if (hours > 12) {
          return { message: 'Working more than 12 hours? Please double-check.', type: 'warning' };
        }
        return null;
        
      case 'description':
        if (!value?.trim()) return { message: 'Please provide a description of your work', type: 'error' };
        if (value.trim().length < 10) {
          return { message: 'Please provide a more detailed description (at least 10 characters)', type: 'warning' };
        }
        return null;
        
      default:
        return null;
    }
  }, []);

  const validateForm = useCallback(() => {
    const errors: Record<string, FieldError> = {};
    let valid = true;
    
    Object.keys(values).forEach(key => {
      const field = key as keyof EnhancedTimesheetFormValues;
      const error = validateField(field, values[field]);
      if (error) {
        errors[field] = error;
        if (error.type === 'error') {
          valid = false;
        }
      }
    });
    
    setFieldErrors(errors);
    setIsFormValid(valid);
    return valid;
  }, [values, validateField]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleChange = (field: keyof EnhancedTimesheetFormValues) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setValues(prev => ({ ...prev, [field]: value }));
      setTouched(prev => ({ ...prev, [field]: true }));
    };

  const handleBlur = (field: keyof EnhancedTimesheetFormValues) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      showError('Validation Error', 'Please correct the highlighted fields');
      return;
    }

    try {
      await onSubmit({
        projectId: values.projectId,
        workItemId: values.workItemId || undefined,
        workDate: values.workDate,
        hours: parseFloat(values.hours),
        description: values.description.trim(),
      });
      
      showSuccess('Timesheet Submitted', 'Your timesheet has been successfully recorded');
      
      // Clear draft and reset form
      localStorage.removeItem('timesheet-draft');
      setValues(getInitialValues(projects));
      setTouched({});
      setFieldErrors({});
      onSuccess?.();
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit timesheet';
      showError('Submission Failed', message);
    }
  };

  const getFieldClasses = (field: keyof EnhancedTimesheetFormValues) => {
    const hasError = fieldErrors[field];
    const isTouched = touched[field];
    
    const baseClasses = 'w-full rounded-xl border backdrop-blur-sm bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:bg-white/15 hover:bg-white/15 transition-all duration-300 shadow-sm hover:shadow-md';
    
    if (hasError && isTouched) {
      if (hasError.type === 'error') {
        return `${baseClasses} border-red-400/50 focus:border-red-400 focus:ring-red-400/25`;
      } else {
        return `${baseClasses} border-yellow-400/50 focus:border-yellow-400 focus:ring-yellow-400/25`;
      }
    }
    
    return `${baseClasses} border-white/20 focus:border-blue-400 focus:ring-blue-400/25 hover:border-white/30`;
  };

  const ErrorMessage = ({ field, id }: { field: keyof EnhancedTimesheetFormValues; id: string }) => {
    const error = fieldErrors[field];
    const isTouched = touched[field];
    
    if (!error || !isTouched) return null;
    
    const Icon = error.type === 'error' ? 
      <svg className=\"w-3 h-3\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
        <path fillRule=\"evenodd\" d=\"M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z\" clipRule=\"evenodd\" />
      </svg> :
      <svg className=\"w-3 h-3\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
        <path fillRule=\"evenodd\" d=\"M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z\" clipRule=\"evenodd\" />
      </svg>;
    
    const colorClass = error.type === 'error' ? 'text-red-300' : 'text-yellow-300';
    
    return (
      <p id={id} className={`mt-1 text-xs ${colorClass} flex items-center gap-1`}>
        {Icon}
        {error.message}
      </p>
    );
  };

  // Show smart suggestions based on selected project
  const getProjectSuggestions = () => {
    const selectedProject = projects.find(p => p.id === values.projectId);
    if (!selectedProject) return null;
    
    // This would typically come from an API based on project patterns
    const suggestions = [
      'Daily standup and sprint planning',
      'Code review and bug fixes',
      'Feature development and testing',
      'Documentation and deployment',
    ];
    
    return suggestions;
  };

  return (
    <Card title=\"Submit Timesheet\" subtitle=\"Track your work hours with smart validation and auto-save\">
      <form onSubmit={handleSubmit} className=\"grid gap-6 sm:grid-cols-2\">
        {/* Project Selection */}
        <div className=\"sm:col-span-2 group\">
          <div className=\"flex items-center gap-2\">
            <label className=\"block text-xs font-semibold uppercase tracking-wide text-slate-300 group-focus-within:text-blue-300 transition-colors duration-200\">
              Project *
            </label>
            <Tooltip content=\"Select the project you worked on. This field is required.\">
              <svg className=\"w-4 h-4 text-slate-400 hover:text-slate-300 cursor-help\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
                <path fillRule=\"evenodd\" d=\"M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z\" clipRule=\"evenodd\" />
              </svg>
            </Tooltip>
          </div>
          <div className=\"relative mt-2\">
            <select
              value={values.projectId}
              onChange={handleChange('projectId')}
              onBlur={handleBlur('projectId')}
              className={`${getFieldClasses('projectId')} appearance-none cursor-pointer`}
              aria-describedby={fieldErrors.projectId && touched.projectId ? 'project-error' : undefined}
              required
            >
              <option value=\"\" className=\"bg-slate-800 text-white\">Select a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id} className=\"bg-slate-800 text-white\">
                  {project.title}
                </option>
              ))}
            </select>
            <div className=\"absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none\">
              <svg className=\"w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M19 9l-7 7-7-7\" />
              </svg>
            </div>
          </div>
          <ErrorMessage field=\"projectId\" id=\"project-error\" />
        </div>

        {/* Work Date */}
        <div className=\"group\">
          <div className=\"flex items-center gap-2\">
            <label className=\"block text-xs font-semibold uppercase tracking-wide text-slate-300 group-focus-within:text-blue-300 transition-colors duration-200\">
              Work Date *
            </label>
            <Tooltip content=\"Select the date you performed this work. Cannot be more than 1 day in the future.\">
              <svg className=\"w-4 h-4 text-slate-400 hover:text-slate-300 cursor-help\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
                <path fillRule=\"evenodd\" d=\"M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z\" clipRule=\"evenodd\" />
              </svg>
            </Tooltip>
          </div>
          <div className=\"relative mt-2\">
            <input
              type=\"date\"
              value={values.workDate}
              onChange={handleChange('workDate')}
              onBlur={handleBlur('workDate')}
              className={`${getFieldClasses('workDate')} [color-scheme:dark]`}
              aria-describedby={fieldErrors.workDate && touched.workDate ? 'date-error' : undefined}
              required
            />
          </div>
          <ErrorMessage field=\"workDate\" id=\"date-error\" />
        </div>

        {/* Hours */}
        <div className=\"group\">
          <div className=\"flex items-center gap-2\">
            <label className=\"block text-xs font-semibold uppercase tracking-wide text-slate-300 group-focus-within:text-blue-300 transition-colors duration-200\">
              Hours *
            </label>
            <Tooltip content=\"Enter hours worked (0.25 hour increments). Maximum 24 hours per day.\">
              <svg className=\"w-4 h-4 text-slate-400 hover:text-slate-300 cursor-help\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
                <path fillRule=\"evenodd\" d=\"M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z\" clipRule=\"evenodd\" />
              </svg>
            </Tooltip>
          </div>
          <div className=\"relative mt-2\">
            <input
              type=\"number\"
              min=\"0\"
              max=\"24\"
              step=\"0.25\"
              value={values.hours}
              onChange={handleChange('hours')}
              onBlur={handleBlur('hours')}
              className={`${getFieldClasses('hours')} placeholder:text-slate-400`}
              placeholder=\"8.0\"
              aria-describedby={fieldErrors.hours && touched.hours ? 'hours-error' : 'hours-hint'}
              required
            />
            <div className=\"absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none\">
              <span className=\"text-xs text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200\">hrs</span>
            </div>
          </div>
          <ErrorMessage field=\"hours\" id=\"hours-error\" />
          {!fieldErrors.hours && (
            <p id=\"hours-hint\" className=\"mt-1 text-xs text-slate-400\">Use increments of 0.25 (15 minutes)</p>
          )}
        </div>

        {/* Description */}
        <div className=\"sm:col-span-2 group\">
          <div className=\"flex items-center gap-2\">
            <label className=\"block text-xs font-semibold uppercase tracking-wide text-slate-300 group-focus-within:text-blue-300 transition-colors duration-200\">
              Work Description *
            </label>
            <Tooltip content=\"Describe what you worked on. Be specific to help with project tracking.\">
              <svg className=\"w-4 h-4 text-slate-400 hover:text-slate-300 cursor-help\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
                <path fillRule=\"evenodd\" d=\"M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z\" clipRule=\"evenodd\" />
              </svg>
            </Tooltip>
          </div>
          <div className=\"relative mt-2\">
            <textarea
              value={values.description}
              onChange={handleChange('description')}
              onBlur={handleBlur('description')}
              rows={3}
              className={`${getFieldClasses('description')} placeholder:text-slate-400 resize-none`}
              placeholder=\"Describe the work you completed today...\"
              aria-describedby={fieldErrors.description && touched.description ? 'description-error' : 'description-hint'}
              required
            />
          </div>
          <ErrorMessage field=\"description\" id=\"description-error\" />
          {!fieldErrors.description && (
            <div className=\"mt-1\">
              <p className=\"text-xs text-slate-400\">
                Characters: {values.description.length} | Suggested minimum: 10
              </p>
              {getProjectSuggestions() && (
                <div className=\"mt-2\">
                  <p className=\"text-xs text-slate-300 mb-1\">Quick suggestions:</p>
                  <div className=\"flex flex-wrap gap-1\">
                    {getProjectSuggestions()?.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        type=\"button\"
                        onClick={() => setValues(prev => ({ ...prev, description: suggestion }))}
                        className=\"text-xs px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors\"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Auto-save indicator */}
        <div className=\"sm:col-span-2 flex items-center justify-between text-xs text-slate-400\">
          <span className=\"flex items-center gap-1\">
            <svg className=\"w-3 h-3\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
              <path fillRule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z\" clipRule=\"evenodd\" />
            </svg>
            Draft auto-saved
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isFormValid ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
          }`}>
            {isFormValid ? 'Ready to submit' : 'Please complete required fields'}
          </span>
        </div>

        {/* Submit Button */}
        <div className=\"sm:col-span-2 flex justify-end\">
          <Button 
            type=\"submit\" 
            variant=\"primary\"
            size=\"lg\"
            loading={isSubmitting} 
            disabled={isSubmitting || !isFormValid}
            className=\"min-w-[140px]\"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Timesheet'}
          </Button>
        </div>
      </form>
    </Card>
  );
};