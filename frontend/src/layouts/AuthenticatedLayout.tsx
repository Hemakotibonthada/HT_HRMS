import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/Avatar';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', match: '/dashboard' },
  { label: 'Employee Portal', to: '/portal/employee', match: '/portal/employee' },
  { label: 'Work Portal', to: '/portal/work', match: '/portal/work' },
];

export const AuthenticatedLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-light text-neutral-dark">
      <header className="sticky top-0 z-50 border-b border-primary/25 bg-gradient-to-r from-primary via-[#264a8f] to-secondary text-primary-foreground shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-xl text-primary-foreground">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground">
              HT
            </span>
            HT Connect
          </Link>
          <nav className="hidden gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive || location.pathname.startsWith(item.match)
                    ? 'font-semibold text-accent'
                    : 'text-primary-foreground/70 hover:text-primary-foreground'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-primary-foreground">{user?.profile?.firstName ?? user?.email}</p>
              <p className="text-xs text-primary-foreground/70 capitalize">{user?.role.replace('_', ' ').toLowerCase()}</p>
            </div>
            <Avatar
              name={`${user?.profile?.firstName ?? ''} ${user?.profile?.lastName ?? ''}`.trim() || user?.email}
              size="sm"
            />
            <Button
              variant="ghost"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="rounded-3xl border border-primary/15 bg-white p-8 shadow-card">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
