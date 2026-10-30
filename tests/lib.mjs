import puppeteer from 'puppeteer-core';
export const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const BASE = process.env.BASE || 'http://127.0.0.1:8780/';
export async function launch(extra = []) {
  return puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu', ...extra] });
}
export async function open(browser, { w = 1440, h = 900, mobile = false, dpr = 1, ua, url = BASE, media = [], touch = false, ready = true } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: touch || mobile });
  if (ua) await page.setUserAgent(ua);
  if (media.length) await page.emulateMediaFeatures(media);
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('requestfailed', r => errors.push('requestfailed: ' + r.url()));
  await page.goto(url, { waitUntil: 'load' });
  if (ready) { await page.waitForFunction('window.__mk===1', { timeout: 8000 }).catch(() => errors.push('app.js no terminó de iniciar')); await page.evaluate('document.fonts.ready'); }
  page.__errors = errors;
  return page;
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
// describe el elemento enfocado: nombre/rol accesibles (CDP), anillo de foco, visibilidad, solapamiento con cabecera/barras fijas
export async function focusInfo(page, client) {
  const { result } = await client.send('Runtime.evaluate', { expression: 'document.activeElement' });
  if (!result.objectId) return null;
  const node = await client.send('DOM.describeNode', { objectId: result.objectId });
  let ax = {};
  try {
    const t = await client.send('Accessibility.getPartialAXTree', { backendNodeId: node.node.backendNodeId, fetchRelatives: false });
    const n = t.nodes.find(x => !x.ignored) || t.nodes[0];
    ax = { role: n?.role?.value, name: n?.name?.value, props: Object.fromEntries((n?.properties || []).filter(p => ['expanded', 'pressed', 'selected', 'invalid', 'required', 'checked', 'disabled'].includes(p.name)).map(p => [p.name, p.value.value])) };
  } catch {}
  const dom = await page.evaluate(() => {
    const el = document.activeElement; if (!el || el === document.body) return { body: true };
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
    const fixed = [...document.querySelectorAll('.hdr,#sticky,.fab')].filter(f => { const s = getComputedStyle(f); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.1 && !f.contains(el) });
    const hit = fixed.filter(f => { const q = f.getBoundingClientRect(); return q.width && q.height && !(r.bottom <= q.top || r.top >= q.bottom || r.right <= q.left || r.left >= q.right); }).map(f => f.id || f.className.split(' ')[0]);
    const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(cx, cy);
    return { tag: el.tagName.toLowerCase(), id: el.id, cls: (typeof el.className === 'string' ? el.className : '').split(' ')[0], ring, ringStyle: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, inView: r.bottom > 0 && r.top < innerHeight && r.width > 0, obscuredBy: hit, coveredByOther: !!top && !(el.contains(top) || top.contains(el)), vis: cs.visibility, display: cs.display, w: Math.round(r.width), h: Math.round(r.height) };
  });
  return { ...dom, ...ax };
}
