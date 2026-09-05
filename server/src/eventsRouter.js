// server/src/eventsRouter.js
const express = require('express');
const { nowAt } = require('./time');
const MAX_BATCH = 200;
const Q_SET = new Set([1, 3, 5]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const AT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

function validAt(at) {
  if (at == null) return { ok: true, value: nowAt() };
  if (typeof at !== 'string') return { ok: false };
  const isDT = AT_RE.test(at);
  if (!DATE_RE.test(at) && !isDT) return { ok: false };
  const t = isDT ? at : at + 'T00:00:00';
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/.exec(t);
  const d = new Date(t);
  if (!m || Number.isNaN(d.getTime())) return { ok: false };
  const ok = d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3]
    && d.getHours() === +m[4] && d.getMinutes() === +m[5] && d.getSeconds() === +m[6];
  if (!ok) return { ok: false };
  return { ok: true, value: at };
}

function validateEvents(events, wordSet) {
  const items = [];
  for (const e of events) {
    if (!e || typeof e.wordId !== 'string' || e.wordId.length === 0) return { error: 'wordId 缺失或非法' };
    const type = e.type;
    if (type === 'study') {
      if (e.q != null) return { error: 'study 不得携带 q' };
      if (!wordSet.has(e.wordId)) { items.push({ ignore: true }); continue; }
      const a = validAt(e.at); if (!a.ok) return { error: 'at 格式非法' };
      items.push({ ignore: false, row: { type, word_id: e.wordId, q: null, at: a.value } });
    } else if (type === 'review') {
      if (!Q_SET.has(e.q)) return { error: 'review 的 q 须为 1/3/5' };
      if (!wordSet.has(e.wordId)) { items.push({ ignore: true }); continue; }
      const a = validAt(e.at); if (!a.ok) return { error: 'at 格式非法' };
      items.push({ ignore: false, row: { type, word_id: e.wordId, q: e.q, at: a.value } });
    } else {
      return { error: 'type 须为 study|review' };
    }
  }
  return { ok: true, items };
}

function eventsRouter(db, content) {
  const r = express.Router();
  r.post('/', async (req, res) => {
    const raw = (req.body && Array.isArray(req.body.events)) ? req.body.events : null;
    if (!raw) return res.status(400).json({ error: { code: 'bad_request', message: 'body 需 {events:[…]}' } });
    let events = raw; let truncated = false;
    if (events.length > MAX_BATCH) { events = events.slice(0, MAX_BATCH); truncated = true; }
    const v = validateEvents(events, content.wordSet);
    if (v.error) return res.status(400).json({ error: { code: 'bad_request', message: v.error } });
    const rows = v.items.filter((it) => !it.ignore);
    if (rows.length) {
      // 单条多值 INSERT:单语句原子落库,替代 SQLite 的显式 BEGIN/COMMIT。
      const sql = 'INSERT INTO events(user_id,type,word_id,q,at) VALUES ' + rows.map(() => '(?,?,?,?,?)').join(',');
      const params = [];
      rows.forEach((it) => params.push(req.user.id, it.row.type, it.row.word_id, it.row.q, it.row.at));
      await db.run(sql, params);
    }
    const out = { accepted: rows.length, ignored: v.items.length - rows.length };
    if (truncated) out.truncated = true;
    res.json(out);
  });
  return r;
}
module.exports = { eventsRouter, validateEvents, MAX_BATCH };
