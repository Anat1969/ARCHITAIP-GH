// ARCHITAIP - the fusion lab, open to every reader.
//
// generate: a historian on Gemini's free tier reads two to four cultures and
//           writes their fusion. The result comes back with a signed token.
// save:     stores a fusion only if its text carries a valid token, so what a
//           reader publishes is always what the historian wrote, never text
//           typed into the request. Deleting stays with the editor.
//
// ask:      the same historian for the editor's own tools (adding a culture,
//           the expert chat). Editor only.
// approve:  a fusion a reader saved waits outside the public list until the
//           editor approves it. Editor only.
//
// images:   anyone can place an image in a frame. sign_image hands out a
//           one-time upload under submissions/, submit_image records it.
//           The editor's image is published at once; a reader's waits in
//           architaip_image_submissions until approve_image (editor only).
//
// Generate and save need no editor key. Abuse is held back by a per-address
// rate limit and by strict input limits; Gemini's free tier costs nothing.
//
// Secrets:  GEMINI_API_KEY (shared in this project), SUPABASE_SERVICE_ROLE_KEY
// Deploy:   supabase functions deploy architaip-fusion

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-editor-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const MODELS = [...new Set([Deno.env.get('GEMINI_MODEL') ?? 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'])];
const VECTOR_KEYS = ['material', 'light', 'threshold', 'proportion', 'narrative'];

// ── Rate limit, per address, in memory ──
const hits = new Map<string, number[]>();
function limited(req: Request, perMinute: number, perDay: number) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'anon').split(',')[0].trim();
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 86_400_000);
  if (list.filter((t) => now - t < 60_000).length >= perMinute || list.length >= perDay) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
}

// ── Signing ──
const enc = new TextEncoder();
async function hmac(text: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(`architaip-fusion:${SERVICE_KEY}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const b64 = (s: string) => btoa(String.fromCharCode(...enc.encode(s)));
const unb64 = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)));

// ── The editor: personal key (hash in architaip_editor_keys) or admin session ──
const service = () => ({ apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` });
async function isEditor(req: Request): Promise<boolean> {
  try {
    const key = req.headers.get('x-editor-key') ?? '';
    if (key.length >= 16) {
      const digest = await crypto.subtle.digest('SHA-256', enc.encode(key));
      const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
      const rows = await fetch(`${SUPABASE_URL}/rest/v1/architaip_editor_keys?select=key_hash&key_hash=eq.${hash}`, { headers: service() }).then((r) => r.json());
      if (Array.isArray(rows) && rows.length > 0) return true;
    }
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    if (!token.startsWith('ey')) return false;
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: SERVICE_KEY } });
    if (!userRes.ok) return false;
    const email = String((await userRes.json())?.email ?? '').toLowerCase();
    if (!email) return false;
    const admins = await fetch(`${SUPABASE_URL}/rest/v1/architaip_admins?select=email&email=eq.${encodeURIComponent(email)}`, { headers: service() }).then((r) => r.json());
    return Array.isArray(admins) && admins.length > 0;
  } catch {
    return false;
  }
}

// ── Input ──
const str = (v: unknown, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const safeId = (v: unknown) => String(v ?? '').replace(/[^\w-]/g, '').slice(0, 160);

function readParents(raw: unknown) {
  if (!Array.isArray(raw) || raw.length < 2 || raw.length > 4) return null;
  return raw.map((p: Record<string, unknown>) => ({
    id: safeId(p?.id),
    name: str(p?.name, 40),
    chaos: str(p?.chaos, 120),
    order: str(p?.order, 120),
    role: str(p?.role, 60),
    vectors: Object.fromEntries(VECTOR_KEYS.map((k) => [k, str((p?.vectors as Record<string, unknown>)?.[k], 220)])),
  }));
}

// ── The historian ──
const SYSTEM = `אתה היסטוריון של תרבות ואדריכלות, מהעת העתיקה ועד היום.
אתה ננס שעומד על כתפי ענקים: רואה רחוק אחורה, אל המקורות, ורחוק קדימה, אל הבית של המאה הבאה.
אתה קורא כל תרבות כמנגנון: ממה היא מגינה (כאוס), מה היא בונה כנגדו (סדר), ומה תפקיד הבית.
במיזוג אתה לא ממצע. אתה חושף את המתח בין ההיגיונות, ומוצא את הבית שיכול להחזיק את שניהם.
עברית תקינה, קצרה ומדויקת, באותיות עבריות בלבד. בלי קלישאות, בלי סופרלטיבים, בלי המצאת עובדות היסטוריות.
פרומפטים לתמונות באנגלית בלבד, ריאליזם תיעודי, צילום אדריכלות מקצועי, בלי טקסט בתמונה.`;

function userPrompt(parents: ReturnType<typeof readParents>, mode: string, weights: number[]) {
  const label = ({ equal: 'שווה', weighted: 'משוקלל', dominant: 'דומיננטי' } as Record<string, string>)[mode] ?? 'שווה';
  const lines = parents!.map((p, i) =>
    `${i + 1}. ${p.name} (משקל ${Math.round((weights[i] ?? 0) * 100)}%): כאוס="${p.chaos}", סדר="${p.order}", תפקיד="${p.role}", וקטורים=${JSON.stringify(p.vectors)}`).join('\n');
  return `מיזוג ${label} בין ${parents!.map((p) => p.name).join(' + ')}.
${mode === 'dominant' ? `${parents![0].name} מובילה, האחרות מתבלות.` : ''}
${lines}

כתוב את התרבות שנולדת מהמפגש:
chaos: ממה המיזוג מגן, עד 6 מילים.
order: מה הוא בונה כנגדו, עד 6 מילים.
role: תפקיד הבית, מילה אחת או שתיים.
insight: משפט מזוקק אחד, עד 14 מילים, בלי מרכאות.
paragraph: 3 עד 4 משפטים. מה כל תרבות מביאה, איפה הן מתנגשות, ואיך הבית פותר את המתח.
post: משפט קצר אחד.
vectors: חומר, אור, סף, פרופורציה ונרטיב, משפט קצר לכל אחד.
spaces: לכל אחד משלושת המרחבים (פרטי, מעבר, קהילתי) כותרת קצרה שמתארת אותו, עד 6 מילים, למשל "חדר אבן שנושם עץ". לא שם סוג המרחב.
prompts: שלושה פרומפטים באנגלית לאותם שלושה מרחבים, כל אחד מסתיים ב-"Documentary realism, professional architecture photography".`;
}

const S = { type: 'STRING' };
const SCHEMA = {
  type: 'OBJECT',
  properties: {
    chaos: S, order: S, role: S, insight: S, paragraph: S, post: S,
    vectors: { type: 'OBJECT', properties: Object.fromEntries(VECTOR_KEYS.map((k) => [k, S])), required: VECTOR_KEYS },
    spaces: { type: 'ARRAY', items: { type: 'OBJECT', properties: { caption: S }, required: ['caption'] } },
    prompts: { type: 'ARRAY', items: { type: 'OBJECT', properties: { text: S }, required: ['text'] } },
  },
  required: ['chaos', 'order', 'role', 'insight', 'paragraph', 'post', 'vectors', 'spaces', 'prompts'],
};

async function viaGemini(key: string, user: string, system = SYSTEM, schema: unknown = SCHEMA) {
  let last: unknown = new Error('no model answered');
  for (const model of MODELS) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          generationConfig: schema
            ? { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.6 }
            : { responseMimeType: schema === null ? 'text/plain' : 'application/json', temperature: 0.6 },
        }),
        signal: AbortSignal.timeout(40000),
      });
      if (!r.ok) throw Object.assign(new Error(`Gemini ${model} ${r.status}`), { status: r.status });
      const j = await r.json();
      const text = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
      if (!text.trim()) throw new Error(`Gemini ${model} empty`);
      return schema === null ? text : JSON.parse(text);
    } catch (err) {
      last = err;
      const st = (err as { status?: number }).status;
      if (st === 400 || st === 401 || st === 403) break;
    }
  }
  throw last;
}

// The model sometimes slips an Arabic letter into a Hebrew word (و for ו).
const LOOKALIKE: Record<string, string> = { 'و': 'ו', 'ي': 'י', 'ا': 'א', 'ن': 'נ', 'ل': 'ל', 'م': 'מ' };
const heb = (v: unknown, max: number) => str(v, max).replace(/[\u0600-\u06FF]/g, (c) => LOOKALIKE[c] ?? '');

/** Only the fields the historian writes, trimmed to sane lengths. */
function clean(d: Record<string, unknown>) {
  const v = (d.vectors ?? {}) as Record<string, unknown>;
  const arr = (x: unknown) => (Array.isArray(x) ? x.slice(0, 3) : []);
  return {
    chaos: heb(d.chaos, 120), order: heb(d.order, 120), role: heb(d.role, 60),
    insight: heb(d.insight, 240), paragraph: heb(d.paragraph, 1400), post: heb(d.post, 240),
    vectors: Object.fromEntries(VECTOR_KEYS.map((k) => [k, heb(v[k], 300)])),
    spaces: arr(d.spaces).map((s: Record<string, unknown>) => ({ caption: heb(s?.caption, 120) })),
    prompts: arr(d.prompts).map((p: Record<string, unknown>) => ({ text: str(p?.text, 1200) })),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: 'server not configured' }, 500);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

  if (body.action === 'generate') {
    if (limited(req, 4, 40)) return json({ error: 'יותר מדי מיזוגים ברצף. נסו שוב בעוד דקה.' }, 429);
    const parents = readParents(body.parents);
    if (!parents) return json({ error: 'בחרו בין שתיים לארבע תרבויות.' }, 400);
    const mode = ['equal', 'weighted', 'dominant'].includes(String(body.mode)) ? String(body.mode) : 'equal';
    const weights = Array.isArray(body.weights) ? body.weights.slice(0, 4).map((w) => Math.min(Math.max(Number(w) || 0, 0), 1)) : [];
    const key = Deno.env.get('GEMINI_API_KEY')?.trim();
    if (!key) return json({ error: 'ההיסטוריון לא מחובר כרגע (חסר מפתח Gemini).' }, 503);
    try {
      const content = clean(await viaGemini(key, userPrompt(parents, mode, weights)));
      const payload = JSON.stringify({ parents: parents.map((p) => p.id), mode, content, at: Date.now() });
      const token = `${b64(payload)}.${await hmac(payload)}`;
      return json({ ...content, token, engine: 'gemini' });
    } catch (err) {
      const st = (err as { status?: number }).status;
      return json({ error: st === 429 ? 'המכסה החינמית של ההיסטוריון נגמרה לרגע. נסו שוב בעוד דקה.' : 'ההיסטוריון לא ענה. נסו שוב.' }, 503);
    }
  }

  if (body.action === 'save') {
    if (limited(req, 3, 20)) return json({ error: 'יותר מדי שמירות ברצף. נסו שוב בעוד דקה.' }, 429);
    const [p64, sig] = String(body.token ?? '').split('.');
    if (!p64 || !sig) return json({ error: 'bad token' }, 400);
    let payload: string;
    try { payload = unb64(p64); } catch { return json({ error: 'bad token' }, 400); }
    if ((await hmac(payload)) !== sig) return json({ error: 'bad token' }, 403);
    const { parents, mode, content, at } = JSON.parse(payload);
    if (Date.now() - Number(at) > 86_400_000) return json({ error: 'הטיוטה פגה. צרו מיזוג חדש.' }, 410);

    const row = (body.row ?? {}) as Record<string, unknown>;
    const lineage = (row.lineage ?? {}) as Record<string, unknown>;
    const hex = (c: unknown) => (/^#[0-9a-f]{6}$/i.test(String(c)) ? String(c) : '#888888');
    const colors = (row.colors ?? {}) as Record<string, unknown>;
    const name = str(row.name, 60);
    const record = {
      id: safeId(row.id) || `${parents.join('_')}_${Date.now().toString(36)}`,
      name: name || parents.join(' × '),
      name_custom: str(row.name_custom, 60),
      lineage: {
        parents,
        parent_names: (Array.isArray(lineage.parent_names) ? lineage.parent_names : []).slice(0, 4).map((n: unknown) => str(n, 40)),
        parent_weights: (Array.isArray(lineage.parent_weights) ? lineage.parent_weights : []).slice(0, 4).map((w: unknown) => Number(w) || 0),
        fusion_logic: mode,
      },
      chaos: content.chaos, order_concept: content.order, role: content.role,
      colors: { primary: hex(colors.primary), secondary: hex(colors.secondary), accent: hex(colors.accent) },
      gradient: /^linear-gradient\([#\w\s,.%()-]+\)$/.test(String(row.gradient)) ? String(row.gradient) : null,
      vectors: content.vectors, insight: content.insight, paragraph: content.paragraph, post: content.post,
      spaces: Array.isArray(row.spaces)
        ? (row.spaces as Record<string, unknown>[]).slice(0, 3).map((s, i) => ({ id: safeId(s.id), label: str(s.label, 30), caption: content.spaces[i]?.caption ?? '', gradient: /^linear-gradient\([#\w\s,.%()-]+\)$/.test(String(s.gradient)) ? String(s.gradient) : null }))
        : [],
      prompts: content.prompts.map((p: { text: string }, i: number) => ({ label: ['חוץ', 'סף', 'פנים'][i], text: p.text })),
      // A reader's fusion waits for the editor before it joins the public list.
      approved: await isEditor(req),
    };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/architaip_fusions`, {
      method: 'POST',
      // A reader adds; never overwrites. An id that already exists is refused.
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify(record),
    });
    if (!res.ok) return json({ error: `save ${res.status}` }, 500);
    const saved = await res.json().catch(() => []);
    if (!Array.isArray(saved) || saved.length === 0) return json({ error: 'המיזוג כבר קיים.' }, 409);
    return json({ ok: true, id: record.id });
  }

  if (body.action === 'ask') {
    if (!(await isEditor(req))) return json({ error: 'editor only' }, 403);
    if (limited(req, 20, 400)) return json({ error: 'יותר מדי בקשות ברצף. נסו שוב בעוד דקה.' }, 429);
    const key = Deno.env.get('GEMINI_API_KEY')?.trim();
    if (!key) return json({ error: 'ההיסטוריון לא מחובר כרגע (חסר מפתח Gemini).' }, 503);
    const prompt = String(body.prompt ?? '').slice(0, 12000);
    if (!prompt.trim()) return json({ error: 'prompt is required' }, 400);
    const extra = String(body.system ?? '').slice(0, 4000);
    const system = extra ? `${SYSTEM}\n\n${extra}` : SYSTEM;
    try {
      // json: free-form JSON (false = no schema), otherwise plain text (null).
      const out = await viaGemini(key, prompt, system, body.json ? false : null);
      const text = typeof out === 'string' ? out : JSON.stringify(out);
      return json({ text: text.replace(/[\u0600-\u06FF]/g, (c) => LOOKALIKE[c] ?? ''), engine: 'gemini' });
    } catch (err) {
      const st = (err as { status?: number }).status;
      return json({ error: st === 429 ? 'המכסה החינמית של ההיסטוריון נגמרה לרגע. נסו שוב בעוד דקה.' : 'ההיסטוריון לא ענה. נסו שוב.' }, 503);
    }
  }

  if (body.action === 'approve') {
    if (!(await isEditor(req))) return json({ error: 'editor only' }, 403);
    const id = safeId(body.id);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/architaip_fusions?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...service(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ approved: body.approved !== false }),
    });
    if (!res.ok) return json({ error: `approve ${res.status}` }, 500);
    return json({ ok: true });
  }

  // ── Images, open to everyone ──
  const BUCKET = 'architaip-media';
  const SLOT = /^(private|threshold|communal|prompt_[0-2])$/;
  const publicUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

  async function publishImage(cultureId: string, slot: string, url: string) {
    const got = await fetch(`${SUPABASE_URL}/rest/v1/architaip_culture_images?select=images&culture_id=eq.${cultureId}&session_id=eq.default`, { headers: service() }).then((r) => r.json()).catch(() => []);
    const images = { ...((Array.isArray(got) && got[0]?.images) || {}), [slot]: url };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/architaip_culture_images?on_conflict=culture_id,session_id`, {
      method: 'POST',
      headers: { ...service(), 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ culture_id: cultureId, session_id: 'default', images, updated_at: new Date().toISOString() }),
    });
    if (!res.ok) throw new Error(`images ${res.status}`);
  }

  if (body.action === 'sign_image') {
    if (limited(req, 12, 120)) return json({ error: 'יותר מדי תמונות ברצף. נסו שוב בעוד דקה.' }, 429);
    const cultureId = safeId(body.culture_id);
    const slot = String(body.slot ?? '');
    const ext = ['jpg', 'png', 'webp', 'gif'].includes(String(body.ext)) ? String(body.ext) : 'jpg';
    if (!cultureId || !SLOT.test(slot)) return json({ error: 'bad slot' }, 400);
    const path = `submissions/${cultureId}/${slot}-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}.${ext}`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET}/${path}`, { method: 'POST', headers: { ...service(), 'Content-Type': 'application/json' }, body: '{}' });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.url) return json({ error: data?.message ?? `sign ${res.status}` }, 502);
    const token = new URL(`http://x${data.url}`).searchParams.get('token');
    return json({ path, token });
  }

  if (body.action === 'submit_image') {
    if (limited(req, 12, 120)) return json({ error: 'יותר מדי תמונות ברצף. נסו שוב בעוד דקה.' }, 429);
    const cultureId = safeId(body.culture_id);
    const slot = String(body.slot ?? '');
    const path = String(body.path ?? '');
    if (!cultureId || !SLOT.test(slot) || !path.startsWith(`submissions/${cultureId}/${slot}-`) || path.includes('..')) return json({ error: 'bad path' }, 400);
    const head = await fetch(publicUrl(path), { method: 'HEAD' });
    if (!head.ok) return json({ error: 'the image did not arrive' }, 400);
    const url = publicUrl(path);
    if (await isEditor(req)) {
      await publishImage(cultureId, slot, url);
      return json({ ok: true, status: 'approved', url });
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/architaip_image_submissions`, {
      method: 'POST',
      headers: { ...service(), 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ culture_id: cultureId, slot, url }),
    });
    const rows = await res.json().catch(() => []);
    if (!res.ok) return json({ error: `submit ${res.status}` }, 500);
    return json({ ok: true, status: 'pending', url, id: rows?.[0]?.id });
  }

  if (body.action === 'approve_image' || body.action === 'reject_image') {
    if (!(await isEditor(req))) return json({ error: 'editor only' }, 403);
    const id = String(body.id ?? '').replace(/[^0-9a-f-]/gi, '');
    const rows = await fetch(`${SUPABASE_URL}/rest/v1/architaip_image_submissions?id=eq.${id}&select=*`, { headers: service() }).then((r) => r.json()).catch(() => []);
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return json({ error: 'not found' }, 404);
    const approve = body.action === 'approve_image';
    if (approve) await publishImage(row.culture_id, row.slot, row.url);
    await fetch(`${SUPABASE_URL}/rest/v1/architaip_image_submissions?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...service(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ status: approve ? 'approved' : 'rejected' }),
    });
    return json({ ok: true, culture_id: row.culture_id, slot: row.slot, url: row.url });
  }

  return json({ error: 'unknown action' }, 400);
});
