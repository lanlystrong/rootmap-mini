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

// pruneCards:交付集缩减后,已下架词的卡片必须被清掉。
// 为什么值得一条测试:computeStats 的 learned = Object.values(cards).length,不做对照,
// 孤儿卡片会让「已学 X/1350」的 X 超过总数(扩词时移除了 47 个既有词)。
test('pruneCards 清掉已下架词的卡片,保留在架词与 log', () => {
  const mem = memStorage();
  const s = createStore(mem);
  s.markStudied('inspect', '2026-09-04');
  s.markStudied('divide', '2026-09-04');      // 本次扩词中被否决、已移出交付集的词
  s.markStudied('spectator', '2026-09-05');
  const n = s.pruneCards(new Set(['inspect', 'spectator']));
  assert.equal(n, 1);
  const p = s.getProgress();
  assert.deepStrictEqual(Object.keys(p.cards).sort(), ['inspect', 'spectator']);
  // log 是历史流水,删词不该篡改「那天新学了几个」
  assert.equal(p.log['2026-09-04'].new, 2);
  assert.equal(s.pruneCards(new Set(['inspect', 'spectator'])), 0, '再清一次应为 0(幂等)');
  // 空集合 = 调用方出问题(交付集加载成空),宁可不清也不能清空全部进度
  assert.equal(s.pruneCards([]), 0, '空集合必须 no-op');
  assert.equal(s.pruneCards(undefined), 0, '无参必须 no-op');
  assert.deepStrictEqual(Object.keys(s.getProgress().cards).sort(), ['inspect', 'spectator']);
  // 数组入参同样可用
  assert.equal(s.pruneCards(['inspect']), 1);
});

// 进度现在在内存里缓存一份解析结果(复习时每点一次自评原本要 parse+stringify
// 整份进度)。缓存挂在 **storage 对象**上,所以同一个 storage 上开两个 store
// 实例也必须看到同一份内存态 —— 否则 A 写完 B 还在用旧缓存读,互相覆盖。
test('同一 storage 上的两个 store 实例共享内存态,不会丢写', () => {
  const mem = memStorage();
  const a = createStore(mem);
  const b = createStore(mem);
  a.markStudied('inspect', '2026-09-04');
  assert.ok(b.getProgress().cards.inspect, 'B 必须看到 A 刚写的卡片');
  b.markStudied('spectator', '2026-09-05');
  assert.equal(Object.keys(a.getProgress().cards).length, 2, 'A 必须看到 B 刚写的卡片');
  assert.equal(b.applyReview('inspect', 5, '2026-09-05').applied, true);
  assert.equal(a.getProgress().cards.inspect.srs.dueDate, '2026-09-11', 'A 看到的是复习后的到期日(SM-2 首个间隔 6 天)');
});

test('reset 会连缓存一起清,否则重置后仍读到旧进度', () => {
  const mem = memStorage();
  const s = createStore(mem);
  s.markStudied('inspect', '2026-09-04');
  s.reset();
  assert.deepStrictEqual(s.getProgress().cards, {});
  // 盘上也必须真的空了(缓存清了但没落盘的话,下次冷启动进度会自己长回来)
  assert.deepStrictEqual(createStore(mem).getProgress().cards, {});
});
