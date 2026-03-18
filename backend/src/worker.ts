import { connectDB } from './config/db';
import { env } from './config/env';
import { closeAiRunWorker, startAiRunWorker } from './services/aiRunQueue.service';
import { logger } from './utils/logger';

async function bootstrapWorker(): Promise<void> {
  await connectDB();
  await startAiRunWorker();

  logger.info(`AI worker started [${env.NODE_ENV}] with driver=${env.QUEUE_DRIVER}`);

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received - shutting down AI worker gracefully`);
    await closeAiRunWorker();
    process.exit(0);
  };

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection in worker', reason);
    process.exit(1);
  });
}

bootstrapWorker().catch((err) => {
  console.error('Failed to start AI worker:', err);
  process.exit(1);
});
