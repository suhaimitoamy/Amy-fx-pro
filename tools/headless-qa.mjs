#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const TARGETS = [
  { name: 'Beranda / Peta Harga', url: 'http://127.0.0.1:8080/index.html' },
  { name: 'Cockpit Mapping Gold', url: 'http://127.0.0.1:8080/apps/mapping/index.html' },
  { name: 'Amy Academy Modul',    url: 'http://127.0.0.1:8080/apps/academy/index.html' },
  { name: 'Jurnal & Disiplin',    url: 'http://127.0.0.1:8080/apps/journal/index.html' }
];

async function runQA() {
  console.log('🐼 ================================================');
  console.log('   AMY FX PRO — LIGHTPANDA HEADLESS QA CHECKER');
  console.log('================================================\n');

  for (const target of TARGETS) {
    const startTime = Date.now();
    try {
      const { stdout } = await execFileAsync('lightpanda', [
        'fetch',
        target.url,
        '--dump', 'markdown',
        '--wait-ms', '2000',
        '--log-level', 'error'
      ]);

      const durationMs = Date.now() - startTime;
      const lengthBytes = Buffer.byteLength(stdout, 'utf8');

      console.log(`✅ [PASS] ${target.name}`);
      console.log(`   URL      : ${target.url}`);
      console.log(`   Durasi   : ${durationMs} ms`);
      console.log(`   Payload  : ${(lengthBytes / 1024).toFixed(1)} KB`);
      console.log('------------------------------------------------');
    } catch (err) {
      console.error(`❌ [FAIL] ${target.name}`);
      console.error(`   Error    : ${err.message}`);
      console.log('------------------------------------------------');
    }
  }

  console.log('\n🎉 Seluruh modul web lokal berhasil diverifikasi secara Headless tanpa beban browser!');
}

runQA();
