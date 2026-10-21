// End-to-end smoke test against `vite preview`, with every Supabase call mocked.
// Run: npm run build && npx vite preview --port 4173 & node tests/smoke.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const OUT = process.env.SHOTS || 'shots';
const CHROME = process.env.CHROME;
fs.mkdirSync(OUT, { recursive: true });

const REF = 'ktqmwpbzcnzkhjskqisy';
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
    requests.push({ method: req.method(), path: url.pathname, body: req.postData() });
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
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
    if (url.pathname.startsWith('/auth/v1/otp')) return json({});
    if (url.pathname.startsWith('/storage/v1/object/')) return json({ Key: 'x' });
    return json({});
  });
  await page.route('https://example.com/**', (r) => r.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }));
  if (admin) {
    await page.addInitScript((ref) => {
      const exp = Math.floor(Date.now() / 1000) + 3600 * 24;
      localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify({
        access_token: 'fake', refresh_token: 'fake', token_type: 'bearer', expires_in: 86400, expires_at: exp,
        user: { id: 'u1', email: 'shtanat5@gmail.com', aud: 'authenticated', role: 'authenticated' },
      }));
    }, REF);
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
  check(await page.locator('text=כניסת עורכת').first().isVisible(), 'reader sees editor login');
  check(await page.locator('text=העתקת קישור').first().isVisible(), 'copy link button in bar');

  // Login: Google hidden while the server has it off, email link + code instead
  await page.locator('.topbar__actions .bar-btn', { hasText: 'כניסת עורכת' }).click();
  await page.waitForSelector('.dialog');
  await page.waitForTimeout(300);
  check(!(await page.locator('text=כניסה עם Google').count()), 'Google hidden when disabled on server');
  await page.locator('.dialog input[type=email]').fill('shtanat5@gmail.com');
  requests.length = 0;
  await page.locator('.dialog button[type=submit]').click();
  await page.waitForSelector('text=קוד מהמייל');
  check(requests.some((r) => r.path.includes('/auth/v1/otp') && r.body.includes('shtanat5')), 'email login sends OTP');
  await page.screenshot({ path: `${OUT}/login.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
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
  check(await page.locator('.chip', { hasText: 'יצירה' }).count() === 0, 'reader has no generate buttons');
  check(await page.locator('.editable').count() === 0, 'reader has no editable fields');

  // Lightbox with URL state
  await page.locator('.frame__image').first().click();
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
  check(await page.locator('.chip', { hasText: 'יצירה' }).count() === 6, 'editor sees generate on every frame');

  // Edit paragraph inline
  requests.length = 0;
  await page.locator('.reading__paragraph.editable').click();
  await page.locator('textarea.editable--open').fill('טקסט חדש לבדיקה');
  await page.locator('.mechanism h2').click();
  await page.waitForTimeout(500);
  const contentWrite = requests.find((r) => r.method === 'POST' && r.path.includes('architaip_culture_content'));
  check(contentWrite && contentWrite.body.includes('טקסט חדש לבדיקה') && contentWrite.body.includes('greece'), 'paragraph edit upserts content');
  check((await page.locator('.reading__paragraph').innerText()).includes('טקסט חדש'), 'edited text shows on page');

  // Generate image
  requests.length = 0;
  await page.locator('.chip', { hasText: 'יצירה' }).first().click();
  await page.waitForTimeout(800);
  check(requests.some((r) => r.path.includes('architaip-fal-image')), 'generate calls image function');
  const imgWrite = requests.find((r) => r.method === 'POST' && r.path.includes('architaip_culture_images'));
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
  check(await page.locator('.chip', { hasText: 'יצירה' }).count() === 0, 'reading mode hides editor tools');
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
  const fusionWrite = requests.find((r) => r.method === 'POST' && r.path.includes('architaip_fusions'));
  check(fusionWrite && fusionWrite.body.includes('fusion_logic'), 'fusion saved with lineage');
  await page.waitForSelector('.lineage');
  check(await page.locator('.lineage__row').count() === 2, 'fusion page shows lineage');
  await page.screenshot({ path: `${OUT}/fusion.png` });

  // Delete fusion
  requests.length = 0;
  await page.locator('.bar-btn', { hasText: 'מחיקה' }).click();
  await page.waitForURL(BASE + '/');
  check(requests.some((r) => r.method === 'DELETE' && r.path.includes('architaip_fusions')), 'fusion delete sent');

  // Add culture dialog under the bar
  await page.locator('.btn', { hasText: 'הוספת תרבות' }).click();
  await page.waitForSelector('.dialog');
  const dlgTop = await page.locator('.dialog').evaluate((el) => el.getBoundingClientRect().top);
  check(dlgTop >= 59, 'dialog opens beneath the top bar');
  await page.screenshot({ path: `${OUT}/add-culture.png` });
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
