// Utilities to normalize incoming text so JSON-like content parses reliably
// and to detect code/JSON so we can avoid styling it before sending.

/**
 * Normalize unicode to improve JSON parsing:
 * - NFKC fold to convert fancy alphabets (e.g., mathematical script) to ASCII
 * - Remove zero-width chars
 * - Replace smart quotes with ASCII quotes
 */
export function normalizeForJsonish(input: string): string {
  if (!input) return input;
  // Unicode normalization to convert compatibility characters to canonical forms
  let s = input.normalize('NFKC');
  // Remove zero-width joiners/space and BOMs
  s = s.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
  // Normalize smart quotes to ASCII
  s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  return s;
}

/**
 * Heuristic: detect if the text likely contains code or JSON so we can skip styling.
 */
export function isCodeOrJson(text: string): boolean {
  if (!text) return false;
  const t = text.trim();
  if (/```/.test(t)) return true; // fenced code block
  if (/^\{[\s\S]*\}$/.test(t)) return true; // looks like a JSON object
  if (/^\[[\s\S]*\]$/.test(t)) return true; // looks like a JSON array
  if (/\"action\"\s*:\s*\"[a-zA-Z0-9_\-]+\"/.test(t)) return true; // common command payloads
  return false;
}
