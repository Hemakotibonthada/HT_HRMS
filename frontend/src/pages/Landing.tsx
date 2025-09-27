import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { AuthContextValue } from '../context/AuthContext';

const navLinks: Array<{ label: string; icon: string }> = [
  { label: 'Dashboard', icon: '📊' },
  { label: 'My Profile', icon: '👤' },
  { label: 'Time Off', icon: '🗓️' },
  { label: 'Payslips', icon: '💳' },
  { label: 'Org Chart', icon: '🌐' },
];

const quickActions: Array<{ label: string; icon: string }> = [
  { label: 'Submit Timesheet', icon: '�' },
  { label: 'Request Leave', icon: '🌴' },
  { label: 'View Payslip', icon: '📄' },
  { label: 'Update Profile', icon: '✏️' },
  { label: 'Book 1:1', icon: '�' },
];

const assuranceHighlights: Array<{ label: string; value: string }> = [
  { label: 'Active employees', value: '2,380' },
  { label: 'Headcount satisfaction', value: '92%' },
  { label: 'Open roles', value: '18' },
];

const userName = 'Priya';
const upcomingPayday = '30 Sep 2025';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth() as AuthContextValue;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen bg-[#F8F8F8] text-neutral-800">
      <aside className="hidden w-64 flex-col bg-[#1E3F66] text-white md:flex">
        <div className="flex items-center justify-center gap-3 px-6 py-6 text-sm font-semibold tracking-[0.35em] uppercase">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg text-white">HT</span>
          Connect
        </div>
        <nav className="flex-1 overflow-y-auto px-4 pb-6">
          <ul className="space-y-1">
            {navLinks.map(({ label, icon }) => (
              <li key={label}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium tracking-[0.18em] uppercase transition hover:bg-white/10"
                >
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-6 pb-8 text-xs text-white/60">
          <p>© {new Date().getFullYear()} HT Connect</p>
          <p className="mt-1">Human Resources Command Center</p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between bg-[#1E3F66] px-6 text-white shadow-sm md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em]">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm">HT</span>
              HRMS Portal
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input
                type="search"
                placeholder="Search directory or policies"
                className="w-64 rounded-full bg-white/15 px-4 py-2 text-sm placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-[#34A853]/60"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/70">⌕</span>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-base hover:bg-white/20"
              aria-label="Notifications"
            >
              🔔
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden flex-col text-right text-[0.65rem] leading-tight text-white/70 sm:flex">
                <span>{userName} Desai</span>
                <span>People Ops Lead</span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1E3F66] text-sm font-semibold">
                PD
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
          <div className="mb-8 space-y-3">
            <h1 className="text-3xl font-semibold text-[#1E3F66]">Welcome, {userName}! Your HR Hub at a Glance.</h1>
            <p className="max-w-3xl text-sm text-neutral-600">
              Stay current on approvals, payroll, and people health from a single view designed for focus and swift action.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <div className="md:col-span-1 xl:col-span-1">
                  <div className="flex h-full items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Time Off</p>
                      <h2 className="text-lg font-semibold text-[#1E3F66]">Vacation Balance</h2>
                      <p className="text-sm text-neutral-500">You have 15 days remaining this year.</p>
                    </div>
                    <div className="relative h-28 w-28">
                      <div className="absolute inset-0 rounded-full bg-[conic-gradient(#34A853_0deg,_#34A853_270deg,_#E6F5EC_270deg_360deg)]" />
                      <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white">
                        <span className="text-xl font-semibold text-[#34A853]">15</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <div className="flex h-full flex-col justify-between rounded-2xl border-l-4 border-[#FF8A65] bg-white p-6 shadow-sm">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Pending Approvals</p>
                      <h2 className="text-xl font-semibold text-[#1E3F66]">2 Leave Requests</h2>
                      <p className="text-sm text-neutral-500">Team members are awaiting your decision.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#FF8A65] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff7453]"
                    >
                      Review Now
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 xl:col-span-1">
                  <div className="flex h-full flex-col justify-between rounded-2xl bg-white p-6 shadow-sm">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Upcoming Payday</p>
                      <h2 className="text-2xl font-semibold text-[#1E3F66]">{upcomingPayday}</h2>
                      <p className="text-sm text-neutral-500">Payroll is finalised. Notify teams about any changes before cutoff.</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#1E3F66]/5 px-3 py-2 text-xs font-medium text-[#1E3F66]">
                      <span>💡</span>
                      Direct deposit preview available.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1E3F66]">Quick Actions</h2>
                  <span className="text-xs text-neutral-500">Resolve routine tasks in seconds</span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {quickActions.map(({ label, icon }) => (
                    <button
                      type="button"
                      key={label}
                      className="flex flex-col items-center gap-3 rounded-xl border border-[#1E3F66]/10 bg-[#F8F8F8] px-4 py-5 text-center text-xs font-semibold text-[#1E3F66] transition hover:-translate-y-1 hover:bg-white hover:shadow-sm"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E3F66]/10 text-lg">{icon}</span>
                      <span className="tracking-[0.08em] uppercase">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {assuranceHighlights.map(({ label, value }) => (
                  <div key={label} className="rounded-2xl bg-white p-5 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">{label}</p>
                    <p className="mt-3 text-2xl font-semibold text-[#1E3F66]">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col justify-between gap-6">
              <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1E3F66]">Inbox overview</h2>
                <div className="space-y-4 text-sm text-neutral-600">
                  <div className="flex items-start gap-3 rounded-xl border border-[#FF8A65]/20 bg-[#FF8A65]/5 px-4 py-3">
                    <span className="mt-1 text-lg">📬</span>
                    <div>
                      <p className="font-semibold text-[#1E3F66]">Two leave approvals pending</p>
                      <p className="text-xs text-neutral-500">Last request submitted 45 minutes ago.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-[#34A853]/20 bg-[#34A853]/5 px-4 py-3">
                    <span className="mt-1 text-lg">✅</span>
                    <div>
                      <p className="font-semibold text-[#1E3F66]">Payroll reconciliation complete</p>
                      <p className="text-xs text-neutral-500">Finance marked all anomalies resolved.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-[#1E3F66]/10 bg-[#1E3F66]/5 px-4 py-3">
                    <span className="mt-1 text-lg">🗂️</span>
                    <div>
                      <p className="font-semibold text-[#1E3F66]">Org chart updated</p>
                      <p className="text-xs text-neutral-500">New hires added to Embedded Systems pod.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1E3F66]">Recent Activities</h2>
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#34A853]/20 bg-[#34A853]/5 px-4 py-3 text-sm text-neutral-600">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34A853]/20 text-[#34A853]">✓</span>
                  <div>
                    <p className="font-semibold text-[#1E3F66]">Timesheet Submitted</p>
                    <p className="text-xs text-neutral-500">Successfully recorded for Engineering Ops.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};
