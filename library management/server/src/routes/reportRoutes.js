import express from 'express';
import { getSummaryReport, getOverdueDefaulters } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', protect, authorize('ADMIN', 'LIBRARIAN'), getSummaryReport);
router.get('/overdue', protect, authorize('ADMIN', 'LIBRARIAN'), getOverdueDefaulters);

export default router;
