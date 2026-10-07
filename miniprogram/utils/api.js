// miniprogram/utils/api.js — 词根地图服务端 HTTP 客户端
const KEY_TOKEN = 'rm_token_v1';
const KEY_USER = 'rm_user_v1';
const { BASE_URL } = require('../config');
const BASE = BASE_URL;

function hasWx() { return typeof wx !== 'undefined'; }
function getToken() { return hasWx() ? (wx.getStorageSync(KEY_TOKEN) || '') : ''; }
function isAuthed() { return !!getToken(); }
function getSession() { return hasWx() ? { token: getToken(), user: wx.getStorageSync(KEY_USER) || null } : { token: '', user: null }; }
function setSession(token, user) { if (!hasWx()) return; wx.setStorageSync(KEY_TOKEN, token); wx.setStorageSync(KEY_USER, user); }
function clearSession() { if (!hasWx()) return; wx.removeStorageSync(KEY_TOKEN); wx.removeStorageSync(KEY_USER); }

// 微信的 wx.request 默认要等 60s 才放弃。弱网下用户点「重试」之后对着空白页
// 干等一分钟,体验上跟卡死没区别。15s 足够覆盖正常请求,超时会被归到「拿不到服务端」。
const DEFAULT_TIMEOUT = 15000;

function request(method, path, { auth = false, body, timeout = DEFAULT_TIMEOUT } = {}) {
  return new Promise((resolve, reject) => {
    if (!hasWx()) return reject({ offline: true });
    const header = { 'content-type': 'application/json' };
    let hadToken = false;
    if (auth) { const t = getToken(); if (t) { header.authorization = 'Bearer ' + t; hadToken = true; } }
    wx.request({
      url: BASE + path, method, data: body, header, timeout,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve(res.data);
        // 401 且请求**带着** token = 会话过期(服务端认不出这个 token)。
        // 只带 token 的请求才是「过期」:wxLogin 自己的 401 是 code2session 失败,
        // 那种情况本地本来就没有 token,不该被当成需要重新登录。
        // 之前这里无条件清登录态然后 reject,页面只知道「云端统计加载失败」——
        // 用户看到的是一个错字,而不是「登录过期了,点这重登」。
        const expired = res.statusCode === 401 && hadToken;
        if (expired) clearSession();
        const code = (res.data && res.data.error && res.data.error.code) || ('http_' + res.statusCode);
        reject({
          code, expired, status: res.statusCode,
          message: res.data && res.data.error && res.data.error.message,
        });
      },
      fail(err) {
        // 超时和断网都归到「拿不到服务端」,但分开报:提示语不一样,
        // 而且 content.js 会据此给不同的错误文案。
        const msg = (err && err.errMsg) || '';
        if (msg.indexOf('timeout') >= 0) {
          return reject({ code: 'timeout', message: '请求超时,请检查网络后重试' });
        }
        reject({ offline: true });
      },
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
