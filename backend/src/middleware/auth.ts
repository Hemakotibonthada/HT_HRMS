import { Request, Response, NextFunction, type RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | Record<string, Express.Multer.File[]>;
}

export const authenticate: RequestHandler = (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  const authHeader = authReq.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedRequest['user'];
    authReq.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user || !roles.includes(authReq.user.role)) {
      return res.status(403).json({ message: 'You are not allowed to perform this action' });
    }

    return next();
  };
};
