import { launch, sleep } from './lib.mjs';
import sharp from 'sharp';
const [dir] = process.argv.slice(2);
const b = await launch();
for (const [w, h, name] of [[1440, 900, 'd'], [390, 844, 'm'], [820, 1100, 't']]) {
  const p = await b.newPage(); const mob = w < 700;
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob });
  await p.goto(process.env.BASE || 'http://127.0.0.1:8780/', { waitUntil: 'load' }); await p.waitForFunction('window.__mk===1'); await p.evaluate('document.fonts.ready');
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important} *,*::before,*::after{transition:none!important;animation:none!important} .js .rv,.js .card{opacity:1!important;transform:none!important;translate:none!important} .hdr{display:none!important} .rail,.fab,.sticky,.prog{display:none!important}' });
  await p.evaluate(() => { document.querySelectorAll('[data-count]').forEach(e => { e.textContent = e.dataset.count + (e.dataset.suf || ''); }); document.querySelectorAll('.card,.rv').forEach(e => e.classList.add('in')); });
  const H = await p.evaluate('document.documentElement.scrollHeight');
  for (let y = 0; y < H; y += 600) { await p.evaluate(y => scrollTo(0, y), y); await sleep(80); }
  await p.evaluate(() => scrollTo(0, 0)); await sleep(400);
  for (const s of ['#nosotros', '#proyectos', '#alamos', '#valores', '#guia', '#exterior', '#galeria', '#proceso', '#faq', '#contacto']) {
    const el = await p.$(s); await el.screenshot({ path: `${dir}/${name}-${s.slice(1)}.png` });
  }
  await p.close();
}
await b.close(); console.log('ok');
