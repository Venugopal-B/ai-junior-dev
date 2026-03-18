import { callAI, parseJSONResponse } from './provider.service';
import { BugAnalysisResult } from '../../types';

const SYSTEM_PROMPT = `You are an expert code reviewer specializing in finding bugs and code quality issues.
Analyze the provided code and return ONLY valid JSON — no markdown fences, no preamble — with this shape:
{
  "summary": "brief overview of findings",
  "issues": [
    {
      "title": "concise issue title",
      "severity": "high|medium|low",
      "explanation": "detailed explanation of the problem",
      "affectedArea": "function name or line range",
      "suggestedAction": "specific actionable fix"
    }
  ]
}
Focus on: null/undefined bugs, missing error handling, off-by-one errors, security issues, race conditions, resource leaks.`;

export async function analyzeBugs(fileName: string, code: string): Promise<BugAnalysisResult> {
  const userContent = `File: ${fileName}\n\nCode:\n${code}`;
  const raw = await callAI(SYSTEM_PROMPT, userContent, 2000);
  return parseJSONResponse<BugAnalysisResult>(raw);
}
