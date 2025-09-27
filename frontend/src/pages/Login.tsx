import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import type { AuthContextValue } from '../context/AuthContext';

const integrityHighlights = [
  'Unified access for HR, payroll, and delivery squads',
  'Adaptive security controls with live audit trails',
  'Guided onboarding to keep regulators satisfied',
];

const trustMetrics = [
  { label: '99.95%', description: 'Availability backed by SLA' },
  { label: 'AES-256', description: 'Encryption at rest & in transit' },
  { label: '24/7', description: 'Security control desk coverage' },
];

const assuranceSignals = [
  {
    title: 'Zero trust perimeter',
    description: 'Context-aware policies verified every session with hardware-backed MFA.',
    icon: '🛡️',
  },
  {
    title: 'Encrypted data plane',
    description: 'Field-level protection across HRIS, payroll, and work orchestration flows.',
    icon: '🔐',
  },
  {
    title: 'Operational telemetry',
    description: 'Stream KPIs and incident timelines directly into compliance dashboards.',
    icon: '📈',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth() as AuthContextValue;
  const [email, setEmail] = useState('admin@htconnect.local');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-light text-neutral-dark">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[-18rem] h-[32rem] rounded-full bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/25 blur-3xl" />
        <div className="absolute inset-x-0 top-1/2 h-[48rem] bg-[radial-gradient(circle_at_top,_rgba(31,59,115,0.28)_0%,_rgba(245,247,250,0)_65%)]" />
        <div className="absolute -left-16 bottom-12 h-60 w-60 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" />
      </div>

      <div className="relative z-10 grid min-h-screen items-stretch gap-0 lg:grid-cols-[1.05fr_0.95fr] max-lg:grid-cols-1">
        <section className="hidden flex-col justify-between border-r border-primary/15 bg-gradient-to-br from-white via-neutral-light to-primary/10 px-12 py-14 shadow-inner lg:flex">
          <div className="space-y-9">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-primary">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                HT
              </span>
              <span>HT Connect · Trusted Control Tower</span>
            </div>
            <div className="space-y-4">
              <h1 className="max-w-md text-4xl font-semibold leading-tight text-neutral-dark">
                Governance, people ops, and delivery—composed into one high-trust workspace.
              </h1>
              <p className="max-w-lg text-base text-neutral-muted">
                Establish reliable guardrails for every squad. HT Connect aligns finance, HR, and engineering leaders with the same secure
                source of truth.
              </p>
            </div>
            <div className="space-y-3 text-sm text-neutral-muted">
              {integrityHighlights.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-white/92 px-5 py-3 shadow-sm">
                  <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-semibold text-primary">
                    ●
                  </span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6 rounded-3xl border border-primary/15 bg-white/90 p-6 text-sm text-neutral-muted shadow-xl">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-primary">People Ops Insight</p>
              <p className="mt-3 text-base text-neutral-dark">
                “The governance workflows in HT Connect keep investors and regulators aligned. Our compliance checks close 2× faster.”
              </p>
              <p className="mt-4 text-xs font-medium text-neutral-muted">— Priya Desai, Director of HR & Compliance</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {trustMetrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-primary/15 bg-gradient-to-br from-white via-white to-primary/10 p-5 text-center">
                  <p className="text-lg font-semibold text-primary">{metric.label}</p>
                  <p className="mt-1 text-[0.7rem] uppercase tracking-[0.3em] text-neutral-muted">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-10 lg:px-16 min-h-screen lg:min-h-auto">
          <div className="w-full max-w-md space-y-8 sm:space-y-12">
            <header className="flex items-center justify-between rounded-full border border-primary/15 bg-white px-4 py-3 text-xs sm:text-[0.65rem] uppercase tracking-[0.25em] sm:tracking-[0.35em] text-neutral-muted shadow-card lg:hidden">
              <span className="flex items-center gap-2 text-primary">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[0.8rem] font-semibold">
                  HT
                </span>
                Connect Access
              </span>
              <span className="text-[0.6rem] text-neutral-muted">Trusted Control Tower</span>
            </header>

            <div className="space-y-3 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/90 px-4 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-primary">
                Secure portal
              </span>
              <div className="flex flex-col items-center justify-between gap-3 text-primary lg:flex-row">
                <div className="flex items-center gap-2 text-primary">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs">🛡️</span>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em]">Verified partner access</p>
                </div>
                <div className="flex gap-2 text-[0.55rem] uppercase tracking-[0.35em] text-neutral-muted">
                  <span>ISO 27001</span>
                  <span>GDPR Ready</span>
                  <span>SOC 2</span>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-dark leading-tight">Sign in to your HT Connect workspace</h2>
              <p className="text-sm text-neutral-muted">
                Centralise authorisations, payroll, and project delivery within a zero trust perimeter. Every session is monitored and
                signed for audit readiness.
              </p>
            </div>

            <div className="relative rounded-2xl sm:rounded-3xl border border-white/20 backdrop-blur-xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 p-6 sm:p-10 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 hover:border-white/30">
              {/* Animated background elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-2xl animate-float" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/30 to-pink-500/30 rounded-full blur-2xl animate-float animation-delay-200" />
              </div>
              
              <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                <div className="space-y-2 group">
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-dark group-focus-within:text-blue-600 transition-colors duration-200">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="block w-full rounded-xl border border-white/30 backdrop-blur-sm bg-white/70 px-4 py-3 text-sm text-neutral-dark placeholder:text-neutral-muted 
                               focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25 focus:bg-white/80
                               hover:bg-white/75 hover:border-white/40 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="you@htlabs.ai"
                      autoComplete="email"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-dark group-focus-within:text-blue-600 transition-colors duration-200">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="block w-full rounded-xl border border-white/30 backdrop-blur-sm bg-white/70 px-4 py-3 text-sm text-neutral-dark placeholder:text-neutral-muted 
                               focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25 focus:bg-white/80
                               hover:bg-white/75 hover:border-white/40 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                {error ? (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm animate-slide-up">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                ) : null}

                <Button
                  type="submit"
                  className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-6 py-3 text-sm font-semibold text-white shadow-lg 
                           hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed
                           before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0 
                           before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 overflow-hidden group"
                  disabled={isSubmitting}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authenticating…
                      </>
                    ) : (
                      <>
                        Sign in securely
                        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                            <path d="M0 2l4 4 4-4z"/>
                          </svg>
                        </div>
                      </>
                    )}
                  </span>
                </Button>

                <div className="grid gap-3 grid-cols-1 xs:grid-cols-3 sm:grid-cols-3">
                  {trustMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-primary/15 bg-white/90 p-4 text-center shadow-sm">
                      <p className="text-xl font-semibold text-primary">{metric.label}</p>
                      <p className="mt-1 text-[0.65rem] uppercase tracking-[0.3em] text-neutral-muted">{metric.description}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {assuranceSignals.map(({ title, description, icon }) => (
                    <div key={title} className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-neutral-light/85 px-4 py-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 via-secondary/20 to-accent/25 text-xl">
                        {icon}
                      </span>
                      <div className="space-y-1">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-primary">{title}</p>
                        <p className="text-sm text-neutral-muted">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-neutral-muted">
                  <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary">
                    SOC 2 Controls
                  </Badge>
                  <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary">
                    ISO 27001
                  </Badge>
                  <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary">
                    GDPR Ready
                  </Badge>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
