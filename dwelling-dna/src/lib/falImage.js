/**
 * Client for the fal.ai image proxy (Supabase Edge Function).
 * The fal.ai credentials stay on the server.
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

export const FAL_ENDPOINT = SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/+$/, '')}/functions/v1/architaip-fal-image`
  : '';

/** True when the app knows where to send image-generation requests. */
export const falReady = !!FAL_ENDPOINT;

/**
 * @param {string} prompt  English image prompt
 * @returns {Promise<string>} URL of the generated image
 */
export async function generateImage(prompt, { cultureId, spaceId } = {}) {
  if (!falReady) throw new Error('שירות יצירת התמונות אינו מוגדר.');

  let response;
  try {
    response = await fetch(FAL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ prompt, cultureId, spaceId }),
    });
  } catch {
    throw new Error('אין חיבור לשירות יצירת התמונות — ייתכן שהפונקציה architaip-fal-image עדיין לא הותקנה בשרת.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('מפתח fal.ai בשרת אינו תקף.');
    }
    throw new Error(data?.error || `שגיאה ${response.status} ביצירת התמונה.`);
  }

  if (!data?.url) throw new Error('לא התקבלה תמונה.');
  return data.url;
}
