const test = require('node:test');
const assert = require('node:assert');
const { installWx, clearWx } = require('./_wxstub');
const api = require('../miniprogram/utils/api');

test('login 成功存 token/user;isAuthed 真', async () => {
  installWx({ respond: () => ({ statusCode: 200, data: { token: 'tok123', user: { id: 1, username: 'alice_01' } } }) });
  try {
    const user = await api.login('alice_01', 'secret123');
    assert.equal(user.username, 'alice_01');
    assert.ok(api.isAuthed());
  } finally { clearWx(); }
});
test('401 自动清登录态并 reject {code:unauthorized}', async () => {
  installWx({ respond: () => ({ statusCode: 401, data: { error: { code: 'unauthorized', message: '未登录' } } }) });
  try {
    await assert.rejects(() => api.me(), (e) => e.code === 'unauthorized');
    assert.equal(api.isAuthed(), false);
  } finally { clearWx(); }
});
test('overview 成功解析服务端形状', async () => {
  installWx({ respond: () => ({ statusCode: 200, data: { totalStudied: 2, reviewEvents: 3, gradeDist: { q1: 1, q3: 0, q5: 2 }, lapses: 1, accuracy: 0.6666666666, studyEvents: 2 } }) });
  try {
    const o = await api.overview();
    assert.equal(o.totalStudied, 2);
  } finally { clearWx(); }
});
