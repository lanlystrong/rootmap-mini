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

async function _sessionCall(path, body) {
  const d = await request('POST', path, { body });
  setSession(d.token, d.user);
  return d.user;
}
const login = (username, password) => _sessionCall('/api/auth/login', { username, password });
const register = (username, password) => _sessionCall('/api/auth/register', { username, password });
async function logout() {
  if (!isAuthed()) return;
  try { await request('POST', '/api/auth/logout', { auth: true }); } catch (e) { /* 服务端不可达也清本地 */ }
  clearSession();
}
const me = () => request('GET', '/api/auth/me', { auth: true }).then((d) => d.user);
const postEvents = (events) => request('POST', '/api/events', { auth: true, body: { events } });
const overview = () => request('GET', '/api/stats/overview', { auth: true });
const daily = (days = 14) => request('GET', '/api/stats/daily?days=' + days, { auth: true });
const roots = (days = 30, limit = 15) => request('GET', '/api/stats/roots?days=' + days + '&limit=' + limit, { auth: true });

module.exports = { BASE, isAuthed, getSession, setSession, clearSession, login, register, logout, me, postEvents, overview, daily, roots };
