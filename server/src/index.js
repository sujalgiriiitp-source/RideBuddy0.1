const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const connectDatabase = require('./config/database');

const startServer = async () => {
  try {
    if (!env.jwtSecret) {
      throw new Error('JWT_SECRET is missing in environment variables');
    }

    await connectDatabase();

    const preferredPort = Number(process.env.PORT) || env.port || 5001;
    const maxPortAttempts = 10;

    const createServerWithRetry = async () => {
      let attempt = 0;

      while (attempt < maxPortAttempts) {
        const currentPort = preferredPort + attempt;

        const server = await new Promise((resolve, reject) => {
          const httpServer = app.listen(currentPort, () => resolve(httpServer));
          httpServer.on('error', (error) => reject(error));
        }).catch((error) => {
          if (error.code === 'EADDRINUSE') {
            logger.warn(`Port ${currentPort} is in use. Retrying with port ${currentPort + 1}...`);
            return null;
          }

          throw error;
        });

        if (server) {
          logger.info(`Server running on port ${currentPort}`);
          return server;
        }

        attempt += 1;
      }

      throw new Error(`Unable to start server: ports ${preferredPort}-${preferredPort + maxPortAttempts - 1} are unavailable`);
    };

    const server = await createServerWithRetry();

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
