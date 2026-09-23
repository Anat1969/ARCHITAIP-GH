// ARCHITAIP — Claude proxy.
//
// Deployed into the shared Supabase project under its own name, so it cannot
// disturb the culture_articles or momchim_* functions living there. The
// Anthropic key stays a project secret and never reaches the browser.
//
// Deploy:  supabase functions deploy architaip-claude
// Secret:  ANTHROPIC_API_KEY (already set in this project)

const ALLOWED_MODELS = new Set(['claude-opus-5', 'claude-haiku-4-5']);
const DEFAULT_MODEL = 'claude-opus-5';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/**
 * Finds the key by its documented name, and failing that under any secret whose
 * name mentions Anthropic or Claude — the same tolerance the sibling app uses,
 * so a differently named secret does not read as a missing one.
 */
function readKey(): string | undefined {
  const direct = Deno.env.get('ANTHROPIC_API_KEY');
  if (direct?.trim()) return direct.trim();

  let names: string[] = [];
  try {
    names = Object.keys(Deno.env.toObject());
  } catch {
    return undefined;
  }

  for (const name of names) {
    if (!/anthropic|claude/i.test(name)) continue;
    if (/^SUPABASE_/i.test(name) || /passcode|model/i.test(name)) continue;
    const value = Deno.env.get(name);
    if (value?.trim()) return value.trim();
  }
  return undefined;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = readKey();
  if (!apiKey) return json({ error: 'ANTHROPIC_API_KEY is not configured on the server' }, 500);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: '"messages" is required' }, 400);
  }

  const model = ALLOWED_MODELS.has(body.model as string) ? (body.model as string) : DEFAULT_MODEL;
  // Thinking is on by default on Opus 5 and shares the max_tokens budget, so
  // leave room for the answer on top of the reasoning.
  const requested = Number(body.max_tokens) || 8000;
  const max_tokens = Math.min(Math.max(requested, 2048), 16000);

  const payload: Record<string, unknown> = { model, max_tokens, messages };
  if (typeof body.system === 'string' && body.system.trim()) payload.system = body.system;

  let upstream: Response;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return json({ error: `Could not reach the Anthropic API: ${err}` }, 502);
  }

  const data = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    const message = data?.error?.message ?? `Anthropic API error ${upstream.status}`;
    return json({ error: message, type: data?.error?.type }, upstream.status);
  }

  if (data?.stop_reason === 'refusal') {
    return json({ error: 'Claude declined to answer this request.', type: 'refusal' }, 422);
  }

  // The response may open with thinking blocks — take the text blocks only.
  const text = (data?.content ?? [])
    .filter((block: { type: string }) => block.type === 'text')
    .map((block: { text: string }) => block.text)
    .join('\n')
    .trim();

  if (!text) {
    return json({ error: 'Claude returned an empty response.', stop_reason: data?.stop_reason }, 502);
  }

  return json({ text, stop_reason: data?.stop_reason, usage: data?.usage });
});
