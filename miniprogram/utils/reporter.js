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

let inFlight = null; // 在途 POST;飞行中再 flush 合并为 settle 后再跑一次

function flush() {
  if (!hasWx() || !api.isAuthed()) return Promise.resolve();
  if (inFlight) return inFlight.then(flush); // 飞行中:不并发第二次 POST,settle 后收尾补发
  const list = readQ().slice(); // 快照副本:飞行中 record 只在原队尾追加,不影响本批已发送前缀计数
  if (!list.length) return Promise.resolve();
  inFlight = api.postEvents(list) // postEvents 参数保持原始事件数组
    .then(() => {
      // 只移除本批已发送的前缀,保留飞行中追加到队尾的新事件(留待下次 flush)
      const cur = readQ();
      cur.splice(0, list.length);
      saveQ(cur);
    })
    .catch(() => { /* offline/失败保留整队,下次再试 */ })
    .finally(() => { inFlight = null; });
  return inFlight;
}
module.exports = { recordStudy: (id) => record('study', id), recordReview: (id, q) => record('review', id, q), flush };
