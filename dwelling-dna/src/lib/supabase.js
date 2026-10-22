import { createClient } from '@supabase/supabase-js';

// Both values are public by design — the publishable key only ever reaches
// tables that RLS already opens to anonymous readers. They are defaulted here
// rather than left to the build environment alone: when the deploy workflow's
// repository variables went stale, the published site pointed at a project that
// no longer existed and the book would not open at all.
const DEFAULT_URL = 'https://ktqmwpbzcnzkhjskqisy.supabase.co';
const DEFAULT_KEY = 'sb_publishable_IkreG7naPa1h-d4kGp1gpA_sLU4tg5q';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── The editor key ──────────────────────────────────────────────────────────
// Email sign-in returns to the shared project's Site URL, which belongs to
// another app, so the editor is recognised by a personal key instead. It
// arrives once per device in the link's hash (#editor=...), never reaches a
// server log, and is kept in this browser.

const EDITOR_KEY = 'architaip:editor';

export function getEditorKey() {
  try { return localStorage.getItem(EDITOR_KEY) || ''; } catch { return ''; }
}

export function setEditorKey(key) {
  try {
    if (key) localStorage.setItem(EDITOR_KEY, key);
    else localStorage.removeItem(EDITOR_KEY);
  } catch { /* private mode: the key lasts for this page only */ }
}

/** Accepts the whole editor link or the key alone. */
export function parseEditorKey(text) {
  const t = String(text ?? '').trim();
  const fromLink = t.match(/editor=([\w-]{16,})/)?.[1];
  if (fromLink) return fromLink;
  return /^[\w-]{16,}$/.test(t) ? t : '';
}

/** Takes the key out of the address bar, so a copied link never carries it. */
export function captureEditorKeyFromUrl() {
  const key = parseEditorKey(window.location.hash);
  if (!key) return '';
  setEditorKey(key);
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  return key;
}

/** Headers for the Edge Functions: the editor key when there is one, and the
 *  user's session token rather than the publishable key when signed in. */
export async function functionHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? SUPABASE_ANON_KEY;
  const key = getEditorKey();
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    ...(key ? { 'x-editor-key': key } : {}),
  };
}

/** Every write goes through architaip-edit, which checks the editor first.
 *  Returns { data, error } like a Supabase call, so callers treat both alike. */
export async function edit(action, payload = {}) {
  try {
    const res = await fetch(`${SUPABASE_URL.replace(/\/+$/, '')}/functions/v1/architaip-edit`, {
      method: 'POST',
      headers: await functionHeaders(),
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { data: null, error: { code: res.status === 403 ? '42501' : String(res.status), message: data?.error || `שגיאה ${res.status}` } };
    }
    return { data, error: null };
  } catch {
    return { data: null, error: { code: 'network', message: 'אין חיבור לשרת' } };
  }
}
