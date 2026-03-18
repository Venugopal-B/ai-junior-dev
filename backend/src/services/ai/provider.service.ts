import Groq from "groq-sdk";
import { env } from "../../config/env";
import { logger } from "../../utils/logger";

class GroqProvider {
  private client: Groq;

  constructor() {
    if (!env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");
    this.client = new Groq({ apiKey: env.GROQ_API_KEY });
  }

  async complete(systemPrompt: string, userContent: string, maxTokens = 2048): Promise<string> {
    const model = env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

    const response = await this.client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    logger.debug("Groq call complete", { model, outputChars: text.length });
    return text;
  }
}

type Provider = { complete: (sys: string, user: string, maxTokens?: number) => Promise<string> };
let providerInstance: Provider | null = null;

function getProvider(): Provider {
  if (!providerInstance) {
    providerInstance = new GroqProvider();
    logger.info("AI provider initialized: groq");
  }
  return providerInstance;
}

export async function callAI(systemPrompt: string, userContent: string, maxTokens = 2048): Promise<string> {
  return getProvider().complete(systemPrompt, userContent, maxTokens);
}

function stripMarkdownFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();
}

function extractJsonObject(raw: string): string {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return raw;
  }

  return raw.slice(start, end + 1);
}

function escapeControlCharsInStrings(raw: string): string {
  let result = "";
  let inString = false;
  let escaping = false;

  for (const char of raw) {
    if (escaping) {
      result += char;
      escaping = false;
      continue;
    }

    if (char === "\\") {
      result += char;
      escaping = true;
      continue;
    }

    if (char === "\"") {
      result += char;
      inString = !inString;
      continue;
    }

    if (inString) {
      if (char === "\n") {
        result += "\\n";
        continue;
      }
      if (char === "\r") {
        result += "\\r";
        continue;
      }
      if (char === "\t") {
        result += "\\t";
        continue;
      }

      const code = char.charCodeAt(0);
      if (code < 0x20) {
        result += `\\u${code.toString(16).padStart(4, "0")}`;
        continue;
      }
    }

    result += char;
  }

  return result;
}

export function parseJSONResponse<T>(raw: string): T {
  const cleaned = stripMarkdownFences(raw);

  try {
    return JSON.parse(cleaned) as T;
  } catch (firstError) {
    const extracted = extractJsonObject(cleaned);
    const repaired = escapeControlCharsInStrings(extracted);

    try {
      const parsed = JSON.parse(repaired) as T;
      logger.warn("Recovered malformed AI JSON response");
      return parsed;
    } catch {
      throw firstError;
    }
  }
}
