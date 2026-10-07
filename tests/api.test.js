const test = require('node:test');
const assert = require('node:assert');
const { installWx, clearWx } = require('./_wxstub');
const api = require('../miniprogram/utils/api');

test('wxLogin 成功:wx.login 拿 code → 服务端换 openid → 存 token/user', async () => {
  let captured;
  installWx({
    respond: (opt) => { captured = opt; return { statusCode: 200, data: { token: 'tok123', user: { id: 1, openid: 'openid_a' } } }; },
  });
  try {
    const user = await api.wxLogin();
    assert.equal(user.openid, 'openid_a');
    assert.ok(api.isAuthed());
    assert.equal(captured.url, api.BASE + '/api/auth/wechat');
    assert.equal(captured.method, 'POST');
    assert.deepStrictEqual(captured.data, { code: 'mock_code' });
  } finally { clearWx(); }
});

test('wxLogin 失败:服务端拒绝 → reject 且不落登录态', async () => {
  installWx({ respond: () => ({ statusCode: 401, data: { error: { code: 'wx_login_failed', message: 'x' } } }) });
  try {
    await assert.rejects(() => api.wxLogin(), (e) => e.code === 'wx_login_failed');
    assert.equal(api.isAuthed(), false);
  } finally { clearWx(); }
});

test('401 自动清登录态并 reject {code:unauthorized}', async () => {
  const store = installWx({ respond: () => ({ statusCode: 401, data: { error: { code: 'unauthorized', message: '未登录' } } }) });
  try {
    api.setSession('tok', { id: 1, openid: 'openid_a' });   // 先建立登录态
    assert.equal(api.isAuthed(), true);
    await assert.rejects(() => api.me(), (e) => e.code === 'unauthorized');
    assert.equal(api.isAuthed(), false);                      // 401 → 登录态被清
    assert.ok(!store['rm_token_v1']);                         // token 已移除
    assert.ok(!store['rm_user_v1']);                          // user 已移除
  } finally { clearWx(); }
});

// 带 token 的 401 = 会话过期,页面要能据此显示「重新登录」而不是笼统的加载失败
test('带 token 的 401 标记 expired:true', async () => {
  installWx({ respond: () => ({ statusCode: 401, data: { error: { code: 'unauthorized' } } }) });
  try {
    api.setSession('tok', { id: 1 });
    await assert.rejects(() => api.me(), (e) => e.expired === true);
  } finally { clearWx(); }
});

// 反过来:wxLogin 自己的 401 是 code2session 失败,本地本来就没 token,
// 那种 401 不是「过期」,不该把用户引去重新登录(会变成死循环)
test('未带 token 的 401(code2session 失败)不算 expired', async () => {
  installWx({ respond: () => ({ statusCode: 401, data: { error: { code: 'wx_login_failed' } } }) });
  try {
    await assert.rejects(() => api.wxLogin(), (e) => e.code === 'wx_login_failed' && e.expired === false);
  } finally { clearWx(); }
});

test('postEvents 载荷约定:body.events 为数组(不二次包装)', async () => {
  let captured;
  installWx({ respond: (opt) => { captured = opt.data; return { statusCode: 200, data: { accepted: 1, ignored: 0 } }; } });
  try {
    const payload = [{ type: 'study', wordId: 'spectator' }];
    await api.postEvents(payload);
    assert.ok(Array.isArray(captured.events), 'req body events is an array');
    assert.deepStrictEqual(captured.events, payload);
  } finally { clearWx(); }
});

test('overview 成功解析服务端形状', async () => {
  installWx({ respond: () => ({ statusCode: 200, data: { totalStudied: 2, reviewEvents: 3, gradeDist: { q1: 1, q3: 0, q5: 2 }, lapses: 1, accuracy: 0.6666666666, studyEvents: 2 } }) });
  try {
    const o = await api.overview();
    assert.equal(o.totalStudied, 2);
  } finally { clearWx(); }
});
