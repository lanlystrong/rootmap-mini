const { test, afterEach } = require('node:test');
const assert = require('node:assert');
const { installWx, clearWx } = require('./_wxstub');
const api = require('../miniprogram/utils/api');
const reporter = require('../miniprogram/utils/reporter');

// reporter 的 saveQ/readQ 直接存/取原始数组(真实 wx storage 保留类型),故断言直接读数组而非 JSON.parse。
// 测试改写 api.postEvents 后需还原,否则影响同文件后续用例。
const originalPostEvents = api.postEvents;
afterEach(() => { api.postEvents = originalPostEvents; });

test('recordStudy 不带 q、recordReview 带 q 且持久化入队', () => {
  const store = installWx();
  try {
    reporter.recordStudy('spectator');
    reporter.recordReview('spectator', 3);
    const q = store['rm_events_pending_v1'];
    assert.ok(Array.isArray(q), 'pending queue persisted as raw array');
    assert.equal(q.length, 2);
    assert.equal(q[0].type, 'study'); assert.ok(!('q' in q[0]));
    assert.equal(q[1].type, 'review'); assert.equal(q[1].q, 3);
    assert.match(q[0].at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  } finally { clearWx(); }
});
test('未登录 flush 不动队;登录成功 flush 清队', async () => {
  const store = installWx();
  try {
    reporter.recordStudy('spectator');
    await reporter.flush();                                   // 未登录:队列保留
    assert.equal(store['rm_events_pending_v1'].length, 1);
    api.setSession('tok', { id: 1, username: 'u' });          // 手动登录态
    let postedArg;
    api.postEvents = async (arg) => { postedArg = arg; return { accepted: 1, ignored: 0 }; };
    await reporter.flush();
    assert.equal(store['rm_events_pending_v1'].length, 0);
    assert.ok(Array.isArray(postedArg), 'postEvents 收到原始事件数组(未二次包装)');
    assert.equal(postedArg.length, 1);
    assert.equal(postedArg[0].type, 'study');
  } finally { clearWx(); }
});
test('发送失败保留队列待下次;队列超 1000 丢最旧', () => {
  const store = installWx({ respond: () => ({ statusCode: 500, data: { error: { code: 'internal' } } }) });
  api.setSession('tok', { id: 1, username: 'u' });
  reporter.recordStudy('spectator');
  // flush 异步拒 → 用微任务等待
  return reporter.flush().catch(() => {}).then(() => {
    assert.equal(store['rm_events_pending_v1'].length, 1); // 保留
  }).finally(() => clearWx());
});
