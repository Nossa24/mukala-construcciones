/* Build de producción de la v2: minifica CSS y JS, les pone un hash en el nombre (caché inmutable)
   y copia todo a dist/. Uso:  npm install  &&  npm run build   (OUT=docs NOINDEX=1 npm run build para la versión de GitHub Pages)
   Lo que se publica es la carpeta dist/. Los archivos de la raíz siguen siendo el código fuente editable. */
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

const root = path.resolve(process.argv[2] || '.');
const out = path.join(root, process.env.OUT || 'dist');   // OUT=docs para publicar con GitHub Pages
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const hash = buf => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);
const kb = n => (n / 1024).toFixed(1).padStart(6) + ' KB';
const sizes = [];

async function min(file, loader) {
  const src = fs.readFileSync(path.join(root, file));
  const { outputFiles } = await build({ entryPoints: [path.join(root, file)], bundle: false, minify: true, loader: { [path.extname(file)]: loader }, target: 'es2020', write: false, legalComments: 'none' });
  const code = Buffer.from(outputFiles[0].contents);
  const name = file.replace(/\.(\w+)$/, `.${hash(code)}.$1`);
  fs.writeFileSync(path.join(out, name), code);
  sizes.push([file, src.length, code.length, zlib.gzipSync(code, { level: 9 }).length, zlib.brotliCompressSync(code).length]);
  return name;
}

const css = await min('styles.css', 'css');
const js = await min('app.js', 'js');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace('href="styles.css"', `href="${css}"`).replace('src="app.js"', `src="${js}"`);
if (!html.includes(css) || !html.includes(js)) throw new Error('no se pudieron enlazar los archivos con hash');
// NOINDEX=1: versión de muestra (propuesta aún sin aprobar): pide a los buscadores no indexarla
if (process.env.NOINDEX === '1') html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex, nofollow">');
fs.writeFileSync(path.join(out, 'index.html'), html);
sizes.push(['index.html', fs.statSync(path.join(root, 'index.html')).size, Buffer.byteLength(html), zlib.gzipSync(html, { level: 9 }).length, zlib.brotliCompressSync(Buffer.from(html)).length]);
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });

console.log('archivo'.padEnd(14), 'original   ', 'final      ', 'gzip       ', 'brotli');
for (const [f, a, b, g, br] of sizes) console.log(f.padEnd(14), kb(a), kb(b), kb(g), kb(br));
console.log(`\nlisto: ${path.relative(process.cwd(), out) || 'dist'}/  →  ${css}, ${js}`);
