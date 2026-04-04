const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const Driver = require('../models/Driver');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, env.jwtSecret, { expiresIn: '7d' });
};

const signup = async ({ name, email, password, phone, role = 'user' }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email is already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const normalizedPhone = typeof phone === 'string' && phone.trim() ? phone.trim() : undefined;

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    phone: normalizedPhone
  });

  if (user.role === 'driver') {
    await Driver.findOneAndUpdate(
      { user: user._id },
      { $setOnInsert: { user: user._id, isAvailable: true } },
      { upsert: true, new: true }
    );
  }

  const token = generateToken(user._id, user.role);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt
    }
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  const token = generateToken(user._id, user.role);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt
    }
  };
};

module.exports = {
  signup,
  login
};
