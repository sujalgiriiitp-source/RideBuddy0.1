const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');
const routes = require('./routes');
const env = require('./config/env');
const logger = require('./config/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:19006',
  'http://127.0.0.1:19006'
];

const configuredOrigins = env.clientOrigin === '*'
  ? ['*']
  : String(env.clientOrigin)
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

const allowedOrigins = configuredOrigins.includes('*')
  ? ['*']
  : Array.from(new Set([...defaultAllowedOrigins, ...configuredOrigins]));

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api', apiLimiter);

app.get('/health', (req, res) => {
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
