const test = require('node:test');
const assert = require('node:assert');
const srs = require('../miniprogram/utils/srs');
const { EF_MIN } = srs;

test('学成初始态: ef2.5 / reps1 / interval1 / 次日到期', () => {
  const s = srs.initialStudyState('2026-09-04');
  assert.deepStrictEqual(s, { ef: 2.5, intervalDays: 1, reps: 1, dueDate: '2026-09-05' });
});

test('连续"记得":间隔 1→6→16→43 递增', () => {
  const s1 = srs.initialStudyState('2026-09-04');           // due 09-05
  const s2 = srs.review(s1, srs.Q_GOOD, '2026-09-05');      // reps2 → 6
  assert.deepStrictEqual({ ...s2 }, { ef: 2.6, intervalDays: 6, reps: 2, dueDate: '2026-09-11' });
  const s3 = srs.review(s2, srs.Q_GOOD, '2026-09-11');      // reps3 → round(6*2.6)=16
  assert.equal(s3.intervalDays, 16); assert.equal(s3.dueDate, '2026-09-27'); assert.equal(s3.ef, 2.7);
  const s4 = srs.review(s3, srs.Q_GOOD, '2026-09-27');      // round(16*2.7)=43
  assert.equal(s4.intervalDays, 43); assert.equal(s4.ef, 2.8);
});

test('"忘了"归零重置并降 EF', () => {
  let s = srs.initialStudyState('2026-09-04');
  s = srs.review(s, srs.Q_GOOD, '2026-09-05');
  s = srs.review(s, srs.Q_GOOD, '2026-09-11');              // ef2.7 reps3 interval16
  const r = srs.review(s, srs.Q_FORGOT, '2026-09-27');
  assert.equal(r.reps, 0); assert.equal(r.intervalDays, 1);
  assert.equal(r.ef, 2.5); assert.equal(r.dueDate, '2026-09-28');
});

test('"模糊"算通过但降 EF(q3 → −0.14)', () => {
  let s = srs.initialStudyState('2026-09-04');
  const r = srs.review(s, srs.Q_HAZY, '2026-09-05');
  assert.equal(r.reps, 2); assert.equal(r.intervalDays, 6);
  assert.ok(r.ef < 2.5);  // 2.5 − 0.14 = 2.36
  assert.equal(Math.round(r.ef * 100), 236);
});

test('EF 不低于 1.3', () => {
  let s = { ef: 1.31, intervalDays: 16, reps: 5, dueDate: '2026-09-04' };
  const r = srs.review(s, srs.Q_FORGOT, '2026-09-04');
  assert.equal(r.ef, EF_MIN);
});

test('lapse 后重新爬坡 1→6', () => {
  let s = srs.review({ ef: 2.5, intervalDays: 16, reps: 5, dueDate: '2026-09-01' }, srs.Q_FORGOT, '2026-09-10');
  assert.deepStrictEqual({ reps: s.reps, intervalDays: s.intervalDays }, { reps: 0, intervalDays: 1 });
  const good1 = srs.review(s, srs.Q_GOOD, s.dueDate);
  assert.equal(good1.intervalDays, 1);   // reps1
  const good2 = srs.review(good1, srs.Q_GOOD, good1.dueDate);
  assert.equal(good2.intervalDays, 6);   // reps2
});
