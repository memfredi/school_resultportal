import { Router } from 'express';
import { createSpecialty, getSpecialties, createProgram } from '../controllers/specialty.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// List all specialties and stats
router.get('/', getSpecialties);

// Admin only routes
router.post('/', requireRole(['ADMIN']), createSpecialty);
router.post('/:specialtyId/programs', requireRole(['ADMIN']), createProgram);

export default router;
