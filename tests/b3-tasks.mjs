import { launch, open, sleep } from './lib.mjs';
const browser = await launch();
const out = {}; const problemas = []; const bad = m => problemas.push(m);
const newPage = async () => { const p = await open(browser, { w: 390, h: 844, mobile: true, dpr: 3 }); await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' }); await p.evaluate(() => { window.open = () => null; }); return p; };
// ¿el elemento queda completamente a la vista, sin tapar por la barra fija, después de la acción?
const enVista = (page, sel) => page.evaluate((s) => { const el = document.querySelector(s); if (!el) return { existe: false }; const r = el.getBoundingClientRect(); const sticky = document.getElementById('sticky'); const stBox = sticky && getComputedStyle(sticky).visibility !== 'hidden' ? sticky.getBoundingClientRect().top : innerHeight; const hdrB = document.getElementById('hdr').classList.contains('is-hidden') ? 0 : document.getElementById('hdr').getBoundingClientRect().bottom; return { existe: true, visible: r.top >= hdrB - 1 && r.bottom <= stBox + 1, top: Math.round(r.top), bottom: Math.round(r.bottom), alturaUtil: Math.round(stBox - hdrB) }; }, sel);
const tap = async (page, sel) => { await page.waitForSelector(sel, { visible: true, timeout: 5000 }); await page.tap(sel).catch(async () => { await page.click(sel); }); await sleep(250); };

/* TAREA 1: apartamento hasta $200 millones en Dosquebradas */
{
  const page = await newPage(); let toques = 0;
  await tap(page, '#fType [data-v=apartamentos]'); toques++;
  await page.select('#fCity', 'Dosquebradas'); toques++;
  await page.$eval('#fMax', e => { e.value = 200; e.dispatchEvent(new Event('input', { bubbles: true })); }); toques++;
  const btn = await page.$eval('#go', e => e.textContent.trim()); await tap(page, '#go'); toques++; await sleep(1400);
  const filas = await page.$$eval('#idx .card .card__h', r => r.map(x => x.textContent));
  const vista = await enVista(page, '#idx .card');
  out.tarea1 = { toques, botonDecia: btn, resultado: filas, primeraFilaALaVista: vista };
  if (!filas.includes('Mukala Dosquebradas') || filas.some(x => !['Artica', 'Mukala Dosquebradas'].includes(x))) bad('tarea 1: el resultado no es «Mukala Dosquebradas» (y, a lo sumo, Artica, que aún no tiene ciudad ni precio): ' + filas.join());
  if (!vista.visible) bad('tarea 1: tras «Ver proyectos» la primera fila no queda a la vista');
  await page.close();
}

/* TAREA 2: qué trae Álamos y cuánto sería la cuota */
{
  const page = await newPage(); let toques = 0;
  await page.evaluate(() => document.querySelector('#idx').scrollIntoView());
  await tap(page, '.card[data-open=alamos]'); toques++;
  const zonas = await page.$$eval('#pdlg .pd__list li', l => l.map(x => x.textContent));
  await tap(page, '#pdlg [data-sim]'); toques++; await sleep(2500);
  const preselec = await page.$eval('#cProj', e => e.options[e.selectedIndex].text);
  const cuotaVista = await enVista(page, '#rPay'); const tabsVista = await enVista(page, '#tab-sim');
  const cuota = await page.$eval('#rPay', e => e.textContent);
  out.tarea2 = { toques, zonasComunes: zonas.join(', '), proyectoPreseleccionado: preselec, cuota, cuotaALaVistaTrasSimular: cuotaVista, pestanaALaVista: tabsVista };
  if (!zonas.includes('Piscina')) bad('tarea 2: el diálogo no lista las zonas comunes');
  if (preselec !== 'Álamos de Mukala') bad('tarea 2: el simulador no preselecciona Álamos');
  if (!cuotaVista.visible) bad(`tarea 2: tras «Simular cuota» la cuota NO queda a la vista (top ${cuotaVista.top}, bottom ${cuotaVista.bottom}, útil ${cuotaVista.alturaUtil})`);
  await page.close();
}

/* TAREA 3: pedir una recomendación al asistente */
{
  const page = await newPage(); let toques = 0;
  await page.evaluate(() => document.querySelector('#guia').scrollIntoView());
  for (const sel of ['[data-k=type] [data-v=apartamentos]', '[data-k=budget] [data-v=b240]', '[data-k=when] [data-v="2627"]', '[data-k=fin] [data-v="crédito hipotecario"]']) { await tap(page, sel); toques++; }
  const reco = await page.$eval('#reco', e => e.hidden ? '' : e.textContent.replace(/\s+/g, ' ').trim());
  const vistaReco = await enVista(page, '#reco'); const vistaBoton = await enVista(page, '#wSend');
  out.tarea3 = { toques, recomendacion: reco.slice(0, 90), recoALaVista: vistaReco, botonEnviarALaVista: vistaBoton };
  if (!/Álamos/.test(reco)) bad('tarea 3: la recomendación no es Álamos');
  if (!vistaReco.visible) bad(`tarea 3: la recomendación no queda a la vista tras el último paso (top ${vistaReco.top}, útil ${vistaReco.alturaUtil})`);
  await page.close();
}

/* TAREA 4: que un asesor me contacte (desde la carga, solo toques) */
{
  const page = await newPage(); let toques = 0; let popup = false; page.on('popup', () => { popup = true; });
  await tap(page, '#navToggle'); toques++;
  const hay = await page.$eval('#nav .btn', e => ({ texto: e.textContent.trim(), href: e.href.slice(0, 40) }));
  out.tarea4 = { toquesParaLlegarAlBotonWhatsApp: toques, boton: hay };
  if (!/wa\.me/.test(hay.href)) bad('tarea 4: el botón del menú no apunta a WhatsApp');
  const sinMenu = await enVista(page, '#sticky .btn'); out.tarea4.barraWhatsAppAlCargar = sinMenu.existe ? (sinMenu.visible ? 'visible' : 'oculta hasta hacer scroll') : 'no existe';
  await page.close();
}

/* TAREA 5: qué significan VIS y SMMLV */
{
  const page = await newPage();
  const r = await page.evaluate(() => {
    const txt = document.body.innerText; const idxFirst = (re) => { const m = re.exec(txt); return m ? m.index : -1; };
    const iVISdef = idxFirst(/interés social \(VIS\)/i), iSMMdef = idxFirst(/\(SMMLV\)|salarios mínimos mensuales legales vigentes/i), iSMMuse = idxFirst(/SMMLV/);
    return { VISdefinidaEnHero: iVISdef > -1 && iVISdef < txt.indexOf('Ver proyectos') + 400, primeraAparicionSMMLV: iSMMuse, primeraDefinicionSMMLV: iSMMdef, defineAntesDeUsar: iSMMdef > -1 && iSMMdef <= iSMMuse };
  });
  out.tarea5 = r; if (!r.VISdefinidaEnHero) bad('tarea 5: VIS no se define en el hero'); if (!r.defineAntesDeUsar) bad('tarea 5: SMMLV aparece antes de que se defina');
  await page.close();
}
console.log(JSON.stringify({ problemas, ...out }, null, 1));
await browser.close();
