import { Queue, Worker } from 'bullmq';
import { env } from '../config/env';
import { getRedisConnectionOptions } from '../config/redis';
import { completeRun } from './run.service';
import { InMemoryBackgroundQueue } from './backgroundQueue.service';
import { buildUniversalOutputSummary } from './ai/analysisSummary.service';
import { executeUniversalRun } from './ai/universalRun.service';
import { UniversalRunResult } from '../types';
import { logger } from '../utils/logger';

const UNIVERSAL_RUN_QUEUE = 'universal-ai-runs';

interface UniversalRunJobPayload {
  runId: string;
  fileName: string;
  code: string;
}

interface UniversalRunJobResult {
  runId: string;
  result: UniversalRunResult;
}

interface EnqueuedJob {
  id: string;
  status: 'queued';
}

const fallbackQueue = new InMemoryBackgroundQueue<UniversalRunJobPayload, UniversalRunJobResult>(
  async ({ runId, fileName, code }) => {
    logger.info(`Fallback AI run started: ${runId} on ${fileName}`);

    try {
      const result = await executeUniversalRun(fileName, code);
      const outputSummary = buildUniversalOutputSummary(result.results);

      await completeRun(
        runId,
        'success',
        outputSummary,
        result as unknown as Record<string, unknown>
      );

      logger.info(`Fallback AI run completed: ${runId}`);
      return { runId, result };
    } catch (err) {
      await completeRun(runId, 'failed', 'Universal AI run failed', {});
      logger.error(`Fallback AI run failed: ${runId}`, err);
      throw err;
    }
  },
  env.QUEUE_CONCURRENCY
);

let queuePromise: Promise<Queue<UniversalRunJobPayload, UniversalRunJobResult> | null> | null = null;
let workerPromise: Promise<Worker<UniversalRunJobPayload, UniversalRunJobResult> | null> | null = null;

async function processUniversalRun({
  runId,
  fileName,
  code,
}: UniversalRunJobPayload): Promise<UniversalRunJobResult> {
  logger.info(`Redis AI run started: ${runId} on ${fileName}`);

  try {
    const result = await executeUniversalRun(fileName, code);
    const outputSummary = buildUniversalOutputSummary(result.results);

    await completeRun(
      runId,
      'success',
      outputSummary,
      result as unknown as Record<string, unknown>
    );

    logger.info(`Redis AI run completed: ${runId}`);
    return { runId, result };
  } catch (err) {
    await completeRun(runId, 'failed', 'Universal AI run failed', {});
    logger.error(`Redis AI run failed: ${runId}`, err);
    throw err;
  }
}

async function createRedisQueue(): Promise<Queue<UniversalRunJobPayload, UniversalRunJobResult> | null> {
  if (env.QUEUE_DRIVER === 'memory') {
    return null;
  }

  const queue = new Queue<UniversalRunJobPayload, UniversalRunJobResult>(UNIVERSAL_RUN_QUEUE, {
    connection: getRedisConnectionOptions(),
    defaultJobOptions: {
      removeOnComplete: 250,
      removeOnFail: 250,
    },
  });

  logger.info('Redis-backed AI queue producer initialized');
  return queue;
}

async function createRedisWorker(): Promise<Worker<UniversalRunJobPayload, UniversalRunJobResult> | null> {
  if (env.QUEUE_DRIVER === 'memory') {
    logger.info('QUEUE_DRIVER=memory, separate worker process is not used');
    return null;
  }

  const worker = new Worker<UniversalRunJobPayload, UniversalRunJobResult>(
    UNIVERSAL_RUN_QUEUE,
    async (job) => processUniversalRun(job.data),
    {
      connection: getRedisConnectionOptions(),
      concurrency: env.QUEUE_CONCURRENCY,
    }
  );

  worker.on('ready', () => {
    logger.info('Redis-backed AI queue worker is ready');
  });

  worker.on('error', (err) => {
    logger.error('Redis-backed AI queue worker error', err);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Redis-backed AI queue job failed: ${job?.id ?? 'unknown'}`, err);
  });

  logger.info('Redis-backed AI worker initialized');
  return worker;
}

async function getRedisQueue(): Promise<Queue<UniversalRunJobPayload, UniversalRunJobResult> | null> {
  if (!queuePromise) {
    queuePromise = createRedisQueue();
  }

  return queuePromise;
}

async function getRedisWorker(): Promise<Worker<UniversalRunJobPayload, UniversalRunJobResult> | null> {
  if (!workerPromise) {
    workerPromise = createRedisWorker();
  }

  return workerPromise;
}

export async function enqueueUniversalRunJob(payload: UniversalRunJobPayload): Promise<EnqueuedJob> {
  if (env.QUEUE_DRIVER === 'memory') {
    const job = fallbackQueue.enqueue(payload);
    return { id: job.id, status: 'queued' };
  }

  const queue = await getRedisQueue();
  if (!queue) {
    throw new Error('Redis queue is not available');
  }

  const job = await queue.add('universal-run', payload);
  return { id: String(job.id), status: 'queued' };
}

export async function startAiRunWorker(): Promise<void> {
  await getRedisWorker();
}

export async function closeAiRunQueueProducer(): Promise<void> {
  if (!queuePromise) {
    return;
  }

  const queue = await queuePromise;
  if (queue) {
    await queue.close();
  }
}

export async function closeAiRunWorker(): Promise<void> {
  if (!workerPromise) {
    return;
  }

  const worker = await workerPromise;
  if (worker) {
    await worker.close();
  }
}
