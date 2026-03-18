import { analyzeBugs } from './analyze.service';
import { explainCode } from './explain.service';
import { generateTests } from './generateTests.service';
import { suggestFixes } from './suggestFix.service';
import { AIRunResultsMap, RunType, UniversalRunResult } from '../../types';

export const runHandlers: Record<RunType, (fileName: string, code: string) => Promise<object>> = {
  explain: explainCode,
  analyze: analyzeBugs,
  'generate-tests': generateTests,
  'suggest-fix': suggestFixes,
};

function resultAsMap<T>(result: object): T {
  return result as T;
}

export async function executeUniversalRun(fileName: string, code: string): Promise<UniversalRunResult> {
  const [explain, analyze, generatedTests, suggestedFixes] = await Promise.all([
    runHandlers.explain(fileName, code),
    runHandlers.analyze(fileName, code),
    runHandlers['generate-tests'](fileName, code),
    runHandlers['suggest-fix'](fileName, code),
  ]);

  return {
    mode: 'universal',
    results: {
      explain: resultAsMap<AIRunResultsMap['explain']>(explain),
      analyze: resultAsMap<AIRunResultsMap['analyze']>(analyze),
      'generate-tests': resultAsMap<AIRunResultsMap['generate-tests']>(generatedTests),
      'suggest-fix': resultAsMap<AIRunResultsMap['suggest-fix']>(suggestedFixes),
    },
  };
}
