import type { GenerateResult } from "@/types";

export function parseGenerateResult(raw: string): GenerateResult {
  let cleaned = raw.trim();

  // Strip model thinking tags (e.g., <think>...</think>)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  // Try parsing directly
  try {
    return validateResult(JSON.parse(cleaned));
  } catch {
    // Attempt repairs
  }

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  try {
    return validateResult(JSON.parse(cleaned));
  } catch {
    // Try to extract JSON object from mixed text
  }

  // Find outermost JSON object boundaries
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonStr = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      return validateResult(JSON.parse(jsonStr));
    } catch {
      // Try with trailing comma fix
    }
    const fixed = jsonStr.replace(/,\s*([}\]])/g, "$1");
    try {
      return validateResult(JSON.parse(fixed));
    } catch (e) {
      throw new Error(`Failed to parse LLM response: ${(e as Error).message}`);
    }
  }

  throw new Error("Failed to parse LLM response: no valid JSON found");
}

function validateResult(data: unknown): GenerateResult {
  const obj = data as Record<string, unknown>;
  if (!obj.matchAnalysis || !obj.questions) {
    throw new Error("Missing required fields: matchAnalysis or questions");
  }

  const ma = obj.matchAnalysis as Record<string, unknown>;
  if (typeof ma.score !== "number" || !Array.isArray(ma.strengths) || !Array.isArray(ma.gaps) || typeof ma.summary !== "string") {
    throw new Error("Invalid matchAnalysis structure");
  }

  if (!Array.isArray(obj.questions) || obj.questions.length === 0) {
    throw new Error("Questions must be a non-empty array");
  }

  return obj as unknown as GenerateResult;
}
