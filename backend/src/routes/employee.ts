import { Router, type NextFunction, type Request } from 'express';
import multer, { type FileFilterCallback } from 'multer';
import path from 'path';
import PDFDocument from 'pdfkit';
import { ensureDir, ensureDirSync, move } from 'fs-extra';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, authorize, type AuthenticatedRequest } from '../middleware/auth';
import { env } from '../config/env';
import { Prisma } from '../generated/prisma';

const router = Router();

const timesheetInclude = {
  project: {
    select: {
      id: true,
      title: true,
      managerId: true,
    },
  },
  workItem: {
    select: {
      id: true,
      title: true,
    },
  },
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
};

const createTimesheetSchema = z.object({
  projectId: z.string().uuid(),
  workItemId: z.string().uuid().optional(),
  workDate: z.string().datetime(),
  hours: z.coerce.number().min(0.25).max(24),
  description: z.string().max(500).optional(),
});

const updateTimesheetStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING']).default('APPROVED'),
});

const payslipPayloadSchema = z.object({
  userId: z.string().uuid(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

const offerLetterSchema = z.object({
  candidateName: z.string().min(3),
  title: z.string().min(2),
  salary: z.string().min(1),
  startDate: z.string().min(1),
  reportingManager: z.string().min(2),
  location: z.string().default('HT R&D Labs, Bangalore'),
  notes: z.string().max(500).optional(),
});

const payslipRoot = path.join(env.UPLOAD_DIR, 'payslips');
ensureDirSync(payslipRoot);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      cb(null, payslipRoot);
    },
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, `${Date.now()}-${sanitized}`);
    },
  }),
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are allowed'));
      return;
    }

    cb(null, true);
  },
});

router.use(authenticate);

router.get('/timesheets', async (req: AuthenticatedRequest, res) => {
  const currentUser = req.user!;
  const queryUserId = typeof req.query.userId === 'string' ? req.query.userId : undefined;

  let whereClause: Prisma.TimesheetWhereInput;

  if (currentUser.role === 'ADMIN') {
    whereClause = queryUserId ? { userId: queryUserId } : {};
  } else if (currentUser.role === 'PROJECT_MANAGER') {
    whereClause = {
      OR: [
        { userId: currentUser.id },
        { project: { managerId: currentUser.id } },
      ],
    };
  } else {
    whereClause = { userId: currentUser.id };
  }

  const timesheets = await prisma.timesheet.findMany({
    where: whereClause,
    include: timesheetInclude,
    orderBy: [{ workDate: 'desc' }, { submittedAt: 'desc' }],
  });

  return res.json(timesheets);
});

router.post('/timesheets', async (req: AuthenticatedRequest, res) => {
  const parsed = createTimesheetSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid timesheet payload', details: parsed.error.flatten() });
  }

  const { projectId, workItemId, workDate, hours, description } = parsed.data;
  const currentUserId = req.user!.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: true,
    },
  });

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const isMember = project.members.some((member) => member.userId === currentUserId) || project.managerId === currentUserId;

  if (!isMember) {
    return res.status(403).json({ message: 'You are not assigned to this project' });
  }

  const timesheet = await prisma.timesheet.create({
    data: {
      userId: currentUserId,
      projectId,
      workItemId,
      workDate: new Date(workDate),
      hours: hours.toFixed(2),
      description,
    },
    include: timesheetInclude,
  });

  return res.status(201).json(timesheet);
});

router.patch('/timesheets/:id/status', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req: AuthenticatedRequest, res) => {
  const parsed = updateTimesheetStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid status payload', details: parsed.error.flatten() });
  }

  const timesheet = await prisma.timesheet.findUnique({
    where: { id: req.params.id },
    include: {
      project: true,
    },
  });

  if (!timesheet) {
    return res.status(404).json({ message: 'Timesheet not found' });
  }

  if (req.user!.role !== 'ADMIN' && timesheet.project.managerId !== req.user!.id) {
    return res.status(403).json({ message: 'You are not allowed to approve this timesheet' });
  }

  const shouldStampApproval = parsed.data.status === 'APPROVED';

  const updated = await prisma.timesheet.update({
    where: { id: timesheet.id },
    data: {
      status: parsed.data.status,
      approvedById: shouldStampApproval ? req.user!.id : null,
      approvedAt: shouldStampApproval ? new Date() : null,
    },
    include: timesheetInclude,
  });

  return res.json(updated);
});

router.get('/payslips', async (req: AuthenticatedRequest, res) => {
  const currentUser = req.user!;
  const requestedUserId = typeof req.query.userId === 'string' ? req.query.userId : currentUser.id;

  if (currentUser.role !== 'ADMIN' && requestedUserId !== currentUser.id) {
    return res.status(403).json({ message: 'You are not allowed to view these payslips' });
  }

  const payslips = await prisma.payslip.findMany({
    where: { userId: requestedUserId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  const items = payslips.map((payslip) => ({
    ...payslip,
    downloadUrl: `/uploads/${payslip.filePath.replace(/\\/g, '/')}`,
  }));

  return res.json(items);
});

router.post('/payslips', authorize(['ADMIN']), upload.single('file'), async (req: AuthenticatedRequest, res) => {
  const file = (req as AuthenticatedRequest & { file?: Express.Multer.File }).file;

  if (!file) {
    return res.status(400).json({ message: 'Payslip PDF is required' });
  }

  const parsed = payslipPayloadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payslip metadata', details: parsed.error.flatten() });
  }

  const { userId, month, year } = parsed.data;
  const finalDir = path.join(payslipRoot, userId);
  await ensureDir(finalDir);

  const filename = `payslip-${year}-${String(month).padStart(2, '0')}.pdf`;
  const finalPath = path.join(finalDir, filename);
  await move(file.path, finalPath, { overwrite: true });

  const relativePath = path.relative(env.UPLOAD_DIR, finalPath).replace(/\\/g, '/');

  const record = await prisma.payslip.upsert({
    where: {
      userId_month_year: {
        userId,
        month,
        year,
      },
    },
    update: {
      filePath: relativePath,
    },
    create: {
      userId,
      month,
      year,
      filePath: relativePath,
    },
  });

  return res.status(201).json({
    ...record,
    downloadUrl: `/uploads/${relativePath}`,
  });
});

router.get('/payslips/:id/download', async (req: AuthenticatedRequest, res) => {
  const payslip = await prisma.payslip.findUnique({ where: { id: req.params.id } });

  if (!payslip) {
    return res.status(404).json({ message: 'Payslip not found' });
  }

  const currentUser = req.user!;

  if (currentUser.role !== 'ADMIN' && currentUser.id !== payslip.userId) {
    return res.status(403).json({ message: 'You do not have access to this payslip' });
  }

  const filePath = path.join(env.UPLOAD_DIR, payslip.filePath);
  return res.download(filePath, path.basename(filePath));
});

router.get('/org-structure', async (_req: AuthenticatedRequest, res) => {
  const profiles = await prisma.employeeProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  type OrgNode = {
    id: string;
    name: string;
    title: string;
    department: string;
    email: string;
    managerId?: string | null;
    children: OrgNode[];
  };

  const nodes = new Map<string, OrgNode>();

  for (const profile of profiles) {
    nodes.set(profile.userId, {
      id: profile.userId,
      name: `${profile.firstName} ${profile.lastName}`.trim(),
      title: profile.position,
      department: profile.department,
      email: profile.user.email,
  managerId: profile.managerId,
      children: [],
    });
  }

  const roots: OrgNode[] = [];

  for (const node of nodes.values()) {
    if (node.managerId && nodes.has(node.managerId)) {
      nodes.get(node.managerId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return res.json(roots);
});

router.post('/offer-letters', authorize(['ADMIN']), async (req: AuthenticatedRequest, res, next: NextFunction) => {
  const parsed = offerLetterSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid offer letter payload', details: parsed.error.flatten() });
  }

  const data = parsed.data;
  const doc = new PDFDocument({ margin: 54 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  doc.on('error', (error: Error) => next(error));
  doc.on('end', () => {
    const pdf = Buffer.concat(chunks);
    const filename = `${data.candidateName.replace(/[^a-zA-Z0-9]/g, '_')}_Offer_Letter.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  });

  doc.fontSize(20).text('HT R&D Labs', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text('Offer of Employment', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();
  doc.text(`Dear ${data.candidateName},`);
  doc.moveDown();
  doc.text(
    `We are pleased to offer you the position of ${data.title} at HT R&D Labs. ` +
      'This offer reflects our confidence in your ability to contribute to our research and development vision.'
  );
  doc.moveDown();
  doc.text(`• Compensation: ${data.salary}`);
  doc.text(`• Joining Date: ${data.startDate}`);
  doc.text(`• Reporting To: ${data.reportingManager}`);
  doc.text(`• Location: ${data.location}`);
  if (data.notes) {
    doc.moveDown();
    doc.text(`Notes: ${data.notes}`);
  }
  doc.moveDown();
  doc.text(
    'Please sign and return this letter within 7 working days to confirm your acceptance. '
      + 'Our People Ops team will share onboarding documentation upon confirmation.'
  );
  doc.moveDown();
  doc.text('With warm regards,');
  doc.text('HT R&D Labs People Operations');
  doc.moveDown(2);
  doc.text('____________________________');
  doc.text('Authorized Signatory');

  doc.end();
});

export default router;
