import { Router } from 'express';
import authRoutes from '../modules/auth/auth.controller';
import usersRoutes from '../modules/users/users.controller';
import savingsRoutes from '../modules/savings/savings.controller';
import creditRoutes from '../modules/credit/credit.controller';
import notificationsRoutes from '../modules/notifications/notifications.controller';

const router = Router();

router.use('/admin/auth', authRoutes);
router.use('/admin/users', usersRoutes);
router.use('/admin/savings', savingsRoutes);
router.use('/admin/credit', creditRoutes);
router.use('/admin/notifications', notificationsRoutes);

export default router;
