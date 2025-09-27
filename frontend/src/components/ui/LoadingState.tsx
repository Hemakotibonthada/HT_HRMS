import { Button } from './Button';

interface LoadingStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'dots' | 'pulse' | 'skeleton' | 'wave' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner = () => (
  <div className="relative">
    <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-blue-400 animate-spin backdrop-blur-sm shadow-lg shadow-blue-500/25" />
    <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-r-purple-400 animate-spin animation-delay-100 backdrop-blur-sm" style={{ animationDirection: 'reverse' }} />
  </div>
);

const LoadingDots = () => (
  <div className="flex space-x-2">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse shadow-lg shadow-blue-500/50"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

const LoadingPulse = () => (
  <div className="relative">
    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse shadow-xl shadow-blue-500/30" />
    <div className="absolute inset-0 h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-ping opacity-30" />
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-4 w-full max-w-sm">
    <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg animate-pulse shadow-inner" />
    <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg animate-pulse animation-delay-100 shadow-inner" style={{ width: '80%' }} />
    <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg animate-pulse animation-delay-200 shadow-inner" style={{ width: '60%' }} />
  </div>
);

const LoadingWave = () => (
  <div className="flex space-x-1">
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="h-8 w-2 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full animate-bounce shadow-lg shadow-blue-500/40"
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

const LoadingMinimal = () => (
  <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin shadow-sm" />
);

const getLoadingComponent = (variant: LoadingStateProps['variant']) => {
  switch (variant) {
    case 'dots':
      return <LoadingDots />;
    case 'pulse':
      return <LoadingPulse />;
    case 'skeleton':
      return <LoadingSkeleton />;
    case 'wave':
      return <LoadingWave />;
    case 'minimal':
      return <LoadingMinimal />;
    default:
      return <LoadingSpinner />;
  }
};

export const LoadingState = ({ 
  title = 'Loading', 
  description = 'Fetching the latest data…', 
  actionLabel, 
  onAction,
  variant = 'default',
  size = 'md'
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: 'p-6 gap-3',
    md: 'p-8 gap-4',
    lg: 'p-12 gap-6'
  };

  const textSizeClasses = {
    sm: { title: 'text-base', description: 'text-xs' },
    md: { title: 'text-lg', description: 'text-sm' },
    lg: { title: 'text-xl', description: 'text-base' }
  };

  return (
    <div className={`
      flex flex-col items-center justify-center ${sizeClasses[size]} 
      rounded-2xl border border-white/10 backdrop-blur-md
      bg-gradient-to-br from-white/10 via-white/5 to-transparent
      text-center text-slate-200 relative overflow-hidden
      shadow-xl shadow-black/20
      before:absolute before:inset-0 before:bg-gradient-to-br 
      before:from-blue-500/10 before:to-purple-500/10 before:rounded-2xl
      hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500
      hover:scale-[1.02] hover:border-white/20
    `}>
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-float animation-delay-200" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-inherit">
        {getLoadingComponent(variant)}
        
        {variant !== 'skeleton' && (
          <div className="text-center">
            <h3 className={`${textSizeClasses[size].title} font-semibold text-white drop-shadow-sm`}>
              {title}
            </h3>
            <p className={`${textSizeClasses[size].description} text-slate-300 mt-1 drop-shadow-sm`}>
              {description}
            </p>
          </div>
        )}
        
        {actionLabel && onAction && (
          <Button 
            variant="secondary" 
            onClick={onAction}
            className="mt-2 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
