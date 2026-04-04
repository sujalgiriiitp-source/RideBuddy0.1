require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./src/routes');
const logger = require('./src/config/logger');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api', apiLimiter);

app.get('/api', (req, res) => {
  res.status(200).json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      logger.warn('MONGO_URI is missing; starting without MongoDB connection');
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
  }
};

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

startServer();