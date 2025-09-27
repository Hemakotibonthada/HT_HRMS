import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize, type AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const expenseCategoryEnum = z.enum(['TRAVEL', 'MEALS', 'EQUIPMENT', 'SOFTWARE', 'OFFICE', 'OTHER']);
const expenseStatusEnum = z.enum(['SUBMITTED', 'APPROVED', 'REJECTED', 'REIMBURSED']);

const createExpenseSchema = z.object({
  title: z.string().min(3),
  description: z.string().max(2000).optional(),
  category: expenseCategoryEnum,
  amount: z.coerce.number().positive(),
  currency: z.string().length(3).default('USD'),
  incurredOn: z.string().datetime(),
  receiptUrl: z.string().url().max(2000).optional(),
  notes: z.string().max(2000).optional(),
});

const updateExpenseSchema = createExpenseSchema.partial().extend({
  status: expenseStatusEnum.optional(),
  rejectionReason: z.string().max(500).optional(),
}).superRefine((data, ctx) => {
  if (data.status === 'REJECTED' && !data.rejectionReason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Rejection reason is required when rejecting a claim',
      path: ['rejectionReason'],
    });
  }
});

router.use(authenticate);

router.get('/', async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const statusQuery = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;
  const status = expenseStatusEnum.safeParse(statusQuery ?? undefined);
  if (statusQuery && !status.success) {
    return res.status(400).json({ message: 'Invalid status filter' });
  }

  const targetUserId =
    actor.role === 'ADMIN' && typeof req.query.userId === 'string' ? req.query.userId : actor.id;

  if (typeof req.query.userId === 'string' && actor.role !== 'ADMIN' && req.query.userId !== actor.id) {
    return res.status(403).json({ message: 'You are not allowed to view these claims' });
  }

  const claims = await prisma.expenseClaim.findMany({
    where: {
      userId: targetUserId,
      ...(status.success ? { status: status.data } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: [{ submittedAt: 'desc' }],
  });

  const payload = claims.map((claim) => ({
    id: claim.id,
    user: claim.user,
    title: claim.title,
    description: claim.description,
    category: claim.category,
    amount: claim.amount.toNumber(),
    currency: claim.currency,
    incurredOn: claim.incurredOn.toISOString(),
    receiptUrl: claim.receiptUrl,
    status: claim.status,
    submittedAt: claim.submittedAt.toISOString(),
    approvedAt: claim.approvedAt?.toISOString() ?? null,
    approvedBy: claim.approvedBy,
    rejectionReason: claim.rejectionReason,
    notes: claim.notes,
  }));

  return res.json(payload);
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const parsed = createExpenseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid expense payload', details: parsed.error.flatten() });
  }

  const data = parsed.data;

  const claim = await prisma.expenseClaim.create({
    data: {
      userId: actor.id,
      title: data.title,
      description: data.description,
      category: data.category,
      amount: data.amount,
      currency: data.currency.toUpperCase(),
      incurredOn: new Date(data.incurredOn),
      receiptUrl: data.receiptUrl,
      notes: data.notes,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  });

  return res.status(201).json({
    id: claim.id,
    user: claim.user,
    title: claim.title,
    description: claim.description,
    category: claim.category,
    amount: claim.amount.toNumber(),
    currency: claim.currency,
    incurredOn: claim.incurredOn.toISOString(),
    receiptUrl: claim.receiptUrl,
    status: claim.status,
    submittedAt: claim.submittedAt.toISOString(),
    approvedAt: null,
    approvedBy: null,
    rejectionReason: null,
    notes: claim.notes,
  });
});

router.patch('/:id', async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const parsed = updateExpenseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid expense update payload', details: parsed.error.flatten() });
  }

  const existing = await prisma.expenseClaim.findUnique({ where: { id: req.params.id } });

  if (!existing) {
    return res.status(404).json({ message: 'Expense claim not found' });
  }

  if (actor.role !== 'ADMIN' && existing.userId !== actor.id) {
    return res.status(403).json({ message: 'You are not allowed to modify this expense claim' });
  }

  const data = parsed.data;
  const statusChanged = data.status && data.status !== existing.status;

  if (statusChanged && actor.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Only administrators can change claim status' });
  }

  if (actor.role !== 'ADMIN' && existing.status !== 'SUBMITTED') {
    return res.status(400).json({ message: 'Submitted claims can only be edited before review' });
  }

  if (data.status === 'APPROVED' && existing.status !== 'SUBMITTED') {
    return res.status(400).json({ message: 'Only submitted claims can be approved' });
  }

  if (data.status === 'REJECTED' && existing.status === 'REIMBURSED') {
    return res.status(400).json({ message: 'A reimbursed claim cannot be rejected' });
  }

  if (data.status === 'REIMBURSED' && existing.status !== 'APPROVED') {
    return res.status(400).json({ message: 'Only approved claims can be reimbursed' });
  }

  const claim = await prisma.expenseClaim.update({
    where: { id: existing.id },
    data: {
      ...('title' in data ? { title: data.title! } : {}),
      ...('description' in data ? { description: data.description ?? null } : {}),
      ...('category' in data ? { category: data.category! } : {}),
      ...('amount' in data ? { amount: data.amount! } : {}),
      ...('currency' in data ? { currency: data.currency!.toUpperCase() } : {}),
      ...('incurredOn' in data ? { incurredOn: data.incurredOn ? new Date(data.incurredOn) : existing.incurredOn } : {}),
      ...('receiptUrl' in data ? { receiptUrl: data.receiptUrl ?? null } : {}),
      ...('notes' in data ? { notes: data.notes ?? null } : {}),
      ...('status' in data && data.status ? { status: data.status } : {}),
      ...('status' in data && data.status && data.status !== 'SUBMITTED'
        ? { approvedById: actor.id, approvedAt: new Date(), rejectionReason: data.rejectionReason ?? null }
        : data.status === 'SUBMITTED'
          ? { approvedById: null, approvedAt: null, rejectionReason: null }
          : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  });

  return res.json({
    id: claim.id,
    user: claim.user,
    title: claim.title,
    description: claim.description,
    category: claim.category,
    amount: claim.amount.toNumber(),
    currency: claim.currency,
    incurredOn: claim.incurredOn.toISOString(),
    receiptUrl: claim.receiptUrl,
    status: claim.status,
    submittedAt: claim.submittedAt.toISOString(),
    approvedAt: claim.approvedAt?.toISOString() ?? null,
    approvedBy: claim.approvedBy,
    rejectionReason: claim.rejectionReason,
    notes: claim.notes,
  });
});

router.get('/summary', authorize(['ADMIN']), async (_req: AuthenticatedRequest, res) => {
  const [totals, approvedThisMonth] = await Promise.all([
    prisma.expenseClaim.groupBy({
      by: ['status'],
      _count: true,
      _sum: { amount: true },
    }),
    prisma.expenseClaim.aggregate({
      _sum: { amount: true },
      where: {
        status: { in: ['APPROVED', 'REIMBURSED'] },
        approvedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  const summary = totals.reduce(
    (acc, row) => {
      acc[row.status] = {
        count: row._count,
        amount: row._sum.amount?.toNumber() ?? 0,
      };
      return acc;
    },
    {} as Record<string, { count: number; amount: number }>,
  );

  return res.json({
    byStatus: summary,
    approvedThisMonth: approvedThisMonth._sum.amount?.toNumber() ?? 0,
  });
});

export default router;
