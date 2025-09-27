import { Router } from 'express';
import authRouter from './auth';
import userRouter from './user';
import workRouter from './work';
import employeeRouter from './employee';
import attendanceRouter from './attendance';
import hrRouter from './hr';
import recruitmentRouter from './recruitment';
import expensesRouter from './expenses';
import analyticsRouter from './analytics';

export const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/work', workRouter);
router.use('/employee', employeeRouter);
router.use('/attendance', attendanceRouter);
router.use('/hr', hrRouter);
router.use('/recruitment', recruitmentRouter);
router.use('/expenses', expensesRouter);
router.use('/analytics', analyticsRouter);
