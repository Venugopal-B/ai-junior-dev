import { runAnalysisSummaryTests } from '../services/ai/analysisSummary.service.test';
import { runBackgroundQueueTests } from '../services/backgroundQueue.service.test';

type TestCase = {
  name: string;
  run: () => Promise<void>;
};

const tests: TestCase[] = [
  { name: 'analysis summary helpers', run: runAnalysisSummaryTests },
  { name: 'background queue lifecycle', run: runBackgroundQueueTests },
];

async function main(): Promise<void> {
  let failures = 0;

  for (const testCase of tests) {
    try {
      await testCase.run();
      console.log(`PASS ${testCase.name}`);
    } catch (err) {
      failures += 1;
      console.error(`FAIL ${testCase.name}`);
      console.error(err);
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(`PASS ${tests.length} test group(s)`);
}

void main();
