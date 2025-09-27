import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
  'aria-label'?: string;
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

const variantClasses = {
  default: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
};

const backgroundClasses = {
  default: 'bg-blue-500/20',
  success: 'bg-green-500/20',
  warning: 'bg-yellow-500/20',
  error: 'bg-red-500/20',
  gradient: 'bg-gray-500/20',
};

export const ProgressBar = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className,
  'aria-label': ariaLabel,
}: ProgressBarProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Animate value changes
  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    const startValue = displayValue;
    const difference = value - startValue;
    const duration = 1000; // 1 second
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(startValue + (difference * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, animated, displayValue]);

  const percentage = Math.min(Math.max((displayValue / max) * 100, 0), 100);
  const roundedPercentage = Math.round(percentage);

  return (
    <div className={clsx('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-200">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-slate-400">
            {roundedPercentage}%
          </span>
        </div>
      )}
      
      <div
        className={clsx(
          'relative w-full rounded-full overflow-hidden',
          sizeClasses[size],
          backgroundClasses[variant],
          'backdrop-blur-sm border border-white/10'
        )}
        role="progressbar"
        aria-valuenow={roundedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || `${roundedPercentage}% complete`}
      >
        {/* Progress fill */}
        <div
          className={clsx(
            'h-full transition-all duration-500 ease-out rounded-full relative overflow-hidden',
            variantClasses[variant],
            striped && 'bg-striped',
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shine" />
          
          {/* Striped pattern */}
          {striped && (
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)',
                animation: 'stripe-move 1s linear infinite'
              }}
            />
          )}
        </div>

        {/* Glow effect for high values */}
        {percentage > 75 && (
          <div 
            className={clsx(
              'absolute inset-0 rounded-full blur-sm opacity-50',
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      
      {/* Status indicators */}
      {percentage === 100 && (
        <div className="flex items-center mt-2 text-green-400 text-sm">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Complete
        </div>
      )}
    </div>
  );
};

// Circular progress variant
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const CircularProgress = ({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  variant = 'default',
  showLabel = true,
  label,
  className,
}: CircularProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const strokeColors = {
    default: 'stroke-blue-500',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    error: 'stroke-red-500',
  };

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-white/20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={clsx(
            'transition-all duration-500 ease-out',
            strokeColors[variant]
          )}
          style={{
            filter: 'drop-shadow(0 0 6px currentColor)',
          }}
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-white">
            {Math.round(percentage)}%
          </span>
          {label && (
            <span className="text-xs text-slate-400 mt-1">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};