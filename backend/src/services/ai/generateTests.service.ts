import { callAI, parseJSONResponse } from './provider.service';
import { TestGenerationResult } from '../../types';

const SYSTEM_PROMPT = `You are a testing expert who writes comprehensive unit tests.
Analyze the provided code and return ONLY valid JSON — no markdown fences, no preamble — with this shape:
{
  "summary": "overview of test coverage",
  "framework": "Jest",
  "scenarios": [
    { "name": "test scenario name", "description": "what this test verifies", "covered": true }
  ],
  "generatedTestCode": "// Full Jest test file as a JSON string with escaped newlines like \\n"
}
Include: happy paths, edge cases, error cases, boundary values. Write real runnable Jest/TypeScript test code.
Important: every string value must be valid JSON, especially generatedTestCode.`;

export async function generateTests(fileName: string, code: string): Promise<TestGenerationResult> {
  const userContent = `File: ${fileName}\n\nCode:\n${code}`;
  const raw = await callAI(SYSTEM_PROMPT, userContent, 2500);
  return parseJSONResponse<TestGenerationResult>(raw);
}
