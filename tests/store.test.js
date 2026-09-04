const test = require('node:test');
const assert = require('node:assert');
const { createStore } = require('../miniprogram/utils/store');

function memStorage() { const m = {}; return { get: k => (k in m ? m[k] : ''), set: (k, v) => { m[k] = v; } }; }

test('markStudied 写初态且同日仅记一次 new', () => {
  const s = createStore(memStorage());
  s.markStudied('inspect', '2026-09-04');
  s.markStudied('inspect', '2026-09-04');          // 幂等
  const p = s.getProgress();
  assert.ok(p.cards.inspect);
  assert.equal(p.log['2026-09-04'].new, 1);
  assert.equal(p.cards.inspect.srs.dueDate, '2026-09-05');
});

test('applyReview 更新 SRS 并记 reviews/lapses', () => {
  const s = createStore(memStorage());
  s.markStudied('inspect', '2026-09-04');
  const r1 = s.applyReview('inspect', 5, '2026-09-05');     // 记得
  assert.equal(r1.applied, true);
  assert.equal(s.getProgress().cards.inspect.srs.intervalDays, 6);
  assert.equal(s.getProgress().log['2026-09-05'].reviews, 1);
  const r2 = s.applyReview('inspect', 1, '2026-09-11');     // 忘了
  assert.equal(r2.applied, true);
  const p = s.getProgress();
  assert.equal(p.cards.inspect.lapses, 1);
  assert.equal(p.log['2026-09-11'].reviews, 1);
  assert.equal(p.log['2026-09-11'].lapses, 1);
});

test('dueWords 到期排序:最久未到期在前;同日间隔短在前', () => {
  const mem = memStorage();
  const seed = { version: 1, log: {}, cards: {
    oldDue:    { srs: { ef: 2.5, intervalDays: 6,  reps: 2, dueDate: '2026-09-02' }, lapses: 0, studiedAt: '2026-09-01' },
    newDue:    { srs: { ef: 2.5, intervalDays: 16, reps: 3, dueDate: '2026-09-08' }, lapses: 0, studiedAt: '2026-09-01' },
    sameShort: { srs: { ef: 2.5, intervalDays: 3,  reps: 1, dueDate: '2026-09-06' }, lapses: 0, studiedAt: '2026-09-01' },
    sameLong:  { srs: { ef: 2.5, intervalDays: 8,  reps: 2, dueDate: '2026-09-06' }, lapses: 0, studiedAt: '2026-09-01' },
  } };
  mem.set('rm_progress_v1', JSON.stringify(seed));       // 存储键名见 spec §5.3
  const s = createStore(mem);
  const due = s.dueWords('2026-09-08');
  assert.deepStrictEqual(due, ['oldDue', 'sameShort', 'sameLong', 'newDue']);
  // oldDue(09-02)最早 → 同日 09-06 按 intervalDays 升序(3 先于 8)→ newDue(09-08)最晚
});
test('applyReview 不存在的词 no-op', () => {
  const s = createStore(memStorage());
  assert.equal(s.applyReview('ghost', 5, '2026-09-05').applied, false);
});
test('重置清空', () => {
  const s = createStore(memStorage());
  s.markStudied('a', '2026-09-04');
  s.reset();
  assert.deepStrictEqual(s.getProgress(), { version: 1, cards: {}, log: {} });
});
test('设置默认值与保存', () => {
  const s = createStore(memStorage());
  assert.deepStrictEqual(s.getSettings(), { reviewCapPerDay: 0, expandAssoc: false });
  s.saveSettings({ reviewCapPerDay: 20, expandAssoc: true });
  assert.deepStrictEqual(s.getSettings(), { reviewCapPerDay: 20, expandAssoc: true });
});
