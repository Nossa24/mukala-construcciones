import { launch, open, sleep } from './lib.mjs';
import path from 'node:path';
const AXE = path.resolve('node_modules/axe-core/axe.min.js');
const b = await launch();
for (const [w, h, name] of [[1440, 900, 'escritorio'], [390, 844, 'móvil']]) {
  const p = await open(b, { w, h, mobile: w < 700 });
  await p.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important} html{scroll-behavior:auto!important}' });
  await p.evaluate(() => { document.querySelectorAll('.rv,.card').forEach(e => e.classList.add('in')); document.getElementById('eForm').requestSubmit(); });
  await sleep(500);
  await p.addScriptTag({ path: AXE });
  const r = await p.evaluate(async () => { const x = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }); return x.violations.map(v => v.impact + ' ' + v.id + ' → ' + v.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' | ')); });
  console.log(name, r.length ? r : 'sin violaciones (formulario del exterior con error visible)');
  await p.close();
}
await b.close();
