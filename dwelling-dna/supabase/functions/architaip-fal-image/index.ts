// ARCHITAIP — image generation proxy.
//
// Renders a prompt with fal.ai and then stores the result in this project's
// architaip-media bucket, returning the permanent public URL. fal hands out
// links that expire; an image that disappears from the magazine a week later is
// exactly the failure this avoids.
//
// Deploy:  supabase functions deploy architaip-fal-image
// Secret:  FAL_API_KEY (already set in this project)

const FAL_ENDPOINT = 'https://fal.run/fal-ai/flux/schnell';
const BUCKET = 'architaip-media';

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

function readFalKey(): string | undefined {
  const direct = Deno.env.get('FAL_API_KEY');
  if (direct?.trim()) return direct.trim();
  try {
    for (const name of Object.keys(Deno.env.toObject())) {
      if (!/fal/i.test(name) || /^SUPABASE_/i.test(name)) continue;
      const value = Deno.env.get(name);
      if (value?.trim()) return value.trim();
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/** Copies the rendered image into storage. Failure is not fatal — the caller
 *  still gets the fal link, which works now even if it will not work forever. */
async function persist(imageUrl: string, cultureId: string, spaceId: string): Promise<string | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return null;

  try {
    const image = await fetch(imageUrl);
    if (!image.ok) return null;
    const contentType = image.headers.get('content-type') ?? 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const path = `${cultureId}/${spaceId}-${Date.now()}.${ext}`;

    const upload = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': contentType,
        'Cache-Control': '31536000',
      },
      body: await image.arrayBuffer(),
    });
    if (!upload.ok) return null;

    return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const falKey = readFalKey();
  if (!falKey) return json({ error: 'FAL_API_KEY is not configured on the server' }, 500);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) return json({ error: '"prompt" is required' }, 400);

  const cultureId = String(body.cultureId ?? 'culture').replace(/[^\w-]/g, '') || 'culture';
  const spaceId = String(body.spaceId ?? 'space').replace(/[^\w-]/g, '') || 'space';

  let upstream: Response;
  try {
    upstream = await fetch(FAL_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Key ${falKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        image_size: 'landscape_4_3',
        num_inference_steps: 4,
        num_images: 1,
      }),
    });
  } catch (err) {
    return json({ error: `Could not reach fal.ai: ${err}` }, 502);
  }

  const data = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    return json({ error: data?.detail ?? `fal.ai error ${upstream.status}` }, upstream.status);
  }

  const falUrl = data?.images?.[0]?.url;
  if (!falUrl) return json({ error: 'fal.ai returned no image' }, 502);

  const stored = await persist(falUrl, cultureId, spaceId);
  return json({ url: stored ?? falUrl, permanent: !!stored });
});
