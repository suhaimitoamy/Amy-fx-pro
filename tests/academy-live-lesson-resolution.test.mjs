import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Lesson resolution from chat history correctly extracts lesson title', () => {
  const code = fs.readFileSync('app/src/main/assets/apps/shared/amy-local-knowledge.js', 'utf8');
  const win = {};
  const fn = new Function('window', code);
  fn(win);
  const knowledge = win.AmyLocalKnowledge;
  assert.ok(Array.isArray(knowledge) && knowledge.length > 0, 'Knowledge must be populated');

  const history = [
    { role: 'user', text: 'kita belajar apa' },
    { role: 'model', text: 'Terakhir kita sedang membahas materi Breaker Block di modul Smart Money Concept...' }
  ];

  const sorted = [...knowledge].filter(k => k.title && k.title.length > 3).sort((a, b) => b.title.length - a.title.length);
  let found = null;
  for (let i = history.length - 1; i >= 0; i--) {
    const text = history[i]?.text || '';
    for (const k of sorted) {
      const esc = k.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp('\\b' + esc + '\\b', 'i').test(text)) {
        found = k;
        break;
      }
    }
    if (found) break;
  }

  assert.ok(found, 'Should find lesson from history');
  assert.equal(found.title, 'Breaker Block');
});

test('resolveLessonHtmlPath converts index.html#chapter to chapter.html', () => {
  function resolveLessonHtmlPath(rawPath) {
    if (!rawPath) return '';
    let p = rawPath.replace(/^.*\/apps\/academy\//, 'apps/academy/');
    if (!p.startsWith('apps/academy/')) p = 'apps/academy/' + p;
    const hashIdx = p.indexOf('#');
    if (hashIdx !== -1) {
      const base = p.slice(0, hashIdx);
      const anchor = p.slice(hashIdx + 1);
      if (base.endsWith('/index.html') && anchor) {
        return base.replace(/\/index\.html$/, '/' + anchor + '.html');
      }
    }
    return p;
  }

  assert.equal(
    resolveLessonHtmlPath('apps/academy/bagian-05-smart-money-concept/index.html#breaker-block'),
    'apps/academy/bagian-05-smart-money-concept/breaker-block.html'
  );
  assert.equal(
    resolveLessonHtmlPath('apps/academy/bagian-01-pemula-nol/index.html#apa-itu-trading'),
    'apps/academy/bagian-01-pemula-nol/apa-itu-trading.html'
  );
});

test('MainActivity does not rewrite chapter html to index.html#chapter', () => {
  const mainAct = fs.readFileSync('app/src/main/java/com/amyelitesuite/MainActivity.kt', 'utf8');
  assert.ok(!mainAct.includes('lessonRegex'), 'MainActivity should not contain obsolete lessonRegex rewrite');
});

test('Live bridge contains findLessonFromChatHistory and anti-stuck visual recovery', () => {
  const bridge = fs.readFileSync('app/src/main/assets/apps/shared/amy-gemini-live-bridge.js', 'utf8');
  assert.ok(bridge.includes('findLessonFromChatHistory'), 'Bridge must define findLessonFromChatHistory');
  assert.ok(bridge.includes('isStreamingMic ? \'listening\' : \'\''), 'Bridge must reset orb visual state on delayed navigation');
});
