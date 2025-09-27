import clsx from 'clsx';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses: Record<Required<AvatarProps>['size'], { container: string; text: string }> = {
  sm: { container: 'h-8 w-8 text-sm', text: 'text-xs' },
  md: { container: 'h-10 w-10 text-base', text: 'text-sm' },
  lg: { container: 'h-16 w-16 text-lg', text: 'text-base' },
};

export const Avatar = ({ name = 'HT', size = 'md', className }: AvatarProps) => {
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-[#1F3B73] to-[#5FB7C2] text-primary-foreground shadow-lg',
        sizeClasses[size].container,
        className,
      )}
      aria-hidden
    >
      <span className={clsx('font-semibold', sizeClasses[size].text)}>{initials || 'HT'}</span>
    </div>
  );
};
