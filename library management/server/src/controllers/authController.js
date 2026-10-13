import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// @route   POST /api/v1/auth/register
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role && ['MEMBER', 'LIBRARIAN', 'ADMIN'].includes(role) ? role : 'MEMBER',
      phone: phone || ''
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        memberId: user.memberId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        borrowQuota: user.borrowQuota,
        totalFinesDue: user.totalFinesDue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/v1/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, id, memberId, password } = req.body;
    const identifier = email || id || memberId;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide ID and password' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { memberId: identifier }
      ]
    });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid ID or password' });
    }

    if (user.accountStatus === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Account is suspended. Please contact library desk.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        memberId: user.memberId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        borrowQuota: user.borrowQuota,
        totalFinesDue: user.totalFinesDue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/v1/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/v1/auth/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
