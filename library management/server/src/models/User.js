import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: () => 'LIB-' + Math.floor(100000 + Math.random() * 900000)
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['MEMBER', 'LIBRARIAN', 'ADMIN'],
    default: 'MEMBER'
  },
  phone: { type: String, default: '' },
  accountStatus: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
    default: 'ACTIVE'
  },
  borrowQuota: { type: Number, default: 5 },
  totalFinesDue: { type: Number, default: 0 }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
