import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/', getAuditLogs);

export default router;
