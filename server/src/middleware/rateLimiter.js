const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const isDevelopment = env.nodeEnv !== 'production';

const buildLimiterHandler = (message) => (req, res) => {
  return res.status(429).json({
    success: false,
    message,
    data: {
      retryAfterSeconds: Math.ceil((req.rateLimit?.resetTime ? req.rateLimit.resetTime.getTime() - Date.now() : 0) / 1000)
    }
  });
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 10000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  validate: {
    xForwardedForHeader: false
  },
  skipSuccessfulRequests: isDevelopment,
  skip: () => isDevelopment,
  handler: buildLimiterHandler('Too many authentication attempts. Please try again later.')
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 5000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  validate: {
    xForwardedForHeader: false
  },
  skip: () => isDevelopment,
  handler: buildLimiterHandler('Too many requests. Please try again later.')
});

module.exports = {
  authLimiter,
  apiLimiter
};
