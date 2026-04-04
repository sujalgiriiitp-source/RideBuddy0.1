const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const connectDatabase = require('./config/database');
const { setSocketServer } = require('./config/socket');
const setupRideTrackingSocket = require('./socket/rideTrackingSocket');
const setupChatSocket = require('./socket/chatSocket');

const startServer = async () => {
  try {
    if (!env.jwtSecret) {
      throw new Error('JWT_SECRET is missing in environment variables');
    }

    await connectDatabase();
    const port = Number(process.env.PORT) || env.port || 5002;

    const server = await new Promise((resolve, reject) => {
      const httpServer = http.createServer(app);
      const io = new Server(httpServer, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      });

      setSocketServer(io);
      setupRideTrackingSocket(io);
      setupChatSocket(io);

      httpServer.listen(port, () => resolve(httpServer));
      httpServer.on('error', (error) => reject(error));
    }).catch((error) => {
      if (error.code === 'EADDRINUSE') {
        throw new Error(`Port ${port} is already in use. Stop the conflicting process and restart the server.`);
      }

      throw error;
    });

    logger.info(`Server running on port ${port}`);
  logger.info('Socket.io tracking server initialized');

    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down server...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

startServer();
