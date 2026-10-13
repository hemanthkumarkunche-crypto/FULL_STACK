import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['DUE_REMINDER', 'OVERDUE_ALERT', 'HOLD_READY', 'FINE_INCURRED', 'BORROW_SUCCESS', 'GENERAL'],
    default: 'GENERAL'
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  channel: { type: String, enum: ['IN_APP', 'EMAIL'], default: 'IN_APP' },
  isRead: { type: Boolean, default: false }
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
