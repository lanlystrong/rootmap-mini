// miniprogram/utils/reporter.js — 学习/复习事件上报(离线持久化队列,不阻塞本地学习)
const api = require('./api');
const KEY_Q = 'rm_events_pending_v1';
const MAX_Q = 1000;
const Q_SET = { 1: true, 3: true, 5: true };

function hasWx() { return typeof wx !== 'undefined'; }
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function localAt() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
function readQ() { if (!hasWx()) return []; try { const raw = wx.getStorageSync(KEY_Q); return Array.isArray(raw) ? raw : []; } catch (e) { return []; } }
function saveQ(list) { if (!hasWx()) return; try { wx.setStorageSync(KEY_Q, list); } catch (e) { /* 满则静默丢,仅影响云端统计 */ } }

function record(type, wordId, q) {
  if (!hasWx() || !wordId) return;
  const ev = { type, wordId, at: localAt() };
  if (type === 'review' && Q_SET[q]) ev.q = q;
  const list = readQ();
  list.push(ev);
  if (list.length > MAX_Q) list.splice(0, list.length - MAX_Q);
  saveQ(list);
}

function flush() {
  if (!hasWx() || !api.isAuthed()) return Promise.resolve();
  const list = readQ();
  if (!list.length) return Promise.resolve();
  return api.postEvents(list)
    .then(() => { saveQ([]); })
    .catch(() => { /* offline/失败保留队列 */ });
}
module.exports = { recordStudy: (id) => record('study', id), recordReview: (id, q) => record('review', id, q), flush };
