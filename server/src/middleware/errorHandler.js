const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Something went wrong';

  if (err.code === 11000) {
    statusCode = StatusCodes.CONFLICT;
    const duplicateField = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `${duplicateField} is already in use`;
  }

  logger.error(err.stack || message);

  return res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
};

module.exports = errorHandler;
