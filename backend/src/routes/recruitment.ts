import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize, type AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const jobStatusEnum = z.enum(['OPEN', 'CLOSED', 'PAUSED']);
const employmentTypeEnum = z.enum(['FULL_TIME', 'CONTRACT', 'INTERN']);
const recruitmentStageEnum = z.enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'ARCHIVED']);

const createJobSchema = z.object({
  title: z.string().min(3),
  department: z.string().min(2),
  location: z.string().min(2).optional(),
  description: z.string().max(2000).optional(),
  employmentType: employmentTypeEnum.default('FULL_TIME'),
  status: jobStatusEnum.default('OPEN'),
  openings: z.coerce.number().int().min(1).max(99).default(1),
});

const updateJobSchema = createJobSchema.partial();

const createCandidateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  resumeUrl: z.string().url().max(2000).optional(),
  source: z.string().max(140).optional(),
  notes: z.string().max(4000).optional(),
});

const updateCandidateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(40).optional(),
  resumeUrl: z.string().url().max(2000).optional(),
  source: z.string().max(140).optional(),
  notes: z.string().max(4000).optional(),
  stage: recruitmentStageEnum.optional(),
  lastInteraction: z.string().datetime().optional(),
  stageNote: z.string().max(1000).optional(),
});

router.use(authenticate);

router.get('/jobs', async (req: AuthenticatedRequest, res) => {
  const statusQuery = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;
  const status = jobStatusEnum.safeParse(statusQuery ?? undefined);

  if (statusQuery && !status.success) {
    return res.status(400).json({ message: 'Invalid status filter' });
  }

  const jobs = await prisma.jobOpening.findMany({
    where: {
      ...(status.success ? { status: status.data } : {}),
    },
    orderBy: [{ createdAt: 'desc' }],
    include: {
      _count: {
        select: {
          candidates: true,
        },
      },
      candidates: {
        select: {
          id: true,
          stage: true,
        },
      },
    },
  });

  const payload = jobs.map((job) => {
    const byStage = job.candidates.reduce((acc: Record<string, number>, candidate) => {
      acc[candidate.stage] = (acc[candidate.stage] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      description: job.description,
      employmentType: job.employmentType,
      status: job.status,
      openings: job.openings,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      totalCandidates: job._count.candidates,
      stageSummary: byStage,
    };
  });

  return res.json(payload);
});

router.post('/jobs', authorize(['ADMIN']), async (req: AuthenticatedRequest, res) => {
  const parsed = createJobSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid job opening payload', details: parsed.error.flatten() });
  }

  const job = await prisma.jobOpening.create({
    data: parsed.data,
  });

  return res.status(201).json({
    id: job.id,
    title: job.title,
    department: job.department,
    location: job.location,
    description: job.description,
    employmentType: job.employmentType,
    status: job.status,
    openings: job.openings,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  });
});

router.patch('/jobs/:id', authorize(['ADMIN']), async (req: AuthenticatedRequest, res) => {
  const parsed = updateJobSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid job update payload', details: parsed.error.flatten() });
  }

  try {
    const job = await prisma.jobOpening.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    return res.json({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      description: job.description,
      employmentType: job.employmentType,
      status: job.status,
      openings: job.openings,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    });
  } catch (error) {
    return res.status(404).json({ message: 'Job opening not found' });
  }
});

router.get('/jobs/:id/candidates', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req: AuthenticatedRequest, res) => {
  const job = await prisma.jobOpening.findUnique({
    where: { id: req.params.id },
    include: {
      candidates: {
        orderBy: [{ createdAt: 'desc' }],
        include: {
          history: {
            orderBy: [{ changedAt: 'desc' }],
            include: {
              changedBy: {
                select: {
                  id: true,
                  email: true,
                  profile: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!job) {
    return res.status(404).json({ message: 'Job opening not found' });
  }

  const payload = {
    id: job.id,
    title: job.title,
    department: job.department,
    status: job.status,
    candidates: job.candidates.map((candidate) => ({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      resumeUrl: candidate.resumeUrl,
      source: candidate.source,
      stage: candidate.stage,
      notes: candidate.notes,
      lastInteraction: candidate.lastInteraction?.toISOString() ?? null,
      createdAt: candidate.createdAt.toISOString(),
      updatedAt: candidate.updatedAt.toISOString(),
      history: candidate.history.map((entry) => ({
        id: entry.id,
        fromStage: entry.fromStage,
        toStage: entry.toStage,
        note: entry.note,
        changedAt: entry.changedAt.toISOString(),
        changedBy: entry.changedBy
          ? {
              id: entry.changedBy.id,
              email: entry.changedBy.email,
              profile: entry.changedBy.profile,
            }
          : null,
      })),
    })),
  };

  return res.json(payload);
});

router.post('/jobs/:id/candidates', async (req: AuthenticatedRequest, res) => {
  const parsed = createCandidateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid candidate payload', details: parsed.error.flatten() });
  }

  const job = await prisma.jobOpening.findUnique({ where: { id: req.params.id } });

  if (!job) {
    return res.status(404).json({ message: 'Job opening not found' });
  }

  const candidate = await prisma.candidateApplication.create({
    data: {
      jobId: job.id,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      resumeUrl: parsed.data.resumeUrl,
      source: parsed.data.source ?? req.user?.email ?? null,
      notes: parsed.data.notes,
    },
  });

  await prisma.candidateStageHistory.create({
    data: {
      candidateId: candidate.id,
      fromStage: null,
      toStage: candidate.stage,
      changedById: req.user?.id,
      note: 'Candidate created',
    },
  });

  return res.status(201).json({
    id: candidate.id,
    jobId: candidate.jobId,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone,
    resumeUrl: candidate.resumeUrl,
    source: candidate.source,
    stage: candidate.stage,
    notes: candidate.notes,
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
  });
});

router.patch('/candidates/:id', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req: AuthenticatedRequest, res) => {
  const parsed = updateCandidateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid candidate update payload', details: parsed.error.flatten() });
  }

  const existing = await prisma.candidateApplication.findUnique({ where: { id: req.params.id } });

  if (!existing) {
    return res.status(404).json({ message: 'Candidate not found' });
  }

  const data = parsed.data;
  const stageChanged = 'stage' in data && data.stage && data.stage !== existing.stage;

  const candidate = await prisma.candidateApplication.update({
    where: { id: existing.id },
    data: {
      ...('firstName' in data ? { firstName: data.firstName! } : {}),
      ...('lastName' in data ? { lastName: data.lastName! } : {}),
      ...('email' in data ? { email: data.email! } : {}),
      ...('phone' in data ? { phone: data.phone ?? null } : {}),
      ...('resumeUrl' in data ? { resumeUrl: data.resumeUrl ?? null } : {}),
      ...('source' in data ? { source: data.source ?? null } : {}),
      ...('notes' in data ? { notes: data.notes ?? null } : {}),
      ...('lastInteraction' in data ? { lastInteraction: data.lastInteraction ? new Date(data.lastInteraction) : null } : {}),
      ...('stage' in data && data.stage ? { stage: data.stage } : {}),
    },
  });

  if (stageChanged) {
    await prisma.candidateStageHistory.create({
      data: {
        candidateId: candidate.id,
        fromStage: existing.stage,
        toStage: candidate.stage,
        changedById: req.user!.id,
        note: data.stageNote ?? undefined,
      },
    });
  } else if (data.stageNote) {
    await prisma.candidateStageHistory.create({
      data: {
        candidateId: candidate.id,
        fromStage: candidate.stage,
        toStage: candidate.stage,
        changedById: req.user!.id,
        note: data.stageNote,
      },
    });
  }

  return res.json({
    id: candidate.id,
    jobId: candidate.jobId,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone,
    resumeUrl: candidate.resumeUrl,
    source: candidate.source,
    stage: candidate.stage,
    notes: candidate.notes,
    lastInteraction: candidate.lastInteraction?.toISOString() ?? null,
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
  });
});

router.get('/pipeline', authorize(['ADMIN', 'PROJECT_MANAGER']), async (_req: AuthenticatedRequest, res) => {
  const jobs = await prisma.jobOpening.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: {
      candidates: {
        select: {
          id: true,
          stage: true,
          createdAt: true,
        },
      },
    },
  });

  const payload = jobs.map((job) => {
    const totals = job.candidates.reduce(
      (acc, candidate) => {
        acc.total += 1;
        acc.byStage[candidate.stage] = (acc.byStage[candidate.stage] ?? 0) + 1;
        if (!acc.newest || candidate.createdAt > acc.newest) {
          acc.newest = candidate.createdAt;
        }
        return acc;
      },
      { total: 0, byStage: {} as Record<string, number>, newest: null as Date | null },
    );

    return {
      id: job.id,
      title: job.title,
      department: job.department,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      totals: {
        totalCandidates: totals.total,
        stageBreakdown: totals.byStage,
        lastCandidateAt: totals.newest ? totals.newest.toISOString() : null,
      },
    };
  });

  return res.json(payload);
});

export default router;
