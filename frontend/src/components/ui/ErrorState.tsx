import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'We could not complete the request. Please try again in a moment.',
  actionLabel = 'Retry',
  onRetry,
}: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-8 text-center text-rose-100">
    <svg className="h-8 w-8 text-rose-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-rose-100/80">{description}</p>
    </div>
    {onRetry && (
      <Button variant="secondary" onClick={onRetry}>
        {actionLabel}
      </Button>
    )}
  </div>
);
