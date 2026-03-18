import { connectDB } from './config/db';
import { env } from './config/env';
import { closeAiRunQueueProducer } from './services/aiRunQueue.service';
import { logger } from './utils/logger';
import app from './app';

async function bootstrap(): Promise<void> {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received - shutting down gracefully`);
    server.close(async () => {
      await closeAiRunQueueProducer();
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', reason);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
