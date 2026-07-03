import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['ADMIN', 'TEACHER']));

router.get('/stats', getDashboardStats);

export default router;
