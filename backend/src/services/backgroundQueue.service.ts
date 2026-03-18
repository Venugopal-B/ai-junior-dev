import { randomUUID } from 'crypto';

export type BackgroundJobStatus = 'queued' | 'running' | 'success' | 'failed';

export interface BackgroundJobSnapshot<TResult> {
  id: string;
  status: BackgroundJobStatus;
  enqueuedAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: TResult;
}

interface BackgroundJob<TResult, TPayload> extends BackgroundJobSnapshot<TResult> {
  payload: TPayload;
}

export class InMemoryBackgroundQueue<TPayload, TResult> {
  private readonly jobs = new Map<string, BackgroundJob<TResult, TPayload>>();
  private readonly pendingJobIds: string[] = [];
  private activeCount = 0;

  constructor(
    private readonly handler: (payload: TPayload) => Promise<TResult>,
    private readonly maxConcurrency = 2,
    private readonly maxJobs = 200
  ) {}

  enqueue(payload: TPayload): BackgroundJobSnapshot<TResult> {
    const job: BackgroundJob<TResult, TPayload> = {
      id: randomUUID(),
      payload,
      status: 'queued',
      enqueuedAt: new Date().toISOString(),
    };

    this.jobs.set(job.id, job);
    this.pendingJobIds.push(job.id);
    queueMicrotask(() => {
      void this.processQueue();
    });

    return this.snapshot(job);
  }

  get(jobId: string): BackgroundJobSnapshot<TResult> | null {
    const job = this.jobs.get(jobId);
    return job ? this.snapshot(job) : null;
  }

  private snapshot(job: BackgroundJob<TResult, TPayload>): BackgroundJobSnapshot<TResult> {
    return {
      id: job.id,
      status: job.status,
      enqueuedAt: job.enqueuedAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
      result: job.result,
    };
  }

  private async processQueue(): Promise<void> {
    while (this.activeCount < this.maxConcurrency && this.pendingJobIds.length > 0) {
      const jobId = this.pendingJobIds.shift();
      if (!jobId) {
        return;
      }

      const job = this.jobs.get(jobId);
      if (!job || job.status !== 'queued') {
        continue;
      }

      this.activeCount += 1;
      job.status = 'running';
      job.startedAt = new Date().toISOString();

      void this.runJob(job).finally(() => {
        this.activeCount -= 1;
        this.trimCompletedJobs();
        void this.processQueue();
      });
    }
  }

  private async runJob(job: BackgroundJob<TResult, TPayload>): Promise<void> {
    try {
      job.result = await this.handler(job.payload);
      job.status = 'success';
    } catch (err) {
      job.error = err instanceof Error ? err.message : 'Background job failed';
      job.status = 'failed';
    } finally {
      job.completedAt = new Date().toISOString();
    }
  }

  private trimCompletedJobs(): void {
    if (this.jobs.size <= this.maxJobs) {
      return;
    }

    const completedJobs = [...this.jobs.values()]
      .filter((job) => job.status === 'success' || job.status === 'failed')
      .sort((a, b) => {
        const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return aTime - bTime;
      });

    while (this.jobs.size > this.maxJobs && completedJobs.length > 0) {
      const job = completedJobs.shift();
      if (job) {
        this.jobs.delete(job.id);
      }
    }
  }
}
