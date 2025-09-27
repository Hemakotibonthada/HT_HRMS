import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const DashboardPage = () => {
  const { user } = useAuth();
  const fullName = `${user?.profile?.firstName ?? ''} ${user?.profile?.lastName ?? ''}`.trim();

  return (
    <div className="space-y-12 animate-slide-up">
      <section className="relative rounded-3xl glass-effect border border-white/20 p-12 backdrop-blur-xl overflow-hidden group hover:border-blue-400/30 transition-all duration-500">
        {/* Animated background elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-400 font-bold animate-slide-in-left">Welcome back</p>
          <h1 className="mt-6 max-w-4xl text-4xl lg:text-6xl font-black text-white leading-tight animate-slide-in-right">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-cyan-200">
              {fullName || user?.email}
            </span>
            <span className="block text-2xl lg:text-3xl mt-4 text-slate-200 font-medium">
              manage people and projects in one secure workspace.
            </span>
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <Badge variant="glow" size="md" animated>{user?.role.replace('_', ' ')}</Badge>
            <span className="text-slate-300 font-medium flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              HT R&D Labs · Internal Portal
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <Card
          variant="glass"
          glow={true}
          animated={true}
          title="Employee Portal"
          subtitle="Manage profiles, timesheets, and payroll."
          action={
            <Button variant="primary" size="lg" glow={true} asChild>
              <Link to="/portal/employee">
                <span className="flex items-center">
                  Open Portal
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </Button>
          }
        >
          <div className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              Submit timesheets, review payslips, and view the org structure in a privacy-first workspace that stays inside HT.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="glass-effect rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-blue-400">👥</div>
                <div className="text-xs text-slate-400 mt-1">HR Management</div>
              </div>
              <div className="glass-effect rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-green-400">⏰</div>
                <div className="text-xs text-slate-400 mt-1">Time Tracking</div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card
          variant="glass"
          glow={true}
          animated={true}
          title="Work Portal"
          subtitle="Track R&D projects, plan sprints, and ship features."
          action={
            <Button variant="secondary" size="lg" glow={true} asChild>
              <Link to="/portal/work">
                <span className="flex items-center">
                  Open Portal
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </Button>
          }
        >
          <div className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              Organize projects, manage work items, and stay aligned with a Kanban view, comments, and automatic history tracking.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="glass-effect rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-purple-400">🚀</div>
                <div className="text-xs text-slate-400 mt-1">Project Tracking</div>
              </div>
              <div className="glass-effect rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-cyan-400">📊</div>
                <div className="text-xs text-slate-400 mt-1">Kanban Boards</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
