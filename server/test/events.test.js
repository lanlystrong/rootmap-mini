const test = require('node:test');
const assert = require('node:assert');
const { startServer, jfetch } = require('./helper');

test('事件入库:合法批 accepted=n、含未知词 ignored;review 带 q 落库', async () => {
  const s = await startServer();
  try {
    const r = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'eve', password: 'secret123' } });
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
  const s = await startServer();
  try {
    const r = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'fay', password: 'secret123' } });
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
  const s = await startServer();
  try {
    const r = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'gal', password: 'secret123' } });
    const events = Array.from({ length: 250 }, (_, i) => ({ type: 'study', wordId: 'spectator' }));
    const res = await jfetch(s.base, 'POST', '/api/events', { auth: r.data.token, body: { events } });
    assert.equal(res.status, 200); assert.equal(res.data.accepted, 200); assert.equal(res.data.truncated, true);
  } finally { await s.close(); }
});
