/**
 * Robustly extract and parse JSON from a Claude response.
 * Handles: markdown fences, trailing commas, unescaped newlines inside strings.
 */
export function parseClaudeJson(text) {
  // 1. Strip markdown code fences
  let cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();

  // 2. Find outermost { ... }
  const start = cleaned.indexOf('{');
  if (start === -1) throw new Error('No JSON object found in response');
  // Walk to find matching closing brace
  let depth = 0;
  let end = -1;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === '{') depth++;
    else if (cleaned[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error('Unterminated JSON object in response');
  let json = cleaned.slice(start, end + 1);

  // 3. Remove trailing commas before } or ]
  json = json.replace(/,\s*([}\]])/g, '$1');

  // 4. Escape unescaped newlines/tabs inside JSON string values
  // Replace literal newlines inside quoted strings with \n
  json = json.replace(/"((?:[^"\\]|\\.)*)"/gs, (_, inner) => {
    const fixed = inner
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return `"${fixed}"`;
  });

  try {
    return JSON.parse(json);
  } catch (e) {
    // Last resort: try to remove problematic characters
    const stripped = json.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
    return JSON.parse(stripped);
  }
}
