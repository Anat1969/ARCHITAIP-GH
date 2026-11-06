// The public fusion function: a historian on Gemini's free tier. No editor key
// is needed - every reader can fuse, and the server signs what it writes so
// only that text can be published.

import { SUPABASE_URL, functionHeaders } from './supabase';

const ENDPOINT = `${SUPABASE_URL.replace(/\/+$/, '')}/functions/v1/architaip-fusion`;

export async function fusionCall(action, payload = {}) {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      // The editor key rides along when this device has one: the server then
      // publishes the editor's own fusions at once and opens ask and approve.
      headers: await functionHeaders(),
      body: JSON.stringify({ action, ...payload }),
    });
  } catch {
    throw new Error('אין חיבור לשרת. בדקו את החיבור לאינטרנט.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `שגיאה ${res.status}`);
  return data;
}

/** The historian for the editor's tools: adding a culture, the expert chat. */
export async function askHistorian({ system = '', prompt, json = false }) {
  const data = await fusionCall('ask', { system, prompt, json });
  if (!data?.text) throw new Error('ההיסטוריון החזיר תשובה ריקה.');
  return data.text;
}
