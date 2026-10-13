import express from 'express';
import { getBooks, getBookById, createBook, updateBook, deleteBook } from '../controllers/bookController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', protect, authorize('ADMIN', 'LIBRARIAN'), createBook);
router.put('/:id', protect, authorize('ADMIN', 'LIBRARIAN'), updateBook);
router.delete('/:id', protect, authorize('ADMIN'), deleteBook);

export default router;
