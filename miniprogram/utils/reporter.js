// miniprogram/utils/reporter.js — 学习/复习事件上报(离线持久化队列,不阻塞本地学习)
const api = require('./api');
const KEY_Q = 'rm_events_pending_v1';
const MAX_Q = 1000;
// 单批上限。必须与 server/src/eventsRouter.js 的 MAX_BATCH 一致:
// 服务端超限会 slice(0, MAX_BATCH) 静默丢掉尾部,而我们这边是按「已确认发送的前缀」删队列的 ——
// 两端不一致时,被丢掉的那截事件会**既不入库也不留队**,永久消失。故客户端主动按此上限切块。
const MAX_BATCH = 200;
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

// 逐块发送,每块成功后**只移除它自己确认发掉的前缀**。
// 为什么必须分块:队列上限 MAX_Q(1000) 远大于单批上限,一次性发出会被服务端截断,
// 而「按客户端自己算的长度删前缀」会把没入库的那部分一起删掉 —— 静默丢数据。
async function sendChunks(list) {
  for (let i = 0; i < list.length; i += MAX_BATCH) {
    const chunk = list.slice(i, i + MAX_BATCH);
    const res = await api.postEvents(chunk); // postEvents 参数保持原始事件数组
    // 服务端回了 truncated = 它只吃下了前 accepted+ignored 条,尾部仍在服务端之外。
    // 这时只认它确认的部分,剩下的留在队里等下次 flush(宁可重发,不可丢失)。
    const done = (res && res.truncated) ? (res.accepted || 0) + (res.ignored || 0) : chunk.length;
    const cur = readQ();
    cur.splice(0, done); // 只删已确认的前缀,飞行中追加到队尾的新事件留待下次
    saveQ(cur);
    if (done < chunk.length) return; // 被截断:后面的块没发,别继续,交给下次 flush
  }
}

function flush() {
  if (!hasWx() || !api.isAuthed()) return Promise.resolve();
  if (inFlight) return inFlight.then(flush); // 飞行中:不并发第二次 POST,settle 后收尾补发
  const list = readQ().slice(); // 快照副本:飞行中 record 只在原队尾追加,不影响本批已发送前缀计数
  if (!list.length) return Promise.resolve();
  inFlight = sendChunks(list)
    .catch(() => { /* offline/失败保留整队,下次再试 */ })
    .finally(() => { inFlight = null; });
  return inFlight;
}
module.exports = { recordStudy: (id) => record('study', id), recordReview: (id, q) => record('review', id, q), flush };
