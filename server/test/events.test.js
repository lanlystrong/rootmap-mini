const test = require('node:test');
const assert = require('node:assert');
const { startServer, jfetch } = require('./helper');

// 假 code2session:code → openid 'o_'+code,避免真实请求微信。
const fakeWx = { code2session: async (code) => ({ openid: 'o_' + code }) };
const loginAs = async (base, code) => jfetch(base, 'POST', '/api/auth/wechat', { body: { code } });

test('事件入库:合法批 accepted=n、含未知词 ignored;review 带 q 落库', async () => {
  const s = await startServer(fakeWx);
  try {
    const r = await loginAs(s.base, 'eve');
    const body = { events: [
      { type: 'study', wordId: 'spectator', at: '2026-09-04T13:00:00' },
      { type: 'review', wordId: 'spectator', q: 3 },
      { type: 'review', wordId: 'notaword', q: 5 },       // 未知词 → ignored
    ]};
    const res = await jfetch(s.base, 'POST', '/api/events', { auth: r.data.token, body });
    assert.equal(res.status, 200);
    assert.equal(res.data.accepted, 2); assert.equal(res.data.ignored, 1);
  } finally { await s.close(); }
});

test('事件校验:无 token 401;非法 type/q 缺失/study 带 q/at 格式错 → 400', async () => {
  const s = await startServer(fakeWx);
  try {
    const r = await loginAs(s.base, 'fay');
    const bad = (events) => jfetch(s.base, 'POST', '/api/events', { auth: r.data.token, body: { events } });
    assert.equal((await bad([{ type: 'bogus', wordId: 'spectator' }])).status, 400);
    assert.equal((await bad([{ type: 'review', wordId: 'spectator' }])).status, 400);           // q 缺失
    assert.equal((await bad([{ type: 'study', wordId: 'spectator', q: 5 }])).status, 400);      // study 带 q
    assert.equal((await bad([{ type: 'review', wordId: 'spectator', q: 2 }])).status, 400);     // q ∉{1,3,5}
    assert.equal((await bad([{ type: 'study', wordId: 'spectator', at: 'not-a-date' }])).status, 400);
    const none = await jfetch(s.base, 'POST', '/api/events', { body: { events: [] } });
    assert.equal(none.status, 401);
  } finally { await s.close(); }
});

test('单批超 200 截断:truncated:true 且 accepted≤200', async () => {
  const s = await startServer(fakeWx);
  try {
    const r = await loginAs(s.base, 'gal');
    const events = Array.from({ length: 250 }, (_, i) => ({ type: 'study', wordId: 'spectator' }));
    const res = await jfetch(s.base, 'POST', '/api/events', { auth: r.data.token, body: { events } });
    assert.equal(res.status, 200); assert.equal(res.data.accepted, 200); assert.equal(res.data.truncated, true);
  } finally { await s.close(); }
});

test('at 严格日历校验(不可滚转)+ wordId 必填;纯日期 at 仍接受', async () => {
  const s = await startServer(fakeWx);
  try {
    const r = await loginAs(s.base, 'zoe');
    const post = (events) => jfetch(s.base, 'POST', '/api/events', { auth: r.data.token, body: { events } });
    // 非法日历日期:2/30、4/31、非闰年 2/29、T24:00:00 → 均 400(不可 Date 滚转后被接受)
    for (const at of ['2026-02-30', '2026-04-31', '2026-02-29', '2026-09-04T24:00:00']) {
      assert.equal((await post([{ type: 'study', wordId: 'spectator', at }])).status, 400, `at=${at}`);
    }
    // wordId 缺失/空 → 400
    assert.equal((await post([{ type: 'study' }])).status, 400);
    assert.equal((await post([{ type: 'review', wordId: '' }])).status, 400);
    // 合法纯日期格式 at 仍被接受
    const ok = await post([{ type: 'study', wordId: 'spectator', at: '2026-09-04' }]);
    assert.equal(ok.status, 200); assert.equal(ok.data.accepted, 1); assert.equal(ok.data.ignored, 0);
  } finally { await s.close(); }
});
