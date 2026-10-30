import { launch, open } from './lib.mjs';
const b = await launch();
for (const w of [1341, 1366, 1440, 1536]) {
  const p = await open(b, { w, h: 800 });
  console.log(w, JSON.stringify(await p.evaluate(() => { const nav = document.querySelector('#nav'), cta = nav.querySelector('.btn'), logo = document.querySelector('.hdr .logo'); const l = [...nav.querySelectorAll('a:not(.btn)')]; const r = cta.getBoundingClientRect(); return { ctaRight: Math.round(r.right), vw: innerWidth, navLeft: Math.round(nav.getBoundingClientRect().left), logoRight: Math.round(logo.getBoundingClientRect().right), gap: Math.round(nav.getBoundingClientRect().left - logo.getBoundingClientRect().right), wrapped: l.some(a => a.getBoundingClientRect().height > 60), sw: document.documentElement.scrollWidth, wrapRight: Math.round(document.querySelector('.hdr .wrap').getBoundingClientRect().right) }; })));
  await p.close();
}
await b.close();
