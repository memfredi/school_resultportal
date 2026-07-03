import { Router } from 'express';
import { getStudentResults, updateBulkResultStatus } from '../controllers/student.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Student fetches own results by matricule (their username)
router.get('/:matricule', getStudentResults);
router.get('/:matricule/results', getStudentResults); // alias

// Admin/Teacher bulk-updates result status for a whole program
router.post('/bulk-status', updateBulkResultStatus);

export default router;
