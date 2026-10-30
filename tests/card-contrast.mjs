import { launch, sleep } from './lib.mjs';
import sharp from 'sharp';
const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const b = await launch(); const out = [];
for (const [w, h, name] of [[1440, 900, 'escritorio'], [390, 844, 'móvil']]) {
  const p = await b.newPage(); const mob = w < 700;
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob });
  await p.goto(process.env.BASE || 'http://127.0.0.1:8780/', { waitUntil: 'load' }); await p.waitForFunction('window.__mk===1'); await p.evaluate('document.fonts.ready');
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important} *,*::before,*::after{transition:none!important;animation:none!important} .js .card{opacity:1!important;translate:none!important}' });
  const n = await p.evaluate(() => document.querySelectorAll('#idx .card').length);
  for (let i = 0; i < n; i++) {
    await p.evaluate(i => { const c = document.querySelectorAll('#idx .card')[i]; c.scrollIntoView({ block: 'center', inline: 'center' }); document.querySelectorAll('#idx .card .card__body,#idx .card .card__top').forEach(e => e.style.visibility = 'hidden'); }, i);
    await sleep(700);
    const info = await p.evaluate(i => { const c = document.querySelectorAll('#idx .card')[i]; const els = [...c.querySelectorAll('.card__h,.card__meta,.card__p,.chip')]; els.forEach(e => e.style.visibility = 'visible'); const rects = els.map(e => { const r = e.getBoundingClientRect(); return { k: e.className.split(' ')[0], x: r.left, y: r.top, w: r.width, h: r.height }; }); els.forEach(e => e.style.visibility = 'hidden'); return { name: c.querySelector('.card__h').textContent, rects }; }, i);
    const buf = await p.screenshot({ type: 'png' });
    const { data, info: im } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
    for (const r of info.rects) {
      if (r.k === 'chip') continue;
      let worst = 99;
      for (let y = Math.max(0, Math.floor(r.y)); y < Math.min(im.height, Math.ceil(r.y + r.h)); y += 2) for (let x = Math.max(0, Math.floor(r.x)); x < Math.min(im.width, Math.ceil(r.x + r.w)); x += 2) { const o = (y * im.width + x) * im.channels; const c = cr([255, 255, 255], [data[o], data[o + 1], data[o + 2]]); if (c < worst) worst = c; }
      out.push(`${name} · ${info.name} · ${r.k}: peor contraste vs blanco = ${worst.toFixed(2)}`);
    }
  }
  await p.close();
}
console.log(out.join('\n'));
const mins = out.map(l => +l.split('= ')[1]); console.log('MÍNIMO', Math.min(...mins).toFixed(2));
await b.close();
