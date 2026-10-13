import mongoose from 'mongoose';

const borrowRecordSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDeskOperator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  borrowedAt: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnedAt: { type: Date, default: null },
  renewalCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['BORROWED', 'RETURNED', 'OVERDUE', 'LOST'],
    default: 'BORROWED'
  },
  fine: {
    amount: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    paymentReference: { type: String, default: '' },
    calculatedDaysOverdue: { type: Number, default: 0 }
  },
  returnCondition: {
    type: String,
    enum: ['GOOD', 'DAMAGED', 'NEEDS_BINDING'],
    default: 'GOOD'
  }
}, {
  timestamps: true
});

borrowRecordSchema.index({ user: 1, status: 1 });
borrowRecordSchema.index({ book: 1, status: 1 });
borrowRecordSchema.index({ status: 1, dueDate: 1 });

export default mongoose.model('BorrowRecord', borrowRecordSchema);
