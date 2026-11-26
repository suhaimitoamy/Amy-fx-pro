import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadAcademyContext() {
  const ctx = { window: {}, globalThis: {} };
  ctx.globalThis = ctx;
  ctx.window = ctx;
  const resolveAsset = rel => (fs.existsSync(`app/src/main/assets/${rel}`) ? `app/src/main/assets/${rel}` : rel);
  for (const f of [
    'apps/academy/data/level-0.js',
    'apps/academy/data/levels-1-2.js',
    'apps/academy/data/levels-3-4.js',
    'apps/academy/data/levels-5-6.js',
    'apps/academy/data/mastery-advanced.js',
    'apps/academy/data/mastery-deep-enrichment.js',
    'apps/academy/data/curriculum.js',
    'apps/academy/data/ict-glossary.js',
  ]) {
    vm.runInNewContext(fs.readFileSync(resolveAsset(f), 'utf8'), ctx);
  }
  return ctx;
}

const ctx = loadAcademyContext();
const G = ctx.AmyAcademyGlossary;
const C = ctx.AmyAcademyCurriculum;

test('ict-glossary: contains >= 40 valid Gold/ICT terms mapped to real Academy lessons', () => {
  assert.ok(G, 'AmyAcademyGlossary should be loaded');
  assert.ok(Array.isArray(G.TERMS) && G.TERMS.length >= 40, `Expected >= 40 terms, got ${G.TERMS?.length}`);
  const ids = new Set();
  for (const item of G.TERMS) {
    assert.ok(item.id && !ids.has(item.id), `Duplicate or missing id: ${item.id}`);
    ids.add(item.id);
    assert.ok(item.term && item.fullName, `Missing term/fullName for ${item.id}`);
    assert.ok(item.simple && item.simple.length >= 25, `Simple explanation too short for ${item.id}`);
    assert.ok(item.example && item.example.length >= 15, `Example too short for ${item.id}`);
    assert.ok(C.getLessonById(item.lessonId), `Invalid lessonId ${item.lessonId} on term ${item.id}`);
  }
});

test('ict-glossary: lookupTerm & filterGlossary work accurately', () => {
  assert.equal(G.lookupTerm('cisd')?.id, 'cisd');
  assert.equal(G.lookupTerm('BISI')?.id, 'fvg');
  assert.equal(G.lookupTerm('EQH')?.id, 'eqh-eql');
  assert.equal(G.lookupTerm('tidak-ada'), null);

  const smtResults = G.filterGlossary('SMT', 'all');
  assert.ok(smtResults.some((x) => x.id === 'smt'));
  const lanjutanOnly = G.filterGlossary('', 'lanjutan');
  assert.ok(lanjutanOnly.length >= 5);
  assert.ok(lanjutanOnly.every((x) => x.category === 'lanjutan'));
});

test('ict-glossary: splitReadableParagraph breaks dense walls of text & inline numbered lists safely', () => {
  // Short paragraph stays single block
  const shortRes = G.splitReadableParagraph('Harga bergerak dari BSL ke SSL dengan cepat.');
  assert.equal(shortRes.length, 1);
  assert.equal(shortRes[0].type, 'p');

  // Inline numbered list converts cleanly into list items
  const numbered = '1. **Quotes (Daftar Harga):** Daftar instrumen seperti `XAUUSD`. 2. **Chart (Grafik):** Tempat membaca candle. 3. **Trade (Posisi Aktif):** Menampilkan Equity.';
  const listRes = G.splitReadableParagraph(numbered);
  assert.equal(listRes.length, 1);
  assert.equal(listRes[0].type, 'list');
  assert.equal(listRes[0].items.length, 3);
  assert.ok(listRes[0].items[0].startsWith('**Quotes'));

  // Long paragraph >= 400 chars splits into 2–3 balanced paragraphs without splitting inside decimals or **bold**
  const dense = 'Aturan kerjanya sederhana: jika `PDH` kemarin berada di `2.670,00` dan pagi ini harga masih di `2.658,00`, maka `PDH 2.670,00` berstatus **FRESH (Utuh)** — ia masih menyimpan Liquidity Pool BSL dan sah dijadikan magnet target atas. Tetapi begitu jam 16:00 WITA Gold sudah sempat menyentuh `2.672,50`, maka `PDH 2.670,00` langsung berubah status menjadi **TAKEN / SWEPT (Sudah Terambil)**. Hapus target lama tersebut dari daftar magnet atasmu, lalu evaluasi apakah harga lanjut ke PWH.';
  const splitRes = G.splitReadableParagraph(dense);
  assert.ok(splitRes.length >= 2, `Expected >= 2 split paragraphs, got ${splitRes.length}`);
  for (const blk of splitRes) {
    assert.equal(blk.type, 'p');
    // Balanced **bold** markers in every chunk
    const boldMarkers = (blk.text.match(/\*\*/g) || []).length;
    assert.equal(boldMarkers % 2, 0, `Unbalanced **bold** in split chunk: ${blk.text}`);
  }
});

test('ict-glossary: annotateTermsHtml wraps ICT acronyms safely without breaking HTML or Indonesian words', () => {
  const html = 'Setelah sweep <strong>BSL</strong> di atas <code>PDH 2.670</code>, tunggu CISD lalu mobil bergerak cepat ke OB atau FVG. Ulangi cek BSL lagi.';
  const annotated = G.annotateTermsHtml(html);

  // BSL wrapped ONCE only
  const bslMatches = annotated.match(/data-glossary-term="bsl"/g) || [];
  assert.equal(bslMatches.length, 1, 'BSL should be annotated only on first occurrence');

  // Inside <code>PDH 2.670</code> must NOT be wrapped
  assert.ok(annotated.includes('<code>PDH 2.670</code>'), 'Must not wrap inside <code> tags');

  // CISD, OB, FVG wrapped
  assert.ok(annotated.includes('data-glossary-term="cisd"'));
  assert.ok(annotated.includes('data-glossary-term="ob"'));
  assert.ok(annotated.includes('data-glossary-term="fvg"'));

  // Indonesian words "mobil" and "cepat" must NOT be mangled
  assert.ok(annotated.includes('mobil bergerak cepat'), 'Must not false-match inside Indonesian words');
});

test('ict-glossary: splitting across all 36 live chapters preserves balanced markdown everywhere', () => {
  let splitCount = 0;
  let listCount = 0;
  for (const lesson of C.LESSONS) {
    for (const sec of (lesson.bookSections || [])) {
      for (const p of [...(sec.paragraphs || []), ...(sec.paragraphsAfter || [])]) {
        const blocks = G.splitReadableParagraph(p);
        if (blocks.length > 1) splitCount++;
        for (const blk of blocks) {
          if (blk.type === 'list') {
            listCount++;
            for (const item of blk.items) {
              assert.equal((item.match(/\*\*/g) || []).length % 2, 0, `Unbalanced ** in list item (Bab ${lesson.stepCode}): ${item}`);
            }
          } else {
            assert.equal((blk.text.match(/\*\*/g) || []).length % 2, 0, `Unbalanced ** in paragraph (Bab ${lesson.stepCode}): ${blk.text}`);
          }
        }
      }
    }
  }
  assert.ok(splitCount >= 80, `Expected >= 80 long paragraphs split for mobile comfort, got ${splitCount}`);
  assert.ok(listCount >= 2, `Expected >= 2 inline numbered lists converted, got ${listCount}`);
});
