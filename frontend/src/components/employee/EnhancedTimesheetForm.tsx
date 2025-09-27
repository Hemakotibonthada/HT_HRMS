import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../ui/Toast';
import { Tooltip } from '../ui/Tooltip';

interface Project {
  id: string;
  name: string;
  client: string;
  isActive: boolean;
}

interface FormErrors {
  [key: string]: {
    message: string;
    type: 'error' | 'warning';
  };
}

const EnhancedTimesheetForm: React.FC = () => {
  const { showToast } = useToast();
  
  // Form state
  const [values, setValues] = useState({
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    taskDescription: '',
    hoursWorked: '',
    breakTime: '0'
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Mock data - would come from API
  const [projects] = useState<Project[]>([
    { id: '1', name: 'HRMS Development', client: 'Internal', isActive: true },
    { id: '2', name: 'Client Portal', client: 'TechCorp', isActive: true },
    { id: '3', name: 'Mobile App', client: 'StartupXYZ', isActive: true }
  ]);

  // Real-time validation
  const validateField = useCallback((name: string, value: string) => {
    const newErrors: FormErrors = { ...errors };
    
    switch (name) {
      case 'date':
        const selectedDate = new Date(value);
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 7); // Allow up to 7 days in future
        
        if (selectedDate > maxDate) {
          newErrors.date = {
            message: 'Cannot log time more than 7 days in the future',
            type: 'error'
          };
        } else if (selectedDate < new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
          newErrors.date = {
            message: 'Time entries older than 30 days require manager approval',
            type: 'warning'
          };
        } else {
          delete newErrors.date;
        }
        break;
        
      case 'projectId':
        if (!value) {
          newErrors.projectId = {
            message: 'Please select a project',
            type: 'error'
          };
        } else {
          delete newErrors.projectId;
        }
        break;
        
      case 'taskDescription':
        if (!value.trim()) {
          newErrors.taskDescription = {
            message: 'Task description is required',
            type: 'error'
          };
        } else if (value.length < 10) {
          newErrors.taskDescription = {
            message: 'Please provide more detail (at least 10 characters)',
            type: 'warning'
          };
        } else {
          delete newErrors.taskDescription;
        }
        break;
        
      case 'hoursWorked':
        const hours = parseFloat(value);
        if (!value || isNaN(hours)) {
          newErrors.hoursWorked = {
            message: 'Hours worked is required',
            type: 'error'
          };
        } else if (hours <= 0) {
          newErrors.hoursWorked = {
            message: 'Hours must be greater than 0',
            type: 'error'
          };
        } else if (hours > 24) {
          newErrors.hoursWorked = {
            message: 'Cannot exceed 24 hours in a day',
            type: 'error'
          };
        } else if (hours > 12) {
          newErrors.hoursWorked = {
            message: 'Working more than 12 hours may require approval',
            type: 'warning'
          };
        } else {
          delete newErrors.hoursWorked;
        }
        break;
    }
    
    setErrors(newErrors);
  }, [errors]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    // Validate on change
    validateField(name, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Auto-save functionality
  useEffect(() => {
    if (!isDirty) return;
    
    const timer = setTimeout(() => {
      // Mock auto-save
      console.log('Auto-saving draft...', values);
      setLastSaved(new Date());
      setIsDirty(false);
      
      showToast({
        type: 'info',
        title: 'Draft Saved',
        message: 'Your timesheet has been automatically saved',
        duration: 2000
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [values, isDirty, showToast]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    Object.keys(values).forEach(key => {
      setTouched(prev => ({ ...prev, [key]: true }));
      validateField(key, values[key as keyof typeof values]);
    });

    // Check for errors
    const hasErrors = Object.values(errors).some(error => error.type === 'error');
    if (hasErrors) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors before submitting'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast({
        type: 'success',
        title: 'Timesheet Submitted',
        message: `Successfully logged ${values.hoursWorked} hours for ${values.date}`
      });
      
      // Reset form
      setValues({
        date: new Date().toISOString().split('T')[0],
        projectId: '',
        taskDescription: '',
        hoursWorked: '',
        breakTime: '0'
      });
      setTouched({});
      setErrors({});
      setIsDirty(false);
      
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Submission Failed',
        message: 'Please try again or contact support'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Error display component
  const FieldError: React.FC<{ field: string; id: string }> = ({ field, id }) => {
    const error = errors[field];
    const isTouched = touched[field];
    
    if (!error || !isTouched) return null;
    
    const Icon = error.type === 'error' ? 
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg> :
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
      'Documentation and knowledge sharing'
    ];
    
    return (
      <div className="mt-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-xs text-gray-400 mb-2">💡 Suggested tasks for {selectedProject.name}:</p>
        <div className="flex flex-wrap gap-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setValues(prev => ({ ...prev, taskDescription: suggestion }))}
              className="px-2 py-1 text-xs bg-blue-600/20 text-blue-300 rounded hover:bg-blue-600/30 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          Log Time Entry
        </h2>
        
        {lastSaved && (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Saved {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Date Field */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-200 mb-2">
            Date
            <Tooltip content="Select the date for this time entry. Future dates beyond 7 days are not allowed.">
              <svg className="inline w-4 h-4 ml-1 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </Tooltip>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={values.date}
            onChange={handleChange}
            onBlur={handleBlur}
            max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
              errors.date && touched.date
                ? errors.date.type === 'error'
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-yellow-500 focus:ring-yellow-500/20'
                : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
            aria-describedby={errors.date && touched.date ? "date-error" : undefined}
          />
          <FieldError field="date" id="date-error" />
        </div>

        {/* Project Selection */}
        <div>
          <label htmlFor="projectId" className="block text-sm font-medium text-gray-200 mb-2">
            Project
            <Tooltip content="Select the project you worked on. Only active projects are shown.">
              <svg className="inline w-4 h-4 ml-1 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </Tooltip>
          </label>
          <select
            id="projectId"
            name="projectId"
            value={values.projectId}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
              errors.projectId && touched.projectId
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
            aria-describedby={errors.projectId && touched.projectId ? "project-error" : undefined}
          >
            <option value="">Select a project...</option>
            {projects.filter(p => p.isActive).map(project => (
              <option key={project.id} value={project.id}>
                {project.name} - {project.client}
              </option>
            ))}
          </select>
          <FieldError field="projectId" id="project-error" />
          {getProjectSuggestions()}
        </div>

        {/* Task Description */}
        <div>
          <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-200 mb-2">
            Task Description
            <Tooltip content="Describe what you worked on. Be specific to help with project tracking and billing.">
              <svg className="inline w-4 h-4 ml-1 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </Tooltip>
          </label>
          <textarea
            id="taskDescription"
            name="taskDescription"
            value={values.taskDescription}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={4}
            placeholder="Describe the tasks you worked on..."
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 resize-none transition-colors ${
              errors.taskDescription && touched.taskDescription
                ? errors.taskDescription.type === 'error'
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-yellow-500 focus:ring-yellow-500/20'
                : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
            aria-describedby={errors.taskDescription && touched.taskDescription ? "task-error" : undefined}
          />
          <div className="flex justify-between items-center mt-1">
            <FieldError field="taskDescription" id="task-error" />
            <span className={`text-xs ${
              values.taskDescription.length < 10 ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {values.taskDescription.length} characters
            </span>
          </div>
        </div>

        {/* Hours and Break Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="hoursWorked" className="block text-sm font-medium text-gray-200 mb-2">
              Hours Worked
              <Tooltip content="Enter the number of hours you worked. Use decimals for partial hours (e.g., 7.5 for 7 hours 30 minutes).">
                <svg className="inline w-4 h-4 ml-1 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </Tooltip>
            </label>
            <input
              id="hoursWorked"
              name="hoursWorked"
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={values.hoursWorked}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="8.0"
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.hoursWorked && touched.hoursWorked
                  ? errors.hoursWorked.type === 'error'
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-yellow-500 focus:ring-yellow-500/20'
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              aria-describedby={errors.hoursWorked && touched.hoursWorked ? "hours-error" : undefined}
            />
            <FieldError field="hoursWorked" id="hours-error" />
          </div>

          <div>
            <label htmlFor="breakTime" className="block text-sm font-medium text-gray-200 mb-2">
              Break Time (hours)
              <Tooltip content="Optional: Enter break time to be deducted from billable hours.">
                <svg className="inline w-4 h-4 ml-1 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </Tooltip>
            </label>
            <input
              id="breakTime"
              name="breakTime"
              type="number"
              min="0"
              max="8"
              step="0.5"
              value={values.breakTime}
              onChange={handleChange}
              placeholder="0.0"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
            />
          </div>
        </div>

        {/* Summary */}
        {values.hoursWorked && (
          <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
            <h3 className="text-sm font-medium text-blue-300 mb-2">Time Summary</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Total Hours: {values.hoursWorked}</div>
              <div>Break Time: {values.breakTime || '0'}</div>
              <div className="font-medium text-blue-300">
                Billable Hours: {(parseFloat(values.hoursWorked) - parseFloat(values.breakTime || '0')).toFixed(1)}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || Object.values(errors).some(error => error.type === 'error')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Submit Time Entry
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setValues({
                date: new Date().toISOString().split('T')[0],
                projectId: '',
                taskDescription: '',
                hoursWorked: '',
                breakTime: '0'
              });
              setTouched({});
              setErrors({});
              setIsDirty(false);
            }}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/20"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedTimesheetForm;