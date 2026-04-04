require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./src/routes');
const connectDatabase = require('./src/config/database');
const env = require('./src/config/env');
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
  res.status(200).json({
    success: true,
    message: 'RideBuddy API',
    data: null
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    if (!env.jwtSecret) {
      throw new Error('JWT_SECRET is missing in environment variables');
    }

    await connectDatabase();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

startServer();