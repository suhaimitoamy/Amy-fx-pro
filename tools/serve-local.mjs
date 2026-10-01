import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT_DIR = path.resolve(__dirname, '../app/src/main/assets');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    let targetPath = path.join(ROOT_DIR, safePath);

    if (!targetPath.startsWith(ROOT_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    if (fs.existsSync(targetPath)) {
      const stat = fs.statSync(targetPath);
      if (stat.isDirectory()) {
        if (!pathname.endsWith('/')) {
          res.writeHead(302, { Location: pathname + '/' + (parsedUrl.search || '') });
          res.end();
          return;
        }
        const indexHtml = path.join(targetPath, 'index.html');
        if (fs.existsSync(indexHtml)) {
          targetPath = indexHtml;
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Index file not found in directory');
          return;
        }
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      const errorPage = path.join(ROOT_DIR, 'error.html');
      if (fs.existsSync(errorPage)) {
        res.end(fs.readFileSync(errorPage));
      } else {
        res.end('<h1>404 Not Found</h1><p>File tidak ditemukan.</p>');
      }
      return;
    }

    const stat = fs.statSync(targetPath);
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const range = req.headers.range;
    if (range && (ext === '.mp4' || ext === '.mp3')) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;
      const stream = fs.createReadStream(targetPath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      if (req.method === 'HEAD') {
        res.end();
      } else {
        stream.pipe(res);
      }
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Accept-Ranges': 'bytes'
    });

    if (req.method === 'HEAD') {
      res.end();
    } else {
      fs.createReadStream(targetPath).pipe(res);
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server Error: ' + err.message);
  }
});

server.listen(PORT, HOST, () => {
  console.log('====================================================');
  console.log('  AMY FX PRO — LOCAL WEB SERVER AKTIF');
  console.log('====================================================');
  console.log(`  > Akses Langsung di Browser:`);
  console.log(`    👉 http://localhost:${PORT}`);
  console.log(`    👉 http://127.0.0.1:${PORT}`);
  console.log('');
  console.log(`  > Modul Cepat:`);
  console.log(`    - Beranda / Profil : http://localhost:${PORT}/index.html`);
  console.log(`    - Mapping Gold     : http://localhost:${PORT}/apps/mapping/`);
  console.log(`    - Jurnal & Habits  : http://localhost:${PORT}/apps/journal/`);
  console.log(`    - Market Intel     : http://localhost:${PORT}/apps/market-intel/`);
  console.log(`    - Academy          : http://localhost:${PORT}/apps/academy/`);
  console.log('====================================================');
});
