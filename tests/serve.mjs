import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
const [root, port, mode = 'dev'] = process.argv.slice(2);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.woff2': 'font/woff2', '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json' };
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.svg', '.json']);
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, path.normalize(p));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('no encontrado'); }
  const ext = path.extname(file); let body = fs.readFileSync(file);
  const h = { 'Content-Type': TYPES[ext] || 'application/octet-stream' };
  if (mode === 'prod') {
    h['ETag'] = '"' + crypto.createHash('md5').update(body).digest('hex') + '"';
    h['Cache-Control'] = ext === '.html' ? 'no-cache' : (/\.[0-9a-f]{10}\.(css|js)$/.test(file) ? 'public, max-age=31536000, immutable' : 'public, max-age=2592000');
    h['X-Content-Type-Options'] = 'nosniff';
    const ae = req.headers['accept-encoding'] || '';
    if (COMPRESSIBLE.has(ext)) {
      if (/\bbr\b/.test(ae)) { body = zlib.brotliCompressSync(body, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } }); h['Content-Encoding'] = 'br'; }
      else if (/\bgzip\b/.test(ae)) { body = zlib.gzipSync(body, { level: 9 }); h['Content-Encoding'] = 'gzip'; }
      h['Vary'] = 'Accept-Encoding';
    }
  } else { h['Cache-Control'] = 'no-store'; }
  h['Content-Length'] = body.length;
  res.writeHead(200, h); res.end(body);
}).listen(+port, '127.0.0.1', () => console.log(`sirviendo ${root} en http://127.0.0.1:${port} (${mode})`));
