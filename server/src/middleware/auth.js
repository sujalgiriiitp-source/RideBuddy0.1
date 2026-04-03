const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication token missing'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid authentication token'));
    }

    req.user = user;
    return next();
  } catch (_error) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token'));
  }
};

module.exports = auth;
