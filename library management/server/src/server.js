import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import circulationRoutes from './routes/circulationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import BorrowRecord from './models/BorrowRecord.js';
import Notification from './models/Notification.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Overdue checker worker
const checkOverdueLoans = async () => {
  try {
    const overdueLoans = await BorrowRecord.find({
      status: 'BORROWED',
      dueDate: { $lt: new Date() }
    }).populate('book user');

    for (const loan of overdueLoans) {
      loan.status = 'OVERDUE';
      const daysOverdue = Math.ceil((Date.now() - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24));
      loan.fine.amount = daysOverdue * 1.0;
      loan.fine.calculatedDaysOverdue = daysOverdue;
      await loan.save();

      // Check if alert already sent today
      const alreadyNotified = await Notification.findOne({
        recipient: loan.user._id,
        type: 'OVERDUE_ALERT',
        createdAt: { $gte: new Date(Date.now() - 24 * 3600 * 1000) }
      });

      if (!alreadyNotified) {
        await Notification.create({
          recipient: loan.user._id,
          type: 'OVERDUE_ALERT',
          title: 'Overdue Book Alert',
          message: `Your loan for "${loan.book?.title || 'Book'}" is ${daysOverdue} days overdue. Daily fine of $1.00 is active.`
        });
      }
    }
  } catch (err) {
    console.error('[Worker] Overdue checker error:', err.message);
  }
};

// Check overdue periodically
setInterval(checkOverdueLoans, 60 * 60 * 1000); // Hourly
setTimeout(checkOverdueLoans, 5000); // Initial 5s delay

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/circulation', circulationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    service: 'Online Library Management API'
  });
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`[API Server] Running on http://localhost:${PORT}`);
});
