import Book from '../models/Book.js';
import BorrowRecord from '../models/BorrowRecord.js';
import User from '../models/User.js';
import Reservation from '../models/Reservation.js';

// @route   GET /api/v1/reports/summary
export const getSummaryReport = async (req, res) => {
  try {
    const totalTitles = await Book.countDocuments({ isDeleted: false });
    const totalMembers = await User.countDocuments({ role: 'MEMBER' });
    const activeLoans = await BorrowRecord.countDocuments({ status: { $in: ['BORROWED', 'OVERDUE'] } });
    const totalOverdue = await BorrowRecord.countDocuments({
      status: 'BORROWED',
      dueDate: { $lt: new Date() }
    });
    const pendingReservations = await Reservation.countDocuments({ status: { $in: ['WAITING', 'READY_FOR_PICKUP'] } });

    // Sum of all unpaid fines
    const fineStats = await BorrowRecord.aggregate([
      { $match: { 'fine.amount': { $gt: 0 } } },
      {
        $group: {
          _id: null,
          totalFinesAssessed: { $sum: '$fine.amount' },
          totalFinesCollected: {
            $sum: { $cond: [{ $eq: ['$fine.isPaid', true] }, '$fine.amount', 0] }
          },
          totalFinesUnpaid: {
            $sum: { $cond: [{ $eq: ['$fine.isPaid', false] }, '$fine.amount', 0] }
          }
        }
      }
    ]);

    const fineSummary = fineStats[0] || {
      totalFinesAssessed: 0,
      totalFinesCollected: 0,
      totalFinesUnpaid: 0
    };

    // Category breakdown
    const categoryBreakdown = await Book.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 }, totalCopies: { $sum: '$totalCopies' } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      summary: {
        totalTitles,
        totalMembers,
        activeLoans,
        totalOverdue,
        pendingReservations,
        ...fineSummary,
        categoryBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/v1/reports/overdue
export const getOverdueDefaulters = async (req, res) => {
  try {
    const overdueLoans = await BorrowRecord.find({
      status: 'BORROWED',
      dueDate: { $lt: new Date() }
    })
      .populate('book', 'title isbn authors shelfLocation')
      .populate('user', 'firstName lastName email memberId phone')
      .sort({ dueDate: 1 });

    const defaultersWithCalculatedDays = overdueLoans.map(loan => {
      const now = new Date();
      const diffTime = Math.abs(now - new Date(loan.dueDate));
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...loan.toObject(),
        daysOverdue,
        estimatedFine: daysOverdue * 1.0
      };
    });

    res.json({ success: true, count: defaultersWithCalculatedDays.length, overdueLoans: defaultersWithCalculatedDays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
