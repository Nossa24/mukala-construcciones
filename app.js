/* Mukala Construcciones — v4 (minimalista)
   Datos de proyectos tomados de mukalaconstructora.com y de los renders enviados por el cliente. */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const WA = '573135467112';
const waUrl = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const cop = n => '$' + new Intl.NumberFormat('es-CO').format(Math.round(n));
const ic = (n, c = 'i') => `<svg class="${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const lock = on => { document.documentElement.style.overflow = on ? 'hidden' : ''; };

/* ------------------------------------------------------------------ data */
const PROJECTS = [
  { id:'artica', name:'Artica', status:'Nuevo proyecto', kick:'Nuevo', city:null, place:'Consulta la ubicación con un asesor', tagline:'Dos torres entre zonas verdes',
    price:null, specs:{}, features:['Dos torres','Piscina','Zonas verdes'],
    blurb:'Nuevo proyecto de Mukala: dos torres con piscina y zonas verdes, según el render. Consulta con un asesor las áreas, los valores y la disponibilidad.',
    images:[['artica-dia.webp','Render de Artica al atardecer'],['artica-noche.webp','Render nocturno de Artica']] },
  { id:'alamos', name:'Álamos de Mukala', status:'En construcción', delivery:'Entrega 2026–2027', kick:'En construcción · Entrega 2026–2027', city:'Pereira', place:'Barrio Álamos, Pereira', tagline:'Un lugar a la altura de la naturaleza',
    price:236372175, priceLabel:'Desde', smmlv:135,
    priceNote:'Equivale a 135 salarios mínimos legales vigentes (SMMLV) al momento de la escrituración. Desde el piso 3 el valor aumenta según la unidad.',
    specs:{ hab:3, banos:2, units:270 },
    features:['Piscina','Sauna','Baño turco','Salón social','Juegos infantiles','Cancha múltiple'],
    blurb:'Un conjunto de 270 apartamentos de 3 habitaciones y 2 baños, rodeado de naturaleza en el barrio Álamos de Pereira, con zonas sociales pensadas para toda la familia.',
    images:[['alamos.webp','Render exterior de Álamos de Mukala'],['apto1402.webp','Render interior · Apto 1402'],['apto1106.webp','Render interior · Apto 1106']] },
  { id:'dosquebradas', name:'Mukala Dosquebradas', status:'Disponible', kick:'Disponible', city:'Dosquebradas', place:'Dosquebradas, Risaralda',
    price:192172500, priceLabel:'Valor', specs:{ area:56, hab:3, banos:2 },
    features:['56 m²','3 habitaciones','2 baños','Sala-comedor'],
    blurb:'Apartamentos de 56 m² con 3 habitaciones, 2 baños y sala-comedor, en un edificio de fachada blanca y negra que ya se ve en el paisaje de Dosquebradas.',
    images:[['dosquebradas.webp','Edificio Mukala en Dosquebradas, vista aérea']] },
  { id:'locales', name:'Locales en Dosquebradas', status:'Disponible', kick:'Disponible', city:'Dosquebradas', place:'Av. Circunvalar, Dosquebradas',
    price:200000000, priceLabel:'Valor', specs:{ area:35 },
    features:['35 m²','Cocineta','Baño'],
    blurb:'Locales de 35 m² en una excelente ubicación sobre la Avenida Circunvalar de Dosquebradas. Se entregan con cocineta y baño.',
    images:[['locales.webp','Render · Locales sobre la Av. Circunvalar'],['local-interior.webp','Render interior de un local']] },
  { id:'casa51', name:'Casa de 51 m²', status:'Disponible', kick:'Disponible', city:null, place:'Consulta la ubicación con un asesor', half:true,
    price:null, specs:{ area:51, hab:3, banos:2 },
    features:['51 m²','3 habitaciones','2 baños','Sala-comedor','Patio'],
    blurb:'Casa de dos pisos de 51 m² con 3 habitaciones, 2 baños, sala-comedor y patio. Acabados limpios, ventanería negra y mucha luz natural.',
    images:[['casa51.webp','Fachada de la casa de 51 m²']] },
  { id:'cerritos', name:'Casas campestres', status:'Consulta disponibilidad', kick:'Cerritos', city:null, place:'Cerritos', half:true,
    price:null, specs:{}, features:['Entorno campestre','Diseño contemporáneo'],
    blurb:'Casas campestres en Cerritos, rodeadas de vegetación y montaña. Consulta con un asesor las áreas, los valores y la disponibilidad.',
    images:[['cerritos.webp','Casas campestres en Cerritos']] }
];
const byId = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
// variantes responsivas en assets/: la más chica lleva el ancho como sufijo
const VARS = { 'artica-dia': [800, 1600], 'artica-noche': [800, 1600], alamos: [800, 1600], dosquebradas: [700, 1400], locales: [640, 1276], casa51: [480, 960], apto1402: [700, 1400], apto1106: [700, 1400] };
const baseName = f => f.replace('.webp', '');
const thumb = f => `${baseName(f)}-320.webp`;
const sset = f => { const v = VARS[baseName(f)]; return v ? `assets/${baseName(f)}-${v[0]}.webp ${v[0]}w, assets/${f} ${v[1]}w` : ''; };
const imgTag = (f, alt, sizes, extra = '') => `<img src="assets/${f}"${sset(f) ? ` srcset="${sset(f)}" sizes="${sizes}"` : ''} alt="${alt}" ${extra}>`;
const waProj = p => waUrl(`Hola, me interesa ${p.name}${p.city ? ' (' + p.city + ')' : ''}. ¿Me pueden dar más información?`);
const specText = p => { const s = p.specs || {}, o = []; if (s.area) o.push(s.area + ' m²'); if (s.hab) o.push(s.hab + ' hab.'); if (s.banos) o.push(s.banos + ' baños'); return o.join(' · '); };

/* -------------------------------------------------------------- whatsapp */
$$('[data-wa]').forEach(a => { a.href = waUrl(a.dataset.wa); });

/* ------------------------------------------------- secciones con nombre */
$$('main > section[id]').forEach(s => {
  const h = $('h1,h2', s);
  if (h) { h.id = h.id || 't-' + s.id; s.setAttribute('aria-labelledby', h.id); }
});

/* ---------------------------------------------------------------- header */
const hdr = $('#hdr'), toggle = $('#navToggle');
const setNav = o => { hdr.classList.toggle('nav-open', o); toggle.setAttribute('aria-expanded', o); toggle.setAttribute('aria-label', o ? 'Cerrar menú' : 'Abrir menú'); };
toggle.addEventListener('click', () => setNav(!hdr.classList.contains('nav-open')));
$$('#nav a').forEach(a => a.addEventListener('click', () => setNav(false)));
addEventListener('keydown', e => { if (e.key === 'Escape' && hdr.classList.contains('nav-open')) { setNav(false); toggle.focus(); } });
let tick = false;
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; hdr.classList.toggle('is-solid', scrollY > 40); }); } }, { passive: true });
hdr.classList.toggle('is-solid', scrollY > 40);

/* --------------------------------------------------------------- paneles */
function panel(p) {
  const price = p.price ? `${p.priceLabel} ${cop(p.price)}` : 'Consulta el valor';
  const sub = [price, specText(p) || p.tagline || p.place].filter(Boolean).join(' · ');
  return `<article class="pn${p.half ? ' pn--half' : ''}" aria-labelledby="pn-${p.id}">
    <div class="pn__media"><img data-src="assets/${p.images[0][0]}"${sset(p.images[0][0]) ? ` data-srcset="${sset(p.images[0][0])}"` : ''} sizes="${p.half ? '(max-width:900px) 100vw, 56vw' : '100vw'}" alt="${p.images[0][1]}" decoding="async"></div>
    <div class="wrap pn__in">
      <p class="pn__k">${p.kick}</p>
      <h3 class="pn__h" id="pn-${p.id}">${p.name}</h3>
      <p class="pn__s">${sub}</p>
      <div class="cta-row">
        <button type="button" class="btn btn--gold" data-open="${p.id}" aria-label="Ver detalle de ${p.name}">Ver detalle</button>
        <a class="btn btn--ghost" href="${waProj(p)}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp sobre ${p.name}">WhatsApp</a>
      </div>
    </div>
  </article>`;
}
$('#pnl').innerHTML = PROJECTS.map(panel).join('');
// las fotos de los paneles se piden cuando faltan ~400 px para verlas: la portada tiene todo el ancho de banda al cargar
const imgIo = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const im = e.target; imgIo.unobserve(im);
  if (im.dataset.srcset) im.srcset = im.dataset.srcset;
  im.src = im.dataset.src;
}), { rootMargin: '0px 0px 400px 0px' });
$$('#pnl img[data-src]').forEach(im => imgIo.observe(im));

/* ---------------------------------------------------- entrada suave */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: .08 });
$$('.pn__in, .about .wrap > *, .contact__in > *').forEach(el => { el.classList.add('rv'); io.observe(el); });

/* ----------------------------------------------------- navegación activa */
const links = $$('#nav a[href^="#"]:not(.btn)');
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(l => l.setAttribute('aria-current', l.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main > section[id]').forEach(s => spy.observe(s));

/* --------------------------------------------------- detalle del proyecto */
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
      <ul class="pd__list">${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
      <div class="pd__act"><a class="btn btn--gold" href="${waProj(p)}" target="_blank" rel="noopener">${ic('wa')}Hablar con un asesor</a></div>
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
});
dlg.addEventListener('close', () => lock(false));
document.addEventListener('click', e => { const o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); openProject(o.dataset.open); } });

window.__mk = 1;   // el script llegó hasta el final sin errores; si no, la página quita la clase js a los 4 s y muestra todo
})();
