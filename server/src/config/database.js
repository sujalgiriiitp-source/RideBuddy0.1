const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');
const User = require('../models/User');
const Booking = require('../models/Booking');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const maskMongoUri = (uri = '') => {
  if (!uri) {
    return '';
  }

  return uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
};

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
    hints.push('If password contains special chars, URL-encode them (e.g., @ -> %40, # -> %23)');
  }

  if (/not authorized|Authentication failed|bad auth|auth failed/i.test(message)) {
    hints.push('Verify MongoDB username/password and encoded password in MONGO_URI');
  }

  if (/IP|whitelist|ECONNREFUSED|ENOTFOUND|timed out|server selection/i.test(message)) {
    hints.push('In MongoDB Atlas Network Access, allow Render IPs or temporarily 0.0.0.0/0');
  }

  return hints;
};

const connectDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI is missing in environment variables');
  }

  const mongoUri = String(env.mongoUri).trim();
  const maxRetries = 3;
  const baseDelayMs = 2000;
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

      logger.info(`MongoDB connected successfully (${maskMongoUri(mongoUri)})`);
      break;
    } catch (error) {
      lastError = error;
      const message = error?.message || 'Unknown MongoDB connection error';
      logger.error(`MongoDB connection failed (attempt ${attempt}/${maxRetries}): ${message}`);

      const hints = buildMongoTroubleshootingHints(mongoUri, message);
      hints.forEach((hint) => logger.warn(`MongoDB hint: ${hint}`));

      if (attempt < maxRetries) {
        const waitMs = baseDelayMs * attempt;
        logger.info(`Retrying MongoDB connection in ${waitMs}ms...`);
        await sleep(waitMs);
      }
    }
  }

  if (mongoose.connection.readyState !== 1) {
    throw new Error(`Unable to connect to MongoDB after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  const userIndexes = await User.collection.indexes();
  const legacyPhoneIndex = userIndexes.find((index) => index.name === 'phone_1' && index.unique);

  if (legacyPhoneIndex) {
    await User.collection.dropIndex('phone_1');
    logger.warn('Dropped legacy unique phone index (phone_1)');
  }

  await User.syncIndexes();

  const bookingIndexes = await Booking.collection.indexes();
  const legacyBookingIndexes = bookingIndexes.filter(
    (index) => index.unique && !['user_1_ride_1', '_id_'].includes(index.name)
  );

  for (const index of legacyBookingIndexes) {
    await Booking.collection.dropIndex(index.name);
    logger.warn(`Dropped legacy booking index (${index.name})`);
  }

  const cleanupResult = await Booking.deleteMany({
    $or: [{ user: null }, { ride: null }]
  });

  if (cleanupResult.deletedCount > 0) {
    logger.warn(`Removed ${cleanupResult.deletedCount} invalid booking records`);
  }

  await Booking.syncIndexes();
  logger.info('MongoDB indexes synced successfully');
};

module.exports = connectDatabase;
