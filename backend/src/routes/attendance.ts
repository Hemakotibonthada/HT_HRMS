import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize, type AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const attendancePayloadSchema = z.object({
  type: z.enum(['CHECK_IN', 'CHECK_OUT']),
  method: z.enum(['BIOMETRIC', 'GPS', 'REMOTE']),
  timestamp: z.string().datetime({ message: 'timestamp must be an ISO date-time string' }).optional(),
  deviceId: z.string().trim().min(2, 'Device identifier is required for biometric scans').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationName: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(250).optional(),
  userId: z.string().uuid().optional(),
}).superRefine((data, ctx) => {
  if (data.method === 'BIOMETRIC' && !data.deviceId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'deviceId is required when using BIOMETRIC method', path: ['deviceId'] });
  }
  if (data.method === 'GPS' && (typeof data.latitude !== 'number' || typeof data.longitude !== 'number')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'latitude and longitude are required for GPS check-ins', path: ['latitude'] });
  }
  if (data.method === 'REMOTE' && !data.notes) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'notes are required for remote check-ins', path: ['notes'] });
  }
});

const logsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  method: z.enum(['BIOMETRIC', 'GPS', 'REMOTE']).optional(),
  limit: z.coerce.number().min(1).max(200).optional(),
});

const summaryQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

router.use(authenticate);

router.post('/logs', async (req: AuthenticatedRequest, res) => {
  const parsed = attendancePayloadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid attendance payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data;
  const actor = req.user!;
  const targetUserId = actor.role === 'ADMIN' && payload.userId ? payload.userId : actor.id;

  if (payload.userId && targetUserId !== actor.id && actor.role !== 'ADMIN') {
    return res.status(403).json({ message: 'You are not allowed to record attendance for this employee' });
  }

  const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();

  const record = await prisma.attendanceLog.create({
    data: {
      userId: targetUserId,
      type: payload.type,
      method: payload.method,
      timestamp,
      deviceId: payload.deviceId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      locationName: payload.locationName,
      notes: payload.notes,
    },
  });

  return res.status(201).json(record);
});

router.get('/logs', async (req: AuthenticatedRequest, res) => {
  const parsed = logsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid query parameters', details: parsed.error.flatten() });
  }

  const query = parsed.data;
  const actor = req.user!;
  const targetUserId = query.userId && actor.role === 'ADMIN' ? query.userId : actor.id;

  if (query.userId && actor.role !== 'ADMIN' && query.userId !== actor.id) {
    return res.status(403).json({ message: 'You are not allowed to view these attendance logs' });
  }

  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const where = {
    userId: targetUserId,
    timestamp: {
      gte: query.from ? new Date(query.from) : defaultFrom,
      lte: query.to ? new Date(query.to) : now,
    },
    method: query.method,
  } as const;

  const logs = await prisma.attendanceLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: query.limit ?? 100,
  });

  return res.json(logs);
});

router.get('/summary', async (req: AuthenticatedRequest, res) => {
  const parsed = summaryQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid summary parameters', details: parsed.error.flatten() });
  }

  const query = parsed.data;
  const actor = req.user!;
  const targetUserId = query.userId && actor.role === 'ADMIN' ? query.userId : actor.id;

  if (query.userId && actor.role !== 'ADMIN' && query.userId !== actor.id) {
    return res.status(403).json({ message: 'You are not allowed to view this summary' });
  }

  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const from = query.from ? new Date(query.from) : defaultFrom;
  const to = query.to ? new Date(query.to) : now;

  const logs = await prisma.attendanceLog.findMany({
    where: {
      userId: targetUserId,
      timestamp: {
        gte: from,
        lte: to,
      },
    },
    orderBy: { timestamp: 'asc' },
  });

  const summaries = new Map<string, {
    date: string;
    firstCheckIn: Date | null;
    lastCheckOut: Date | null;
    totalSessions: number;
    methods: Set<string>;
    totalDurationMs: number;
    openCheckIn?: Date | null;
  }>();

  for (const entry of logs) {
    const dayKey = entry.timestamp.toISOString().split('T')[0];
    if (!summaries.has(dayKey)) {
      summaries.set(dayKey, {
        date: dayKey,
        firstCheckIn: null,
        lastCheckOut: null,
        totalSessions: 0,
        methods: new Set<string>(),
        totalDurationMs: 0,
        openCheckIn: null,
      });
    }

    const bucket = summaries.get(dayKey)!;
    bucket.methods.add(entry.method);

    if (entry.type === 'CHECK_IN') {
      bucket.firstCheckIn = bucket.firstCheckIn ?? entry.timestamp;
      bucket.openCheckIn = entry.timestamp;
    } else if (entry.type === 'CHECK_OUT') {
      bucket.lastCheckOut = entry.timestamp;
      if (bucket.openCheckIn) {
        bucket.totalDurationMs += Math.max(0, entry.timestamp.getTime() - bucket.openCheckIn.getTime());
        bucket.totalSessions += 1;
        bucket.openCheckIn = null;
      }
    }
  }

  const output = Array.from(summaries.values())
    .map((value) => ({
      date: value.date,
      firstCheckIn: value.firstCheckIn ? value.firstCheckIn.toISOString() : null,
      lastCheckOut: value.lastCheckOut ? value.lastCheckOut.toISOString() : null,
      totalSessions: value.totalSessions,
      methodsUsed: Array.from(value.methods.values()),
      totalDurationMinutes: Math.round(value.totalDurationMs / 60000),
    }))
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  return res.json(output);
});

router.get('/logs/admin', authorize(['ADMIN']), async (_req, res) => {
  const logs = await prisma.attendanceLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 200,
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

  return res.json(logs);
});

export default router;
