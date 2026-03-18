import { Request, Response } from 'express';
import { getFileById } from '../services/file.service';
import { createRun, completeRun } from '../services/run.service';
import { explainCode } from '../services/ai/explain.service';
import { analyzeBugs } from '../services/ai/analyze.service';
import { generateTests } from '../services/ai/generateTests.service';
import { suggestFixes } from '../services/ai/suggestFix.service';
import { aiRequestSchema } from '../validations/ai.validation';
import { sendCreated, sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { RunType } from '../types';
import { logger } from '../utils/logger';
import { enqueueUniversalRunJob } from '../services/aiRunQueue.service';
import {
  buildInputSummary,
  buildOutputSummary,
  buildUniversalOutputSummary,
} from '../services/ai/analysisSummary.service';
import { executeUniversalRun } from '../services/ai/universalRun.service';

async function runAIAction<T extends object>(
  req: Request,
  res: Response,
  runType: RunType,
  handler: (fileName: string, code: string) => Promise<T>
): Promise<void> {
  const { body } = aiRequestSchema.parse({ body: req.body });
  const file = await getFileById(body.fileId, req.user!.userId);

  const run = await createRun(
    body.projectId,
    body.fileId,
    runType,
    buildInputSummary(file.file_name, file.content)
  );

  try {
    logger.info(`AI run started: ${runType} on ${file.file_name}`);
    const result = await handler(file.file_name, file.content);
    const outputSummary = buildOutputSummary(runType, result as Record<string, unknown>);
    const completedRun = await completeRun(
      run.id,
      'success',
      outputSummary,
      result as unknown as Record<string, unknown>
    );

    sendSuccess(res, { run: completedRun, result });
    return;
  } catch (err) {
    await completeRun(run.id, 'failed', 'AI analysis failed', {});
    throw err;
  }
}

async function runUniversalAIAction(req: Request, res: Response): Promise<void> {
  const { body } = aiRequestSchema.parse({ body: req.body });
  const file = await getFileById(body.fileId, req.user!.userId);

  const run = await createRun(
    body.projectId,
    body.fileId,
    'analyze',
    buildInputSummary(file.file_name, file.content)
  );

  try {
    logger.info(`AI run started: universal on ${file.file_name}`);
    const result = await executeUniversalRun(file.file_name, file.content);
    const outputSummary = buildUniversalOutputSummary(result.results);
    const completedRun = await completeRun(
      run.id,
      'success',
      outputSummary,
      result as unknown as Record<string, unknown>
    );

    sendSuccess(res, { run: completedRun, result });
    return;
  } catch (err) {
    await completeRun(run.id, 'failed', 'Universal AI run failed', {});
    throw err;
  }
}

async function queueUniversalAIAction(req: Request, res: Response): Promise<void> {
  const { body } = aiRequestSchema.parse({ body: req.body });
  const file = await getFileById(body.fileId, req.user!.userId);

  const run = await createRun(
    body.projectId,
    body.fileId,
    'analyze',
    buildInputSummary(file.file_name, file.content)
  );

  const job = await enqueueUniversalRunJob({
    runId: run.id,
    fileName: file.file_name,
    code: file.content,
  });

  sendCreated(res, { jobId: job.id, status: job.status, run }, 'Background AI run started');
}

export const explain = asyncHandler((req, res) =>
  runAIAction(req, res, 'explain', explainCode)
);

export const analyze = asyncHandler((req, res) =>
  runAIAction(req, res, 'analyze', analyzeBugs)
);

export const generateTestsCtrl = asyncHandler((req, res) =>
  runAIAction(req, res, 'generate-tests', generateTests)
);

export const suggestFixCtrl = asyncHandler((req, res) =>
  runAIAction(req, res, 'suggest-fix', suggestFixes)
);

export const runAll = asyncHandler((req, res) =>
  runUniversalAIAction(req, res)
);

export const runAllAsync = asyncHandler((req, res) =>
  queueUniversalAIAction(req, res)
);
