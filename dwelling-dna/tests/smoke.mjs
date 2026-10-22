// End-to-end smoke test against `vite preview`, with every Supabase call mocked.
// Run: npm run build && npx vite preview --port 4173 & node tests/smoke.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const OUT = process.env.SHOTS || 'shots';
const CHROME = process.env.CHROME;
fs.mkdirSync(OUT, { recursive: true });

const REF = 'ktqmwpbzcnzkhjskqisy';
const TEST_KEY = 'test-editor-key-0123456789';
const requests = [];
const errors = [];
let failures = 0;
const check = (ok, msg) => { if (!ok) { failures++; console.log('FAIL', msg); } else console.log('ok  ', msg); };

const FUSION_JSON = JSON.stringify({
  chaos: 'כאוס משולב', order: 'סדר משולב', role: 'גשר', insight: 'תובנת מיזוג', paragraph: 'פסקה', post: 'פוסט',
  vectors: { material: 'א', light: 'ב', threshold: 'ג', proportion: 'ד', narrative: 'ה' },
  spaces: [{ caption: '1' }, { caption: '2' }, { caption: '3' }],
  prompts: [{ text: 'p1' }, { text: 'p2' }, { text: 'p3' }],
});

async function mock(page, admin) {
  await page.route(`https://${REF}.supabase.co/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname.includes('/functions/v1/architaip-edit')) {
      // Recorded as /edit/<action> so the checks below read like the app's intent.
      const body = JSON.parse(req.postData() || '{}');
      requests.push({ method: 'POST', path: `/edit/${body.action}`, body: req.postData() });
      if (req.headers()['x-editor-key'] !== TEST_KEY) return json({ error: 'not editor' }, 403);
      if (body.action === 'sign_upload') return json({ path: body.path, token: 'signed-token' });
      return json({ ok: true });
    }
    requests.push({ method: req.method(), path: url.pathname, body: req.postData() });
    if (url.pathname.startsWith('/rest/v1/rpc/architaip_is_admin')) return json(admin);
    if (url.pathname.startsWith('/rest/v1/')) return req.method() === 'GET' ? json([]) : json([], 201);
    if (url.pathname.includes('/functions/v1/architaip-fal-image')) return json({ url: 'https://example.com/gen.jpg', permanent: true });
    if (url.pathname.includes('/functions/v1/architaip-claude')) {
      const body = JSON.parse(req.postData() || '{}');
      const isFusion = body.messages?.[0]?.content?.includes('מיזוג');
      return json({ text: isFusion ? FUSION_JSON : 'תשובת מומחה קצרה.' });
    }
    if (url.pathname.startsWith('/auth/v1/user')) return json({ id: 'u1', email: 'shtanat5@gmail.com' });
    if (url.pathname.startsWith('/auth/v1/settings')) return json({ external: { google: false, email: true } });
    if (url.pathname.startsWith('/storage/v1/object/')) return json({ Key: 'x', path: 'x' });
    return json({});
  });
  await page.route('https://example.com/**', (r) => r.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }));
  if (admin) {
    // The editor's device: the key it received from the editor link.
    await page.addInitScript((key) => localStorage.setItem('architaip:editor', key), TEST_KEY);
  }
}

async function noHScroll(page, label) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(over <= 1, `${label}: no horizontal scroll (${over}px)`);
}

const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});

// ── Reader, desktop ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::/.test(m.text())) errors.push(m.text()); });
  await mock(page, false);
  await page.goto(BASE + '/');
  await page.waitForSelector('.cover__title');
  await page.screenshot({ path: `${OUT}/home.png` });
  check(await page.locator('.tile').count() === 11, 'home shows 11 culture tiles');
  check(await page.locator('text=מצב עורכת').first().isVisible(), 'reader sees editor access');
  check(await page.locator('text=העתקת קישור').first().isVisible(), 'copy link button in bar');

  // Editor access: no email, no password - the editor link, pasted once
  await page.locator('.topbar__actions .bar-btn', { hasText: 'מצב עורכת' }).click();
  await page.waitForSelector('.dialog');
  await page.waitForTimeout(300);
  check(!(await page.locator('text=כניסה עם Google').count()), 'Google hidden when disabled on server');
  check(!(await page.locator('.dialog input[type=email]').count()), 'no email field');
  await page.screenshot({ path: `${OUT}/login.png` });
  await page.locator('.dialog input').fill('https://architaip.vercel.app/#editor=wrong-key-000000000000');
  await page.locator('.dialog button[type=submit]').click();
  await page.waitForSelector('text=הקישור לא מוכר');
  check(true, 'unknown editor link is refused');
  await page.locator('.dialog input').fill(`https://architaip.vercel.app/#editor=${TEST_KEY}`);
  await page.locator('.dialog button[type=submit]').click();
  await page.waitForSelector('text=מצב עריכה');
  await page.waitForTimeout(600);
  check(!(await page.locator('.dialog').count()), 'pasting the editor link turns this device into an editor');
  await page.locator('.topbar__actions .bar-btn', { hasText: 'יציאה ממצב עורכת' }).click();
  await page.waitForSelector('text=מצב עורכת');
  check(await page.evaluate(() => !localStorage.getItem('architaip:editor')), 'leaving editor mode forgets the key');

  check(await page.locator('text=שיחת הפיתוח').first().isVisible(), 'dev chat button in bar');

  // Atlas tab writes to URL
  await page.locator('.atlas__tab', { hasText: 'אור' }).click();
  await page.waitForTimeout(400);
  check(page.url().includes('v=light'), 'atlas tab updates URL');
  await page.locator('.atlas').screenshot({ path: `${OUT}/atlas.png` });

  // Tile to culture
  await page.locator('.tile', { hasText: 'יפן' }).click();
  await page.waitForURL(/\/c\/japan/);
  await page.waitForSelector('.entry-hero__name');
  await page.waitForTimeout(700);
  check((await page.locator('.entry-hero__name').innerText()).includes('יפן'), 'culture page opens');
  await page.screenshot({ path: `${OUT}/culture.png` });
  await page.locator('.transfer').screenshot({ path: `${OUT}/transfer.png` });
  check(await page.locator('.frame').count() === 6, 'six space frames (ancestral + projection)');
  check(await page.locator('.chip', { hasText: 'העלאת תמונה' }).count() === 6, 'every frame offers upload, signed in or not');
  check(await page.locator('.frame__drop').count() === 6, 'empty frames invite drag and paste');
  check(await page.locator('.editable').count() === 0, 'reader has no editable fields');

  // Lightbox with URL state
  await page.locator('.frame .chip', { hasText: 'הגדלה' }).first().click();
  await page.waitForSelector('.lightbox');
  check(page.url().includes('space=private'), 'lightbox writes space to URL');
  await page.screenshot({ path: `${OUT}/lightbox.png` });
  check(await page.locator('.topbar').isVisible(), 'top bar stays above lightbox');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
  check(!(await page.locator('.lightbox').count()), 'lightbox closes');

  // Next culture by arrow key (RTL: left = forward)
  await page.keyboard.press('ArrowLeft');
  await page.waitForURL(/\/c\/africa/);
  check(true, 'left arrow turns to next culture');

  // Deep link and 404
  await page.goto(BASE + '/c/egypt?space=prompt_1');
  await page.waitForSelector('.lightbox');
  check(true, 'deep link opens culture with space');
  await page.goto(BASE + '/c/nope');
  await page.waitForSelector('.empty-page');
  check(true, 'unknown culture shows not-found page');

  // Lab compare as reader
  await page.goto(BASE + '/lab?p=egypt,japan');
  await page.waitForSelector('.compare');
  check(await page.locator('.compare__row').count() === 9, 'lab compares 2 cultures across 8 rows + head');
  check(await page.locator('text=שמורה לעורכת').isVisible(), 'reader cannot fuse');
  await page.screenshot({ path: `${OUT}/lab.png`, fullPage: true });

  // Read route goes to last read
  await page.goto(BASE + '/read');
  await page.waitForURL(/\/c\//);
  check(true, 'read route resolves to a culture');

  // Installability
  await page.goto(BASE + '/');
  await page.waitForTimeout(1500);
  const manifest = await (await page.request.get(BASE + '/manifest.webmanifest')).json();
  check(manifest.icons.length >= 3, 'manifest has icons');
  await ctx.close();
}

// ── Editor, desktop ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.accept());
  await mock(page, true);
  await page.goto(BASE + '/c/greece');
  await page.waitForSelector('.entry-hero__name');
  await page.waitForSelector('text=מצב עריכה');
  check(true, 'admin session shows edit mode');
  check(await page.locator('.chip', { hasText: 'יצירה ב-AI' }).count() === 6, 'editor sees generate on every frame');

  // Edit paragraph inline
  requests.length = 0;
  await page.locator('.reading__paragraph.editable').click();
  await page.locator('textarea.editable--open').fill('טקסט חדש לבדיקה');
  await page.locator('.mechanism h2').click();
  await page.waitForTimeout(500);
  const contentWrite = requests.find((r) => r.path === '/edit/content');
  check(contentWrite && contentWrite.body.includes('טקסט חדש לבדיקה') && contentWrite.body.includes('greece'), 'paragraph edit upserts content');
  check((await page.locator('.reading__paragraph').innerText()).includes('טקסט חדש'), 'edited text shows on page');

  // Generate image
  requests.length = 0;
  await page.locator('.chip', { hasText: 'יצירה ב-AI' }).first().click();
  await page.waitForTimeout(800);
  check(requests.some((r) => r.path.includes('architaip-fal-image')), 'generate calls image function');
  const imgWrite = requests.find((r) => r.path === '/edit/images');
  check(imgWrite && imgWrite.body.includes('gen.jpg'), 'generated image is saved');
  check(await page.locator('text=התמונה נשמרה').isVisible(), 'save state shows in bar');

  // Copy link carries state
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.locator('.topbar__actions .bar-btn', { hasText: 'העתקת קישור' }).click();
  check(await page.locator('text=הקישור הועתק').waitFor({ timeout: 3000 }).then(() => true, () => false), 'copy link confirms');

  // Expert chat
  await page.locator('.expert .chip').first().click();
  await page.waitForSelector('text=תשובת מומחה קצרה.');
  check(true, 'expert answers');
  await page.screenshot({ path: `${OUT}/culture-admin.png`, fullPage: false });

  // Toggle to reading mode
  await page.locator('.topbar__actions .bar-btn', { hasText: 'מצב עריכה' }).click();
  check(await page.locator('.reading__paragraph.editable').count() === 0, 'reading mode hides text editing');
  await page.locator('.topbar__actions .bar-btn', { hasText: 'מצב קריאה' }).click();

  // Fusion: compare, generate, approve
  await page.goto(BASE + '/lab?p=egypt,japan');
  await page.waitForSelector('.modes');
  await page.locator('.mode', { hasText: 'משוקלל' }).click();
  await page.locator('.weight input').first().fill('80');
  requests.length = 0;
  await page.locator('.btn--primary', { hasText: 'יצירת מיזוג' }).click();
  await page.waitForSelector('.draft-card');
  check(requests.some((r) => r.path.includes('architaip-claude')), 'fusion calls Claude');
  await page.screenshot({ path: `${OUT}/lab-draft.png`, fullPage: true });
  await page.locator('.btn', { hasText: 'אישור ופתיחת המיזוג' }).click();
  await page.waitForURL(/\/f\//);
  const fusionWrite = requests.find((r) => r.path === '/edit/fusion');
  check(fusionWrite && fusionWrite.body.includes('fusion_logic'), 'fusion saved with lineage');
  await page.waitForSelector('.lineage');
  check(await page.locator('.lineage__row').count() === 2, 'fusion page shows lineage');
  await page.screenshot({ path: `${OUT}/fusion.png` });

  // Delete fusion
  requests.length = 0;
  await page.locator('.bar-btn', { hasText: 'מחיקה' }).click();
  await page.waitForURL(BASE + '/');
  check(requests.some((r) => r.path === '/edit/delete' && r.body.includes('fusion')), 'fusion delete sent');

  // Add culture dialog under the bar
  await page.locator('.btn', { hasText: 'הוספת תרבות' }).click();
  await page.waitForSelector('.dialog');
  const dlgTop = await page.locator('.dialog').evaluate((el) => el.getBoundingClientRect().top);
  check(dlgTop >= 59, 'dialog opens beneath the top bar');
  await page.screenshot({ path: `${OUT}/add-culture.png` });
  await ctx.close();
}

// ── Opening the editor link ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await mock(page, false);
  await page.goto(`${BASE}/c/egypt#editor=${TEST_KEY}`);
  await page.waitForSelector('text=מצב עריכה');
  check(!page.url().includes('editor='), 'editor link: key leaves the address bar');
  check(await page.evaluate((k) => localStorage.getItem('architaip:editor') === k, TEST_KEY), 'editor link: device remembered');
  await page.goto(`${BASE}/`);
  await page.waitForSelector('text=מצב עריכה');
  check(true, 'editor link: still editor after navigating, no login again');
  await ctx.close();
}

// ── Images: drop and paste, before and after sign-in ──
{
  const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await mock(page, false);
  await page.goto(BASE + '/c/persia');
  await page.waitForSelector('.frame__image');

  const dropOn = (index) => page.evaluate(({ index, b64 }) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const dt = new DataTransfer();
    dt.items.add(new File([bytes], 'x.png', { type: 'image/png' }));
    const el = document.querySelectorAll('.frame')[index];
    el.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt }));
    el.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, { index, b64: PNG });

  // Reader drops: the image shows at once, waits, and sign-in opens
  await dropOn(0);
  await page.waitForSelector('text=ממתין לשמירה');
  const bg = await page.locator('.frame__image').first().evaluate((el) => el.style.backgroundImage);
  check(bg.includes('blob:'), 'dropped image shows immediately in the frame');
  await page.waitForSelector('.dialog');
  check(await page.locator('text=התמונה כבר במסגרת').isVisible(), 'sign-in opens and explains the image is kept');
  await page.screenshot({ path: `${OUT}/drop-pending.png` });
  await page.keyboard.press('Escape');

  // Paste onto a hovered frame
  await page.locator('.frame__image').nth(1).hover();
  await page.evaluate((b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const dt = new DataTransfer();
    dt.items.add(new File([bytes], 'y.png', { type: 'image/png' }));
    window.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }, PNG);
  await page.waitForTimeout(500);
  check(await page.locator('.frame__badge').count() === 2, 'pasted image lands in the hovered frame');

  // Survives reload, then uploads once signed in
  await page.reload();
  await page.waitForSelector('.frame__image');
  await page.waitForTimeout(500);
  check(await page.locator('.frame__badge').count() === 2, 'waiting images survive a reload');
  requests.length = 0;
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await mock(page, true);
  await page.goto(BASE + '/c/persia');
  await page.waitForSelector('text=מצב עריכה');
  await page.waitForTimeout(1500);
  const uploads = requests.filter((r) => r.path.includes('/storage/v1/object/upload/sign/architaip-media/persia/'));
  check(uploads.length === 2, `waiting images upload after sign-in (${uploads.length})`);
  const saves = requests.filter((r) => r.path === '/edit/images');
  const last = saves.at(-1)?.body ?? '';
  check(last.includes('"private"') && last.includes('"threshold"') && last.includes('storage/v1/object/public'), 'both images saved together, neither overwrites the other');
  check(await page.locator('.frame__badge').count() === 0, 'pending badges clear after saving');

  // Signed in: a drop saves straight away
  requests.length = 0;
  await dropOn(3);
  await page.waitForTimeout(1200);
  check(requests.some((r) => r.path.includes('/upload/sign/architaip-media/persia/prompt_0')), 'editor drop uploads directly');

  // Lightbox takes a paste too
  await page.goto(BASE + '/c/persia?space=prompt_2');
  await page.waitForSelector('.lightbox');
  requests.length = 0;
  await page.evaluate((b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const dt = new DataTransfer();
    dt.items.add(new File([bytes], 'z.png', { type: 'image/png' }));
    window.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }, PNG);
  await page.waitForTimeout(1200);
  check(requests.some((r) => r.path.includes('/persia/prompt_2')), 'paste in the lightbox fills that space');
  await ctx.close();
}

// ── Mobile ──
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await mock(page, false);
  for (const path of ['/', '/c/mesopotamia', '/lab?p=egypt,japan,maya', '/c/maya?space=communal']) {
    await page.goto(BASE + path);
    await page.waitForTimeout(900);
    await noHScroll(page, `mobile ${path}`);
  }
  await page.goto(BASE + '/');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/m-home.png` });
  await page.locator('.topbar__menu-btn').click();
  await page.waitForSelector('.topbar__drawer');
  await page.screenshot({ path: `${OUT}/m-menu.png` });
  await page.locator('.topbar__drawer .topbar__link', { hasText: 'קריאה' }).click();
  await page.waitForURL(/\/c\//);
  check(!(await page.locator('.topbar__drawer').count()), 'menu closes on navigation');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/m-culture.png`, fullPage: true });
  await ctx.close();
}

// ── Installability needs a real profile, not an incognito context ──
{
  const ctx = await chromium.launchPersistentContext(fs.mkdtempSync('/tmp/pw-'), CHROME ? { executablePath: CHROME } : {});
  const page = ctx.pages()[0] ?? await ctx.newPage();
  await mock(page, false);
  await page.goto(BASE + '/');
  await page.waitForTimeout(2500);
  const cdp = await ctx.newCDPSession(page);
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
  check(installabilityErrors.length === 0, `installable (${JSON.stringify(installabilityErrors)})`);
  await ctx.close();
}

await browser.close();
check(errors.length === 0, `no page errors ${errors.length ? JSON.stringify(errors.slice(0, 5)) : ''}`);
console.log(failures ? `\n${failures} FAILED` : '\nALL PASSED');
process.exit(failures ? 1 : 0);
