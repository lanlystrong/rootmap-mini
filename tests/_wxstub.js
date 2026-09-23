// tests/_wxstub.js — 假 wx:内存 storage + wx.request(直接回调,无真实网络)+ wx.login
function installWx({ respond, loginCode } = {}) {
  const store = {};
  global.wx = {
    getStorageSync: (k) => store[k],
    setStorageSync: (k, v) => { store[k] = v; },
    removeStorageSync: (k) => { delete store[k]; },
    login(opt) {
      setTimeout(() => { opt.success({ code: loginCode || 'mock_code' }); }, 0);
    },
    request(opt) {
      const r = typeof respond === 'function' ? respond(opt) : respond;
      setTimeout(() => {
        opt.success({ statusCode: r.statusCode, data: r.data, header: {} });
      }, 0);
    },
  };
  return store;
}
function clearWx() { delete global.wx; }
module.exports = { installWx, clearWx };
