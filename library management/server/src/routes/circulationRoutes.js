import express from 'express';
import {
  borrowBook,
  returnBook,
  reserveBook,
  cancelReservation,
  renewLoan,
  getMyLoans,
  getAllCirculationRecords,
  payFine
} from '../controllers/circulationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/borrow', protect, borrowBook);
router.post('/return', protect, authorize('ADMIN', 'LIBRARIAN'), returnBook);
router.post('/reserve', protect, reserveBook);
router.post('/cancel-reservation/:id', protect, cancelReservation);
router.post('/renew/:borrowId', protect, renewLoan);
router.get('/my-loans', protect, getMyLoans);
router.get('/all-records', protect, authorize('ADMIN', 'LIBRARIAN'), getAllCirculationRecords);
router.post('/pay-fine/:borrowId', protect, payFine);

export default router;
