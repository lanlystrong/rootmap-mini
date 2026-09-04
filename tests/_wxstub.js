// tests/_wxstub.js — 假 wx:内存 storage + wx.request(直接回调,无真实网络)
function installWx({ respond } = {}) {
  const store = {};
  global.wx = {
    getStorageSync: (k) => store[k],
    setStorageSync: (k, v) => { store[k] = v; },
    removeStorageSync: (k) => { delete store[k]; },
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
