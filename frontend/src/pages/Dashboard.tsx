import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const DashboardPage = () => {
  const { user } = useAuth();
  const fullName = `${user?.profile?.firstName ?? ''} ${user?.profile?.lastName ?? ''}`.trim();

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Welcome back</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-white sm:text-5xl">
          {fullName || user?.email}, manage people and projects in one secure workspace.
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-200">
          <Badge variant="info">Role: {user?.role.replace('_', ' ')}</Badge>
          <span className="text-slate-400">HT R&D Labs · Internal Portal</span>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card
          title="Employee Portal"
          subtitle="Manage profiles, timesheets, and payroll."
          action={
            <Button asChild>
              <Link to="/portal/employee">Open Portal</Link>
            </Button>
          }
        >
          <p className="text-sm text-slate-200">
            Submit timesheets, review payslips, and view the org structure in a privacy-first workspace that stays inside HT.
          </p>
        </Card>
        <Card
          title="Work Portal"
          subtitle="Track R&D projects, plan sprints, and ship features."
          action={
            <Button variant="secondary" asChild>
              <Link to="/portal/work">Open Portal</Link>
            </Button>
          }
        >
          <p className="text-sm text-slate-200">
            Organize projects, manage work items, and stay aligned with a Kanban view, comments, and automatic history tracking.
          </p>
        </Card>
      </div>
    </div>
  );
};
