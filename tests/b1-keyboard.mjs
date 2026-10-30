import { launch, open, focusInfo, sleep } from './lib.mjs';
const browser = await launch();
const out = { problemas: [] };
const bad = (m) => out.problemas.push(m);

/* ---------- A. recorrido completo con Tab (escritorio) ---------- */
{
  const page = await open(browser, { w: 1440, h: 900 }); await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  const client = await page.createCDPSession(); await client.send('Accessibility.enable'); await client.send('DOM.enable'); await client.send('Runtime.enable');
  const steps = []; const seen = new Set();
  for (let i = 0; i < 160; i++) {
    await page.keyboard.press('Tab'); await sleep(25);
    const f = await focusInfo(page, client); if (!f) break;
    if (f.body) { steps.push({ i, body: true }); if (steps.filter(s => s.body).length > 1) break; continue; }
    const key = f.id || (f.cls + ':' + f.name);
    steps.push({ i, ...f });
    if (seen.has(key + i)) break; seen.add(key + i);
    if (steps.length > 12 && f.tag === 'a' && /wa\.me|Abrir/.test(f.name || '') && i > 140) break;
  }
  out.tabDesktop = { paradas: steps.length, primeras: steps.slice(0, 6).map(s => `${s.tag || 'body'}#${s.id || ''}.${s.cls || ''} → ${s.role || ''} «${(s.name || '').slice(0, 40)}»`) };
  steps.filter(s => !s.body).forEach(s => {
    if (!s.ring) bad(`sin anillo de foco: ${s.tag}#${s.id}.${s.cls} «${(s.name || '').slice(0, 30)}»`);
    if (!s.name && !['input', 'select', 'textarea'].includes(s.tag)) bad(`sin nombre accesible: ${s.tag}#${s.id}.${s.cls}`);
    if (s.vis === 'hidden' || s.display === 'none') bad(`enfocable pero oculto: ${s.tag}#${s.id}.${s.cls}`);
    if (s.obscuredBy && s.obscuredBy.length && s.coveredByOther) bad(`foco tapado por ${s.obscuredBy.join(',')}: ${s.tag}#${s.id}.${s.cls} «${(s.name || '').slice(0, 30)}»`);
  });
  const firstName = steps[0]?.name; out.tabDesktop.primeraParada = `${steps[0]?.tag}: «${firstName}»`;
  if (!/contenido/i.test(firstName || '')) bad('la primera parada de Tab no es «Ir al contenido»');
  out.tabDesktop.nombresRepetidos = Object.entries(steps.filter(s => !s.body).reduce((a, s) => { const k = (s.role || '') + '|' + (s.name || ''); a[k] = (a[k] || 0) + 1; return a; }, {})).filter(([, n]) => n > 1).map(([k, n]) => `${k} ×${n}`).slice(0, 8);
  out.erroresPagina = page.__errors;
  await page.close();
}

/* ---------- B. diálogo de proyecto con teclado ---------- */
{
  const page = await open(browser, { w: 1440, h: 900 });
  const client = await page.createCDPSession(); await client.send('Accessibility.enable'); await client.send('DOM.enable'); await client.send('Runtime.enable');
  await page.focus('.card[data-open=alamos]');
  await page.keyboard.press('Enter'); await sleep(400);
  const inside = () => page.evaluate(() => ({ open: document.getElementById('pdlg').open, inDlg: document.getElementById('pdlg').contains(document.activeElement), ae: document.activeElement.className.split(' ')[0] || document.activeElement.tagName, onPage: document.activeElement !== document.body && document.activeElement !== document.documentElement }));
  const o = await inside(); out.dialogo = { abre: o.open, focoDentro: o.inDlg, primerFoco: o.ae };
  let escapes = 0; for (let i = 0; i < 14; i++) { await page.keyboard.press('Tab'); const s = await inside(); if (!s.inDlg && s.onPage) escapes++; }
  out.dialogo.escapesDelFoco = escapes; if (escapes) bad('el foco se escapa del diálogo con Tab');
  await page.keyboard.press('Escape'); await sleep(300);
  const back = await page.evaluate(() => ({ closed: !document.getElementById('pdlg').open, ae: document.activeElement.getAttribute('data-open') || document.activeElement.tagName }));
  out.dialogo.cierraConEsc = back.closed; out.dialogo.focoVuelveA = back.ae; if (back.ae !== 'alamos') bad('al cerrar el diálogo el foco no vuelve a la fila de origen');
  const nameRole = await page.evaluate(() => { const d = document.getElementById('pdlg'); d.showModal(); return { labelledby: d.getAttribute('aria-labelledby'), title: document.getElementById('pdTitle')?.textContent }; });
  out.dialogo.tituloAccesible = nameRole; await page.close();
}

/* ---------- C. pestañas con flechas, asistente y simulador ---------- */
{
  const page = await open(browser, { w: 1440, h: 900 });
  await page.focus('#tab-wizard'); await page.keyboard.press('ArrowRight'); await sleep(100);
  out.pestanas = await page.evaluate(() => ({ sim: document.getElementById('tab-sim').getAttribute('aria-selected'), foco: document.activeElement.id, panel: document.getElementById('pan-sim').classList.contains('is-on') }));
  await page.keyboard.press('Home'); await sleep(100);
  out.pestanas.home = await page.evaluate(() => document.getElementById('tab-wizard').getAttribute('aria-selected'));
  // asistente con Enter sobre las opciones
  const q = async () => page.evaluate(() => ({ step: document.getElementById('wzStep').textContent, ae: document.activeElement.className.split(' ')[0], txt: (document.activeElement.textContent || '').slice(0, 40) }));
  const trace = [];
  for (const sel of ['[data-k=type] [data-v=apartamentos]', '[data-k=budget] [data-v=b240]', '[data-k=when] [data-v="2627"]', '[data-k=fin] [data-v="crédito hipotecario"]']) {
    await page.focus(sel); await page.keyboard.press('Enter'); await sleep(120); trace.push(await q());
  }
  out.asistente = { pasos: trace.map(t => `${t.step} → foco en .${t.ae}`) };
  if (trace.some(t => t.ae !== 'wz__q')) bad('en el asistente el foco no pasa a la pregunta siguiente');
  await page.focus('#wName'); await page.keyboard.type('Ana'); await page.keyboard.press('Enter'); await sleep(150);
  out.asistente.enterVacioCelular = await page.evaluate(() => ({ err: document.getElementById('wErr').textContent.slice(0, 70), foco: document.activeElement.id, invalid: document.activeElement.getAttribute('aria-invalid') }));
  if (out.asistente.enterVacioCelular.foco !== 'wPhone') bad('Enter en el asistente con celular vacío no lleva el foco al celular');
  await page.keyboard.type('3001234567'); await page.evaluate(() => { window.open = () => null; }); await page.keyboard.press('Enter'); await sleep(150);
  out.asistente.enviar = await page.evaluate(() => ({ ok: document.getElementById('wErr').classList.contains('ok'), link: !!document.querySelector('#wErr a') }));
  if (!out.asistente.enviar.ok || !out.asistente.enviar.link) bad('el asistente no confirma el envío con enlace de respaldo');
  // simulador con teclado (flechas en el deslizador)
  await page.click('#tab-sim'); await page.focus('#cInit'); const before = await page.$eval('#rPay', e => e.textContent);
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); const after = await page.$eval('#rPay', e => e.textContent);
  out.simulador = { cuotaAntes: before, cuotaDespues: after, cambia: before !== after };
  await page.$eval('#cRate', e => { e.value=''; }); await page.focus('#cRate'); await page.keyboard.type('80');
  out.simulador.tasa80 = await page.evaluate(() => ({ invalid: document.getElementById('cRate').getAttribute('aria-invalid'), pay: document.getElementById('rPay').textContent, errMientrasEscribe: document.getElementById('rateErr').textContent }));
  await page.keyboard.press('Tab'); await sleep(100);
  out.simulador.alSalir = await page.evaluate(() => document.getElementById('rateErr').textContent);
  await page.close();
}

/* ---------- D. formulario de contacto ---------- */
{
  const page = await open(browser, { w: 1440, h: 900 });
  await page.evaluate(() => { window.open = () => null; });
  await page.focus('#nName'); await page.keyboard.press('Enter'); await sleep(100);
  const e1 = await page.evaluate(() => ({ foco: document.activeElement.id, err: document.getElementById('formErr').textContent, inv: document.activeElement.getAttribute('aria-invalid'), desc: document.activeElement.getAttribute('aria-describedby') }));
  await page.keyboard.type('Ana Gómez'); await page.keyboard.press('Enter'); await sleep(100);
  const e2 = await page.evaluate(() => ({ foco: document.activeElement.id, err: document.getElementById('formErr').textContent }));
  await page.keyboard.type('300 123 4567'); await page.focus('#nMail'); await page.keyboard.type('ana@'); await page.keyboard.press('Enter'); await sleep(100);
  const e3 = await page.evaluate(() => ({ foco: document.activeElement.id, err: document.getElementById('formErr').textContent }));
  await page.$eval('#nMail', e => { e.value=''; }); await page.focus('#nMail'); await page.keyboard.type('ana@correo.com'); await page.keyboard.press('Enter'); await sleep(150);
  const e4 = await page.evaluate(() => ({ ok: document.getElementById('formErr').classList.contains('ok'), link: document.querySelector('#formErr a')?.href.slice(0, 50) }));
  out.formulario = { vacio: e1, sinCelular: e2, correoMalo: e3, exito: e4 };
  if (e1.foco !== 'nName' || e1.inv !== 'true') bad('formulario vacío: no marca/enfoca el nombre');
  if (e2.foco !== 'nPhone') bad('formulario sin celular: no enfoca el celular');
  if (e3.foco !== 'nMail') bad('correo inválido: no enfoca el correo');
  if (!e4.ok || !e4.link) bad('envío correcto sin confirmación/enlace de respaldo');
  await page.close();
}

/* ---------- E. menú móvil con teclado ---------- */
{
  const page = await open(browser, { w: 390, h: 844, mobile: true, dpr: 3 });
  const client = await page.createCDPSession(); await client.send('Accessibility.enable'); await client.send('DOM.enable'); await client.send('Runtime.enable');
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); // skip, logo, menú
  const f = await focusInfo(page, client); out.menuMovil = { foco: `${f.tag}#${f.id} «${f.name}»`, expanded: f.props?.expanded };
  await page.keyboard.press('Enter'); await sleep(350);
  out.menuMovil.alAbrir = await page.evaluate(() => ({ open: document.getElementById('hdr').classList.contains('nav-open'), exp: document.getElementById('navToggle').getAttribute('aria-expanded'), label: document.getElementById('navToggle').getAttribute('aria-label'), items: [...document.querySelectorAll('#nav a')].length }));
  await page.keyboard.press('Escape'); await sleep(300);
  out.menuMovil.alCerrar = await page.evaluate(() => ({ open: document.getElementById('hdr').classList.contains('nav-open'), foco: document.activeElement.id, label: document.getElementById('navToggle').getAttribute('aria-label') }));
  if (out.menuMovil.alCerrar.foco !== 'navToggle') bad('Esc cierra el menú pero el foco no vuelve al botón');
  await page.close();
}

/* ---------- F. enlace «Ir al contenido» ---------- */
{
  const page = await open(browser, { w: 1440, h: 900 });
  await page.keyboard.press('Tab'); await page.keyboard.press('Enter'); await sleep(200);
  out.saltar = await page.evaluate(() => ({ hash: location.hash, foco: document.activeElement.id || document.activeElement.tagName }));
  await page.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
