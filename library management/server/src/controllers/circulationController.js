import BorrowRecord from '../models/BorrowRecord.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Reservation from '../models/Reservation.js';
import Notification from '../models/Notification.js';

const FINE_PER_DAY = 1.0; // $1.00 fine per day overdue
const LOAN_DURATION_DAYS = 14;

// @route   POST /api/v1/circulation/borrow
export const borrowBook = async (req, res) => {
  try {
    const { bookId, userId } = req.body;
    const targetUserId = userId || req.user._id;

    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.accountStatus === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Account is suspended due to unpaid fines or policy violations.' });
    }

    // Check active loan quota
    const activeLoansCount = await BorrowRecord.countDocuments({
      user: targetUserId,
      status: { $in: ['BORROWED', 'OVERDUE'] }
    });

    if (activeLoansCount >= user.borrowQuota) {
      return res.status(400).json({
        success: false,
        message: `Member has reached maximum borrow limit (${user.borrowQuota} books)`
      });
    }

    const book = await Book.findById(bookId);
    if (!book || book.isDeleted) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No available copies left. Please place a reservation instead.'
      });
    }

    // Decrement available copies
    book.availableCopies -= 1;
    await book.save();

    // Create loan record (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + LOAN_DURATION_DAYS);

    const borrowRecord = await BorrowRecord.create({
      book: book._id,
      user: user._id,
      issueDeskOperator: req.user._id,
      borrowedAt: new Date(),
      dueDate,
      status: 'BORROWED'
    });

    // Notify user
    await Notification.create({
      recipient: user._id,
      type: 'BORROW_SUCCESS',
      title: 'Book Borrowed Successfully',
      message: `You have borrowed "${book.title}". Due date is ${dueDate.toLocaleDateString()}.`
    });

    // If user had a reservation for this book, mark it fulfilled
    await Reservation.findOneAndUpdate(
      { book: book._id, user: user._id, status: { $in: ['WAITING', 'READY_FOR_PICKUP'] } },
      { status: 'FULFILLED' }
    );

    const populatedRecord = await BorrowRecord.findById(borrowRecord._id).populate('book').populate('user', 'firstName lastName email memberId');
    res.status(201).json({ success: true, borrowRecord: populatedRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/v1/circulation/return
export const returnBook = async (req, res) => {
  try {
    const { borrowRecordId, returnCondition } = req.body;

    const record = await BorrowRecord.findById(borrowRecordId).populate('book').populate('user');
    if (!record) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    if (record.status === 'RETURNED') {
      return res.status(400).json({ success: false, message: 'Book has already been returned' });
    }

    const returnDate = new Date();
    const dueDate = new Date(record.dueDate);
    let daysOverdue = 0;
    let fineAmount = 0;

    if (returnDate > dueDate) {
      const diffTime = Math.abs(returnDate - dueDate);
      daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = daysOverdue * FINE_PER_DAY;
    }

    record.returnedAt = returnDate;
    record.status = 'RETURNED';
    record.returnCondition = returnCondition || 'GOOD';
    record.fine = {
      amount: fineAmount,
      isPaid: fineAmount === 0,
      calculatedDaysOverdue: daysOverdue,
      paymentReference: ''
    };

    await record.save();

    // Increment available book copies
    const book = await Book.findById(record.book._id);
    if (book) {
      book.availableCopies += 1;
      await book.save();

      // Check if someone is waiting in reservation queue
      const nextReservation = await Reservation.findOne({
        book: book._id,
        status: 'WAITING'
      }).sort({ reservedAt: 1 });

      if (nextReservation) {
        nextReservation.status = 'READY_FOR_PICKUP';
        nextReservation.readyForPickupAt = new Date();
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 48); // 48-hour pickup window
        nextReservation.pickupDeadline = deadline;
        await nextReservation.save();

        await Notification.create({
          recipient: nextReservation.user,
          type: 'HOLD_READY',
          title: 'Reserved Book Ready for Pickup',
          message: `"${book.title}" is now ready at the issue desk. Please collect before ${deadline.toLocaleDateString()}.`
        });
      }
    }

    // Update user fine balance if fine incurred
    if (fineAmount > 0) {
      await User.findByIdAndUpdate(record.user._id, {
        $inc: { totalFinesDue: fineAmount }
      });

      await Notification.create({
        recipient: record.user._id,
        type: 'FINE_INCURRED',
        title: 'Overdue Fine Assessed',
        message: `Returned "${record.book.title}" ${daysOverdue} days late. Accrued fine: $${fineAmount.toFixed(2)}.`
      });
    }

    res.json({
      success: true,
      message: 'Book returned successfully',
      daysOverdue,
      fineAmount,
      borrowRecord: record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/v1/circulation/reserve
export const reserveBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    const book = await Book.findById(bookId);
    if (!book || book.isDeleted) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Check if user already has active reservation
    const existing = await Reservation.findOne({
      book: bookId,
      user: userId,
      status: { $in: ['WAITING', 'READY_FOR_PICKUP'] }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an active reservation for this title.' });
    }

    const queueCount = await Reservation.countDocuments({ book: bookId, status: 'WAITING' });

    const reservation = await Reservation.create({
      book: bookId,
      user: userId,
      queuePosition: queueCount + 1,
      status: book.availableCopies > 0 ? 'READY_FOR_PICKUP' : 'WAITING',
      readyForPickupAt: book.availableCopies > 0 ? new Date() : null,
      pickupDeadline: book.availableCopies > 0 ? new Date(Date.now() + 48 * 3600 * 1000) : null
    });

    await Notification.create({
      recipient: userId,
      type: 'GENERAL',
      title: 'Reservation Confirmed',
      message: `Reservation confirmed for "${book.title}". Queue position: ${queueCount + 1}.`
    });

    const populated = await Reservation.findById(reservation._id).populate('book');
    res.status(201).json({ success: true, reservation: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/v1/circulation/cancel-reservation/:id
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    reservation.status = 'CANCELLED';
    await reservation.save();
    res.json({ success: true, message: 'Reservation cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/v1/circulation/renew/:borrowId
export const renewLoan = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.borrowId).populate('book');
    if (!record || record.status !== 'BORROWED') {
      return res.status(400).json({ success: false, message: 'Cannot renew non-active loan' });
    }

    if (record.renewalCount >= 2) {
      return res.status(400).json({ success: false, message: 'Maximum renewals reached (2 extensions allowed)' });
    }

    // Check if other users are waiting on reservations
    const waitingHold = await Reservation.findOne({ book: record.book._id, status: 'WAITING' });
    if (waitingHold) {
      return res.status(400).json({
        success: false,
        message: 'Cannot renew. Another patron is currently waiting in reservation queue for this title.'
      });
    }

    const currentDue = new Date(record.dueDate);
    currentDue.setDate(currentDue.getDate() + 7); // +7 days extension

    record.dueDate = currentDue;
    record.renewalCount += 1;
    await record.save();

    res.json({
      success: true,
      message: `Loan extended. New due date is ${currentDue.toLocaleDateString()}`,
      borrowRecord: record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/v1/circulation/my-loans
export const getMyLoans = async (req, res) => {
  try {
    const loans = await BorrowRecord.find({ user: req.user._id })
      .populate('book')
      .sort({ createdAt: -1 });

    const reservations = await Reservation.find({ user: req.user._id, status: { $in: ['WAITING', 'READY_FOR_PICKUP'] } })
      .populate('book')
      .sort({ createdAt: -1 });

    res.json({ success: true, loans, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/v1/circulation/all-records
export const getAllCirculationRecords = async (req, res) => {
  try {
    const records = await BorrowRecord.find()
      .populate('book')
      .populate('user', 'firstName lastName email memberId')
      .sort({ createdAt: -1 });

    const reservations = await Reservation.find()
      .populate('book')
      .populate('user', 'firstName lastName email memberId')
      .sort({ createdAt: -1 });

    res.json({ success: true, records, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/v1/circulation/pay-fine/:borrowId
export const payFine = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.borrowId);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    const amountPaid = record.fine.amount;
    record.fine.isPaid = true;
    record.fine.paymentReference = 'TXN-' + Math.floor(1000000 + Math.random() * 9000000);
    await record.save();

    await User.findByIdAndUpdate(record.user, {
      $inc: { totalFinesDue: -amountPaid }
    });

    res.json({ success: true, message: 'Fine settled successfully', paymentReference: record.fine.paymentReference });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
