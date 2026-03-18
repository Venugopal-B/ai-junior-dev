import assert from 'node:assert/strict';
import {
  buildInputSummary,
  buildOutputSummary,
  buildUniversalOutputSummary,
} from './analysisSummary.service';

export async function runAnalysisSummaryTests(): Promise<void> {
  const inputSummary = buildInputSummary('utils.ts', 'const a = 1;\nconst b = 2;');
  assert.equal(inputSummary, 'utils.ts (2 lines)');

  assert.equal(
    buildOutputSummary('analyze', { issues: [{ title: 'bug' }, { title: 'bug-2' }] }),
    'Found 2 issue(s)'
  );
  assert.equal(
    buildOutputSummary('generate-tests', { scenarios: [{ name: 'a' }] }),
    'Generated 1 test scenario(s)'
  );
  assert.equal(
    buildOutputSummary('suggest-fix', { fixes: [{ title: 'fix' }] }),
    'Suggested 1 fix(es)'
  );
  assert.equal(
    buildOutputSummary('explain', { summary: 'Clear explanation' }),
    'Clear explanation'
  );

  const universalSummary = buildUniversalOutputSummary({
    explain: {
      summary: 'Explains the file',
      keyFunctions: [],
      responsibilities: [],
      riskyAreas: [],
    },
    analyze: {
      summary: 'Bug scan',
      issues: [{ title: 'Race condition', severity: 'high', explanation: '...', affectedArea: 'run', suggestedAction: 'lock' }],
    },
    'generate-tests': {
      summary: 'Test generation',
      framework: 'Jest',
      scenarios: [
        { name: 'happy path', description: 'works', covered: true },
        { name: 'edge case', description: 'still works', covered: false },
      ],
      generatedTestCode: 'describe("x", () => {});',
    },
    'suggest-fix': {
      summary: 'Fixes',
      fixes: [{ title: 'Guard clause', explanation: 'Add validation', originalCode: 'a', suggestedCode: 'b', diffSummary: 'added guard' }],
    },
  });

  assert.equal(
    universalSummary,
    'Explained code, found 1 issue(s), generated 2 test scenario(s), suggested 1 fix(es)'
  );
}
