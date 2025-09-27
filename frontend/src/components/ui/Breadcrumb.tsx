import { Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import type { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
  maxItems?: number;
}

// Default breadcrumb mapping based on routes
const routeToBreadcrumb: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ label: 'Dashboard', path: '/dashboard' }],
  '/portal/employee': [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Employee Portal' },
  ],
  '/portal/work': [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Work Portal' },
  ],
  '/portal/employee/profile': [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Employee Portal', path: '/portal/employee' },
    { label: 'Profile' },
  ],
  '/portal/employee/timesheet': [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Employee Portal', path: '/portal/employee' },
    { label: 'Timesheet' },
  ],
  '/portal/employee/expenses': [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Employee Portal', path: '/portal/employee' },
    { label: 'Expenses' },
  ],
  '/portal/employee/payroll': [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Employee Portal', path: '/portal/employee' },
    { label: 'Payroll' },
  ],
  '/portal/work/projects': [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Work Portal', path: '/portal/work' },
    { label: 'Projects' },
  ],
  '/portal/work/kanban': [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Work Portal', path: '/portal/work' },
    { label: 'Kanban Board' },
  ],
};

const ChevronRight = () => (
  <svg
    className="w-4 h-4 text-slate-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const HomeIcon = () => (
  <svg
    className="w-4 h-4 text-slate-400"
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

export const Breadcrumb = ({
  items,
  separator = <ChevronRight />,
  className = '',
  maxItems = 5,
}: BreadcrumbProps) => {
  const location = useLocation();

  const breadcrumbItems = useMemo(() => {
    if (items) return items;
    return routeToBreadcrumb[location.pathname] || [];
  }, [items, location.pathname]);

  // Handle truncation for long breadcrumb trails
  const displayItems = useMemo(() => {
    if (breadcrumbItems.length <= maxItems) {
      return breadcrumbItems;
    }

    const first = breadcrumbItems[0];
    const last = breadcrumbItems.slice(-2); // Keep last 2 items
    const truncated = breadcrumbItems.length - 3; // Number of items truncated

    return [
      first,
      { label: `+${truncated} more`, path: undefined },
      ...last,
    ];
  }, [breadcrumbItems, maxItems]);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center space-x-2 text-sm">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label.startsWith('+');

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 flex-shrink-0" aria-hidden="true">
                  {separator}
                </span>
              )}

              {isEllipsis ? (
                <span className="text-slate-400 cursor-default px-2 py-1 rounded-md hover:bg-white/5 transition-colors">
                  {item.label}
                </span>
              ) : isLast ? (
                <span
                  className="text-white font-medium flex items-center"
                  aria-current="page"
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </span>
              ) : item.path ? (
                <Link
                  to={item.path}
                  className="text-slate-300 hover:text-white flex items-center px-2 py-1 rounded-md hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {index === 0 && !item.icon && <HomeIcon />}
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  <span className={index === 0 && !item.icon ? 'sr-only' : ''}>
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span className="text-slate-400 flex items-center">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Hook for managing breadcrumb context
export const useBreadcrumb = () => {
  const location = useLocation();

  const setBreadcrumb = (items: BreadcrumbItem[]) => {
    // This could be extended to work with a context provider
    // For now, it's a placeholder for future functionality
    console.log('Setting breadcrumb:', items);
  };

  const currentBreadcrumb = routeToBreadcrumb[location.pathname] || [];

  return {
    currentBreadcrumb,
    setBreadcrumb,
  };
};