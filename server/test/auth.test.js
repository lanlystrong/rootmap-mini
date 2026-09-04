const test = require('node:test');
const assert = require('node:assert');
const { startServer, jfetch } = require('./helper');

test('注册即登录;重复用户名 409;me 返回本人', async () => {
  const s = await startServer();
  try {
    const ok = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'alice_01', password: 'secret123' } });
    assert.equal(ok.status, 201);
    assert.ok(ok.data.token && ok.data.user.username === 'alice_01');
    const dup = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'alice_01', password: 'other456' } });
    assert.equal(dup.status, 409); assert.equal(dup.data.error.code, 'username_taken');
    const me = await jfetch(s.base, 'GET', '/api/auth/me', { auth: ok.data.token });
    assert.equal(me.status, 200); assert.equal(me.data.user.username, 'alice_01');
  } finally { await s.close(); }
});

test('登录校验:正确通过、错误 401 bad_credentials、未带 token 401 unauthorized', async () => {
  const s = await startServer();
  try {
    await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'bob', password: 'secret123' } });
    const bad = await jfetch(s.base, 'POST', '/api/auth/login', { body: { username: 'bob', password: 'wrong' } });
    assert.equal(bad.status, 401); assert.equal(bad.data.error.code, 'bad_credentials');
    const ok = await jfetch(s.base, 'POST', '/api/auth/login', { body: { username: 'bob', password: 'secret123' } });
    assert.equal(ok.status, 200);
    const none = await jfetch(s.base, 'GET', '/api/auth/me');
    assert.equal(none.status, 401); assert.equal(none.data.error.code, 'unauthorized');
  } finally { await s.close(); }
});

test('登出后原 token 失效;非法入参 400', async () => {
  const s = await startServer();
  try {
    const r = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'carol', password: 'secret123' } });
    const out = await jfetch(s.base, 'POST', '/api/auth/logout', { auth: r.data.token });
    assert.equal(out.status, 204);
    const me = await jfetch(s.base, 'GET', '/api/auth/me', { auth: r.data.token });
    assert.equal(me.status, 401);
    const short = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'x', password: 'secret123' } });
    assert.equal(short.status, 400);
    const badpw = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'ok_name', password: '123' } });
    assert.equal(badpw.status, 400);
  } finally { await s.close(); }
});
