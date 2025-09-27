import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { ensureDirSync } from 'fs-extra';
import { env } from './config/env';
import { router as apiRouter } from './routes';

const app = express();

const uploadsRoot = env.UPLOAD_DIR;
ensureDirSync(uploadsRoot);

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL ?? '*',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve(uploadsRoot)));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', apiRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

export { app };
