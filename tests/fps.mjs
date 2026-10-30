import { launch, sleep } from './lib.mjs';
const b = await launch();
for (const [w, h, name, dpr] of [[1440, 900, 'escritorio', 1], [390, 844, 'móvil', 2]]) {
  for (const rate of [1, 6]) {
    const p = await b.newPage(); const mob = w < 700;
    await p.setViewport({ width: w, height: h, deviceScaleFactor: dpr, isMobile: mob, hasTouch: mob });
    const c = await p.createCDPSession(); await c.send('Emulation.setCPUThrottlingRate', { rate });
    await p.goto(process.env.BASE || 'http://127.0.0.1:8780/', { waitUntil: 'load' }); await p.waitForFunction('window.__mk===1', { timeout: 30000 }); await sleep(1200);
    const r = await p.evaluate(async () => {
      const times = []; let last = performance.now(), run = true;
      const loop = t => { times.push(t - last); last = t; if (run) requestAnimationFrame(loop); }; requestAnimationFrame(loop);
      const H = document.documentElement.scrollHeight - innerHeight;
      for (let y = 0; y < H; y += 60) { scrollTo(0, y); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }
      run = false; times.shift();
      const sorted = [...times].sort((a, b) => a - b);
      return { frames: times.length, medianMs: +sorted[Math.floor(sorted.length / 2)].toFixed(1), p95Ms: +sorted[Math.floor(sorted.length * .95)].toFixed(1), over50: times.filter(t => t > 50).length, over33pct: +(times.filter(t => t > 33.4).length / times.length * 100).toFixed(1) };
    });
    console.log(`${name} CPU×${rate}:`, JSON.stringify(r));
    await p.close();
  }
}
await b.close();
