const test = require('node:test');
const assert = require('node:assert');
const { startServer, jfetch } = require('./helper');

// 假 code2session:code → openid 'o_'+code,避免真实请求微信。
const fakeWx = { code2session: async (code) => ({ openid: 'o_' + code }) };
const loginAs = async (base, code) => jfetch(base, 'POST', '/api/auth/wechat', { body: { code } });

const pad = (n) => (n < 10 ? '0' + n : '' + n);
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const yesterday = () => { const t = new Date(); t.setDate(t.getDate() - 1); return iso(t); };

test('overview:totalStudied 去重/gradeDist/accuracy;跨用户隔离', async () => {
  const s = await startServer(fakeWx);
  try {
    const r = await loginAs(s.base, 'han');
    await jfetch(s.base, 'POST', '/api/events', { auth: r.data.token, body: { events: [
      { type: 'study', wordId: 'spectator' }, { type: 'study', wordId: 'inspect' },
      { type: 'review', wordId: 'spectator', q: 1 }, { type: 'review', wordId: 'spectator', q: 5 }, { type: 'review', wordId: 'spectator', q: 5 },
    ] } });
    const o = await jfetch(s.base, 'GET', '/api/stats/overview', { auth: r.data.token });
    assert.equal(o.status, 200);
    assert.equal(o.data.totalStudied, 2);
    assert.equal(o.data.reviewEvents, 3);
    assert.deepEqual(o.data.gradeDist, { q1: 1, q3: 0, q5: 2 });
    assert.equal(o.data.lapses, 1);
    assert.ok(Math.abs(o.data.accuracy - (1 - 1 / 3)) < 1e-9);
    const r2 = await loginAs(s.base, 'ivo');
    const o2 = await jfetch(s.base, 'GET', '/api/stats/overview', { auth: r2.data.token });
    assert.equal(o2.data.totalStudied, 0); assert.equal(o2.data.reviewEvents, 0);
  } finally { await s.close(); }
});

test('daily:14 天升序、今天在末、昨天在倒数第二、缺日补 0;roots 聚合', async () => {
  const s = await startServer(fakeWx);
  try {
    const r = await loginAs(s.base, 'jay');
    const y = yesterday();
    await jfetch(s.base, 'POST', '/api/events', { auth: r.data.token, body: { events: [
      { type: 'study', wordId: 'spectator', at: y },
      { type: 'review', wordId: 'spectator', q: 3, at: y },
    ] } });
    const d = await jfetch(s.base, 'GET', '/api/stats/daily?days=14', { auth: r.data.token });
    assert.equal(d.status, 200); assert.equal(d.data.length, 14);
    assert.equal(d.data[13].date, iso(new Date()));            // 今天在末
    assert.equal(d.data[13].new, 0); assert.equal(d.data[13].reviews, 0);
    assert.equal(d.data[12].date, y);                          // 昨天 = 倒数第二
    assert.equal(d.data[12].new, 1); assert.equal(d.data[12].reviews, 1);
    const rt = await jfetch(s.base, 'GET', '/api/stats/roots', { auth: r.data.token });
    assert.equal(rt.status, 200); assert.ok(Array.isArray(rt.data));
    const row = rt.data.find((x) => x.rootId === 'root-spect' || x.studied === 1);
    assert.ok(row && row.reviews === 1 && row.studied === 1);
  } finally { await s.close(); }
});

test('入参:days 非数/超界 400;空库全 0 不崩', async () => {
  const s = await startServer(fakeWx);
  try {
    const r = await loginAs(s.base, 'kai');
    const o = await jfetch(s.base, 'GET', '/api/stats/overview', { auth: r.data.token });
    assert.equal(o.data.totalStudied, 0); assert.equal(o.data.accuracy, 0);
    assert.equal((await jfetch(s.base, 'GET', '/api/stats/daily?days=abc', { auth: r.data.token })).status, 400);
    assert.equal((await jfetch(s.base, 'GET', '/api/stats/daily?days=999', { auth: r.data.token })).status, 400);
    assert.equal((await jfetch(s.base, 'GET', '/api/stats/roots?limit=999', { auth: r.data.token })).status, 400);
  } finally { await s.close(); }
});
