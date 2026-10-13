import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reservedAt: { type: Date, default: Date.now },
  readyForPickupAt: { type: Date, default: null },
  pickupDeadline: { type: Date, default: null },
  queuePosition: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['WAITING', 'READY_FOR_PICKUP', 'FULFILLED', 'EXPIRED', 'CANCELLED'],
    default: 'WAITING'
  }
}, {
  timestamps: true
});

reservationSchema.index({ book: 1, queuePosition: 1 });
reservationSchema.index({ user: 1, status: 1 });

export default mongoose.model('Reservation', reservationSchema);
