/* Mukala Construcciones — v2
   Datos de proyectos tomados de mukalaconstructora.com (ver DIAGNOSTICO.md). */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const WA = '573135467112';
const waUrl = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const cop = n => '$' + new Intl.NumberFormat('es-CO').format(Math.round(n));
const ic = (n, c = 'i') => `<svg class="${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lock = on => { document.documentElement.style.overflow = on ? 'hidden' : ''; };

// Validación accesible: marca el campo con aria-invalid, lo vincula al mensaje y le da el foco (WCAG 3.3.1 / 3.3.3)
const validPhone = v => { const d = v.replace(/\D/g, ''); return d.length === 10 || (d.length >= 11 && d.length <= 15); };   // 10 dígitos en Colombia, o con indicativo internacional
function validate(nameEl, phoneEl, errEl, mailEl) {
  const checks = [
    [nameEl, !nameEl.value.trim(), 'Escribe tu nombre para poder contactarte.'],
    [phoneEl, !validPhone(phoneEl.value), 'Escribe tu número de celular: 10 dígitos (por ejemplo 300 123 4567) o con indicativo internacional.']
  ];
  if (mailEl && mailEl.value.trim() && !mailEl.checkValidity()) checks.push([mailEl, true, 'Revisa el correo: parece incompleto (ejemplo: nombre@correo.com).']);
  [nameEl, phoneEl, mailEl].filter(Boolean).forEach(el => { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); });
  errEl.classList.remove('ok');
  const bad = checks.find(c => c[1]);
  if (!bad) { errEl.textContent = ''; return true; }
  const [el, , msg] = bad;
  el.setAttribute('aria-invalid', 'true');
  el.setAttribute('aria-describedby', errEl.id);
  errEl.textContent = msg;
  el.focus();
  return false;
}
document.addEventListener('input', e => {
  // en los formularios de contacto el error se limpia al corregir; la tasa del simulador se revalida en calc()
  if (e.target.closest('#form, #wForm') && e.target.matches('[aria-invalid]')) { e.target.removeAttribute('aria-invalid'); e.target.removeAttribute('aria-describedby'); }
});

// Cada sección se nombra con su encabezado (puntos de referencia navegables)
$$('main > section[id]').forEach(s => {
  const h = $('h1,h2', s);
  if (h) { h.id = h.id || 't-' + s.id; s.setAttribute('aria-labelledby', h.id); }
  else s.setAttribute('aria-label', 'Nosotros');
});

// Cinta animada: botón para pausarla (WCAG 2.2.2)
{
  const band = $('#mqBand'), btn = $('#mqPp');
  const set = p => {
    btn.setAttribute('aria-pressed', p); band.classList.toggle('is-paused', p);
    btn.setAttribute('aria-label', p ? 'Reanudar cinta animada' : 'Pausar cinta animada');
    btn.innerHTML = ic(p ? 'play' : 'pause');
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-pressed') !== 'true'));
  if (RM) set(true);
}

/* ------------------------------------------------------------------ data */
const PROJECTS = [
  { id:'artica', name:'Artica', type:'apartamentos', typeLabel:'Apartamentos', city:null, place:'Consulta la ubicación con un asesor',
    status:'Nuevo proyecto', chip:'Nuevo', tagline:'Dos torres entre zonas verdes', price:null,
    specs:{}, rooms:'—',
    features:['Dos torres','Piscina','Zonas verdes'],
    blurb:'Nuevo proyecto de Mukala: dos torres con piscina y zonas verdes, según el render. Consulta con un asesor las áreas, los valores y la disponibilidad.',
    images:[['artica-dia.webp','Render de Artica al atardecer'],['artica-noche.webp','Render nocturno de Artica']] },
  { id:'alamos', name:'Álamos de Mukala', type:'apartamentos', typeLabel:'Apartamentos', city:'Pereira', place:'Barrio Álamos, Pereira',
    status:'En construcción', delivery:'Entrega 2026–2027', tagline:'Un lugar a la altura de la naturaleza',
    price:236372175, priceLabel:'Desde', smmlv:135,
    priceNote:'Equivale a 135 salarios mínimos legales vigentes (SMMLV) al momento de la escrituración. Desde el piso 3 el valor aumenta según la unidad.',
    specs:{ hab:3, banos:2, units:270 }, rooms:'Sala-comedor, cocina y zona de ropas',
    features:['Piscina','Sauna','Baño turco','Salón social','Juegos infantiles','Cancha múltiple'],
    blurb:'Un conjunto de 270 apartamentos de 3 habitaciones y 2 baños, rodeado de naturaleza en el barrio Álamos de Pereira, con zonas sociales pensadas para toda la familia.',
    images:[['alamos.webp','Render exterior de Álamos de Mukala'],['apto1402.webp','Render interior · Apto 1402'],['apto1106.webp','Render interior · Apto 1106']] },
  { id:'dosquebradas', name:'Mukala Dosquebradas', type:'apartamentos', typeLabel:'Apartamentos', city:'Dosquebradas', place:'Dosquebradas, Risaralda',
    status:'Disponible', price:192172500, priceLabel:'Valor',
    specs:{ area:56, hab:3, banos:2 }, rooms:'Sala-comedor',
    features:['56 m²','3 habitaciones','2 baños','Sala-comedor'],
    blurb:'Apartamentos de 56 m² con 3 habitaciones, 2 baños y sala-comedor, en un edificio de fachada blanca y negra que ya se ve en el paisaje de Dosquebradas.',
    images:[['dosquebradas.webp','Edificio Mukala en Dosquebradas, vista aérea']] },
  { id:'locales', name:'Locales en Dosquebradas', type:'locales', typeLabel:'Locales', city:'Dosquebradas', place:'Av. Circunvalar, Dosquebradas',
    status:'Disponible', price:200000000, priceLabel:'Valor',
    specs:{ area:35 }, rooms:'Cocineta y baño',
    features:['35 m²','Cocineta','Baño'],
    blurb:'Locales de 35 m² en una excelente ubicación sobre la Avenida Circunvalar de Dosquebradas. Se entregan con cocineta y baño.',
    images:[['locales.webp','Render · Locales sobre la Av. Circunvalar'],['local-interior.webp','Render interior de un local']] },
  { id:'casa51', name:'Casa de 51 m²', type:'casas', typeLabel:'Casas', city:null, place:'Consulta la ubicación con un asesor',
    status:'Disponible', price:null,
    specs:{ area:51, hab:3, banos:2 }, rooms:'Sala-comedor y patio',
    features:['51 m²','3 habitaciones','2 baños','Sala-comedor','Patio'],
    blurb:'Casa de dos pisos de 51 m² con 3 habitaciones, 2 baños, sala-comedor y patio. Acabados limpios, ventanería negra y mucha luz natural.',
    images:[['casa51.webp','Fachada de la casa de 51 m²']] },
  { id:'cerritos', name:'Casas campestres', type:'casas', typeLabel:'Casas', city:null, place:'Cerritos',
    status:'Consulta disponibilidad', chip:'Consultar', price:null, specs:{}, rooms:'—',
    features:['Entorno campestre','Diseño contemporáneo'],
    blurb:'Casas campestres en Cerritos, rodeadas de vegetación y montaña. Consulta con un asesor las áreas, los valores y la disponibilidad.',
    images:[['cerritos.webp','Casas campestres en Cerritos']] }
];
const byId = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
// variantes responsivas generadas en assets/: la más chica lleva el ancho como sufijo
const VARS = { 'artica-dia': [800, 1600], 'artica-noche': [800, 1600], alamos: [800, 1600], hero: [1200, 2400], dosquebradas: [700, 1400], locales: [640, 1276], casa51: [480, 960], apto1402: [700, 1400], apto1106: [700, 1400] };
const baseName = f => f.replace('.webp', '');
const thumb = f => `${baseName(f)}-320.webp`;
const small = f => { const v = VARS[baseName(f)]; return v ? `${baseName(f)}-${v[0]}.webp` : f; };
const sset = f => { const v = VARS[baseName(f)]; return v ? `assets/${baseName(f)}-${v[0]}.webp ${v[0]}w, assets/${f} ${v[1]}w` : ''; };
const imgTag = (f, alt, sizes, extra = '') => `<img src="assets/${f}"${sset(f) ? ` srcset="${sset(f)}" sizes="${sizes}"` : ''} alt="${alt}" ${extra}>`;
const waProj = p => waUrl(`Hola, me interesa ${p.name}${p.city ? ' (' + p.city + ')' : ''}. ¿Me pueden dar más información?`);

/* -------------------------------------------------------------- whatsapp */
$$('[data-wa]').forEach(a => { a.href = waUrl(a.dataset.wa); });

/* ------------------------------------------------------------ topography */
function smooth(p) {
  const n = p.length; let s = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    s += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return s + 'Z';
}
function topo(svg) {
  const levels = +svg.dataset.topo || 8, W = 1000, H = 800;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  let seed = levels * 7919 + 13;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ph = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
  const peaks = [[640, 380, 40, 1.25], [330, 540, 30, 1.1]];
  let d = '';
  peaks.forEach(([cx, cy, step, sx]) => {
    for (let i = 1; i <= levels * 2; i++) {
      const r = i * step, pts = [], N = 40;
      for (let k = 0; k < N; k++) {
        const a = k / N * Math.PI * 2;
        const rr = r * (1 + .14 * Math.sin(2 * a + ph[0] + i * .12) + .09 * Math.sin(3 * a + ph[1]) + .05 * Math.sin(5 * a + ph[2] - i * .08));
        pts.push([cx + Math.cos(a) * rr * sx, cy + Math.sin(a) * rr * .82]);
      }
      d += smooth(pts);
    }
  });
  svg.innerHTML = `<path d="${d}"/>`;
}
$$('[data-topo]').forEach(topo);

/* --------------------------------------------------------------- marquee */
{
  const items = ['Confianza', 'Integridad', 'Pasión por servir', 'Eficiencia', 'Tu inversión en las mejores manos'];
  const one = items.map(t => `<span>${t}<svg viewBox="40 40 490 300"><use href="#mk"/></svg></span>`).join('');
  $('#mq').innerHTML = one + one + one + one;
}

/* ---------------------------------------------------------------- header */
const hdr = $('#hdr'), prog = $('#prog'), sticky = $('#sticky'), fab = $('.fab');
const toggle = $('#navToggle');
const setNav = o => { hdr.classList.toggle('nav-open', o); toggle.setAttribute('aria-expanded', o); toggle.setAttribute('aria-label', o ? 'Cerrar menú' : 'Abrir menú'); };
toggle.addEventListener('click', () => setNav(!hdr.classList.contains('nav-open')));
$$('#nav a').forEach(a => a.addEventListener('click', () => setNav(false)));
addEventListener('keydown', e => { if (e.key === 'Escape' && hdr.classList.contains('nav-open')) { setNav(false); toggle.focus(); } });
hdr.addEventListener('focusin', () => hdr.classList.remove('is-hidden'));
// con teclado, la cabecera se aparta de inmediato cuando el foco baja al contenido (no tapa lo enfocado mientras se desliza)
let byKey = false;   // ¿el último gesto fue de teclado? (un clic o un toque en un campo no debe esconder la cabecera)
addEventListener('keydown', e => { if (e.key === 'Tab') byKey = true; }, true);
addEventListener('pointerdown', () => { byKey = false; }, true);
document.addEventListener('focusin', e => {
  if (!byKey || hdr.contains(e.target) || hdr.classList.contains('nav-open') || scrollY < 300) return;
  if (e.target.matches && e.target.matches(':focus-visible') && !hdr.classList.contains('is-hidden')) {
    hdr.classList.add('snap', 'is-hidden');   // sin animación: al enfocar con teclado no debe quedar ni un instante sobre el contenido
    requestAnimationFrame(() => requestAnimationFrame(() => hdr.classList.remove('snap')));
  }
});

/* ---------------------------------------------------------- scroll tasks */
const maniEl = $('#mani'), tl = $('#tl'), heroEl = $('.hero'), rail = $('#rail');
// manifiesto: palabras
const words = [];
{
  const full = maniEl.textContent.replace(/\*/g, '').trim().replace(/\s+/g, ' ');
  const raw = maniEl.textContent.trim().split(/\s+/);
  maniEl.textContent = '';
  const srText = document.createElement('span'); srText.className = 'sr'; srText.textContent = full; maniEl.append(srText);
  raw.forEach((t, i) => {
    const g = /^\*.*\*[.,]?$/.test(t);
    const clean = t.replace(/\*/g, '');
    const s = document.createElement('span');
    s.className = 'w' + (g ? ' g' : '');
    s.textContent = clean;
    s.setAttribute('aria-hidden', 'true');
    maniEl.append(s, i < raw.length - 1 ? ' ' : '');
    words.push(s);
  });
}
const pars = $$('[data-par]');
const tlSteps = $$('.tl__s');
let lastY = 0, ticking = false;
function onScroll() {
  ticking = false;
  const y = scrollY, vh = innerHeight;
  // lecturas de layout, todas juntas y antes de escribir (evita reflujos forzados)
  const max = document.documentElement.scrollHeight - vh;
  const mr = maniEl.getBoundingClientRect();
  const tb = tl.getBoundingClientRect();
  const heroH = heroEl.offsetHeight;
  const parPos = RM ? [] : pars.map(el => el.parentElement.getBoundingClientRect());
  // escrituras
  hdr.classList.toggle('is-solid', y > 40);
  const down = y > lastY + 4, up = y < lastY - 4;
  if (!hdr.classList.contains('nav-open')) {
    if (down && y > 500) hdr.classList.add('is-hidden');
    else if (up || y < 300) hdr.classList.remove('is-hidden');
  }
  lastY = y;
  prog.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
  if (!RM && y < heroH * 1.1) heroEl.style.setProperty('--hp', clamp(y / heroH, 0, 1).toFixed(3));
  rail.classList.toggle('on', y > 500);
  sticky.classList.toggle('on', y > 700);
  fab.classList.toggle('on', y > 700);

  const t = RM ? 1 : clamp((vh * .82 - mr.top) / (mr.height * .95), 0, 1);
  const n = Math.round(t * words.length);
  words.forEach((w, i) => w.classList.toggle('on', i < n));

  pars.forEach((el, i) => {
    const bb = parPos[i];
    if (!bb || bb.bottom < -100 || bb.top > vh + 100) return;
    const off = (bb.top + bb.height / 2 - vh / 2) * -(+el.dataset.par);
    el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
  });

  const tp = RM ? 1 : clamp((vh * .78 - tb.top) / (tb.height + vh * .1), 0, 1);
  tl.style.setProperty('--tp', tp.toFixed(3));
  tlSteps.forEach((st, i) => st.classList.toggle('on', tp > (i + .12) / tlSteps.length));
}
const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
addEventListener('scroll', req, { passive: true });
addEventListener('resize', req);
requestAnimationFrame(() => requestAnimationFrame(onScroll));   // primera lectura de layout en el 2.º cuadro, con el diseño ya calculado (sin reflujo forzado)

/* ---------------------------------------------------------------- reveal */
const rvo = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); rvo.unobserve(e.target); }
}), { rootMargin: '0px 0px -8% 0px', threshold: .06 });
$$('.rv').forEach(el => rvo.observe(el));

/* counters */
const co = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  co.unobserve(e.target);
  const el = e.target, end = +el.dataset.count, suf = el.dataset.suf || '', fmt = el.dataset.fmt === 'cop' ? cop : String;
  if (RM) { el.textContent = fmt(end) + suf; return; }
  const t0 = performance.now(), dur = 900;
  const step = now => {
    const k = clamp((now - t0) / dur, 0, 1), v = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(Math.round(end * v)) + (k === 1 ? suf : '');
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}), { threshold: .6 });
$$('[data-count]').forEach(el => co.observe(el));

/* active nav link */
const links = $$('#nav a[href^="#"]:not(.btn), #rail a');
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(l => l.setAttribute('aria-current', l.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => spy.observe(s));

/* héroe: la imagen se desplaza un poco con el cursor (solo ratón, sin movimiento reducido) */
if (FINE && !RM) {
  let mx = 0, my = 0, pend = false;
  heroEl.addEventListener('pointermove', e => {
    const r = heroEl.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5;
    if (!pend) { pend = true; requestAnimationFrame(() => { pend = false; heroEl.style.setProperty('--mx', mx.toFixed(3)); heroEl.style.setProperty('--my', my.toFixed(3)); }); }
  });
}

/* ------------------------------------------------------------- slideshow */
{
  const slides = $$('.slide'), bars = $$('#bars i'), n = slides.length;
  const INFO = [['01', 'Artica · Nuevo proyecto', 'artica'], ['02', 'Artica · de noche', 'artica'], ['03', 'Álamos de Mukala · Pereira', 'alamos']];
  let cur = 0, timer = null, playing = !RM;
  const load = i => { const im = slides[i].querySelector('img[data-src]'); if (im) { if (im.dataset.srcset) { im.srcset = im.dataset.srcset; im.removeAttribute('data-srcset'); } im.src = im.dataset.src; im.removeAttribute('data-src'); } };
  function show(i) {
    cur = (i + n) % n;
    load(cur); setTimeout(() => load((cur + 1) % n), 2500);
    slides.forEach((s, k) => s.classList.toggle('is-on', k === cur));
    bars.forEach(b => b.classList.remove('is-on'));
    requestAnimationFrame(() => requestAnimationFrame(() => bars[cur].classList.add('is-on')));
    $('#capN').textContent = INFO[cur][0];
    $('#capT').textContent = INFO[cur][1];
    $('#capL').dataset.open = INFO[cur][2];
    clearTimeout(timer);
    if (playing) timer = setTimeout(() => show(cur + 1), 6500);
  }
  $('#prev').addEventListener('click', () => show(cur - 1));
  $('#next').addEventListener('click', () => show(cur + 1));
  $('#pp').addEventListener('click', () => {
    playing = !playing;
    $('#bars').classList.toggle('is-paused', !playing);
    $('#pp').setAttribute('aria-label', playing ? 'Pausar presentación' : 'Reanudar presentación');
    $('#pp').innerHTML = ic(playing ? 'pause' : 'play');
    if (playing) show(cur); else clearTimeout(timer);
  });
  if (RM) { $('#pp').innerHTML = ic('play'); $('#bars').classList.add('is-paused'); }
  // pausa temporal mientras el usuario interactúa con los controles (WCAG 2.2.2, buena práctica de carruseles)
  let held = false;
  const hold = on => {
    if (!playing || held === on) return;
    held = on;
    if (on) { clearTimeout(timer); $('#bars').classList.add('is-paused'); }
    else { $('#bars').classList.remove('is-paused'); show(cur); }
  };
  const ctl = $('.ctl');
  ctl.addEventListener('mouseenter', () => hold(true));
  ctl.addEventListener('mouseleave', () => hold(false));
  ctl.addEventListener('focusin', () => hold(true));
  ctl.addEventListener('focusout', e => { if (!ctl.contains(e.relatedTarget)) hold(false); });
  if (playing) show(0); else bars[0].classList.add('is-on');
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else if (playing) show(cur); });
}

/* --------------------------------------------------------- filters/index */
const state = { type: 'todos', city: 'todas', max: 0 };
const match = p => {
  if (state.type !== 'todos' && p.type !== state.type) return false;
  if (state.city !== 'todas' && p.city && p.city !== state.city) return false;
  if (state.max && p.price && p.price > state.max) return false;
  return true;
};
const specText = p => {
  const s = p.specs || {}, o = [];
  if (s.area) o.push(s.area + ' m²');
  if (s.hab) o.push(s.hab + ' hab.');
  if (s.banos) o.push(s.banos + ' baños');
  return o.join(' · ');
};
function cardHtml(p, i) {
  const s = p.specs || {}, m = [];
  if (s.area) m.push(`<span>${ic('area')}<b>${s.area} m²</b></span>`);
  if (s.hab) m.push(`<span>${ic('bed')}<b>${s.hab}</b><span class="sr"> habitaciones</span></span>`);
  if (s.banos) m.push(`<span>${ic('bath')}<b>${s.banos}</b><span class="sr"> baños</span></span>`);
  if (s.units) m.push(`<span>${ic('bld')}<b>${s.units}</b><span class="sr"> apartamentos</span></span>`);
  if (!m.length) m.push(`<span>${ic('pin')}<b>${p.place}</b></span>`);
  const price = p.price ? `<small>${p.priceLabel}</small>${cop(p.price)}` : 'Consulta el valor';
  return `<button type="button" class="card" data-open="${p.id}" style="--d:${(i * .07).toFixed(2)}s">
    <span class="card__img">${imgTag(p.images[0][0], '', '(max-width:760px) 94vw, (max-width:1180px) 50vw, 34vw', 'loading="lazy" decoding="async"')}</span>
    <span class="card__top"><span class="chip ${p.status === 'En construcción' ? 'chip--gold' : ''}">${p.chip || p.status}</span><span class="card__no" aria-hidden="true">${String(PROJECTS.indexOf(p) + 1).padStart(2, '0')}</span></span>
    <span class="card__body">
      <strong class="card__h">${p.name}</strong>
      <span class="card__meta">${m.join('')}</span>
      <span class="card__foot"><span class="card__p">${price}</span><span class="card__go" aria-hidden="true">${ic('arrow')}</span></span>
    </span>
  </button>`;
}
let cardsUpd = () => {};
function renderIdx() {
  const list = PROJECTS.filter(match);
  const idx = $('#idx');
  if (!list.length) {
    idx.innerHTML = `<div class="empty"><h3 class="h-m">No encontramos proyectos con esos filtros</h3><p>Escríbenos y te contamos qué viene en camino.</p><button class="btn btn--dark" type="button" id="reset">Ver todos los proyectos</button><a class="btn btn--gold" href="${waUrl('Hola, busco un inmueble que no encontré en el sitio de Mukala.')}" target="_blank" rel="noopener">${ic('wa')}Escribir por WhatsApp</a></div>`;
    $('#reset').onclick = resetFilters;
  } else idx.innerHTML = list.map(cardHtml).join('');
  idx.dataset.n = list.length; cardsUpd();
  $$('.card', idx).forEach(c => rvo.observe(c));   // las tarjetas entran con el mismo reveal que el resto
  const filtered = state.type !== 'todos' || state.city !== 'todas' || state.max > 0;
  if (renderIdx.ready) { clearTimeout(renderIdx.t); renderIdx.t = setTimeout(() => { $('#noteLive').textContent = `${list.length} de ${PROJECTS.length} proyectos`; }, 700); }
  renderIdx.ready = true;
  $('#note').innerHTML = `Mostrando ${list.length} de ${PROJECTS.length} proyectos${filtered && list.length ? ' · <button class="link" type="button" id="clr">Limpiar filtros</button>' : ''}`;
  if (filtered && list.length) $('#clr').onclick = resetFilters;
  const go = $('#go');
  go.firstChild.textContent = list.length ? `Ver ${list.length} ${list.length === 1 ? 'proyecto' : 'proyectos'} ` : 'Sin resultados ';
}
{
  const idx = $('#idx'), ctl = $('#cCtl'), nEl = $('#cN');
  const step = () => { const c = idx.querySelector('.card'); return c ? c.getBoundingClientRect().width + 14 : 300; };
  $('#cPrev').addEventListener('click', () => idx.scrollBy({ left: -step(), behavior: RM ? 'auto' : 'smooth' }));
  $('#cNext').addEventListener('click', () => idx.scrollBy({ left: step(), behavior: RM ? 'auto' : 'smooth' }));
  let pend = false;
  cardsUpd = () => {
    pend = false;
    const total = idx.querySelectorAll('.card').length, i = Math.min(total - 1, Math.max(0, Math.round(idx.scrollLeft / step())));
    ctl.hidden = total < 2;
    nEl.textContent = `${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  };
  idx.addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(cardsUpd); } }, { passive: true });
}
const fMax = $('#fMax');
const fillRange = el => el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%');
// los deslizadores anuncian su valor en palabras (no solo el número crudo)
const maxText = () => state.max ? `Hasta $${state.max / 1e6} millones` : 'Sin límite';
function syncFinder() {
  $$('#fType button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === state.type));
  $('#fCity').value = state.city;
  fMax.value = state.max ? state.max / 1e6 : fMax.max;
  fillRange(fMax);
  $('#oMax').textContent = state.max ? `Hasta $${state.max / 1e6} M` : 'Sin límite';
  fMax.setAttribute('aria-valuetext', maxText());
}
function resetFilters() {
  state.type = 'todos'; state.city = 'todas'; state.max = 0; syncFinder(); renderIdx();
  const idx = $('#idx'); idx.tabIndex = -1; idx.focus({ preventScroll: true });
}
$('#fType').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.type = b.dataset.v; syncFinder(); renderIdx(); });
$('#fCity').addEventListener('change', e => { state.city = e.target.value; renderIdx(); });
fMax.addEventListener('input', () => {
  const v = +fMax.value; state.max = v >= +fMax.max ? 0 : v * 1e6;
  fillRange(fMax); $('#oMax').textContent = state.max ? `Hasta $${v} M` : 'Sin límite'; fMax.setAttribute('aria-valuetext', maxText()); renderIdx();
});
$('#finder').addEventListener('submit', e => { e.preventDefault(); $('#proyectos').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); });
syncFinder(); renderIdx();

/* tarjetas: inclinación suave y foco de luz dorado que sigue al cursor (solo con ratón y sin movimiento reducido) */
if (FINE && !RM) {
  const idx = $('#idx');
  idx.addEventListener('pointermove', e => {
    const c = e.target.closest('.card'); if (!c) return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty('--ry', ((x - .5) * 6).toFixed(2) + 'deg'); c.style.setProperty('--rx', ((.5 - y) * 6).toFixed(2) + 'deg');
    c.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); c.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
  });
  idx.addEventListener('pointerout', e => {
    const c = e.target.closest('.card'); if (!c || c.contains(e.relatedTarget)) return;
    c.style.removeProperty('--rx'); c.style.removeProperty('--ry');
  });
}

/* ------------------------------------------------------------ comparador */
{
  const dash = '<span class="na">—</span>';
  const rows = [
    ['Tipo', p => p.typeLabel],
    ['Ubicación', p => p.place],
    ['Estado', p => p.status + (p.delivery ? '<br><small>' + p.delivery + '</small>' : '')],
    ['Valor', p => p.price ? `<b>${cop(p.price)}</b>${p.smmlv ? '<br><small>' + p.smmlv + ' <abbr title="salarios mínimos mensuales legales vigentes">SMMLV</abbr></small>' : ''}` : 'Consultar'],
    ['Área', p => p.specs.area ? p.specs.area + ' m²' : dash],
    ['Habitaciones', p => p.specs.hab || dash],
    ['Baños', p => p.specs.banos || dash],
    ['Unidades', p => p.specs.units || dash],
    ['Incluye', p => p.rooms && p.rooms !== '—' ? p.rooms : dash]
  ];
  $('#cmp').innerHTML = `<table><caption class="sr">Comparación de los proyectos de Mukala: tipo, ubicación, estado, valor y características</caption><thead><tr><th scope="col"><span class="sr">Característica</span></th>${PROJECTS.map(p => `<th scope="col">${p.name}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(([l, f]) => `<tr><th scope="row">${l}</th>${PROJECTS.map(p => `<td>${f(p)}</td>`).join('')}</tr>`).join('')}</tbody>
    <tfoot><tr><th scope="row"><span class="sr">Acciones</span></th>${PROJECTS.map(p => `<td><button type="button" class="btn btn--line btn--sm" data-open="${p.id}" aria-label="Ver detalle de ${p.name}">Ver detalle</button></td>`).join('')}</tr></tfoot></table>`;
}

/* ----------------------------------------------------------- project dlg */
const dlg = $('#pdlg');
function openProject(id) {
  const p = byId[id]; if (!p) return;
  const s = p.specs || {};
  const spec = [['area', s.area, 'm²'], ['bed', s.hab, 'hab.'], ['bath', s.banos, 'baños'], ['bld', s.units, 'apartamentos']].filter(x => x[1]);
  dlg.innerHTML = `<div class="pd">
    <button class="pd__x" aria-label="Cerrar" data-close>${ic('x')}</button>
    <div class="pd__media">
      <div class="pd__main">${imgTag(p.images[0][0], p.images[0][1], '(max-width:980px) 94vw, 560px', 'id="pdImg"')}</div>
      ${p.images.length > 1 ? `<div class="pd__thumbs">${p.images.map((m, i) => `<button type="button" data-th="${i}" aria-label="${m[1]}" aria-current="${i === 0}"><img src="assets/${thumb(m[0])}" alt="" width="320" height="240"></button>`).join('')}</div>` : ''}
    </div>
    <div class="pd__info">
      <div><p class="eyebrow" style="margin-bottom:14px">${p.status}${p.delivery ? ' · ' + p.delivery : ''}</p>
        <h2 id="pdTitle">${p.name}</h2>
        <p class="loc">${ic('pin')}${p.place}</p></div>
      ${p.tagline ? `<p style="font-style:italic;color:var(--text)">${p.tagline}</p>` : ''}
      ${p.price ? `<div class="pr"><small>${p.priceLabel}</small><strong>${cop(p.price)}</strong>${p.smmlv ? `<em>${p.smmlv} SMMLV</em>` : ''}</div>` : `<div class="pr"><strong style="font-size:1.4rem">Consulta el valor</strong></div>`}
      ${p.priceNote ? `<p class="pd__note">${p.priceNote}</p>` : ''}
      <p>${p.blurb}</p>
      ${spec.length ? `<ul class="specs">${spec.map(([i, v, t]) => `<li>${ic(i)}<span><b>${v}</b> ${t}</span></li>`).join('')}</ul>` : ''}
      <p class="pd__h">Incluye</p>
      <ul class="pd__list">${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
      <div class="pd__act">
        <a class="btn btn--gold" href="${waProj(p)}" target="_blank" rel="noopener">${ic('wa')}Hablar con un asesor</a>
        ${p.price ? `<button class="btn btn--ghost" type="button" data-sim="${p.id}">Simular cuota</button>` : ''}
      </div>
    </div></div>`;
  dlg.dataset.id = id; dlg.showModal(); lock(true);
}
dlg.addEventListener('click', e => {
  if (e.target === dlg || e.target.closest('[data-close]')) { dlg.close(); return; }
  const th = e.target.closest('[data-th]');
  if (th) {
    const m = byId[dlg.dataset.id].images[+th.dataset.th];
    const im = $('#pdImg'); const ss = sset(m[0]); if (ss) im.setAttribute('srcset', ss); else im.removeAttribute('srcset'); im.src = 'assets/' + m[0]; im.alt = m[1];
    $$('[data-th]', dlg).forEach(b => b.setAttribute('aria-current', b === th));
  }
  const sim = e.target.closest('[data-sim]');
  if (sim) { dlg.close(); showTool('sim', sim.dataset.sim); $('#tab-sim').focus({ preventScroll: true }); }
});
dlg.addEventListener('close', () => lock(false));
document.addEventListener('click', e => {
  const o = e.target.closest('[data-open]');
  if (o) { e.preventDefault(); openProject(o.dataset.open); }
});

/* ------------------------------------------------------ flagship gallery */
{
  const main = $('#fMain'), th = $$('#fThumbs button');
  const imgs = ['alamos.webp', 'apto1402.webp', 'apto1106.webp'];
  const alts = ['Render exterior de Álamos de Mukala', 'Render interior · Apto 1402', 'Render interior · Apto 1106'];
  const im = $('img', main);
  let token = 0;
  th.forEach((b, i) => b.addEventListener('click', () => {
    th.forEach(x => x.setAttribute('aria-current', x === b));
    const my = ++token, ss = sset(imgs[i]);
    im.classList.add('off');
    setTimeout(() => {
      if (my !== token) return;                       // un clic más reciente manda
      if (ss) im.setAttribute('srcset', ss); else im.removeAttribute('srcset');
      im.src = 'assets/' + imgs[i]; im.alt = alts[i];
      const show = () => { if (my === token) im.classList.remove('off'); };
      if (im.complete) show(); else im.onload = show;
    }, RM ? 0 : 260);
  }));
}

/* ------------------------------------------------------------------ tools */
const tabs = $$('.tabs [role=tab]');
function setTool(name, proj) {
  tabs.forEach(t => { const on = t.id === 'tab-' + name; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
  $('#pan-wizard').classList.toggle('is-on', name === 'wizard');
  $('#pan-sim').classList.toggle('is-on', name === 'sim');
  if (name === 'sim' && proj) setProj(proj);
}
tabs.forEach(t => t.addEventListener('click', () => setTool(t.id.replace('tab-', ''))));
// teclado: flechas, Inicio y Fin cambian de pestaña (patrón WAI-ARIA)
tabs.forEach((t, i) => t.addEventListener('keydown', e => {
  const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
  if (k === undefined) return;
  e.preventDefault();
  const nx = tabs[(k + tabs.length) % tabs.length];
  setTool(nx.id.replace('tab-', '')); nx.focus();
}));
setTool('wizard');
// abre una herramienta y deja a la vista lo que el usuario vino a ver (la cuota, o el asistente con sus pestañas)
function showTool(name, proj) {
  setTool(name, proj);
  const target = name === 'sim' && proj ? $('.res') : $('.tools');
  target.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: name === 'sim' && proj ? 'center' : 'start' });
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-tool]'); if (!a) return;
  e.preventDefault();
  showTool(a.dataset.tool, a.dataset.proj);
  $('#tab-' + a.dataset.tool).focus({ preventScroll: true });   // el foco acompaña al usuario (teclado y lectores de pantalla)
});

// desplaza lo mínimo para que un bloque quede completo entre la cabecera y la barra fija inferior
function keepInView(el) {
  const hdrB = hdr.classList.contains('is-hidden') ? 0 : hdr.getBoundingClientRect().bottom;
  const st = getComputedStyle(sticky), barTop = st.visibility !== 'hidden' && st.display !== 'none' ? sticky.getBoundingClientRect().top : innerHeight;
  const r = el.getBoundingClientRect(), limit = Math.min(innerHeight, barTop) - 16;
  let dy = 0;
  if (r.bottom > limit) dy = r.bottom - limit;
  if (r.top - dy < hdrB + 8) dy = r.top - hdrB - 8;          // si no cabe entero, prioriza el comienzo
  if (Math.abs(dy) > 2) scrollBy({ top: dy, behavior: RM ? 'auto' : 'smooth' });
}

/* wizard */
{
  const steps = $$('.wz__step'), bar = $$('#wzBar i'), back = $('#wzBack'), label = $('#wzStep');
  const ans = {}, txt = {};
  let si = 0;
  const PHR = {
    type: { apartamentos: 'un apartamento', casas: 'una casa', locales: 'un local comercial', cualquiera: 'un inmueble (aún no tengo claro cuál)' },
    budget: { b200: 'un presupuesto de hasta $200 millones', b240: 'un presupuesto de hasta $240 millones', b240p: 'un presupuesto de más de $240 millones', nose: 'un presupuesto que prefiero conversar' },
    when: { ya: 'lo necesito lo antes posible', '2627': 'lo necesito entre 2026 y 2027', sinafan: 'no tengo afán' }
  };
  function recommend() {
    let l = PROJECTS.slice();
    if (ans.type && ans.type !== 'cualquiera') l = l.filter(p => p.type === ans.type);
    const cap = { b200: 200e6, b240: 240e6 }[ans.budget];
    if (cap) l = l.filter(p => !p.price || p.price <= cap);
    if (ans.when === 'ya') { const x = l.filter(p => p.status !== 'En construcción'); if (x.length) l = x; }
    if (ans.when === '2627') { const x = l.filter(p => p.delivery); if (x.length) l = x; }
    l.sort((a, b) => (b.price ? 1 : 0) - (a.price ? 1 : 0));
    return l[0] || null;
  }
  function go(i, focus = true) {
    si = i;
    steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
    bar.forEach((b, k) => b.classList.toggle('done', k <= i));
    back.hidden = i === 0;
    { const k = steps[i].dataset.k; $$('.opt', steps[i]).forEach(o => o.setAttribute('aria-pressed', ans[k] !== undefined && o.dataset.v === ans[k])); }
    label.textContent = `Paso ${i + 1} de ${steps.length}`;
    if (focus) { const q = $('.wz__q', steps[i]); if (q) { q.tabIndex = -1; q.focus({ preventScroll: true }); } requestAnimationFrame(() => keepInView(steps[i])); }
    if (i === steps.length - 1) {
      const r = recommend(), box = $('#reco');
      if (r) {
        box.hidden = false;
        box.innerHTML = `<img src="assets/${thumb(r.images[0][0])}" alt="" width="320" height="240"><div><small>Te recomendamos</small><h4>${r.name}</h4><p>${r.place}${r.price ? ' · ' + r.priceLabel.toLowerCase() + ' ' + cop(r.price) : ''}</p></div>`;
      } else box.hidden = true;
    }
  }
  $('#wz').addEventListener('click', e => {
    const o = e.target.closest('.opt'); if (!o) return;
    const k = o.closest('.wz__step').dataset.k;
    ans[k] = o.dataset.v; txt[k] = o.dataset.v;
    go(si + 1);
  });
  back.addEventListener('click', () => go(Math.max(0, si - 1)));
  $('#wzReset').addEventListener('click', () => {
    Object.keys(ans).forEach(k => delete ans[k]);
    $('#wName').value = ''; $('#wPhone').value = '';
    $('#wErr').textContent = ''; $('#wErr').classList.remove('ok');
    $$('#wForm [aria-invalid]').forEach(el => { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); });
    go(0);
  });
  $('#wForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!validate($('#wName'), $('#wPhone'), $('#wErr'))) return;
    const name = $('#wName').value.trim(), phone = $('#wPhone').value.trim(), err = $('#wErr');
    const r = recommend();
    const m = `Hola, soy ${name}. Estoy buscando ${PHR.type[ans.type]}, con ${PHR.budget[ans.budget]}; ${PHR.when[ans.when]}. Pienso financiarlo con ${ans.fin}. ${r ? 'Me interesó ' + r.name + '. ' : ''}Mi teléfono: ${phone}.`;
    window.open(waUrl(m), '_blank', 'noopener');
    err.innerHTML = `<span>Listo: se abrió WhatsApp con tus respuestas. ¿No se abrió? <a href="${waUrl(m)}" target="_blank" rel="noopener">Abrir WhatsApp</a></span>`; err.classList.add('ok');
  });
  go(0, false);
}

/* simulator */
const priced = PROJECTS.filter(p => p.price);
const cProj = $('#cProj'), cPrice = $('#cPrice'), cInit = $('#cInit'), cYears = $('#cYears'), cRate = $('#cRate');
cProj.innerHTML = priced.map(p => `<option value="${p.id}">${p.name}</option>`).join('') + '<option value="otro">Otro valor</option>';
const num = s => +String(s).replace(/\D/g, '') || 0;
const ringArc = $('#ringArc'), ringPct = $('#ringPct'), rPay = $('#rPay');
// la cuota "viaja" al nuevo valor en vez de saltar (sin movimiento reducido: cambia directo)
function tweenPay(to) {
  cancelAnimationFrame(tweenPay.r);
  if (to === null) { rPay.textContent = '—'; tweenPay.v = 0; return; }
  const from = tweenPay.v || to; tweenPay.v = to;
  if (RM || Math.abs(from - to) < 1) { rPay.textContent = cop(to); return; }
  const t0 = performance.now();
  const f = now => { const k = clamp((now - t0) / 280, 0, 1); rPay.textContent = cop(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) tweenPay.r = requestAnimationFrame(f); };
  tweenPay.r = requestAnimationFrame(f);
}
function calc() {
  const price = num(cPrice.value), ci = +cInit.value, yrs = +cYears.value, ea = Math.max(0, +cRate.value) / 100;
  $('#oInit').textContent = ci + ' %'; $('#oYears').textContent = yrs + ' años';
  cInit.setAttribute('aria-valuetext', ci + ' % de cuota inicial'); cYears.setAttribute('aria-valuetext', yrs + ' años');
  const rv = +cRate.value, rateBad = !(rv >= 1 && rv <= 40);
  if (rateBad) { cRate.setAttribute('aria-invalid', 'true'); cRate.setAttribute('aria-describedby', 'rateErr'); } else { cRate.removeAttribute('aria-invalid'); cRate.removeAttribute('aria-describedby'); }
  $('#rateErr').textContent = rateBad && document.activeElement !== cRate ? 'Escribe una tasa entre 1 % y 40 %.' : '';
  ringArc.style.setProperty('--a', (ci / 100 * 301.59).toFixed(1)); ringPct.textContent = ci + ' %';
  if (rateBad) { tweenPay(null); ['#rInit', '#rLoan', '#rInc'].forEach(q => { $(q).textContent = '—'; }); clearTimeout(calc.t); $('#rPayLive').textContent = ''; [cInit, cYears].forEach(fillRange); return; }
  const init = price * ci / 100, loan = price - init, n = yrs * 12, r = Math.pow(1 + ea, 1 / 12) - 1;
  const pay = !price ? 0 : r > 0 ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
  tweenPay(price ? pay : null);
  clearTimeout(calc.t); calc.t = setTimeout(() => { $('#rPayLive').textContent = price ? 'Cuota mensual aproximada: ' + cop(pay) : ''; }, 700);
  $('#rInit').textContent = price ? cop(init) : '—';
  $('#rLoan').textContent = price ? cop(loan) : '—';
  $('#rInc').textContent = price ? cop(pay / .3) : '—';
  $('#rN').textContent = n + ' meses';
  [cInit, cYears].forEach(fillRange);
}
// la foto del proyecto elegido acompaña al simulador
function simFig(p) {
  const fig = $('#simFig'); fig.hidden = !p;
  if (!p) return;
  const f = p.images[0][0], im = $('#simImg');
  im.srcset = sset(f) ? `assets/${baseName(f)}-${VARS[baseName(f)][0]}.webp ${VARS[baseName(f)][0]}w, assets/${f} ${VARS[baseName(f)][1]}w` : ''; im.sizes = '(max-width:980px) 90vw, 520px';
  im.src = 'assets/' + small(f); $('#simCap').textContent = p.name + (p.city ? ' · ' + p.city : '');
}
function setProj(id) { cProj.value = id; if (byId[id] && byId[id].price) cPrice.value = new Intl.NumberFormat('es-CO').format(byId[id].price); simFig(byId[id]); calc(); }
cProj.addEventListener('change', () => { if (cProj.value !== 'otro') setProj(cProj.value); else { simFig(null); cPrice.focus(); calc(); } });
cPrice.addEventListener('input', () => {
  const v = num(cPrice.value);
  const m = priced.find(p => p.price === v); cProj.value = m ? m.id : 'otro'; simFig(m || null); calc();
});
cPrice.addEventListener('blur', () => { const v = num(cPrice.value); cPrice.value = v ? new Intl.NumberFormat('es-CO').format(v) : ''; });
[cInit, cYears, cRate].forEach(el => el.addEventListener('input', calc));
cRate.addEventListener('blur', calc);
setProj('alamos');

/* ---------------------------------------------------------------- gallery */
const GAL = [
  ['artica-dia.webp', 'Render', 'Artica · atardecer', ''],
  ['artica-noche.webp', 'Render', 'Artica · de noche', ''],
  ['dosquebradas.webp', 'Foto', 'Mukala Dosquebradas', ''],
  ['alamos.webp', 'Render', 'Álamos de Mukala', ''],
  ['casa51.webp', 'Foto', 'Casa de 51 m²', 't'],
  ['apto1402.webp', 'Render', 'Álamos · Apto 1402', ''],
  ['locales.webp', 'Render', 'Locales en Dosquebradas', ''],
  ['cerritos.webp', 'Foto', 'Casas campestres · Cerritos', ''],
  ['apto1106.webp', 'Render', 'Álamos · Apto 1106', '']
];
const gal = $('#gal');
gal.innerHTML = GAL.map(([f, t, n, c]) => `<button type="button" class="tile ${c}" data-lb="${f}" data-cap="${t} · ${n}" aria-label="Ampliar: ${t} ${n}"><span class="im">${imgTag(f, n, '(max-width:760px) 90vw, 860px', 'loading="lazy" decoding="async" draggable="false"')}</span><span class="c"><span class="tag">${t}</span> ${n}</span></button>`).join('');
{
  let down = false, sx = 0, sl = 0, moved = false;
  gal.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = gal.scrollLeft; });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) { moved = true; gal.classList.add('drag'); }
    if (moved) gal.scrollLeft = sl - dx;
  });
  addEventListener('pointerup', () => { if (!down) return; down = false; gal.classList.remove('drag'); });
  gal.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  const tiles = $$('.tile', gal), gN = $('#gN'), gBar = $('#gBar');
  let gt = false;
  const galUpdate = () => {
    gt = false;
    const gr = gal.getBoundingClientRect(), max = gal.scrollWidth - gal.clientWidth, p = max > 0 ? clamp(gal.scrollLeft / max, 0, 1) : 0;
    const pos = RM ? [] : tiles.map(t => t.getBoundingClientRect());
    pos.forEach((r, i) => tiles[i].style.setProperty('--px', ((gr.left + gr.width / 2 - (r.left + r.width / 2)) / gr.width * 36).toFixed(1) + 'px'));
    gBar.style.transform = `scaleX(${Math.max(p, 1 / tiles.length).toFixed(3)})`;
    gN.textContent = `${String(Math.round(p * (tiles.length - 1)) + 1).padStart(2, '0')} / ${String(tiles.length).padStart(2, '0')}`;
  };
  const galReq = () => { if (!gt) { gt = true; requestAnimationFrame(galUpdate); } };
  gal.addEventListener('scroll', galReq, { passive: true }); addEventListener('resize', galReq); requestAnimationFrame(() => requestAnimationFrame(galReq));
  const step = () => (gal.firstElementChild ? gal.firstElementChild.getBoundingClientRect().width + 18 : 400);
  $('#gPrev').addEventListener('click', () => gal.scrollBy({ left: -step(), behavior: RM ? 'auto' : 'smooth' }));
  $('#gNext').addEventListener('click', () => gal.scrollBy({ left: step(), behavior: RM ? 'auto' : 'smooth' }));
}
const lb = $('#lb');
document.addEventListener('click', e => {
  const t = e.target.closest('[data-lb]');
  if (t) { lb.innerHTML = `<button class="pd__x" aria-label="Cerrar imagen" data-close>${ic('x')}</button><img src="assets/${t.dataset.lb}" alt="${t.dataset.cap}"><p>${t.dataset.cap}</p>`; lb.showModal(); lock(true); return; }
  const c = e.target.closest('[data-close]');
  if (e.target === lb || (c && lb.contains(c))) lb.close();
});
lb.addEventListener('close', () => lock(false));

/* ---------------------------------------------------------------- contact */
$('#nProj').innerHTML = '<option value="">Aún no lo sé / varios</option>' + PROJECTS.map(p => `<option>${p.name}</option>`).join('');
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  if (!validate($('#nName'), $('#nPhone'), $('#formErr'), $('#nMail'))) return;
  const name = $('#nName').value.trim(), phone = $('#nPhone').value.trim(), mail = $('#nMail').value.trim(), proj = $('#nProj').value, msg = $('#nMsg').value.trim();
  const err = $('#formErr');
  const t = `Hola, soy ${name}. ${proj ? 'Me interesa ' + proj + '. ' : 'Estoy interesado/a en una propiedad. '}${msg ? msg + ' ' : ''}Mi teléfono: ${phone}${mail ? ' · Correo: ' + mail : ''}.`;
  window.open(waUrl(t), '_blank', 'noopener');
  err.innerHTML = `<span>Listo: se abrió WhatsApp con tu mensaje. ¿No se abrió? <a href="${waUrl(t)}" target="_blank" rel="noopener">Abrir WhatsApp</a></span>`; err.classList.add('ok');
});
window.__mk = 1;   // el script llegó hasta el final sin errores; si no, la página quita la clase js a los 4 s y muestra todo
})();
