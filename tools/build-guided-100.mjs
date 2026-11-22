import fs from 'node:fs';
import path from 'node:path';
import { CASES_PART_A } from './guided-100-cases-a.mjs';
import { CASES_PART_B } from './guided-100-cases-b.mjs';
import { synthesizeChartForCase } from './guided-100-synth.mjs';

const ALL_SPECS = [...CASES_PART_A, ...CASES_PART_B];

function deterministicShuffle(arr, seed) {
  const out = arr.slice();
  let s = seed >>> 0;
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

const exercises = ALL_SPECS.map((spec, idx) => {
  const synth = synthesizeChartForCase(spec, idx);
  const shuffledChoices = deterministicShuffle(spec.choices, 918273 + idx * 313);
  return {
    id: spec.id,
    category: spec.category,
    topic: spec.topic,
    difficulty: spec.difficulty,
    title: spec.title,
    type: 'choice',
    timeframe: spec.timeframe || 'M15',
    source: 'XAUUSD-ICT-Lab-v3',
    prompt: spec.prompt,
    answer: spec.answer,
    choices: shuffledChoices,
    principle: spec.principle,
    lesson: spec.lesson,
    candles: synth.candles,
    afterCandles: synth.afterCandles,
    markers: synth.markers,
    levels: synth.levels,
    evidence: synth.evidence,
    outcomeNote: synth.outcomeNote,
    chartGuide: spec.chartGuide,
    scenario: spec.scenario || null
  };
});

const payload = {
  schemaVersion: 3,
  updatedAt: '2026-11-22',
  totalCount: exercises.length,
  pillars: [
    { topic: 'inducement', label: 'Filter Jebakan & Inducement' },
    { topic: 'killzone', label: 'Eksekusi Killzone Sisi Kanan' },
    { topic: 'dealing-range', label: 'Dealing Range & Disiplin NO TRADE' },
    { topic: 'market-structure', label: 'Market Structure: BOS, MSS & CISD' },
    { topic: 'pd-array', label: 'PD Array: OB, Breaker, Unicorn & BPR' },
    { topic: 'entry-playbook', label: 'Playbook Entry: Silver Bullet, 2022 & PO3' },
    { topic: 'risk-sl-rr', label: 'Penempatan SL Invalidation & RR' },
    { topic: 'psychology-execution', label: 'Psikologi Eksekusi & Anti-FOMO' }
  ],
  exercises
};

const outPath = path.resolve('apps/academy/trading-practice/assets/data/guided-exercises.json');
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

// Quick summary stats
const byDiff = {};
const byTopic = {};
let longestCorrect = 0;
let withEvidence = 0;
for (const q of exercises) {
  byDiff[q.difficulty] = (byDiff[q.difficulty] || 0) + 1;
  byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
  if (q.evidence) withEvidence++;
  const maxLen = Math.max(...q.choices.map((c) => c.length));
  if (q.answer.length === maxLen) longestCorrect++;
}

console.log('Generated guided-exercises.json successfully!');
console.log('Total:', exercises.length);
console.log('Difficulties:', byDiff);
console.log('Topics:', byTopic);
console.log('With visual evidence:', withEvidence, '/', exercises.length);
console.log('Correct is longest option:', longestCorrect, '/', exercises.length);
