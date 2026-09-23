// miniprogram/utils/api.js — 词根地图服务端 HTTP 客户端(本机联调)
const KEY_TOKEN = 'rm_token_v1';
const KEY_USER = 'rm_user_v1';
const BASE = 'http://127.0.0.1:3000'; // 本机服务端地址,改这里或按环境注入

function hasWx() { return typeof wx !== 'undefined'; }
function getToken() { return hasWx() ? (wx.getStorageSync(KEY_TOKEN) || '') : ''; }
function isAuthed() { return !!getToken(); }
function getSession() { return hasWx() ? { token: getToken(), user: wx.getStorageSync(KEY_USER) || null } : { token: '', user: null }; }
function setSession(token, user) { if (!hasWx()) return; wx.setStorageSync(KEY_TOKEN, token); wx.setStorageSync(KEY_USER, user); }
function clearSession() { if (!hasWx()) return; wx.removeStorageSync(KEY_TOKEN); wx.removeStorageSync(KEY_USER); }

function request(method, path, { auth = false, body } = {}) {
  return new Promise((resolve, reject) => {
    if (!hasWx()) return reject({ offline: true });
    const header = { 'content-type': 'application/json' };
    if (auth) { const t = getToken(); if (t) header.authorization = 'Bearer ' + t; }
    wx.request({
      url: BASE + path, method, data: body, header,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve(res.data);
        if (res.statusCode === 401) clearSession();
        const code = (res.data && res.data.error && res.data.error.code) || ('http_' + res.statusCode);
        reject({ code, status: res.statusCode, message: res.data && res.data.error && res.data.error.message });
      },
      fail() { reject({ offline: true }); },
    });
  });
}

// 微信静默登录:wx.login 拿 code → 服务端 code2session 换 openid → 下发 token/用户。
function wxLogin() {
  return new Promise((resolve, reject) => {
    if (!hasWx() || !wx.login) return reject({ offline: true });
    wx.login({
      success(res) {
        if (!res.code) return reject({ code: 'wx_login_failed', message: '未取到登录 code' });
        request('POST', '/api/auth/wechat', { body: { code: res.code } })
          .then((d) => { setSession(d.token, d.user); resolve(d.user); })
          .catch(reject);
      },
      fail() { reject({ offline: true }); },
    });
  });
}

async function logout() {
  if (!isAuthed()) return;
  try { await request('POST', '/api/auth/logout', { auth: true }); } catch (e) { /* 服务端不可达也清本地 */ }
  clearSession();
}
const me = () => request('GET', '/api/auth/me', { auth: true }).then((d) => d.user);
const saveProfile = (patch) => request('PUT', '/api/auth/profile', { auth: true, body: patch }).then((d) => d.user);
const postEvents = (events) => request('POST', '/api/events', { auth: true, body: { events } });
const overview = () => request('GET', '/api/stats/overview', { auth: true });
const daily = (days = 14) => request('GET', '/api/stats/daily?days=' + days, { auth: true });
const roots = (days = 30, limit = 15) => request('GET', '/api/stats/roots?days=' + days + '&limit=' + limit, { auth: true });

// ===== 内容下发(无需鉴权)=====
// 内容元数据:含 checksum/version/counts,用于增量判断是否需要重新拉全量。
const contentMeta = () => request('GET', '/api/content/meta').then((d) => (d && d.meta) || d);
// 拉取全量内容(词根/词缀/单词),三者并行;返回 { roots, affixes, words }
// 与服务端同源 data/index,结构完全一致,可直接喂给 content.buildIndex。
const fetchContent = () => Promise.all([
  request('GET', '/api/content/roots'),
  request('GET', '/api/content/affixes'),
  request('GET', '/api/content/words'),
]).then(([roots, affixes, words]) => ({ roots, affixes, words }));

module.exports = { BASE, isAuthed, getSession, setSession, clearSession, wxLogin, logout, me, saveProfile, postEvents, overview, daily, roots, contentMeta, fetchContent };
