import { callAI, parseJSONResponse } from './provider.service';
import { FixSuggestionResult } from '../../types';

const SYSTEM_PROMPT = `You are a code improvement specialist who suggests targeted fixes.
Analyze the provided code and return ONLY valid JSON — no markdown fences, no preamble — with this shape:
{
  "summary": "overview of suggested improvements",
  "fixes": [
    {
      "title": "fix title",
      "explanation": "why this fix is needed and what it improves",
      "originalCode": "the original problematic code snippet",
      "suggestedCode": "the improved code snippet",
      "diffSummary": "one-line description of the change"
    }
  ]
}
Focus on: bug fixes, null safety, error handling improvements, performance, readability.`;

export async function suggestFixes(fileName: string, code: string): Promise<FixSuggestionResult> {
  const userContent = `File: ${fileName}\n\nCode:\n${code}`;
  const raw = await callAI(SYSTEM_PROMPT, userContent, 2500);
  return parseJSONResponse<FixSuggestionResult>(raw);
}
