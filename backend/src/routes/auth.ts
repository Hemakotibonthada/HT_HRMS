import { Router } from 'express';
import { sign, type Secret, type SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { comparePassword } from '../utils/password';
import { env } from '../config/env';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid email or password format' });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: {
        select: {
          firstName: true,
          lastName: true,
          position: true,
          department: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = await comparePassword(password, user.passwordHash);

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  const token = sign(payload, env.JWT_SECRET as Secret, options);

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    },
  });
});

export default router;
