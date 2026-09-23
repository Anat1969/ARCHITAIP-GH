/**
 * Client for the Claude proxy (Supabase Edge Function).
 * The API key stays on the server — nothing secret is bundled into the site.
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

export const CLAUDE_ENDPOINT = SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/+$/, '')}/functions/v1/architaip-claude`
  : '';

/** True when the app knows where to send Claude requests. */
export const claudeReady = !!CLAUDE_ENDPOINT;

/**
 * @param {object}   opts
 * @param {string}  [opts.model]      'claude-opus-5' (default) or 'claude-haiku-4-5'
 * @param {number}  [opts.maxTokens]
 * @param {string}  [opts.system]
 * @param {string}   opts.prompt      the user message
 * @returns {Promise<string>} the text of Claude's answer
 */
export async function askClaude({ model = 'claude-opus-5', maxTokens = 8000, system, prompt }) {
  if (!claudeReady) {
    throw new Error('שירות ה-AI אינו מוגדר (חסר VITE_SUPABASE_URL).');
  }

  let response;
  try {
    response = await fetch(CLAUDE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: prompt }] }),
    });
  } catch {
    throw new Error('אין חיבור לשירות ה-AI — בדקי את החיבור לאינטרנט, או שהפונקציה architaip-claude עדיין לא הותקנה בשרת.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(describeError(response.status, data?.error));
  }

  if (!data?.text) throw new Error('התקבלה תשובה ריקה מ-Claude.');
  return data.text;
}

function describeError(status, message) {
  if (status === 401 || status === 403) {
    return 'מפתח ה-API של Claude בשרת אינו תקף. יש להגדיר מפתח חדש ב-Supabase.';
  }
  if (status === 404) {
    return 'שירות המומחה עדיין לא הותקן בשרת. יש להריץ: supabase functions deploy architaip-claude';
  }
  if (status === 429) return 'יותר מדי בקשות ל-Claude. נסי שוב בעוד רגע.';
  if (status === 500 && message?.includes('ANTHROPIC_API_KEY')) {
    return 'לא הוגדר מפתח Claude בשרת. הריצי: supabase secrets set ANTHROPIC_API_KEY=...';
  }
  if (status >= 500) return 'שירות ה-AI אינו זמין כרגע. נסי שוב בעוד רגע.';
  return message || `שגיאה ${status} בפנייה ל-Claude.`;
}
