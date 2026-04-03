const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');
const User = require('../models/User');
const Booking = require('../models/Booking');

const connectDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI is missing in environment variables');
  }

  await mongoose.connect(env.mongoUri);

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
  logger.info('MongoDB connected successfully');
};

module.exports = connectDatabase;
