const test = require('node:test');
const assert = require('node:assert');
const { startServer, jfetch } = require('./helper');

// 注入假 code2session:code 'c<N>' → openid 'o_<N>';避免真实请求微信。
const fakeWx = (map) => ({ code2session: async (code) => {
  if (map && map[code] && map[code].err) { const e = new Error(map[code].err); e.errcode = map[code].errcode; throw e; }
  return { openid: map && map[code] ? map[code].openid : 'o_' + code };
} });

test('静默登录:新 openid 自动建号、复用老号、不同 openid 建新号、me 返回本人', async () => {
  const s = await startServer(fakeWx());
  try {
    const a = await jfetch(s.base, 'POST', '/api/auth/wechat', { body: { code: 'c1' } });
    assert.equal(a.status, 200);
    assert.ok(a.data.token);
    assert.equal(a.data.user.openid, 'o_c1');

    // 同一 openid 再登录 → 复用同一用户(id 不变),签发新 token
    const b = await jfetch(s.base, 'POST', '/api/auth/wechat', { body: { code: 'c1' } });
    assert.equal(b.data.user.id, a.data.user.id);
    assert.notEqual(b.data.token, a.data.token);

    // 不同 code → 不同 openid → 新用户
    const c = await jfetch(s.base, 'POST', '/api/auth/wechat', { body: { code: 'c2' } });
    assert.equal(c.data.user.openid, 'o_c2');
    assert.notEqual(c.data.user.id, a.data.user.id);

    const me = await jfetch(s.base, 'GET', '/api/auth/me', { auth: a.data.token });
    assert.equal(me.status, 200);
    assert.equal(me.data.user.openid, 'o_c1');
  } finally { await s.close(); }
});

test('缺 code 400;code2session 失败 401 wx_login_failed;未带 token 401', async () => {
  const s = await startServer(fakeWx({ bad: { err: 'invalid code', errcode: 40029 } }));
  try {
    const noCode = await jfetch(s.base, 'POST', '/api/auth/wechat', { body: {} });
    assert.equal(noCode.status, 400);
    assert.equal(noCode.data.error.code, 'bad_request');

    const bad = await jfetch(s.base, 'POST', '/api/auth/wechat', { body: { code: 'bad' } });
    assert.equal(bad.status, 401);
    assert.equal(bad.data.error.code, 'wx_login_failed');

    const none = await jfetch(s.base, 'GET', '/api/auth/me');
    assert.equal(none.status, 401);
    assert.equal(none.data.error.code, 'unauthorized');
  } finally { await s.close(); }
});

test('登出后原 token 失效', async () => {
  const s = await startServer(fakeWx());
  try {
    const a = await jfetch(s.base, 'POST', '/api/auth/wechat', { body: { code: 'c1' } });
    const out = await jfetch(s.base, 'POST', '/api/auth/logout', { auth: a.data.token });
    assert.equal(out.status, 204);
    const me = await jfetch(s.base, 'GET', '/api/auth/me', { auth: a.data.token });
    assert.equal(me.status, 401);
  } finally { await s.close(); }
});

test('个人资料:保存昵称/头像并回读;非法头像 400;未登录 401', async () => {
  const s = await startServer(fakeWx());
  try {
    const a = await jfetch(s.base, 'POST', '/api/auth/wechat', { body: { code: 'c1' } });

    // 保存昵称(去空格)
    const nick = await jfetch(s.base, 'PUT', '/api/auth/profile', { auth: a.data.token, body: { nickname: '  小明  ' } });
    assert.equal(nick.status, 200);
    assert.equal(nick.data.user.nickname, '小明');

    // 保存头像(data URL)
    const avatar = 'data:image/png;base64,iVBORw0KGgo=';
    const av = await jfetch(s.base, 'PUT', '/api/auth/profile', { auth: a.data.token, body: { avatar } });
    assert.equal(av.status, 200);
    assert.equal(av.data.user.avatarUrl, avatar);

    // me 回读
    const me = await jfetch(s.base, 'GET', '/api/auth/me', { auth: a.data.token });
    assert.equal(me.data.user.nickname, '小明');
    assert.equal(me.data.user.avatarUrl, avatar);

    // 非法头像
    const bad = await jfetch(s.base, 'PUT', '/api/auth/profile', { auth: a.data.token, body: { avatar: 'not-a-data-url' } });
    assert.equal(bad.status, 400);
    assert.equal(bad.data.error.code, 'invalid_avatar');

    // 未登录
    const none = await jfetch(s.base, 'PUT', '/api/auth/profile', { body: { nickname: 'x' } });
    assert.equal(none.status, 401);
  } finally { await s.close(); }
});
