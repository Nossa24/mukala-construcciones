import { webkit, firefox, chromium, devices } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:8780/';
const targets = [
  { name: 'Safari/WebKit escritorio', engine: webkit, ctx: { viewport: { width: 1440, height: 900 } } },
  { name: 'Safari/WebKit iPhone 14', engine: webkit, ctx: { ...devices['iPhone 14'] } },
  { name: 'Safari/WebKit iPhone 14 horizontal', engine: webkit, ctx: { ...devices['iPhone 14 landscape'] } },
  { name: 'Safari/WebKit iPad', engine: webkit, ctx: { ...devices['iPad (gen 7)'] } },
  { name: 'Firefox escritorio', engine: firefox, ctx: { viewport: { width: 1440, height: 900 } } },
  { name: 'Firefox móvil 390', engine: firefox, ctx: { viewport: { width: 390, height: 844 }, hasTouch: false } },
  { name: 'Chrome Pixel 7', engine: chromium, launch: { channel: 'chrome' }, ctx: { ...devices['Pixel 7'] } },
];
const results = []; const issues = [];
for (const t of targets) {
  let browser;
  try { browser = await t.engine.launch({ ...(t.launch || {}) }); } catch (e) { issues.push(`${t.name}: NO ARRANCÓ (${String(e.message).split('\n')[0].slice(0,120)})`); continue; }
  const context = await browser.newContext(t.ctx); const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push('pageerror: ' + e.message)); page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); }); page.on('requestfailed', r => errors.push('requestfailed: ' + r.url()));
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForFunction('window.__mk===1', null, { timeout: 10000 }).catch(() => errors.push('app.js no terminó de iniciar'));
  await page.evaluate('document.fonts.ready');
  const m = await page.evaluate(() => {
    const out = {};
    out.fuente = document.fonts.check('16px Archivo') && [...document.fonts].some(f => f.family.includes('Archivo') && f.status === 'loaded');
    out.ancho = { sw: document.documentElement.scrollWidth, iw: innerWidth };
    out.intl = new Intl.NumberFormat('es-CO').format(236372175);
    // el eje de ancho (wdth) de la fuente variable funciona si el texto expandido es más ancho que el normal
    const t = document.createElement('span'); t.textContent = 'MUKALA CONSTRUCCIONES'; t.style.cssText = 'position:absolute;visibility:hidden;font:800 30px Archivo;white-space:nowrap'; document.body.appendChild(t);
    t.style.fontStretch = '100%'; const w100 = t.getBoundingClientRect().width; t.style.fontStretch = '125%'; const w125 = t.getBoundingClientRect().width; t.remove();
    out.ejeAncho = { normal: Math.round(w100), expandido: Math.round(w125), funciona: w125 > w100 * 1.05 };
    out.soporte = { dvh: CSS.supports('height', '100dvh'), backdrop: CSS.supports('backdrop-filter', 'blur(4px)') || CSS.supports('-webkit-backdrop-filter', 'blur(4px)'), dialog: typeof HTMLDialogElement === 'function' && typeof document.createElement('dialog').showModal === 'function', aspect: CSS.supports('aspect-ratio', '1/1'), env: CSS.supports('padding', 'env(safe-area-inset-left)'), minmax: CSS.supports('grid-template-columns', 'repeat(2,minmax(0,1fr))') };
    out.h1 = getComputedStyle(document.querySelector('h1')).fontFamily.split(',')[0];
    out.cardsFila = document.querySelectorAll('#idx .card').length;
    return out;
  });
  // flujos: filtro, diálogo, asistente, formulario
  const flujos = {};
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await page.evaluate(() => document.querySelectorAll('.rv').forEach(e => e.classList.add('in')));
  await page.waitForTimeout(1200);
  const shotBase0 = `shots/${t.name.replace(/[^a-z0-9]+/gi, '_')}`; await page.screenshot({ path: `${shotBase0}_hero.png` });
  await page.click('#fType [data-v=locales]', { force: true }); flujos.filtroLocales = await page.$$eval('#idx .card', r => r.length);
  await page.click('#fType [data-v=todos]', { force: true });
  await page.click('.card[data-open=alamos]', { force: true }); await page.waitForTimeout(500);
  flujos.dialogoAbre = await page.$eval('#pdlg', d => d.open && getComputedStyle(d).position === 'fixed');
  flujos.dialogoCentrado = await page.$eval('#pdlg', d => { const r = d.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1; });
  await page.keyboard.press('Escape'); await page.waitForTimeout(300); flujos.dialogoCierraConEsc = await page.$eval('#pdlg', d => !d.open);
  for (const sel of ['[data-k=type] [data-v=apartamentos]', '[data-k=budget] [data-v=b240]', '[data-k=when] [data-v="2627"]', '[data-k=fin] [data-v="crédito hipotecario"]']) await page.click(sel, { force: true });
  flujos.asistenteLlegaAlFinal = await page.$eval('#wzStep', e => e.textContent); flujos.reco = await page.$eval('#reco', e => e.hidden ? '(oculto)' : e.textContent.replace(/\s+/g, ' ').slice(0, 60));
  await page.fill('#nName', ''); await page.evaluate(() => { window.open = () => null; });
  await page.click('#form button[type=submit]', { force: true }); flujos.errorForm = await page.$eval('#formErr', e => e.textContent.slice(0, 45));
  await page.fill('#nName', 'Ana'); await page.fill('#nPhone', '3001234567'); await page.click('#form button[type=submit]', { force: true });
  flujos.exitoConRespaldo = await page.$eval('#formErr', e => e.classList.contains('ok') && !!e.querySelector('a'));
  // simulador
  await page.click('#tab-sim', { force: true }); flujos.cuota = await page.$eval('#rPay', e => e.textContent);
  const shotBase = `shots/${t.name.replace(/[^a-z0-9]+/gi, '_')}`;
  await page.evaluate(() => { document.querySelector('#proyectos').scrollIntoView(); }); await page.waitForTimeout(300); await page.screenshot({ path: `${shotBase}_proyectos.png` });
  await page.evaluate(() => { document.querySelector('#alamos').scrollIntoView(); }); await page.waitForTimeout(300); await page.screenshot({ path: `${shotBase}_alamos.png` });
  const r = { name: t.name, errors, ...m, flujos };
  results.push(r);
  if (errors.length) issues.push(`${t.name}: errores ${errors.join(' | ')}`);
  if (!m.fuente) issues.push(`${t.name}: la fuente Archivo no cargó`);
  if (!m.ejeAncho.funciona) issues.push(`${t.name}: el eje de ancho de la fuente variable NO funciona (${m.ejeAncho.normal} vs ${m.ejeAncho.expandido})`);
  if (m.ancho.sw > m.ancho.iw) issues.push(`${t.name}: scroll horizontal (${m.ancho.sw}>${m.ancho.iw})`);
  if (m.intl !== '236.372.175') issues.push(`${t.name}: formato de precio distinto: ${m.intl}`);
  Object.entries(m.soporte).forEach(([k, v]) => { if (!v) issues.push(`${t.name}: sin soporte de ${k}`); });
  if (flujos.filtroLocales !== 1) issues.push(`${t.name}: filtro de locales devolvió ${flujos.filtroLocales}`);
  if (!flujos.dialogoAbre) issues.push(`${t.name}: el diálogo no abre como modal fijo`);
  if (!flujos.dialogoCentrado) issues.push(`${t.name}: el diálogo se sale de la pantalla`);
  if (!flujos.dialogoCierraConEsc) issues.push(`${t.name}: Esc no cierra el diálogo`);
  if (!/Paso 5/.test(flujos.asistenteLlegaAlFinal)) issues.push(`${t.name}: el asistente no llegó al paso 5 (${flujos.asistenteLlegaAlFinal})`);
  if (!flujos.exitoConRespaldo) issues.push(`${t.name}: el formulario no mostró éxito con enlace de respaldo`);
  await browser.close();
}
results.forEach(r => console.log(`\n== ${r.name}\n  fuente=${r.fuente} ejeAncho=${r.ejeAncho.normal}→${r.ejeAncho.expandido} intl=${r.intl} ancho=${r.ancho.sw}/${r.ancho.iw} filas=${r.cardsFila}\n  soporte=${JSON.stringify(r.soporte)}\n  flujos=${JSON.stringify(r.flujos)}\n  errores=${r.errors.length ? r.errors.join(' | ') : 'ninguno'}`));
console.log('\nPROBLEMAS:', issues.length ? '\n - ' + issues.join('\n - ') : 'ninguno');
