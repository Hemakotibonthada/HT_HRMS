import { Router } from 'express';
import { authenticate, authorize, type AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.use(authenticate);

router.get('/overview', authorize(['ADMIN', 'PROJECT_MANAGER']), async (_req: AuthenticatedRequest, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [
    headcount,
    roleMix,
    activeProjects,
    attendanceWindow,
    openJobs,
    candidatePipeline,
    expenseTotals,
    payrollRollup,
    performanceStatus,
  ] = await Promise.all([
    prisma.employeeProfile.count(),
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),
    prisma.project.count({
      where: {
        status: { in: ['IN_PROGRESS', 'ON_HOLD'] },
      },
    }),
    prisma.attendanceLog.findMany({
      where: {
        timestamp: { gte: thirtyDaysAgo },
      },
      select: {
        type: true,
        timestamp: true,
      },
      orderBy: { timestamp: 'desc' },
    }),
    prisma.jobOpening.count({
      where: { status: 'OPEN' },
    }),
    prisma.candidateApplication.groupBy({
      by: ['stage'],
      _count: true,
    }),
    prisma.expenseClaim.groupBy({
      by: ['status'],
      _count: true,
      _sum: { amount: true },
    }),
    prisma.payrollRun.findFirst({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        entries: true,
      },
    }),
    prisma.performanceCycle.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  const roleBreakdown = roleMix.reduce((acc, row) => {
    acc[row.role] = row._count;
    return acc;
  }, {} as Record<string, number>);

  const attendanceSummary = attendanceWindow.reduce(
    (acc, entry) => {
      const dayKey = entry.timestamp.toISOString().slice(0, 10);
      if (!acc.byDay[dayKey]) {
        acc.byDay[dayKey] = { checkIns: 0, checkOuts: 0 };
      }
      if (entry.type === 'CHECK_IN') {
        acc.byDay[dayKey].checkIns += 1;
        acc.totalCheckIns += 1;
      } else {
        acc.byDay[dayKey].checkOuts += 1;
        acc.totalCheckOuts += 1;
      }
      return acc;
    },
    { totalCheckIns: 0, totalCheckOuts: 0, byDay: {} as Record<string, { checkIns: number; checkOuts: number }> },
  );

  const pipeline = candidatePipeline.reduce((acc, row) => {
    acc[row.stage] = row._count;
    return acc;
  }, {} as Record<string, number>);

  const expenses = expenseTotals.reduce((acc, row) => {
    acc[row.status] = {
      count: row._count,
      amount: row._sum.amount?.toNumber() ?? 0,
    };
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  const performance = performanceStatus.reduce((acc, row) => {
    acc[row.status] = row._count;
    return acc;
  }, {} as Record<string, number>);

  const payrollSummary = payrollRollup
    ? {
        id: payrollRollup.id,
        label: payrollRollup.label,
        month: payrollRollup.month,
        year: payrollRollup.year,
        status: payrollRollup.status,
        processedAt: payrollRollup.processedAt?.toISOString() ?? null,
        totalGross: payrollRollup.totalGross.toNumber(),
        totalNet: payrollRollup.totalNet.toNumber(),
        entries: payrollRollup.entries.slice(0, 5).map((entry) => ({
          id: entry.id,
          userId: entry.userId,
          netPay: entry.netPay.toNumber(),
        })),
      }
    : null;

  return res.json({
    headcount,
    roleBreakdown,
    activeProjects,
    attendance: attendanceSummary,
    recruitment: {
      openJobs,
      pipeline,
    },
    expenses,
    payroll: payrollSummary,
    performance,
    generatedAt: now.toISOString(),
    period: {
      startOfMonth: startOfMonth.toISOString(),
      last30DaysStart: thirtyDaysAgo.toISOString(),
    },
  });
});

export default router;
