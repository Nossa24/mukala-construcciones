// Verificación automática de la v4 (minimalista): teclado, árbol de accesibilidad, anchos, preferencias,
// tareas, contraste sobre fotos y axe en varios estados. Uso:  BASE=http://127.0.0.1:8780/ node verificar.mjs
import path from 'node:path';
import sharp from 'sharp';
import { launch, open, sleep, BASE } from './lib.mjs';

const AXE = path.resolve('node_modules/axe-core/axe.min.js');
const problemas = []; const bad = m => problemas.push(m);
const out = {};
const browser = await launch();
const noSmooth = 'html{scroll-behavior:auto!important}';
const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const rgb = s => (s.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);

/* 1. Teclado ---------------------------------------------------------- */
{
  const page = await open(browser, { w: 1440, h: 900 }); await page.addStyleTag({ content: noSmooth });
  const stops = [];
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(() => {
      const el = document.activeElement; if (!el || el === document.body) return { body: true };
      const cs = getComputedStyle(el), r = el.getBoundingClientRect(), hdr = document.getElementById('hdr').getBoundingClientRect();
      const name = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50);
      const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
      const tapado = r.top < hdr.bottom - 1 && r.bottom > hdr.top && !document.getElementById('hdr').contains(el) && r.height < innerHeight * .8 && !el.classList.contains('skip');   // «Ir al contenido» se muestra a propósito sobre la cabecera
      return { tag: el.tagName.toLowerCase(), name, ring, vis: cs.visibility, disp: cs.display, tapado };
    });
    stops.push(s);
    if (s.body) break;
  }
  out.teclado = { paradas: stops.length, primeras: stops.slice(0, 5).map(s => `${s.tag}: ${s.name}`) };
  stops.filter(s => !s.body).forEach(s => {
    if (!s.name) bad(`teclado: parada sin nombre (${s.tag})`);
    if (!s.ring) bad(`teclado: sin anillo de foco: ${s.name}`);
    if (s.vis === 'hidden' || s.disp === 'none') bad(`teclado: enfocable pero oculto: ${s.name}`);
    if (s.tapado) bad(`teclado: foco tapado por la cabecera: ${s.name}`);
  });
  if (!/Ir al contenido/.test(stops[0]?.name || '')) bad('teclado: la primera parada no es «Ir al contenido»');
  // «Ir al contenido» deja el foco en <main>
  await page.goto(BASE, { waitUntil: 'load' }); await page.waitForFunction('window.__mk===1');
  await page.keyboard.press('Tab'); await page.keyboard.press('Enter'); await sleep(200);
  out.teclado.saltar = await page.evaluate(() => document.activeElement.id);
  if (out.teclado.saltar !== 'main') bad('teclado: «Ir al contenido» no lleva el foco a <main>');
  // diálogo: abre, foco dentro, Esc cierra y devuelve el foco
  await page.evaluate(() => document.querySelector('[data-open=alamos]').focus());
  await page.keyboard.press('Enter'); await sleep(400);
  const d = await page.evaluate(() => ({ abre: document.getElementById('pdlg').open, dentro: document.getElementById('pdlg').contains(document.activeElement), titulo: document.getElementById('pdTitle')?.textContent, smmlv: /SMMLV/.test(document.getElementById('pdlg').textContent) }));
  await page.keyboard.press('Escape'); await sleep(300);
  d.cierra = await page.evaluate(() => !document.getElementById('pdlg').open); d.focoVuelve = await page.evaluate(() => document.activeElement.getAttribute('data-open'));
  out.teclado.dialogo = d;
  if (!d.abre || !d.dentro || !d.cierra || d.focoVuelve !== 'alamos') bad('teclado: el diálogo no abre/cierra/devuelve el foco correctamente');
  await page.close();
}
{ // menú móvil
  const page = await open(browser, { w: 390, h: 844, mobile: true }); await page.addStyleTag({ content: noSmooth });
  await page.focus('#navToggle'); await page.keyboard.press('Enter'); await sleep(300);
  const a = await page.evaluate(() => ({ exp: document.getElementById('navToggle').getAttribute('aria-expanded'), etiqueta: document.getElementById('navToggle').getAttribute('aria-label'), items: document.querySelectorAll('#nav a').length }));
  await page.keyboard.press('Escape'); await sleep(300);
  a.cierra = await page.evaluate(() => ({ exp: document.getElementById('navToggle').getAttribute('aria-expanded'), foco: document.activeElement.id }));
  out.teclado.menuMovil = a;
  if (a.exp !== 'true' || a.cierra.exp !== 'false' || a.cierra.foco !== 'navToggle') bad('teclado: el menú móvil no abre/cierra con foco correcto');
  await page.close();
}

/* 2. Árbol de accesibilidad ------------------------------------------- */
{
  const page = await open(browser, { w: 1440, h: 900 });
  await page.evaluate(() => document.querySelectorAll('.rv').forEach(e => e.classList.add('in')));
  const r = await page.evaluate(() => ({
    lang: document.documentElement.lang, title: document.title,
    h: [...document.querySelectorAll('h1,h2,h3')].map(h => +h.tagName[1] + ' ' + h.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)),
    landmarks: ['header', 'nav', 'main', 'footer'].map(t => t + ':' + document.querySelectorAll(t).length),
    imgSinAlt: [...document.images].filter(i => !i.hasAttribute('alt')).length,
    botonesSinNombre: [...document.querySelectorAll('button,a[href]')].filter(e => !(e.getAttribute('aria-label') || e.textContent.trim())).length,
    nombresRepetidos: (() => { const m = {}; document.querySelectorAll('button[data-open],#pnl a').forEach(e => { const n = e.getAttribute('aria-label') || e.textContent.trim(); m[n] = (m[n] || 0) + 1; }); return Object.entries(m).filter(([, c]) => c > 1).map(([n]) => n); })(),
    ocultosEnfocables: [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(e => { const s = getComputedStyle(e); return (s.visibility === 'hidden' || s.display === 'none') && e.tabIndex >= 0; }).map(e => e.id || e.className).slice(0, 3)
  }));
  out.arbol = r;
  const lv = r.h.map(x => +x[0]);
  if (lv.filter(x => x === 1).length !== 1) bad('encabezados: debe haber un solo H1');
  lv.forEach((x, i) => { if (i && x - lv[i - 1] > 1) bad('encabezados: salto de nivel en «' + r.h[i] + '»'); });
  if (r.lang !== 'es-CO') bad('idioma del documento');
  if (r.imgSinAlt) bad(`${r.imgSinAlt} imágenes sin atributo alt`);
  if (r.botonesSinNombre) bad(`${r.botonesSinNombre} enlaces/botones sin nombre`);
  if (r.nombresRepetidos.length) bad('nombres repetidos en botones de proyecto: ' + r.nombresRepetidos.join(', '));
  if (r.landmarks.join() !== 'header:1,nav:1,main:1,footer:1') bad('puntos de referencia: ' + r.landmarks.join());
  await page.close();
}

/* 3. Anchos: desbordes, objetivos táctiles, menú ------------------------ */
{
  const filas = [];
  for (const w of [320, 360, 375, 390, 430, 600, 768, 820, 900, 901, 1024, 1280, 1366, 1440, 1920]) {
    const page = await open(browser, { w, h: 800, mobile: w < 700 });
    await page.addStyleTag({ content: noSmooth + ' *,*::before,*::after{transition:none!important;animation:none!important} .js .rv{opacity:1!important;translate:none!important}' });
    const m = await page.evaluate(() => {
      const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const nm = e => e.id ? '#' + e.id : (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(' ')[0] : e.tagName.toLowerCase());
      const over = [...new Set([...document.querySelectorAll('body *')].filter(e => !e.closest('svg,.hero__img,.pn__media,.contact__bg,dialog') && vis(e) && e.getBoundingClientRect().right > innerWidth + 1).map(nm))].slice(0, 5);
      const small = [...document.querySelectorAll('a[href],button,summary')].filter(e => vis(e) && !e.closest('#nav:not(.x)') ? false : false);
      const peq = [...document.querySelectorAll('a[href],button')].filter(e => { if (!vis(e)) return false; const r = e.getBoundingClientRect(); return (r.width < 44 || r.height < 44) && !e.classList.contains('skip'); }).map(e => nm(e) + ' ' + Math.round(e.getBoundingClientRect().width) + '×' + Math.round(e.getBoundingClientRect().height));
      const tiny = [...document.querySelectorAll('body *')].filter(e => !e.closest('svg,.logo') && vis(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1) && parseFloat(getComputedStyle(e).fontSize) < 12).length;
      const toggle = getComputedStyle(document.getElementById('navToggle')).display !== 'none';
      const cta = document.querySelector('#nav .btn').getBoundingClientRect(), logo = document.querySelector('.logo').getBoundingClientRect(), nav = document.getElementById('nav').getBoundingClientRect();
      return { sw: document.documentElement.scrollWidth, iw: innerWidth, over, peq, tiny, menu: toggle ? 'botón' : 'en línea', ctaFuera: !toggle && cta.right > innerWidth - 8, solapa: !toggle && nav.left < logo.right + 8 };
    });
    filas.push({ w, ...m });
    if (m.sw > m.iw) bad(`${w}px: scroll horizontal (${m.sw} > ${m.iw})`);
    if (m.over.length) bad(`${w}px: desbordes ${m.over}`);
    if (m.peq.length) bad(`${w}px: objetivos táctiles < 44 px: ${m.peq.slice(0, 3).join('; ')}`);
    if (m.tiny) bad(`${w}px: ${m.tiny} textos < 12 px`);
    if (m.ctaFuera) bad(`${w}px: el botón del menú se sale de la pantalla`);
    if (m.solapa) bad(`${w}px: el menú se solapa con el logotipo`);
    await page.close();
  }
  out.anchos = filas.map(f => `${f.w}: ${f.menu}, sin desborde=${f.sw <= f.iw}`);
}

/* 4. Preferencias del sistema ---------------------------------------- */
{
  const rm = await open(browser, { w: 1440, h: 900, media: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  out.movimientoReducido = await rm.evaluate(() => ({ animHero: getComputedStyle(document.querySelector('.hero__img')).animationName, ocultos: [...document.querySelectorAll('.rv')].filter(e => getComputedStyle(e).opacity < 1).length }));
  if (out.movimientoReducido.animHero !== 'none' && getComputedStyleOk(out.movimientoReducido)) bad('movimiento reducido: la portada se sigue animando');
  if (out.movimientoReducido.ocultos) bad('movimiento reducido: hay bloques sin mostrar');
  await rm.close();
  const fc = await open(browser, { w: 1440, h: 900, media: [{ name: 'forced-colors', value: 'active' }] });
  out.coloresForzados = await fc.evaluate(() => ({ borde: getComputedStyle(document.querySelector('.btn--gold')).borderTopStyle, activo: matchMedia('(forced-colors:active)').matches }));
  await fc.close();
  for (const pct of [150, 200]) {
    const page = await open(browser, { w: 390, h: 844, mobile: true });
    await page.addStyleTag({ content: `html{font-size:${pct}%!important} *,*::before,*::after{transition:none!important} .js .rv{opacity:1!important;translate:none!important}` }); await sleep(300);
    const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, recortes: [...document.querySelectorAll('button,a,h1,h2,h3,p,li,dt,dd')].filter(e => /hidden|clip/.test(getComputedStyle(e).overflowX) && e.scrollWidth > e.clientWidth + 2 && !e.closest('.btn') && !e.classList.contains('sr') && !e.classList.contains('skip')).length }));
    out['texto' + pct] = r;
    if (r.sw > r.iw) bad(`texto al ${pct} %: la página se ensancha (${r.sw} > ${r.iw})`);
    if (r.recortes) bad(`texto al ${pct} %: ${r.recortes} textos recortados`);
    await page.close();
  }
}
function getComputedStyleOk() { return true; }

/* 5. Tareas guionadas (no sustituyen a usuarios reales) ----------------- */
{
  const page = await open(browser, { w: 390, h: 844, mobile: true, dpr: 3 });
  await page.addStyleTag({ content: noSmooth }); await page.evaluate(() => { window.__abiertas = []; window.open = u => { window.__abiertas.push(u); return null; }; });
  const hero = await page.evaluate(() => ({ vis: /interés social \(VIS\)/.test(document.querySelector('.hero').textContent), wa: document.querySelector('.hero .btn--ghost').href.startsWith('https://wa.me/573135467112?text=') }));
  await page.tap('.hero .btn--gold'); await sleep(900);
  const llega = await page.evaluate(() => { const r = document.getElementById('pnl').getBoundingClientRect(); return r.top < innerHeight * .5; });
  await page.evaluate(() => document.querySelector('[data-open=alamos]').scrollIntoView({ block: 'center' })); await sleep(400);
  await page.tap('[data-open=alamos]'); await sleep(500);
  const det = await page.evaluate(() => ({ abre: document.getElementById('pdlg').open, precio: /\$236\.372\.175/.test(document.getElementById('pdlg').textContent), smmlv: /salarios mínimos legales vigentes \(SMMLV\)/.test(document.getElementById('pdlg').textContent) }));
  out.tareas = { heroVIS: hero.vis, heroWhatsApp: hero.wa, verProyectos: llega, detalleAlamos: det };
  if (!hero.vis) bad('tareas: VIS no está definido en la portada');
  if (!hero.wa) bad('tareas: el botón de la portada no abre WhatsApp con mensaje');
  if (!llega) bad('tareas: «Ver proyectos» no lleva a los proyectos');
  if (!det.abre || !det.precio || !det.smmlv) bad('tareas: el detalle de Álamos no muestra precio y SMMLV definido');
  await page.close();
  const c = await open(browser, { w: 390, h: 844, mobile: true });
  out.tareas.contacto = await c.evaluate(() => ({ tel: !!document.querySelector('a[href="tel:+573135467112"]'), mail: !!document.querySelector('a[href^="mailto:"]'), exterior: [...document.querySelectorAll('#contacto a')].some(a => /vivo fuera de Colombia/i.test(decodeURIComponent(a.href))) }));
  if (!out.tareas.contacto.tel || !out.tareas.contacto.mail || !out.tareas.contacto.exterior) bad('tareas: faltan enlaces de contacto');
  await c.close();
}

/* 6. Contraste del texto sobre fotos (muestreo de píxeles) ---------------- */
{
  let peor = 99; const det = [];
  for (const [w, h, nombre] of [[1440, 900, 'escritorio'], [390, 844, 'móvil']]) {
    const page = await open(browser, { w, h, mobile: w < 700 });
    await page.addStyleTag({ content: noSmooth + ' *,*::before,*::after{transition:none!important;animation:none!important} .js .rv{opacity:1!important;translate:none!important}' });
    const objetivos = await page.evaluate(() => [...document.querySelectorAll('.hero h1,.hero__sub,.pn__k,.pn__h,.pn__s,.contact h2,.contact .lead,.contact__l li,.hero .btn--ghost,.pn .btn--ghost,.contact .btn--ghost')].map((e, i) => { e.dataset.mx = i; return { i, c: getComputedStyle(e).color, sel: e.className || e.tagName, tam: parseFloat(getComputedStyle(e).fontSize), peso: +getComputedStyle(e).fontWeight }; }));
    for (const o of objetivos) {
      await page.evaluate(i => { const e = document.querySelector(`[data-mx="${i}"]`); e.scrollIntoView({ block: 'center' }); document.querySelectorAll('[data-mx]').forEach(x => x.style.visibility = 'hidden'); }, o.i);
      await sleep(350);
      const rect = await page.evaluate(i => { const e = document.querySelector(`[data-mx="${i}"]`); e.style.visibility = 'visible'; const r = e.getBoundingClientRect(); e.style.visibility = 'hidden'; return { x: r.left, y: r.top, w: r.width, h: r.height, vis: r.bottom > 0 && r.top < innerHeight }; }, o.i);
      if (!rect.vis) continue;
      const png = await page.screenshot({ type: 'png' }); const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
      let worst = 99; const col = rgb(o.c);
      for (let y = Math.max(0, Math.floor(rect.y)); y < Math.min(info.height, Math.ceil(rect.y + rect.h)); y += 3) for (let x = Math.max(0, Math.floor(rect.x)); x < Math.min(info.width, Math.ceil(rect.x + Math.min(rect.w, 700))); x += 3) { const k = (y * info.width + x) * info.channels; const c = ratio(col, [data[k], data[k + 1], data[k + 2]]); if (c < worst) worst = c; }
      const grande = o.tam >= 24 || (o.tam >= 18.66 && o.peso >= 700);
      const umbral = grande ? 3 : 4.5;
      if (worst < peor) peor = worst;
      if (worst < umbral) bad(`contraste (${nombre}): ${o.sel} = ${worst.toFixed(2)}:1 (mínimo ${umbral})`);
      det.push(`${nombre} ${String(o.sel).split(' ')[0]} ${worst.toFixed(1)}`);
      await page.evaluate(() => document.querySelectorAll('[data-mx]').forEach(x => x.style.visibility = ''));
    }
    await page.close();
  }
  out.contrasteMinimo = peor.toFixed(2);
}

/* 7. axe-core en varios estados ------------------------------------------ */
{
  const filas = [];
  async function axe(page, nombre) {
    await page.addScriptTag({ path: AXE });
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' }); await sleep(300);
    const v = await page.evaluate(async () => { const x = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }); return x.violations.map(a => a.impact + ' ' + a.id + ' ×' + a.nodes.length + ' → ' + a.nodes[0].target.join(' ')); });
    filas.push(`${nombre}: ${v.length ? v.join(' | ') : '0 violaciones'}`); v.forEach(x => bad('axe · ' + nombre + ': ' + x));
  }
  let p = await open(browser, { w: 1440, h: 900 }); await p.evaluate(() => document.querySelectorAll('.rv').forEach(e => e.classList.add('in'))); await axe(p, 'escritorio');
  await p.evaluate(() => document.querySelector('[data-open=alamos]').click()); await sleep(400); await axe(p, 'escritorio · detalle abierto'); await p.close();
  p = await open(browser, { w: 390, h: 844, mobile: true }); await p.evaluate(() => document.querySelectorAll('.rv').forEach(e => e.classList.add('in'))); await axe(p, 'móvil 390');
  await p.evaluate(() => document.getElementById('navToggle').click()); await sleep(400); await axe(p, 'móvil · menú abierto'); await p.close();
  p = await open(browser, { w: 820, h: 1100 }); await p.evaluate(() => document.querySelectorAll('.rv').forEach(e => e.classList.add('in'))); await axe(p, 'tablet 820'); await p.close();
  out.axe = filas;
}

await browser.close();
console.log(JSON.stringify(out, null, 1));
console.log(problemas.length ? 'PROBLEMAS:\n - ' + problemas.join('\n - ') : 'PROBLEMAS: ninguno');
