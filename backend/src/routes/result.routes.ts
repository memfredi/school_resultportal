import { Router } from 'express';
import { importResults, getResultsByProgram, updateResultStatus } from '../controllers/result.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/import', requireRole(['ADMIN', 'TEACHER']), importResults);
router.get('/program/:programId', getResultsByProgram);
router.patch('/:id/status', requireRole(['ADMIN']), updateResultStatus);

export default router;
