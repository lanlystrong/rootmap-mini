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
test('OVERLAP:飞行中 flush 串行合并——不重发且尾部不丢', async () => {
  const store = installWx();
  try {
    api.setSession('tok', { id: 1, username: 'u' });
    const calls = [];
    const resolvers = [];
    api.postEvents = (arg) => { calls.push(arg); return new Promise((res) => resolvers.push(res)); };
    reporter.recordStudy('a');
    const f1 = reporter.flush();               // 发送 ['a'] 在飞
    reporter.recordStudy('b');                 // 飞行中追加到队尾
    const f2 = reporter.flush();               // 飞行中再 flush → 合并,不得第二个 POST 并发
    assert.equal(calls.length, 1, '飞行期间不得发起第二个 POST');
    resolvers[0]({ accepted: 1, ignored: 0 }); // 首个发送成功
    await f1;
    // 首个成功后只清掉已发送前缀 ['a'],飞行中追加的 ['b'] 由 follow-up 补发
    assert.equal(calls.length, 2, 'settle 后 follow-up flush 再发一次收尾');
    assert.equal(calls[0].length, 1); assert.equal(calls[0][0].wordId, 'a');
    assert.equal(calls[1].length, 1); assert.equal(calls[1][0].wordId, 'b');
    assert.equal(store['rm_events_pending_v1'].length, 1, '飞行中追加的 b 应保留在队');
    resolvers[1]({ accepted: 1, ignored: 0 }); // follow-up 发送成功
    await f2;
    assert.equal(store['rm_events_pending_v1'].length, 0, '全部发送后队列清空');
  } finally { clearWx(); }
});
test('OVERFLOW:队列超 1000 丢最旧,保留 w1..w1000 FIFO 有序', () => {
  const store = installWx();
  try {
    for (let i = 0; i <= 1000; i++) reporter.recordStudy('w' + i); // 1001 条,无 session 仅入队
    const q = store['rm_events_pending_v1'];
    assert.equal(q.length, 1000, '队列封顶 1000');
    assert.equal(q[0].wordId, 'w1', '最旧 w0 已被丢');
    assert.equal(q[999].wordId, 'w1000', '最新 w1000 保留,FIFO 有序');
  } finally { clearWx(); }
});
test('CHUNK:队列 450 条分 3 批(200/200/50)发出,不触发服务端截断且队列清空', async () => {
  const store = installWx();
  try {
    api.setSession('tok', { id: 1, username: 'u' });
    const calls = [];
    api.postEvents = async (arg) => { calls.push(arg); return { accepted: arg.length, ignored: 0 }; };
    for (let i = 0; i < 450; i++) reporter.recordStudy('w' + i);
    assert.equal(store['rm_events_pending_v1'].length, 450);
    await reporter.flush();
    assert.equal(calls.length, 3, '450 条应切成 3 批,而不是一次发 450 触发服务端截断');
    assert.deepEqual(calls.map(c => c.length), [200, 200, 50]);
    assert.ok(calls.every(c => c.length <= 200), '单批不得超过服务端 MAX_BATCH,否则尾部会被静默丢弃');
    // 顺序不能乱:三批拼起来必须正好是原队列
    assert.deepEqual(calls.flat().map(e => e.wordId), Array.from({ length: 450 }, (_, i) => 'w' + i));
    assert.equal(store['rm_events_pending_v1'].length, 0, '全部确认入库后队列清空');
  } finally { clearWx(); }
});
test('TRUNCATED:服务端只收下前 N 条时,只移除 N 条,余下留在队列待下次', async () => {
  const store = installWx();
  try {
    api.setSession('tok', { id: 1, username: 'u' });
    // 假装服务端上限被下调到 100(200 条一批会被截断)
    let call = 0;
    api.postEvents = async (arg) => {
      call++;
      const n = Math.min(100, arg.length);
      return { accepted: n, ignored: 0, truncated: arg.length > n };
    };
    for (let i = 0; i < 450; i++) reporter.recordStudy('w' + i);
    await reporter.flush();
    assert.equal(call, 1, '首批被截断后应停止继续发后续批次(否则会按错位的前缀删队列)');
    const left = store['rm_events_pending_v1'];
    assert.equal(left.length, 350, '只应移除服务端确认的 100 条,其余 350 条必须留在队列');
    assert.equal(left[0].wordId, 'w100', '留下的必须是从未送达处接续的,不能重复发已入库的');
  } finally { clearWx(); }
});
