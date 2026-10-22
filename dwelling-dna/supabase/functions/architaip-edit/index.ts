// ARCHITAIP - every write the magazine makes.
//
// The editor is recognised by a personal editor key (sent as x-editor-key and
// stored here only as a SHA-256 hash in architaip_editor_keys), or by a
// Supabase session whose email is in architaip_admins. The key exists because
// email sign-in returns to the shared project's Site URL, which belongs to
// another app: a key opened once per device works without depending on it.
//
// Writes run with the service role after that check, so the table policies
// stay closed to the public. Uploads get a signed URL and go straight to
// storage rather than through this function.
//
// Deploy:  supabase functions deploy architaip-edit

const BUCKET = 'architaip-media';
const SESSION_ID = 'default';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-editor-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const service = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };

async function sha256(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function isEditor(req: Request): Promise<boolean> {
  try {
    const key = req.headers.get('x-editor-key') ?? '';
    if (key.length >= 16) {
      const rows = await fetch(
        `${SUPABASE_URL}/rest/v1/architaip_editor_keys?select=key_hash&key_hash=eq.${await sha256(key)}`,
        { headers: service },
      ).then((r) => r.json());
      if (Array.isArray(rows) && rows.length > 0) return true;
    }
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    if (!token) return false;
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SERVICE_KEY },
    });
    if (!userRes.ok) return false;
    const email = String((await userRes.json())?.email ?? '').toLowerCase();
    if (!email) return false;
    const admins = await fetch(
      `${SUPABASE_URL}/rest/v1/architaip_admins?select=email&email=eq.${encodeURIComponent(email)}`,
      { headers: service },
    ).then((r) => r.json());
    return Array.isArray(admins) && admins.length > 0;
  } catch {
    return false;
  }
}

async function rest(method: string, path: string, body?: unknown, prefer?: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      ...service,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
}

const upsert = (table: string, row: unknown, conflict?: string) =>
  rest('POST', `${table}${conflict ? `?on_conflict=${conflict}` : ''}`, row, 'resolution=merge-duplicates,return=minimal');

const safeId = (v: unknown) => String(v ?? '').replace(/[^\w-]/g, '').slice(0, 160);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: 'server not configured' }, 500);
  if (!(await isEditor(req))) return json({ error: 'not editor' }, 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const now = new Date().toISOString();
  try {
    switch (body.action) {
      case 'check':
        return json({ ok: true });

      case 'content': {
        const id = safeId(body.id);
        await upsert('architaip_culture_content',
          { culture_id: id, session_id: SESSION_ID, content: body.content ?? {}, updated_at: now },
          'culture_id,session_id');
        return json({ ok: true });
      }

      case 'images': {
        const id = safeId(body.id);
        await upsert('architaip_culture_images',
          { culture_id: id, session_id: SESSION_ID, images: body.images ?? {}, updated_at: now },
          'culture_id,session_id');
        return json({ ok: true });
      }

      case 'culture':
        await upsert('architaip_cultures', { ...(body.row as object), is_custom: true });
        return json({ ok: true });

      case 'fusion':
        await upsert('architaip_fusions', body.row);
        return json({ ok: true });

      case 'delete': {
        const id = safeId(body.id);
        const table = body.kind === 'fusion' ? 'architaip_fusions' : 'architaip_cultures';
        await rest('DELETE', `${table}?id=eq.${id}`);
        await rest('DELETE', `architaip_culture_content?culture_id=eq.${id}`);
        await rest('DELETE', `architaip_culture_images?culture_id=eq.${id}`);
        return json({ ok: true });
      }

      case 'sign_upload': {
        const path = String(body.path ?? '');
        if (!/^[\w-]+\/[\w.-]+$/.test(path) || path.includes('..')) return json({ error: 'bad path' }, 400);
        const res = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET}/${path}`, {
          method: 'POST',
          headers: { ...service, 'Content-Type': 'application/json' },
          body: '{}',
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) return json({ error: data?.message ?? `sign ${res.status}` }, 502);
        const token = new URL(`http://x${data.url}`).searchParams.get('token');
        if (!token) return json({ error: 'no upload token' }, 502);
        return json({ path, token });
      }

      default:
        return json({ error: 'unknown action' }, 400);
    }
  } catch (err) {
    return json({ error: String((err as Error).message ?? err) }, 500);
  }
});
