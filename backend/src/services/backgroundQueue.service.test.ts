import assert from 'node:assert/strict';
import { InMemoryBackgroundQueue } from './backgroundQueue.service';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function runBackgroundQueueTests(): Promise<void> {
  const queue = new InMemoryBackgroundQueue(async (payload: { value: number }) => {
    await wait(5);
    return payload.value * 2;
  }, 1);

  const queuedJob = queue.enqueue({ value: 21 });
  assert.equal(queuedJob.status, 'queued');

  await wait(30);

  const completedJob = queue.get(queuedJob.id);
  assert.ok(completedJob);
  assert.equal(completedJob.status, 'success');
  assert.equal(completedJob.result, 42);
  assert.ok(completedJob.startedAt);
  assert.ok(completedJob.completedAt);

  const failingQueue = new InMemoryBackgroundQueue(async () => {
    await wait(5);
    throw new Error('boom');
  }, 1);

  const failedJobSeed = failingQueue.enqueue({});
  await wait(30);

  const failedJob = failingQueue.get(failedJobSeed.id);
  assert.ok(failedJob);
  assert.equal(failedJob.status, 'failed');
  assert.equal(failedJob.error, 'boom');
}
