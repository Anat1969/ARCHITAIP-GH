// The public fusion function: a historian on Gemini's free tier. No editor key
// is needed - every reader can fuse, and the server signs what it writes so
// only that text can be published.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

const ENDPOINT = `${SUPABASE_URL.replace(/\/+$/, '')}/functions/v1/architaip-fusion`;

export async function fusionCall(action, payload = {}) {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ action, ...payload }),
    });
  } catch {
    throw new Error('אין חיבור לשרת. בדקו את החיבור לאינטרנט.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `שגיאה ${res.status}`);
  return data;
}
