import { callAI, parseJSONResponse } from './provider.service';
import { CodeExplanationResult } from '../../types';

const SYSTEM_PROMPT = `You are a senior software engineer helping developers understand code.
Analyze the provided code and return ONLY valid JSON — no markdown fences, no preamble — with this exact shape:
{
  "summary": "2-3 sentence plain-English overview of what this code does",
  "keyFunctions": [{ "name": "functionOrClassName", "description": "concise description" }],
  "responsibilities": ["responsibility 1", "responsibility 2"],
  "riskyAreas": [{ "area": "function/section name", "risk": "specific risk explanation" }]
}`;

export async function explainCode(fileName: string, code: string): Promise<CodeExplanationResult> {
  const userContent = `File: ${fileName}\n\nCode:\n${code}`;
  const raw = await callAI(SYSTEM_PROMPT, userContent, 1500);
  return parseJSONResponse<CodeExplanationResult>(raw);
}
