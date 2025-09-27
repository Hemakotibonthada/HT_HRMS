import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/Avatar';
import { Breadcrumb } from '../components/ui/Breadcrumb';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', match: '/dashboard' },
  { label: 'Employee Portal', to: '/portal/employee', match: '/portal/employee' },
  { label: 'Work Portal', to: '/portal/work', match: '/portal/work' },
];

export const AuthenticatedLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-neutral-light text-neutral-dark">
      <header className="sticky top-0 z-50 border-b border-primary/25 bg-gradient-to-r from-primary via-[#264a8f] to-secondary text-primary-foreground shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 font-semibold text-lg sm:text-xl text-primary-foreground hover:opacity-90 transition-opacity"
            aria-label="HT Connect - Go to Dashboard"
          >
            <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground">
              HT
            </span>
            <span className="hidden sm:inline">HT Connect</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden gap-6 md:flex" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 ${
                    isActive || location.pathname.startsWith(item.match)
                      ? 'font-semibold text-accent bg-white/10'
                      : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className="hidden md:flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-semibold text-primary-foreground">{user?.profile?.firstName ?? user?.email}</p>
              <p className="text-xs text-primary-foreground/70 capitalize">{user?.role.replace('_', ' ').toLowerCase()}</p>
            </div>
            <Avatar
              name={`${user?.profile?.firstName ?? ''} ${user?.profile?.lastName ?? ''}`.trim() || user?.email}
              size="sm"
            />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/10 focus:ring-2 focus:ring-white/30"
              aria-label="Logout"
            >
              <span className="sr-only sm:not-sr-only">Logout</span>
              <svg className="w-4 h-4 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-primary-foreground/20 bg-primary/95 backdrop-blur-sm animate-slide-up">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Navigation */}
              <nav className="space-y-1" role="navigation" aria-label="Mobile navigation">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 ${
                        isActive || location.pathname.startsWith(item.match)
                          ? 'text-accent bg-white/10'
                          : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              
              {/* Mobile User Section */}
              <div className="pt-4 border-t border-primary-foreground/20">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar
                    name={`${user?.profile?.firstName ?? ''} ${user?.profile?.lastName ?? ''}`.trim() || user?.email}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-semibold text-primary-foreground">{user?.profile?.firstName ?? user?.email}</p>
                    <p className="text-xs text-primary-foreground/70 capitalize">{user?.role.replace('_', ' ').toLowerCase()}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="w-full text-primary-foreground hover:bg-primary-foreground/10 justify-start"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-12">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb className="text-slate-600" />
        </div>
        
        <div className="rounded-2xl sm:rounded-3xl border border-primary/15 bg-white p-4 sm:p-6 lg:p-8 shadow-card">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
