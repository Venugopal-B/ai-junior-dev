import { AIRunResultsMap, RunType } from '../../types';

export function buildInputSummary(fileName: string, code: string): string {
  return `${fileName} (${code.split('\n').length} lines)`;
}

export function buildOutputSummary(runType: RunType, result: Record<string, unknown>): string {
  if (runType === 'analyze') {
    const issues = (result.issues as unknown[])?.length ?? 0;
    return `Found ${issues} issue(s)`;
  }

  if (runType === 'generate-tests') {
    const scenarios = (result.scenarios as unknown[])?.length ?? 0;
    return `Generated ${scenarios} test scenario(s)`;
  }

  if (runType === 'suggest-fix') {
    const fixes = (result.fixes as unknown[])?.length ?? 0;
    return `Suggested ${fixes} fix(es)`;
  }

  return (result.summary as string) ?? 'Analysis complete';
}

export function buildUniversalOutputSummary(results: AIRunResultsMap): string {
  const issueCount = results.analyze.issues?.length ?? 0;
  const scenarioCount = results['generate-tests'].scenarios?.length ?? 0;
  const fixCount = results['suggest-fix'].fixes?.length ?? 0;

  return `Explained code, found ${issueCount} issue(s), generated ${scenarioCount} test scenario(s), suggested ${fixCount} fix(es)`;
}
