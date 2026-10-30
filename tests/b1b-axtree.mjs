import { launch, open, sleep } from './lib.mjs';
const browser = await launch();
const out = { problemas: [] }; const bad = m => out.problemas.push(m);
const page = await open(browser, { w: 1440, h: 900 });
await page.evaluate(() => { document.querySelectorAll('.rv,.card').forEach(e => e.classList.add('in')); document.querySelector('#comparar').open = true; });
const snap = await page.accessibility.snapshot({ interestingOnly: false });
const flat = []; (function walk(n, depth, path) { flat.push({ ...n, depth, path }); (n.children || []).forEach(c => walk(c, depth + 1, [...path, n.role])); })(snap, 0, []);
const by = r => flat.filter(n => n.role === r);
// 3. encabezados
const heads = by('heading').map(n => ({ lvl: n.level, name: (n.name || '').replace(/\s+/g, ' ').slice(0, 42) }));
out.encabezados = heads.map(h => `H${h.lvl} ${h.name}`);
const h1 = heads.filter(h => h.lvl === 1).length; if (h1 !== 1) bad(`hay ${h1} H1`);
let prev = 0; heads.forEach(h => { if (h.lvl - prev > 1 && prev) bad(`salto de encabezado H${prev}→H${h.lvl}: ${h.name}`); prev = h.lvl; });
heads.filter(h => !h.name.trim()).forEach(() => bad('encabezado vacío'));
// 4. regiones
const LM = ['banner', 'navigation', 'main', 'region', 'contentinfo', 'complementary', 'search', 'form'];
out.regiones = flat.filter(n => LM.includes(n.role)).map(n => `${n.role}${n.name ? ' «' + n.name + '»' : ''}`);
['banner', 'navigation', 'main', 'contentinfo'].forEach(r => { if (!by(r).length) bad(`falta la región ${r}`); });
by('region').filter(n => !n.name).forEach(() => bad('región sin nombre'));
by('navigation').forEach(n => { if (!n.name) bad('navegación sin nombre'); });
// botones/enlaces/campos sin nombre
['button', 'link', 'textbox', 'combobox', 'slider', 'spinbutton', 'tab', 'checkbox', 'radio'].forEach(r => by(r).filter(n => !(n.name || '').trim()).forEach(n => bad(`${r} sin nombre accesible (${(n.description || n.value || '').toString().slice(0, 30)})`)));
// 5. buscador: botones de tipo con estado pulsado
const tipo = by('button').filter(n => ['Todos', 'Apartamentos', 'Casas', 'Locales'].includes(n.name));
out.buscador = tipo.map(n => `${n.name}: pressed=${n.pressed}`);
if (tipo.some(n => n.pressed === undefined)) bad('botones de tipo sin estado «pulsado»');
// 6. filas del índice
const filas = by('button').filter(n => /Artica|Álamos de Mukala|Mukala Dosquebradas|Locales en Dosquebradas|Casa de 51|Casas campestres/.test(n.name || '') && /\$|Consulta|Desde|Valor/.test(n.name || ''));
out.filas = filas.map(n => n.name.replace(/\s+/g, ' ').slice(0, 110));
if (filas.length !== 6) bad(`el índice expone ${filas.length} filas con nombre completo (esperaba 6)`);
filas.forEach(n => { if (/^0\d/.test(n.name)) bad('la fila lee el número decorativo al inicio: ' + n.name.slice(0, 20)); });
// 8. tabla comparativa
const tabla = by('table')[0]; const ths = by('columnheader'), rhs = by('rowheader');
out.tabla = { tablas: by('table').length, caption: (tabla && tabla.name) || '', columnas: ths.length, filasEncabezado: rhs.length };
if (!tabla || !tabla.name) bad('la tabla no tiene nombre/caption'); if (ths.length < 5) bad('faltan encabezados de columna');
// 13. galería
out.galeria = by('button').filter(n => /^Ampliar:/.test(n.name || '')).map(n => n.name);
if (out.galeria.length !== 9) bad(`galería: ${out.galeria.length} botones «Ampliar» (esperaba 9)`);
if (out.galeria.some(n => !/(Foto|Render)/.test(n))) bad('un botón de la galería no indica Foto/Render');
// 14. preguntas frecuentes
const faq = flat.filter(n => /Qué tipo de inmuebles|Dónde están sus proyectos|Cómo se define|proyecto personalizado|Cómo hablo con un asesor/.test(n.name || '') && ['DisclosureTriangle', 'button', 'summary'].includes(n.role));
out.faq = faq.map(n => `${n.role}: ${n.name.slice(0, 36)} expanded=${n.expanded}`);
if (faq.length < 5 || faq.some(n => n.expanded === undefined)) bad('las preguntas frecuentes no exponen estado expandido/contraído');
// 15. pausas
out.pausas = by('button').filter(n => /Paus|Reanud/.test(n.name || '')).map(n => `${n.name}${n.pressed !== undefined ? ' pressed=' + n.pressed : ''}`);
if (out.pausas.length < 2) bad('faltan los controles de pausa');
// pestañas
out.pestanas = { tablist: by('tablist').length, tabs: by('tab').map(n => `${n.name} selected=${n.selected}`) };
if (by('tablist').length !== 1 || by('tab').length !== 2) bad('estructura de pestañas incorrecta');
// formularios: campos obligatorios
const campos = by('textbox').filter(n => /Nombre|Celular|Correo/.test(n.name || ''));
out.campos = campos.map(n => `${n.name.replace(/\s+/g, ' ')} required=${n.required}`);
// imágenes
const imgs = await page.evaluate(() => [...document.images].map(i => ({ alt: i.getAttribute('alt'), src: i.getAttribute('src') || i.currentSrc, vis: i.closest('[aria-hidden=true]') ? 'oculta' : 'visible' })));
out.imagenes = { total: imgs.length, sinAtributoAlt: imgs.filter(i => i.alt === null).map(i => i.src.split('/').pop()), decorativas: imgs.filter(i => i.alt === '').length, conAlt: imgs.filter(i => i.alt).length };
if (out.imagenes.sinAtributoAlt.length) bad('imágenes sin atributo alt: ' + out.imagenes.sinAtributoAlt.join(','));
// regiones vivas
out.regionesVivas = await page.evaluate(() => [...document.querySelectorAll('[aria-live],[role=alert],[role=status]')].map(e => `${e.id || e.className.split(' ')[0]}:${e.getAttribute('aria-live') || e.getAttribute('role')}`));
// idioma, título, aria-hidden sobre elementos enfocables
out.documento = await page.evaluate(() => ({ lang: document.documentElement.lang, title: document.title, ocultosEnfocables: [...document.querySelectorAll('[aria-hidden=true] a[href],[aria-hidden=true] button,[aria-hidden=true] input,[aria-hidden=true] [tabindex]')].filter(e => e.tabIndex >= 0).map(e => e.id || e.className.toString().split(' ')[0]) }));
if (out.documento.ocultosEnfocables.length) bad('elementos enfocables dentro de aria-hidden: ' + out.documento.ocultosEnfocables.join(','));
// 10 y 12: región viva de la cuota y mensajes de formulario
await page.click('#tab-sim'); await page.$eval('#cInit', e => { e.value = 40; e.dispatchEvent(new Event('input', { bubbles: true })); });
const antes = await page.$eval('#rPayLive', e => e.textContent); await sleep(900);
out.liveCuota = { inmediatamenteTrasMover: antes, tras900ms: await page.$eval('#rPayLive', e => e.textContent) };
console.log(JSON.stringify(out, null, 1));
await browser.close();
