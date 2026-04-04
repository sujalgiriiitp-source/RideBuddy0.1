const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');
const routes = require('./routes');
const logger = require('./config/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'RideBuddy API is healthy',
    data: null
  });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

process.on('unhandledRejection', (error) => {
  logger.error(`Unhandled rejection: ${error.message}`);
});

module.exports = app;
