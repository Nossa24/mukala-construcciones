// Mismos flujos en WebKit (motor de Safari), Chrome móvil y, si arranca, Firefox. Uso: BASE=http://127.0.0.1:8780/ node engines.mjs
import { webkit, firefox, chromium, devices } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:8780/';
const targets = [
  { name: 'Safari/WebKit escritorio', engine: webkit, ctx: { viewport: { width: 1440, height: 900 } } },
  { name: 'Safari/WebKit iPhone 14', engine: webkit, ctx: { ...devices['iPhone 14'] } },
  { name: 'Safari/WebKit iPhone 14 horizontal', engine: webkit, ctx: { ...devices['iPhone 14 landscape'] } },
  { name: 'Safari/WebKit iPad', engine: webkit, ctx: { ...devices['iPad (gen 7)'] } },
  { name: 'Firefox escritorio', engine: firefox, ctx: { viewport: { width: 1440, height: 900 } } },
  { name: 'Firefox móvil 390', engine: firefox, ctx: { viewport: { width: 390, height: 844 } } },
  { name: 'Chrome Pixel 7', engine: chromium, launch: { channel: 'chrome' }, ctx: { ...devices['Pixel 7'] } },
];
const issues = [];
for (const t of targets) {
  let browser;
  try { browser = await t.engine.launch(t.launch || {}); } catch (e) { issues.push(`${t.name}: NO ARRANCÓ (${String(e.message).split('\n')[0].slice(0, 70)})`); continue; }
  const errs = [];
  try {
    const ctx = await browser.newContext(t.ctx); const page = await ctx.newPage();
    page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(BASE, { waitUntil: 'load' }); await page.waitForFunction('window.__mk===1', null, { timeout: 8000 }).catch(() => errs.push('app.js no inició'));
    await page.evaluate('document.fonts.ready');
    const r = await page.evaluate(() => ({ fuente: document.fonts.check('700 20px Archivo'), ejeAncho: (() => { const s = document.createElement('span'); s.textContent = 'Mukala Construcciones'; s.style.cssText = 'position:absolute;visibility:hidden;font:600 32px Archivo;font-stretch:62%'; document.body.append(s); const a = s.getBoundingClientRect().width; s.style.fontStretch = '125%'; const b = s.getBoundingClientRect().width; s.remove(); return a < b; })(), paneles: document.querySelectorAll('#pnl .pn').length, hero: !!document.querySelector('.hero__img').naturalWidth, ancho: document.documentElement.scrollWidth <= innerWidth }));
    await page.evaluate(() => document.querySelector('[data-open=alamos]').click()); await page.waitForTimeout(400);
    const d = await page.evaluate(() => ({ abre: document.getElementById('pdlg').open, titulo: document.getElementById('pdTitle')?.textContent }));
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    d.cierra = await page.evaluate(() => !document.getElementById('pdlg').open);
    let menu = 'n/a';
    if (await page.evaluate(() => getComputedStyle(document.getElementById('navToggle')).display !== 'none')) { await page.click('#navToggle'); menu = await page.evaluate(() => document.getElementById('navToggle').getAttribute('aria-expanded')); }
    console.log(`== ${t.name}\n  fuente=${r.fuente} ejeAncho=${r.ejeAncho} paneles=${r.paneles} imagenPortada=${r.hero} sinDesborde=${r.ancho}\n  detalle=${JSON.stringify(d)} menú=${menu}\n  errores=${errs.length ? errs.join(' | ') : 'ninguno'}`);
    if (!r.fuente || !r.ejeAncho || r.paneles !== 6 || !r.hero || !r.ancho || !d.abre || !d.cierra || errs.length) issues.push(`${t.name}: revisar`);
  } catch (e) { issues.push(`${t.name}: ${String(e.message).slice(0, 90)}`); }
  await browser.close();
}
console.log('\nPROBLEMAS:' + (issues.length ? '\n - ' + issues.join('\n - ') : ' ninguno'));
