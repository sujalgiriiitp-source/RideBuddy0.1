require('dotenv').config();

const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
const routes = require('./src/routes');
const bookingRoutes = require('./src/routes/bookings');
const logger = require('./src/config/logger');
const { setSocketServer } = require('./src/config/socket');
const setupRideTrackingSocket = require('./src/socket/rideTrackingSocket');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api', apiLimiter);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 RideBuddy API is LIVE'
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true });
});

app.use('/api/bookings', bookingRoutes);
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildMongoTroubleshootingHints = (mongoUri, message) => {
  const hints = [];
  const credentialsPart = (mongoUri.split('://')[1] || '').split('@')[0] || '';

  let decodedCredentials = credentialsPart;
  try {
    decodedCredentials = decodeURIComponent(credentialsPart);
  } catch (_error) {
    decodedCredentials = credentialsPart;
  }

  if (!mongoUri.includes('mongodb+srv://') && !mongoUri.includes('mongodb://')) {
    hints.push('MONGO_URI must start with mongodb+srv:// or mongodb://');
  }

  if (mongoUri.includes('@') && /[:/\\?#[\]@]/.test(decodedCredentials)) {
    hints.push('If your password contains special characters, URL-encode it (e.g., @ -> %40, # -> %23)');
  }

  if (/not authorized|Authentication failed|bad auth|auth failed/i.test(message)) {
    hints.push('Check MongoDB username/password and ensure password special characters are URL-encoded');
  }

  if (/IP|whitelist|ECONNREFUSED|ENOTFOUND|timed out|server selection/i.test(message)) {
    hints.push('In MongoDB Atlas Network Access, allow your Render IPs or temporarily 0.0.0.0/0');
  }

  return hints;
};

const connectDBWithRetry = async ({ maxRetries = 3, baseDelayMs = 2000 } = {}) => {
  const mongoUri = (process.env.MONGO_URI || '').trim();

  if (!mongoUri) {
    throw new Error('MONGO_URI is required. Set process.env.MONGO_URI before starting the server.');
  }

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      logger.info(`MongoDB connection attempt ${attempt}/${maxRetries}`);

      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4
      });

      logger.info('MongoDB Connected');
      return;
    } catch (error) {
      lastError = error;
      const message = error?.message || 'Unknown MongoDB connection error';
      logger.error(`MongoDB Connection Failed (attempt ${attempt}/${maxRetries}): ${message}`);

      const hints = buildMongoTroubleshootingHints(mongoUri, message);
      hints.forEach((hint) => logger.warn(`MongoDB hint: ${hint}`));

      if (attempt < maxRetries) {
        const waitMs = baseDelayMs * attempt;
        logger.info(`Retrying MongoDB connection in ${waitMs}ms...`);
        await sleep(waitMs);
      }
    }
  }

  throw new Error(`Unable to connect to MongoDB after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
};

const startServer = async () => {
  try {
    await connectDBWithRetry();

    const PORT = process.env.PORT || 5000;
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    setSocketServer(io);
    setupRideTrackingSocket(io);

    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server Started on port ${PORT}`);
      logger.info('Socket.io tracking server initialized');
    });
  } catch (error) {
    logger.error(`MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();