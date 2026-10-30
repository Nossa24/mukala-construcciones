import { launch, open, sleep } from './lib.mjs';
const browser = await launch();
const WIDTHS = [[320,640],[360,740],[375,667],[390,844],[412,915],[430,932],[600,900],[768,1024],[820,1180],[1024,768],[1180,820],[1280,720],[1366,768],[1440,900],[1920,1080]];
const rows = []; const issues = [];
for (const [w, h] of WIDTHS) {
  const page = await open(browser, { w, h, mobile: w <= 820, dpr: w <= 820 ? 2 : 1 });
  await page.evaluate(() => { const st = document.createElement('style'); st.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.head.appendChild(st); document.querySelectorAll('.rv').forEach(e => e.classList.add('in')); document.querySelectorAll('.ln>span').forEach(s => s.style.transform = 'none'); document.getElementById('sticky').classList.add('on'); document.querySelector('.fab').classList.add('on'); });
  await sleep(150);
  const m = await page.evaluate((touchMax) => {
    const vis = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const nm = el => el.id ? '#' + el.id : (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(' ')[0] : el.tagName.toLowerCase());
    const over = [...new Set([...document.querySelectorAll('body *')].filter(e => { if (e.closest('svg,.mq,.slides,.topo,.gal,.cards,.cmp__w,.giant,.ghost,.hdr,#sticky,.fab,aside')) return false; const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 && r.width > 0; }).map(nm))].slice(0, 5);
    const sel = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=tab]';
    const small = [...document.querySelectorAll(sel)].filter(el => vis(el) && (el.getBoundingClientRect().width < 44 || el.getBoundingClientRect().height < 44)).map(el => nm(el) + ' ' + Math.round(el.getBoundingClientRect().width) + '×' + Math.round(el.getBoundingClientRect().height));
    const tiny = [...document.querySelectorAll('body *')].filter(el => { if (el.closest('svg') || !vis(el)) return false; if (!([...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1))) return false; return parseFloat(getComputedStyle(el).fontSize) < 12 && !el.closest('.logo'); }).length;
    const nav = document.getElementById('nav').getBoundingClientRect(), logo = document.querySelector('.logo').getBoundingClientRect();
    const toggle = getComputedStyle(document.getElementById('navToggle')).display !== 'none';
    const links = [...document.querySelectorAll('#nav > a')].map(a => a.getBoundingClientRect().height);
    const finder = document.querySelector('.finder').getBoundingClientRect();
    return { sw: document.documentElement.scrollWidth, iw: innerWidth, over, small, tiny, menu: toggle ? 'botón' : 'inline', navOverlap: !toggle && nav.left < logo.right, ctaClipped: !toggle && (document.querySelector('#nav .btn').getBoundingClientRect().right > innerWidth - 8), linkWrap: !toggle && links.some(x => x > 60), finderBottom: Math.round(finder.bottom), ih: innerHeight };
  });
  const row = { ancho: w, hScroll: m.sw > m.iw, desbordes: m.over.join(',') || '—', objetivos44: touchMax(w) ? (m.small.length ? m.small.join('; ') : '0') : 'n/a', textoMenor12: m.tiny, menu: m.menu, navSolapa: m.navOverlap, enlacesPartidos: m.linkWrap, buscadorVisible: m.finderBottom <= m.ih ? 'sí' : `no (${m.finderBottom}>${m.ih})`, errores: page.__errors.length };
  rows.push(row);
  if (m.ctaClipped) issues.push(`${w}px: el botón del menú se sale de la pantalla`); if (row.hScroll) issues.push(`${w}px: scroll horizontal`); if (m.over.length) issues.push(`${w}px: desbordes ${m.over}`);
  if (touchMax(w) && m.small.length) issues.push(`${w}px: objetivos <44: ${m.small.join('; ')}`);
  if (m.tiny) issues.push(`${w}px: ${m.tiny} textos <12px`); if (m.navOverlap) issues.push(`${w}px: el menú se solapa con el logo`); if (m.linkWrap) issues.push(`${w}px: enlaces del menú partidos`);
  if (page.__errors.length) issues.push(`${w}px: errores ${page.__errors.join(' | ')}`);
  await page.close();
}
function touchMax(w) { return w <= 1180; }
console.log('ancho | hScroll | menú | solapa | partidos | <12px | objetivos<44 | buscador en 1.ª pantalla');
rows.forEach(r => console.log(`${String(r.ancho).padStart(5)} | ${r.hScroll ? 'SÍ' : 'no'} | ${r.menu} | ${r.navSolapa ? 'SÍ' : 'no'} | ${r.enlacesPartidos ? 'SÍ' : 'no'} | ${r.textoMenor12} | ${r.objetivos44} | ${r.buscadorVisible}`));
console.log('\nPROBLEMAS:', issues.length ? '\n - ' + issues.join('\n - ') : 'ninguno');
await browser.close();
