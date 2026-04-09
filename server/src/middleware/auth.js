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
    req.userId = decoded.userId || decoded.id || decoded._id || user._id;
    return next();
  } catch (_error) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token'));
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to perform this action'));
    }

    return next();
  };
};

module.exports = auth;
module.exports.authorizeRoles = authorizeRoles;
