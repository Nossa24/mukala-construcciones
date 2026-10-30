import { launch, open, sleep } from './lib.mjs';
import path from 'node:path';
const AXE = path.resolve('node_modules/axe-core/axe.min.js');
const browser = await launch();
const rows = []; const detail = [];
async function axeRun(page, nombre) {
  await page.addScriptTag({ path: AXE });
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
  await sleep(300);
  const r = await page.evaluate(async () => { const x = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }, resultTypes: ['violations', 'incomplete'] }); return { v: x.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, ej: v.nodes.slice(0, 2).map(n => n.target.join(' ') + ' :: ' + (n.any[0]?.message || n.failureSummary || '').slice(0, 110)) })), inc: x.incomplete.map(i => i.id + ' ×' + i.nodes.length), pass: x.passes.length }; });
  rows.push({ nombre, violaciones: r.v.length, reglas: r.pass }); r.v.forEach(v => detail.push(`${nombre}: ${v.impact} ${v.id} ×${v.n} → ${v.ej.join(' | ')}`));
}
const prep = p => p.evaluate(() => { document.querySelectorAll('.rv').forEach(e => e.classList.add('in')); document.querySelectorAll('.ln>span').forEach(s => s.style.transform = 'none'); document.querySelectorAll('.mani__txt .w').forEach(w => w.classList.add('on')); });
{ const p = await open(browser, { w: 1440, h: 900 }); await prep(p); await axeRun(p, 'escritorio'); 
  await p.evaluate(() => { window.open = () => null; });
  await p.click('.card[data-open=alamos]'); await sleep(300); await axeRun(p, 'escritorio · diálogo de proyecto abierto'); await p.keyboard.press('Escape');
  await p.evaluate(() => document.querySelector('[data-lb]').click()); await sleep(200); await axeRun(p, 'escritorio · visor de fotos abierto'); await p.keyboard.press('Escape');
  await p.click('#form button[type=submit]'); await sleep(150); await axeRun(p, 'escritorio · formulario con error');
  await p.type('#nName', 'Ana'); await p.type('#nPhone', '3001234567'); await p.click('#form button[type=submit]'); await sleep(150); await axeRun(p, 'escritorio · formulario con éxito y enlace de respaldo');
  await p.click('#tab-sim'); await p.$eval('#cRate', e => { e.value = '80'; e.dispatchEvent(new Event('input', { bubbles: true })); e.blur(); }); await sleep(150); await axeRun(p, 'escritorio · simulador con tasa inválida');
  await p.click('#tab-wizard'); for (const s of ['[data-k=type] [data-v=casas]', '[data-k=budget] [data-v=b200]', '[data-k=when] [data-v=ya]', '[data-k=fin] [data-v="recursos propios"]']) await p.click(s); await p.click('#wForm button[type=submit]'); await sleep(150); await axeRun(p, 'escritorio · asistente en el último paso con error');
  await p.click('#fType [data-v=locales]'); await p.select('#fCity', 'Pereira'); await sleep(150); await axeRun(p, 'escritorio · estado vacío de proyectos');
  await p.close(); }
{ const p = await open(browser, { w: 390, h: 844, mobile: true, dpr: 3 }); await prep(p); await p.evaluate(() => { document.getElementById('sticky').classList.add('on'); }); await axeRun(p, 'móvil 390'); 
  await p.tap('#navToggle'); await sleep(300); await axeRun(p, 'móvil · menú abierto'); await p.close(); }
{ const p = await open(browser, { w: 820, h: 1180, mobile: true, dpr: 2 }); await prep(p); await axeRun(p, 'tablet 820'); await p.close(); }
rows.forEach(r => console.log(`${r.violaciones === 0 ? '✓' : '✗'} ${r.nombre.padEnd(60)} violaciones: ${r.violaciones} (${r.reglas} reglas aprobadas)`));
console.log('\nDETALLE:', detail.length ? '\n - ' + detail.join('\n - ') : 'ninguna violación');
await browser.close();
