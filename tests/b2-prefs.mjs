import { launch, open, sleep } from './lib.mjs';
const browser = await launch(); const out = {}; const problemas = []; const bad = m => problemas.push(m);

/* 1. movimiento reducido */
{
  const page = await open(browser, { w: 1440, h: 900, media: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await sleep(8000);
  out.movimientoReducido = await page.evaluate(() => {
    const on = [...document.querySelectorAll('.slide')].findIndex(s => s.classList.contains('is-on'));
    const running = document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.getTiming().iterations === Infinity).map(a => (a.effect.target && (a.effect.target.id || a.effect.target.className.toString().split(' ')[0])) || '?');
    const mq = document.getElementById('mqBand').classList.contains('is-paused');
    const rv = [...document.querySelectorAll('.rv')].filter(e => +getComputedStyle(e).opacity < 1).length;
    const h1t = getComputedStyle(document.querySelector('.hero h1 .ln > span')).transform;
    const words = [...document.querySelectorAll('.mani__txt .w')].filter(w => !w.classList.contains('on')).length;
    const stats = [...document.querySelectorAll('[data-count]')].map(e => e.textContent).join(',');
    return { diapositivaTras8s: on, presentacionEtiqueta: document.getElementById('pp').getAttribute('aria-label'), animacionesInfinitasCorriendo: running, cintaPausada: mq, bloquesOcultos: rv, h1Transform: h1t, palabrasApagadas: words, cifras: stats };
  });
  const m = out.movimientoReducido;
  if (m.diapositivaTras8s !== 0) bad('con movimiento reducido la presentación avanzó sola');
  if (m.animacionesInfinitasCorriendo.length) bad('animaciones infinitas con movimiento reducido: ' + m.animacionesInfinitasCorriendo.join(','));
  if (!m.cintaPausada) bad('la cinta no arranca pausada con movimiento reducido');
  if (m.bloquesOcultos) bad(`${m.bloquesOcultos} bloques .rv siguen ocultos con movimiento reducido`);
  await page.close();
}

/* 2. colores forzados (modo de alto contraste de Windows) */
{
  const page = await open(browser, { w: 1440, h: 900, media: [{ name: 'forced-colors', value: 'active' }] });
  await sleep(600); await page.screenshot({ path: 'shots/forced_hero.png' });
  await page.evaluate(() => { document.querySelectorAll('.rv').forEach(e => e.classList.add('in')); document.querySelector('#proyectos').scrollIntoView(); }); await sleep(400);
  await page.screenshot({ path: 'shots/forced_proyectos.png' });
  out.coloresForzados = await page.evaluate(() => ({ activo: matchMedia('(forced-colors: active)').matches, botonDorado: (() => { const b = document.querySelector('.hero .btn--gold'); const s = getComputedStyle(b); return { borde: s.borderTopWidth + ' ' + s.borderTopStyle, color: s.borderTopColor }; })() }));
  await page.close();
}

/* 3. texto grande del sistema (150 % y 200 %) en móvil */
for (const pct of [150, 200]) {
  const page = await open(browser, { w: 390, h: 844, mobile: true, dpr: 2 });
  await page.addStyleTag({ content: `html{font-size:${pct}%!important}` }); await sleep(300);
  await page.evaluate(() => { const st = document.createElement('style'); st.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.head.appendChild(st); document.querySelectorAll('.rv').forEach(e => e.classList.add('in')); document.querySelectorAll('.ln>span').forEach(s => s.style.transform = 'none'); });
  const r = await page.evaluate(() => {
    const nm = el => el.id ? '#' + el.id : (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(' ')[0] : el.tagName.toLowerCase());
    const over = [...new Set([...document.querySelectorAll('body *')].filter(e => { if (e.closest('svg,.mq,.slides,.topo,.gal,.cards,.cmp__w,.giant,.ghost,.hdr,#sticky,.fab,aside')) return false; const q = e.getBoundingClientRect(); return q.right > innerWidth + 1 && q.width > 0; }).map(nm))].slice(0, 6);
    // texto recortado: contenedores con overflow hidden cuyo contenido de texto excede su caja
    const clipped = [...document.querySelectorAll('button,a,.chip,.tag,label,th,td,h1,h2,h3,p,li,summary')].filter(el => { const cs = getComputedStyle(el); if (!/hidden|clip/.test(cs.overflowX)) return false; if (el.closest('.mq,.gal,.cmp__w,.giant,.btn')) return false; return el.scrollWidth > el.clientWidth + 2; }).map(nm).slice(0, 6);
    return { sw: document.documentElement.scrollWidth, iw: innerWidth, over, clipped };
  });
  out['textoGrande' + pct] = r;
  if (r.sw > r.iw || r.over.length) bad(`texto al ${pct}%: desborde ${r.over.join(',')}`);
  if (r.clipped.length) bad(`texto al ${pct}%: recortes ${r.clipped.join(',')}`);
  await page.screenshot({ path: `shots/texto${pct}_hero.png` });
  await page.close();
}

/* 4. zoom del navegador 200 % (1280×720 → 640×360) */
{
  const page = await open(browser, { w: 640, h: 360, dpr: 2 });
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, menu: getComputedStyle(document.getElementById('navToggle')).display }));
  out.zoom200 = r; if (r.sw > r.iw) bad('zoom 200 %: scroll horizontal');
  await page.close();
}

/* 5. muescas del iPhone en horizontal (inset de área segura) */
{
  const page = await open(browser, { w: 844, h: 390, mobile: true, dpr: 3 });
  const client = await page.createCDPSession();
  try {
    await client.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 0, left: 47, right: 47, bottom: 21 } });
    await page.evaluate(() => document.getElementById('sticky').classList.add('on')); await sleep(300);
    out.areaSegura = await page.evaluate(() => {
      const pl = parseFloat(getComputedStyle(document.querySelector('.hero__in')).paddingLeft), pr = parseFloat(getComputedStyle(document.querySelector('.hero__in')).paddingRight);
      const st = document.getElementById('sticky'), sb = parseFloat(getComputedStyle(st).paddingBottom);
      const btn = document.querySelector('#sticky .btn').getBoundingClientRect();
      const logo = document.querySelector('.logo').getBoundingClientRect(), tg = document.getElementById('navToggle').getBoundingClientRect();
      return { paddingIzq: pl, paddingDer: pr, barraPaddingInferior: sb, botonBarraIzq: Math.round(btn.left), logoIzq: Math.round(logo.left), menuDer: Math.round(innerWidth - tg.right) };
    });
    const a = out.areaSegura; if (a.paddingIzq < 47 || a.paddingDer < 47) bad('el contenido no respeta la muesca lateral'); if (a.logoIzq < 47) bad('el logo queda bajo la muesca'); if (a.menuDer < 47 - 10) bad('el botón de menú queda bajo la muesca');
    await page.screenshot({ path: 'shots/muesca_horizontal.png' });
  } catch (e) { out.areaSegura = 'no se pudo emular: ' + e.message.split('\n')[0]; }
  await page.close();
}

/* 6. teléfono lento: CPU 6× + red 4G lenta y 3G */
for (const [nombre, down, up, rtt] of [['4G lenta (1,6 Mbps, 150 ms)', 1.6e6 / 8, 750e3 / 8, 150], ['3G lenta (500 kbps, 400 ms)', 500e3 / 8, 500e3 / 8, 400]]) {
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 740, deviceScaleFactor: 2.6, isMobile: true, hasTouch: true });
  const client = await page.createCDPSession();
  await client.send('Network.enable'); await client.send('Network.emulateNetworkConditions', { offline: false, downloadThroughput: down, uploadThroughput: up, latency: rtt });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 6 }); await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  await page.evaluateOnNewDocument(() => {
    window.__m = { lcp: 0, cls: 0, longTasks: 0, longMs: 0 };
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__m.longTasks++; window.__m.longMs += e.duration; } }).observe({ type: 'longtask', buffered: true });
  });
  const t0 = Date.now(); await page.goto(process.env.BASE || 'http://127.0.0.1:8780/', { waitUntil: 'load', timeout: 90000 }); const loadMs = Date.now() - t0;
  await page.waitForFunction('window.__mk===1', { timeout: 60000 }).catch(() => {}); const readyMs = Date.now() - t0; await sleep(1500);
  const m = await page.evaluate(() => { const fcp = performance.getEntriesByName('first-contentful-paint')[0]; return { fcp: fcp ? Math.round(fcp.startTime) : null, lcp: Math.round(window.__m.lcp), cls: +window.__m.cls.toFixed(3), tareasLargas: window.__m.longTasks, msBloqueados: Math.round(window.__m.longMs), contenidoVisible: !!document.querySelector('.hero h1') && getComputedStyle(document.querySelector('.hero .lead')).opacity !== '0', filas: document.querySelectorAll('#idx .card').length, bytes: Math.round(performance.getEntriesByType('resource').reduce((a, r) => a + (r.transferSize || 0), 0) / 1024) }; });
  out['lento ' + nombre] = { loadMs, appListaMs: readyMs, ...m };
  if (m.cls > 0.1) bad(`${nombre}: CLS ${m.cls}`); if (!m.contenidoVisible || m.filas !== 6) bad(`${nombre}: contenido no disponible`);
  await page.close();
}
console.log(JSON.stringify({ problemas, ...out }, null, 1));
await browser.close();
