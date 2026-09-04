const test = require('node:test');
const assert = require('node:assert');
const { computeStats, familyProgressOf, streakCompute } = require('../miniprogram/utils/stats');
const { initialStudyState } = require('../miniprogram/utils/srs');

function mk(overrides) { return { version: 1, cards: {}, log: {}, ...overrides }; }
function card(iso, reps) { return { srs: { ...initialStudyState(iso), reps }, lapses: 0, studiedAt: iso }; }

test('computeStats 口径', () => {
  const p = mk({
    cards: {
      a: card('2026-09-01', 2),     // 熟悉; due=09-02(到期)
      b: card('2026-09-01', 1),     // 未熟; due=09-02(到期)
      c: card('2026-09-10', 1),     // 未来到期 09-11
    },
    log: { '2026-09-03': { new: 1, reviews: 2, lapses: 0 } },
  });
  const s = computeStats(p, '2026-09-10');
  assert.equal(s.learned, 3);
  assert.equal(s.familiar, 1);      // 仅 a(reps2)
  assert.equal(s.dueToday, 2);      // a、b
  assert.equal(s.streak, 0);        // log 仅 09-03,今日/昨日无
  assert.equal(s.last14.length, 14);
});

test('连续打卡:今日为尾;昨日为尾;无则 0', () => {
  const log = { '2026-09-08': { new: 1, reviews: 0, lapses: 0 }, '2026-09-09': { new: 1, reviews: 0, lapses: 0 } };
  assert.equal(streakCompute(log, '2026-09-09'), 2);
  assert.equal(streakCompute(log, '2026-09-10'), 2);   // 以昨日(09-09)为尾,09-09+09-08 → 连续 2 天
  assert.equal(streakCompute({}, '2026-09-10'), 0);
});

test('familyProgressOf', () => {
  const words = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const cards = { a: card('2026-09-01', 3), b: card('2026-09-01', 1) };
  assert.deepStrictEqual(familyProgressOf(words, cards), { total: 3, learned: 2, familiar: 1 });
});
