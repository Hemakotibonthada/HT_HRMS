import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/profile', authenticate, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      memberships: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const projects = user.memberships.map((membership: (typeof user.memberships)[number]) => ({
    id: membership.project.id,
    title: membership.project.title,
    status: membership.project.status,
    role: membership.role,
  }));

  return res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.profile,
    projects,
  });
});

export default router;
