import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize, type AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const createProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETE', 'ON_HOLD']).default('IN_PROGRESS'),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  managerId: z.string().uuid(),
});

const createWorkItemSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().optional(),
  type: z.enum(['FEATURE', 'BUG', 'TASK']).default('TASK'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  assigneeId: z.string().uuid(),
  reporterId: z.string().uuid(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).default('TODO'),
  dueDate: z.string().datetime().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
});

const commentSchema = z.object({
  body: z.string().min(1),
});

router.use(authenticate);

router.get('/projects', async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { managerId: userId },
        { members: { some: { userId } } },
      ],
    },
    include: {
      workItems: {
        include: {
          assignee: { select: { id: true, profile: true } },
          reporter: { select: { id: true, profile: true } },
        },
      },
      milestones: true,
      members: {
        include: {
          user: { select: { id: true, email: true, profile: true } },
        },
      },
    },
  });

  return res.json(projects);
});

router.post('/projects', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid project payload', details: parsed.error.flatten() });
  }

  const { title, description, status, startDate, dueDate, managerId } = parsed.data;

  const project = await prisma.project.create({
    data: {
      title,
      description,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      managerId,
    },
    include: {
      milestones: true,
      workItems: true,
      members: {
        include: {
          user: { select: { id: true, email: true, profile: true } },
        },
      },
    },
  });

  return res.status(201).json(project);
});

router.get('/work-items', async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  const workItems = await prisma.workItem.findMany({
    where: {
      OR: [{ assigneeId: userId }, { reporterId: userId }],
    },
    include: {
      project: true,
      assignee: { select: { id: true, profile: true } },
      reporter: { select: { id: true, profile: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, profile: true } } },
      },
      history: {
        orderBy: { changedAt: 'desc' },
      },
    },
  });

  return res.json(workItems);
});

router.post('/work-items', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req: AuthenticatedRequest, res) => {
  const parsed = createWorkItemSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid work item payload', details: parsed.error.flatten() });
  }

  const workItem = await prisma.workItem.create({
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      history: {
        create: {
          changedById: req.user!.id,
          status: parsed.data.status,
        },
      },
    },
    include: {
      project: true,
      assignee: { select: { id: true, profile: true } },
      reporter: { select: { id: true, profile: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, profile: true } } },
      },
      history: true,
    },
  });

  return res.status(201).json(workItem);
});

router.patch('/work-items/:id/status', async (req: AuthenticatedRequest, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid status payload', details: parsed.error.flatten() });
  }

  const workItemId = req.params.id;

  const workItem = await prisma.workItem.update({
    where: { id: workItemId },
    data: {
      status: parsed.data.status,
      history: {
        create: {
          changedById: req.user!.id,
          status: parsed.data.status,
        },
      },
    },
    include: {
      project: true,
      assignee: { select: { id: true, profile: true } },
      reporter: { select: { id: true, profile: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, profile: true } } },
      },
      history: {
        orderBy: { changedAt: 'desc' },
      },
    },
  });

  return res.json(workItem);
});

router.post('/work-items/:id/comments', async (req: AuthenticatedRequest, res) => {
  const parsed = commentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid comment payload', details: parsed.error.flatten() });
  }

  const newComment = await prisma.workItemComment.create({
    data: {
      workItemId: req.params.id,
      authorId: req.user!.id,
      body: parsed.data.body,
    },
    include: {
      author: { select: { id: true, profile: true } },
    },
  });

  return res.status(201).json(newComment);
});

export default router;
