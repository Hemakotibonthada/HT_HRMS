import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize, type AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const createBenefitPlanSchema = z.object({
  name: z.string().min(3),
  description: z.string().max(500).optional(),
  type: z.enum(['HEALTH', 'INSURANCE', 'RETIREMENT', 'WELLNESS', 'OTHER']).default('OTHER'),
  employeeContribution: z.coerce.number().nonnegative().optional(),
  employerContribution: z.coerce.number().nonnegative().optional(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
});

const updateBenefitPlanSchema = createBenefitPlanSchema.partial();

const manageEnrollmentSchema = z.object({
  action: z.enum(['ENROLL', 'CANCEL']).default('ENROLL'),
  effectiveDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  employeeContribution: z.coerce.number().nonnegative().optional(),
  employerContribution: z.coerce.number().nonnegative().optional(),
  userId: z.string().uuid().optional(),
  notes: z.string().max(250).optional(),
});

const payrollEntrySchema = z.object({
  userId: z.string().uuid(),
  grossPay: z.coerce.number().nonnegative(),
  deductions: z.coerce.number().min(0),
  netPay: z.coerce.number().min(0),
  notes: z.string().max(300).optional(),
});

const createPayrollRunSchema = z.object({
  label: z.string().max(140).optional(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  status: z.enum(['DRAFT', 'FINALIZED']).default('DRAFT'),
  processedAt: z.string().datetime().optional(),
  entries: z.array(payrollEntrySchema).min(1),
});

const createPerformanceCycleSchema = z.object({
  name: z.string().min(3),
  status: z.enum(['UPCOMING', 'ACTIVE', 'CLOSED']).default('UPCOMING'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const updatePerformanceCycleSchema = createPerformanceCycleSchema.partial().extend({
  status: z.enum(['UPCOMING', 'ACTIVE', 'CLOSED']).optional(),
});

const createPerformanceGoalSchema = z.object({
  cycleId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().max(1000).optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ON_TRACK', 'AT_RISK', 'COMPLETED']).optional(),
  progress: z.coerce.number().int().min(0).max(100).optional(),
  dueDate: z.string().datetime().optional(),
  ownerId: z.string().uuid().optional(),
});

const updatePerformanceGoalSchema = createPerformanceGoalSchema.partial();

const createPerformanceReviewSchema = z.object({
  employeeId: z.string().uuid(),
  managerId: z.string().uuid().optional(),
  cycleId: z.string().uuid(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED']).optional(),
  rating: z.enum(['OUTSTANDING', 'EXCEEDS', 'MEETS', 'DEVELOPING', 'UNSATISFACTORY']).optional(),
  summary: z.string().max(2000).optional(),
  strengths: z.string().max(2000).optional(),
  growthAreas: z.string().max(2000).optional(),
  submittedAt: z.string().datetime().optional(),
  acknowledgedAt: z.string().datetime().optional(),
});

const updatePerformanceReviewSchema = createPerformanceReviewSchema.partial();

router.use(authenticate);

router.get('/benefits/plans', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  const plans = await prisma.benefitPlan.findMany({
    orderBy: { name: 'asc' },
    include: {
      enrollments: {
        where: {
          userId,
          status: { in: ['ACTIVE', 'PENDING'] },
        },
        orderBy: { enrolledAt: 'desc' },
        take: 1,
      },
    },
  });

  const payload = plans.map((plan) => {
    const activeEnrollment = plan.enrollments[0];
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      type: plan.type,
      employeeContribution: plan.employeeContribution?.toNumber() ?? null,
      employerContribution: plan.employerContribution?.toNumber() ?? null,
      effectiveFrom: plan.effectiveFrom?.toISOString() ?? null,
      effectiveTo: plan.effectiveTo?.toISOString() ?? null,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
      enrollment: activeEnrollment
        ? {
            id: activeEnrollment.id,
            status: activeEnrollment.status,
            effectiveDate: activeEnrollment.effectiveDate?.toISOString() ?? null,
            endDate: activeEnrollment.endDate?.toISOString() ?? null,
            employeeContribution: activeEnrollment.employeeContribution?.toNumber() ?? null,
            employerContribution: activeEnrollment.employerContribution?.toNumber() ?? null,
          }
        : null,
    };
  });

  return res.json(payload);
});

router.post('/benefits/plans', authorize(['ADMIN']), async (req: AuthenticatedRequest, res) => {
  const parsed = createBenefitPlanSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid benefit plan payload', details: parsed.error.flatten() });
  }

  const data = parsed.data;

  const plan = await prisma.benefitPlan.create({
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      employeeContribution: data.employeeContribution ?? undefined,
      employerContribution: data.employerContribution ?? undefined,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
      effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
    },
  });

  return res.status(201).json(plan);
});

router.patch('/benefits/plans/:id', authorize(['ADMIN']), async (req: AuthenticatedRequest, res) => {
  const parsed = updateBenefitPlanSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid benefit plan update', details: parsed.error.flatten() });
  }

  const plan = await prisma.benefitPlan.update({
    where: { id: req.params.id },
    data: {
      ...parsed.data,
      employeeContribution: parsed.data.employeeContribution ?? undefined,
      employerContribution: parsed.data.employerContribution ?? undefined,
      effectiveFrom: parsed.data.effectiveFrom ? new Date(parsed.data.effectiveFrom) : undefined,
      effectiveTo: parsed.data.effectiveTo ? new Date(parsed.data.effectiveTo) : undefined,
    },
  });

  return res.json(plan);
});

router.post('/benefits/plans/:id/enroll', async (req: AuthenticatedRequest, res) => {
  const parsed = manageEnrollmentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid enrollment request', details: parsed.error.flatten() });
  }

  const payload = parsed.data;
  const actor = req.user!;
  const targetUserId = payload.userId && actor.role === 'ADMIN' ? payload.userId : actor.id;

  if (payload.userId && actor.role !== 'ADMIN' && payload.userId !== actor.id) {
    return res.status(403).json({ message: 'You are not allowed to manage enrollments for this employee' });
  }

  const plan = await prisma.benefitPlan.findUnique({ where: { id: req.params.id } });

  if (!plan) {
    return res.status(404).json({ message: 'Benefit plan not found' });
  }

  if (payload.action === 'CANCEL') {
    const active = await prisma.benefitEnrollment.findFirst({
      where: {
        planId: plan.id,
        userId: targetUserId,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    if (!active) {
      return res.status(404).json({ message: 'No active enrollment to cancel' });
    }

    const cancelled = await prisma.benefitEnrollment.update({
      where: { id: active.id },
      data: {
        status: 'CANCELLED',
        endDate: payload.endDate ? new Date(payload.endDate) : new Date(),
      },
    });

    return res.json(cancelled);
  }

  const existing = await prisma.benefitEnrollment.findFirst({
    where: {
      planId: plan.id,
      userId: targetUserId,
      status: { in: ['ACTIVE', 'PENDING'] },
    },
  });

  if (existing) {
    return res.status(409).json({ message: 'Employee is already enrolled in this plan' });
  }

  const enrollment = await prisma.benefitEnrollment.create({
    data: {
      planId: plan.id,
      userId: targetUserId,
      status: 'ACTIVE',
      effectiveDate: payload.effectiveDate ? new Date(payload.effectiveDate) : new Date(),
      employeeContribution: payload.employeeContribution ?? plan.employeeContribution ?? undefined,
      employerContribution: payload.employerContribution ?? plan.employerContribution ?? undefined,
    },
  });

  return res.status(201).json(enrollment);
});

router.get('/benefits/enrollments', async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const userId = typeof req.query.userId === 'string' && actor.role === 'ADMIN' ? req.query.userId : actor.id;

  if (req.query.userId && actor.role !== 'ADMIN' && req.query.userId !== actor.id) {
    return res.status(403).json({ message: 'You are not allowed to view these enrollments' });
  }

  const enrollments = await prisma.benefitEnrollment.findMany({
    where: {
      userId,
    },
    include: {
      plan: true,
    },
    orderBy: { enrolledAt: 'desc' },
  });

  const payload = enrollments.map((entry) => ({
    id: entry.id,
    status: entry.status,
    enrolledAt: entry.enrolledAt.toISOString(),
    effectiveDate: entry.effectiveDate?.toISOString() ?? null,
    endDate: entry.endDate?.toISOString() ?? null,
    employeeContribution: entry.employeeContribution?.toNumber() ?? null,
    employerContribution: entry.employerContribution?.toNumber() ?? null,
    plan: {
      id: entry.plan.id,
      name: entry.plan.name,
      description: entry.plan.description,
      type: entry.plan.type,
    },
  }));

  return res.json(payload);
});

router.get('/payroll/runs', async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;

  if (actor.role === 'ADMIN') {
    const runs = await prisma.payrollRun.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        entries: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
      },
    });

    const payload = runs.map((run) => ({
      id: run.id,
      label: run.label,
      month: run.month,
      year: run.year,
      status: run.status,
      processedAt: run.processedAt?.toISOString() ?? null,
      totalGross: run.totalGross.toNumber(),
      totalNet: run.totalNet.toNumber(),
      createdAt: run.createdAt.toISOString(),
      entries: run.entries.map((entry) => ({
        id: entry.id,
        user: entry.user,
        grossPay: entry.grossPay.toNumber(),
        deductions: entry.deductions.toNumber(),
        netPay: entry.netPay.toNumber(),
        notes: entry.notes,
      })),
    }));

    return res.json(payload);
  }

  const runs = await prisma.payrollRun.findMany({
    where: {
      entries: {
        some: { userId: actor.id },
      },
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    include: {
      entries: {
        where: { userId: actor.id },
      },
    },
  });

  const payload = runs.map((run) => ({
    id: run.id,
    label: run.label,
    month: run.month,
    year: run.year,
    status: run.status,
    processedAt: run.processedAt?.toISOString() ?? null,
    totalGross: run.totalGross.toNumber(),
    totalNet: run.totalNet.toNumber(),
    createdAt: run.createdAt.toISOString(),
    entry: run.entries[0]
      ? {
          id: run.entries[0].id,
          grossPay: run.entries[0].grossPay.toNumber(),
          deductions: run.entries[0].deductions.toNumber(),
          netPay: run.entries[0].netPay.toNumber(),
          notes: run.entries[0].notes,
        }
      : null,
  }));

  return res.json(payload);
});

router.post('/payroll/runs', authorize(['ADMIN']), async (req: AuthenticatedRequest, res) => {
  const parsed = createPayrollRunSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payroll run payload', details: parsed.error.flatten() });
  }

  const data = parsed.data;

  const totalGross = data.entries.reduce((total, entry) => total + entry.grossPay, 0);
  const totalNet = data.entries.reduce((total, entry) => total + entry.netPay, 0);

  const payrollRun = await prisma.payrollRun.create({
    data: {
      label: data.label,
      month: data.month,
      year: data.year,
      status: data.status,
      processedAt: data.processedAt ? new Date(data.processedAt) : undefined,
      totalGross,
      totalNet,
      entries: {
        create: data.entries.map((entry) => ({
          userId: entry.userId,
          grossPay: entry.grossPay,
          deductions: entry.deductions,
          netPay: entry.netPay,
          notes: entry.notes,
        })),
      },
    },
    include: {
      entries: true,
    },
  });

  return res.status(201).json(payrollRun);
});

router.get('/payroll/entries/me', async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;

  const entries = await prisma.payrollEntry.findMany({
    where: { userId: actor.id },
    include: {
      payrollRun: true,
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  const payload = entries.map((entry) => ({
    id: entry.id,
    grossPay: entry.grossPay.toNumber(),
    deductions: entry.deductions.toNumber(),
    netPay: entry.netPay.toNumber(),
    notes: entry.notes,
    createdAt: entry.createdAt.toISOString(),
    payrollRun: {
      id: entry.payrollRun.id,
      month: entry.payrollRun.month,
      year: entry.payrollRun.year,
      status: entry.payrollRun.status,
      label: entry.payrollRun.label,
      processedAt: entry.payrollRun.processedAt?.toISOString() ?? null,
    },
  }));

  return res.json(payload);
});

router.get('/performance/cycles', async (_req: AuthenticatedRequest, res) => {
  const cycles = await prisma.performanceCycle.findMany({
    orderBy: [{ startDate: 'desc' }],
  });

  const payload = cycles.map((cycle) => ({
    id: cycle.id,
    name: cycle.name,
    status: cycle.status,
    startDate: cycle.startDate.toISOString(),
    endDate: cycle.endDate.toISOString(),
    createdAt: cycle.createdAt.toISOString(),
    updatedAt: cycle.updatedAt.toISOString(),
  }));

  return res.json(payload);
});

router.post('/performance/cycles', authorize(['ADMIN']), async (req: AuthenticatedRequest, res) => {
  const parsed = createPerformanceCycleSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid performance cycle payload', details: parsed.error.flatten() });
  }

  const data = parsed.data;

  const cycle = await prisma.performanceCycle.create({
    data: {
      name: data.name,
      status: data.status,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });

  return res.status(201).json({
    id: cycle.id,
    name: cycle.name,
    status: cycle.status,
    startDate: cycle.startDate.toISOString(),
    endDate: cycle.endDate.toISOString(),
    createdAt: cycle.createdAt.toISOString(),
    updatedAt: cycle.updatedAt.toISOString(),
  });
});

router.patch('/performance/cycles/:id', authorize(['ADMIN']), async (req: AuthenticatedRequest, res) => {
  const parsed = updatePerformanceCycleSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid performance cycle update', details: parsed.error.flatten() });
  }

  const data = parsed.data;

  const cycle = await prisma.performanceCycle.update({
    where: { id: req.params.id },
    data: {
      ...('name' in data ? { name: data.name } : {}),
      ...('status' in data && data.status ? { status: data.status } : {}),
      ...('startDate' in data && data.startDate ? { startDate: new Date(data.startDate) } : {}),
      ...('endDate' in data && data.endDate ? { endDate: new Date(data.endDate) } : {}),
    },
  });

  return res.json({
    id: cycle.id,
    name: cycle.name,
    status: cycle.status,
    startDate: cycle.startDate.toISOString(),
    endDate: cycle.endDate.toISOString(),
    createdAt: cycle.createdAt.toISOString(),
    updatedAt: cycle.updatedAt.toISOString(),
  });
});

router.get('/performance/goals', async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const filterUserId = typeof req.query.userId === 'string' && actor.role !== 'EMPLOYEE' ? req.query.userId : actor.id;
  const cycleId = typeof req.query.cycleId === 'string' ? req.query.cycleId : undefined;

  if (req.query.userId && actor.role === 'EMPLOYEE' && req.query.userId !== actor.id) {
    return res.status(403).json({ message: 'You are not allowed to view these goals' });
  }

  const goals = await prisma.performanceGoal.findMany({
    where: {
      ownerId: filterUserId,
      ...(cycleId ? { cycleId } : {}),
    },
    include: {
      cycle: true,
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  const payload = goals.map((goal) => ({
    id: goal.id,
    ownerId: goal.ownerId,
    cycleId: goal.cycleId,
    title: goal.title,
    description: goal.description,
    status: goal.status,
    progress: goal.progress,
    dueDate: goal.dueDate?.toISOString() ?? null,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    cycle: {
      id: goal.cycle.id,
      name: goal.cycle.name,
      status: goal.cycle.status,
      startDate: goal.cycle.startDate.toISOString(),
      endDate: goal.cycle.endDate.toISOString(),
    },
  }));

  return res.json(payload);
});

router.post('/performance/goals', async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const parsed = createPerformanceGoalSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid performance goal payload', details: parsed.error.flatten() });
  }

  const data = parsed.data;
  const targetOwnerId = data.ownerId && actor.role !== 'EMPLOYEE' ? data.ownerId : actor.id;

  if (data.ownerId && actor.role === 'EMPLOYEE' && data.ownerId !== actor.id) {
    return res.status(403).json({ message: 'Employees can only create goals for themselves' });
  }

  const goal = await prisma.performanceGoal.create({
    data: {
      ownerId: targetOwnerId,
      cycleId: data.cycleId,
      title: data.title,
      description: data.description,
      status: data.status ?? 'NOT_STARTED',
      progress: data.progress ?? 0,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
    include: {
      cycle: true,
    },
  });

  return res.status(201).json({
    id: goal.id,
    ownerId: goal.ownerId,
    cycleId: goal.cycleId,
    title: goal.title,
    description: goal.description,
    status: goal.status,
    progress: goal.progress,
    dueDate: goal.dueDate?.toISOString() ?? null,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    cycle: {
      id: goal.cycle.id,
      name: goal.cycle.name,
      status: goal.cycle.status,
      startDate: goal.cycle.startDate.toISOString(),
      endDate: goal.cycle.endDate.toISOString(),
    },
  });
});

router.patch('/performance/goals/:id', async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const parsed = updatePerformanceGoalSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid performance goal update', details: parsed.error.flatten() });
  }

  const existing = await prisma.performanceGoal.findUnique({ where: { id: req.params.id } });

  if (!existing) {
    return res.status(404).json({ message: 'Performance goal not found' });
  }

  if (actor.role === 'EMPLOYEE' && existing.ownerId !== actor.id) {
    return res.status(403).json({ message: 'You are not allowed to modify this goal' });
  }

  const data = parsed.data;

  if ('ownerId' in data && data.ownerId && data.ownerId !== existing.ownerId) {
    if (actor.role === 'EMPLOYEE') {
      return res.status(403).json({ message: 'You cannot reassign this goal' });
    }
  }

  const goal = await prisma.performanceGoal.update({
    where: { id: existing.id },
    data: {
      ...('title' in data && data.title ? { title: data.title } : {}),
      ...('description' in data ? { description: data.description ?? null } : {}),
      ...('status' in data && data.status ? { status: data.status } : {}),
      ...('progress' in data && data.progress != null ? { progress: Math.min(Math.max(data.progress, 0), 100) } : {}),
      ...('dueDate' in data ? { dueDate: data.dueDate ? new Date(data.dueDate) : null } : {}),
      ...('ownerId' in data && data.ownerId && data.ownerId !== existing.ownerId ? { ownerId: data.ownerId } : {}),
    },
    include: {
      cycle: true,
    },
  });

  return res.json({
    id: goal.id,
    ownerId: goal.ownerId,
    cycleId: goal.cycleId,
    title: goal.title,
    description: goal.description,
    status: goal.status,
    progress: goal.progress,
    dueDate: goal.dueDate?.toISOString() ?? null,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    cycle: {
      id: goal.cycle.id,
      name: goal.cycle.name,
      status: goal.cycle.status,
      startDate: goal.cycle.startDate.toISOString(),
      endDate: goal.cycle.endDate.toISOString(),
    },
  });
});

router.get('/performance/reviews', async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const cycleId = typeof req.query.cycleId === 'string' ? req.query.cycleId : undefined;

  const reviews = await prisma.employeePerformanceReview.findMany({
    where: {
      ...(actor.role === 'EMPLOYEE'
        ? { employeeId: actor.id }
        : actor.role === 'PROJECT_MANAGER'
          ? { OR: [{ managerId: actor.id }, { employeeId: actor.id }] }
          : {}),
      ...(cycleId ? { cycleId } : {}),
    },
    include: {
      employee: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      manager: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      cycle: true,
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  const payload = reviews.map((review) => ({
    id: review.id,
    employee: review.employee,
    manager: review.manager,
    cycle: {
      id: review.cycle.id,
      name: review.cycle.name,
      status: review.cycle.status,
      startDate: review.cycle.startDate.toISOString(),
      endDate: review.cycle.endDate.toISOString(),
    },
    status: review.status,
    rating: review.rating,
    summary: review.summary,
    strengths: review.strengths,
    growthAreas: review.growthAreas,
    submittedAt: review.submittedAt?.toISOString() ?? null,
    acknowledgedAt: review.acknowledgedAt?.toISOString() ?? null,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  }));

  return res.json(payload);
});

router.post('/performance/reviews', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const parsed = createPerformanceReviewSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid performance review payload', details: parsed.error.flatten() });
  }

  const data = parsed.data;

  const managerId = data.managerId ?? actor.id;

  const review = await prisma.employeePerformanceReview.upsert({
    where: {
      employeeId_cycleId: {
        employeeId: data.employeeId,
        cycleId: data.cycleId,
      },
    },
    update: {
      managerId,
      status: data.status ?? undefined,
      rating: data.rating ?? undefined,
      summary: data.summary ?? undefined,
      strengths: data.strengths ?? undefined,
      growthAreas: data.growthAreas ?? undefined,
      submittedAt: data.submittedAt ? new Date(data.submittedAt) : undefined,
      acknowledgedAt: data.acknowledgedAt ? new Date(data.acknowledgedAt) : undefined,
    },
    create: {
      employeeId: data.employeeId,
      managerId,
      cycleId: data.cycleId,
      status: data.status ?? 'DRAFT',
      rating: data.rating,
      summary: data.summary,
      strengths: data.strengths,
      growthAreas: data.growthAreas,
      submittedAt: data.submittedAt ? new Date(data.submittedAt) : undefined,
      acknowledgedAt: data.acknowledgedAt ? new Date(data.acknowledgedAt) : undefined,
    },
    include: {
      employee: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      manager: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      cycle: true,
    },
  });

  return res.status(201).json({
    id: review.id,
    employee: review.employee,
    manager: review.manager,
    cycle: {
      id: review.cycle.id,
      name: review.cycle.name,
      status: review.cycle.status,
      startDate: review.cycle.startDate.toISOString(),
      endDate: review.cycle.endDate.toISOString(),
    },
    status: review.status,
    rating: review.rating,
    summary: review.summary,
    strengths: review.strengths,
    growthAreas: review.growthAreas,
    submittedAt: review.submittedAt?.toISOString() ?? null,
    acknowledgedAt: review.acknowledgedAt?.toISOString() ?? null,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  });
});

router.patch('/performance/reviews/:id', async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const parsed = updatePerformanceReviewSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid performance review update', details: parsed.error.flatten() });
  }

  const existing = await prisma.employeePerformanceReview.findUnique({
    where: { id: req.params.id },
    include: {
      employee: true,
      manager: true,
      cycle: true,
    },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Performance review not found' });
  }

  if (actor.role === 'EMPLOYEE' && existing.employeeId !== actor.id) {
    return res.status(403).json({ message: 'You cannot modify this review' });
  }

  if (actor.role === 'PROJECT_MANAGER' && existing.managerId !== actor.id && existing.employeeId !== actor.id) {
    return res.status(403).json({ message: 'You are not associated with this review' });
  }

  const data = parsed.data;

  const review = await prisma.employeePerformanceReview.update({
    where: { id: existing.id },
    data: {
      ...('managerId' in data && data.managerId ? { managerId: data.managerId } : {}),
      ...('status' in data && data.status ? { status: data.status } : {}),
      ...('rating' in data ? { rating: data.rating ?? null } : {}),
      ...('summary' in data ? { summary: data.summary ?? null } : {}),
      ...('strengths' in data ? { strengths: data.strengths ?? null } : {}),
      ...('growthAreas' in data ? { growthAreas: data.growthAreas ?? null } : {}),
      ...('submittedAt' in data ? { submittedAt: data.submittedAt ? new Date(data.submittedAt) : null } : {}),
      ...('acknowledgedAt' in data ? { acknowledgedAt: data.acknowledgedAt ? new Date(data.acknowledgedAt) : null } : {}),
    },
    include: {
      employee: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      manager: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      cycle: true,
    },
  });

  return res.json({
    id: review.id,
    employee: review.employee,
    manager: review.manager,
    cycle: {
      id: review.cycle.id,
      name: review.cycle.name,
      status: review.cycle.status,
      startDate: review.cycle.startDate.toISOString(),
      endDate: review.cycle.endDate.toISOString(),
    },
    status: review.status,
    rating: review.rating,
    summary: review.summary,
    strengths: review.strengths,
    growthAreas: review.growthAreas,
    submittedAt: review.submittedAt?.toISOString() ?? null,
    acknowledgedAt: review.acknowledgedAt?.toISOString() ?? null,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  });
});

export default router;
