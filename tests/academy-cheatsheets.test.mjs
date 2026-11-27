import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const resolveAsset = rel => (fs.existsSync(`app/src/main/assets/${rel}`) ? `app/src/main/assets/${rel}` : rel);

function loadAcademyEnv() {
  const ctx = { window: {}, globalThis: {} };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  const files = [
    'apps/academy/data/level-0.js',
    'apps/academy/data/levels-1-2.js',
    'apps/academy/data/levels-3-4.js',
    'apps/academy/data/levels-5-6.js',
    'apps/academy/data/mastery-advanced.js',
    'apps/academy/data/mastery-deep-enrichment.js',
    'apps/academy/data/curriculum.js',
    'apps/academy/data/ict-glossary.js',
    'apps/academy/data/academy-cheatsheets.js'
  ];
  for (const file of files) {
    vm.runInNewContext(fs.readFileSync(resolveAsset(file), 'utf8'), ctx, { filename: file });
  }
  return {
    C: ctx.AmyAcademyCurriculum,
    G: ctx.AmyAcademyGlossary,
    CS: ctx.AmyAcademyCheatSheets
  };
}

test('academy-cheatsheets: covers all 6 stages (Bagian I–VI) with valid structured content & balanced markdown', () => {
  const { C, CS } = loadAcademyEnv();
  assert.ok(CS && Array.isArray(CS.CHEAT_SHEETS), 'CHEAT_SHEETS exported');
  assert.equal(CS.CHEAT_SHEETS.length, C.STAGES.length, 'One cheat sheet per stage');

  for (const stage of C.STAGES) {
    const sheet = CS.getCheatSheetByStage(stage.id);
    assert.ok(sheet, `Cheat sheet exists for stage ${stage.id}`);
    assert.equal(sheet.stageId, stage.id);
    assert.ok(sheet.blocks.length >= 2, `Stage ${stage.id} has >=2 blocks`);
    assert.ok(sheet.goldenLine && sheet.goldenLine.length > 20, `Stage ${stage.id} has goldenLine`);
    for (const block of sheet.blocks) {
      assert.ok(block.title && block.items.length >= 2);
      for (const item of block.items) {
        const boldMarks = (item.match(/\*\*/g) || []).length;
        assert.equal(boldMarks % 2, 0, `Balanced ** in stage ${stage.id}: ${item}`);
      }
    }
  }
});

test('academy-cheatsheets: practice checkpoints & Bagian VI advanced metadata map to real Academy lessons', () => {
  const { C, CS } = loadAcademyEnv();
  const expectedCheckpoints = ['karakter-xauusd-spread-wita', 'model-sweep-mss-fvg', 'protokol-100-sample-mandiri'];
  for (const lessonId of expectedCheckpoints) {
    assert.ok(C.getLessonById(lessonId), `Checkpoint lesson ${lessonId} exists`);
    const cp = CS.getPracticeCheckpointForLesson(lessonId);
    assert.ok(cp && cp.title && cp.primaryHref, `Checkpoint config valid for ${lessonId}`);
  }
  const advMeta = CS.getStagePathMeta(5);
  assert.ok(advMeta && advMeta.isAdvanced === true && advMeta.bannerNote.length > 30, 'Bagian VI marked as Jalur Lanjutan');
});

test('academy Tahap 1 beginner gap closure: Bab 02 fees, Bab 04 MT5 tools, Bab 24 Fibo OTE, and 50 glossary terms', () => {
  const { C, G } = loadAcademyEnv();
  assert.ok(G.TERMS.length >= 50, `Glossary expanded to >= 50 terms (got ${G.TERMS.length})`);
  for (const id of ['swap', 'komisi-raw', 'slippage', 'margin-call', 'rollover']) {
    const t = G.lookupTerm(id);
    assert.ok(t, `Glossary includes ${id}`);
    assert.ok(C.getLessonById(t.lessonId), `Glossary term ${id} maps to valid lesson`);
  }

  const bab02 = C.getLessonById('bid-ask-spread-pips-gold');
  const bab02Text = bab02.bookSections.map(s => [s.heading, ...(s.paragraphs || [])].join(' ')).join(' ');
  assert.match(bab02Text, /Triple Swap/i);
  assert.match(bab02Text, /Raw \/ ECN/i);
  assert.match(bab02Text, /Slippage/i);

  const bab04 = C.getLessonById('panduan-mt5-lima-jenis-order');
  const bab04Text = bab04.bookSections.map(s => [s.heading, ...(s.paragraphs || [])].join(' ')).join(' ');
  assert.match(bab04Text, /Horizontal Line/i);
  assert.match(bab04Text, /Rectangle/i);
  assert.match(bab04Text, /Crosshair/i);

  const bab24 = C.getLessonById('premium-discount-equilibrium');
  const bab24Rows = bab24.bookSections.flatMap(s => (s.table && s.table.rows) || []).flat().join(' ');
  assert.match(bab24Rows, /0\.5/);
  assert.match(bab24Rows, /0\.618/);
  assert.match(bab24Rows, /0\.705/);
  assert.match(bab24Rows, /0\.786/);
});
