// server/src/eventsRouter.js
const express = require('express');
const { nowAt } = require('./time');

const MAX_BATCH = 200;
const Q_SET = new Set([1, 3, 5]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const AT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

// 严格日历校验:非法日期(2/30、4/31、非闰年 2/29、T24:00:00)必须拒绝,不得被 Date 滚转接受。
function validAt(at) {
  if (at == null) return { ok: true, value: nowAt() };
  if (typeof at !== 'string') return { ok: false };
  if (!DATE_RE.test(at) && !AT_RE.test(at)) return { ok: false };

  const m = at.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2}))?$/);
  const y = Number(m[1]), mo = Number(m[2]), da = Number(m[3]);
  const hh = Number(m[4] || 0), mm = Number(m[5] || 0), ss = Number(m[6] || 0);
  if (mo < 1 || mo > 12 || da < 1 || da > 31) return { ok: false };
  if (hh > 23 || mm > 59 || ss > 59) return { ok: false };

  const d = new Date(y, mo - 1, da, hh, mm, ss);
  if (d.getFullYear() !== y || d.getMonth() !== mo - 1 || d.getDate() !== da) return { ok: false };
  return { ok: true, value: at };
}

// 逐条校验;未知词 ignored(不报错),非法字段整体 400。
function validateEvents(events, wordSet) {
  const items = [];
  for (const e of events) {
    const type = e && e.type;
    if (type !== 'study' && type !== 'review') return { error: 'type 须为 study|review' };
    if (e.wordId == null || e.wordId === '') return { error: 'wordId 必填' };
    if (type === 'study' && e.q != null) return { error: 'study 不得携带 q' };
    if (type === 'review' && !Q_SET.has(e.q)) return { error: 'review 的 q 须为 1/3/5' };
    const a = validAt(e.at);
    if (!a.ok) return { error: 'at 格式非法' };
    if (!wordSet.has(e.wordId)) { items.push({ ignore: true }); continue; }
    items.push({ ignore: false, row: { type, word_id: e.wordId, q: type === 'review' ? e.q : null, at: a.value } });
  }
  return { ok: true, items };
}

function eventsRouter(db, content) {
  const r = express.Router();

  // 批量上报学习事件(受鉴权)
  r.post('/', async (req, res) => {
    try {
      const raw = (req.body && Array.isArray(req.body.events)) ? req.body.events : null;
      if (!raw) return res.status(400).json({ error: { code: 'bad_request', message: 'body 需 {events:[…]}' } });

      let events = raw, truncated = false;
      if (events.length > MAX_BATCH) { events = events.slice(0, MAX_BATCH); truncated = true; }

      const v = validateEvents(events, content.wordSet);
      if (v.error) return res.status(400).json({ error: { code: 'bad_request', message: v.error } });

      let accepted = 0;
      for (const it of v.items) {
        if (it.ignore) continue;
        await db.run(
          'INSERT INTO events (user_id, type, word_id, q, at) VALUES (?,?,?,?,?)',
          [req.user.userId, it.row.type, it.row.word_id, it.row.q, it.row.at]
        );
        accepted++;
      }

      const out = { accepted, ignored: v.items.length - accepted };
      if (truncated) out.truncated = true;
      res.json(out);
    } catch (err) {
      console.error('Events batch error:', err);
      res.status(500).json({ error: { code: 'events_batch_failed', message: 'Failed to process events' } });
    }
  });

  return r;
}

module.exports = { eventsRouter, validateEvents, MAX_BATCH };
