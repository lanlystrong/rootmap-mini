// server/src/statsRouter.js
const express = require('express');
const { todayISO } = require('./time');

function clampInt(v, dflt, min, max, name) {
  if (v == null || v === '') return dflt;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) return { err: `${name} 须为 ${min}..${max} 的整数` };
  return n;
}
function acc(g) { const t = g.q1 + g.q3 + g.q5; return t ? 1 - g.q1 / t : 0; }
function padt(n) { return n < 10 ? '0' + n : '' + n; }
function dISO(d) { return `${d.getFullYear()}-${padt(d.getMonth() + 1)}-${padt(d.getDate())}`; }

function statsRouter(db, content) {
  const r = express.Router();

  r.get('/overview', (req, res) => {
    const distinct = db.prepare("SELECT COUNT(DISTINCT word_id) n FROM events WHERE user_id=? AND type='study'").get(req.user.id);
    const rows = db.prepare(
      "SELECT type, q, COUNT(*) n FROM events WHERE user_id=? GROUP BY type, q"
    ).all(req.user.id);
    const gradeDist = { q1: 0, q3: 0, q5: 0 };
    let studyEvents = 0, reviewEvents = 0;
    for (const row of rows) {
      if (row.type === 'study') studyEvents = row.n;
      else { reviewEvents += row.n; if (row.q) gradeDist['q' + row.q] = row.n; }
    }
    res.json({ totalStudied: distinct.n, studyEvents, reviewEvents, gradeDist, lapses: gradeDist.q1, accuracy: acc(gradeDist) });
  });

  r.get('/daily', (req, res) => {
    const days = clampInt(req.query.days, 14, 1, 90, 'days');
    if (days.err) return res.status(400).json({ error: { code: 'bad_request', message: days.err } });
    const today = todayISO();
    const start = new Date(today); start.setDate(start.getDate() - (days - 1));
    const sISO = dISO(start);
    const rows = db.prepare(
      `SELECT substr(at,1,10) d, type, q, COUNT(*) n FROM events
       WHERE user_id=? AND substr(at,1,10)>=? GROUP BY substr(at,1,10), type, q`
    ).all(req.user.id, sISO);
    const map = new Map();
    for (const row of rows) {
      let e = map.get(row.d);
      if (!e) { e = { date: row.d, new: 0, reviews: 0, lapses: 0 }; map.set(row.d, e); }
      if (row.type === 'study') e.new = row.n;
      else { e.reviews += row.n; if (row.q === 1) e.lapses += row.n; }
    }
    const out = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(sISO); d.setDate(d.getDate() + i);
      const dI = dISO(d);
      out.push(map.get(dI) || { date: dI, new: 0, reviews: 0, lapses: 0 });
    }
    res.json(out);
  });

  r.get('/roots', (req, res) => {
    const days = clampInt(req.query.days, 30, 1, 90, 'days');
    const limit = clampInt(req.query.limit, 15, 1, 30, 'limit');
    if (days.err) return res.status(400).json({ error: { code: 'bad_request', message: days.err } });
    if (limit.err) return res.status(400).json({ error: { code: 'bad_request', message: limit.err } });
    const today = todayISO();
    const start = new Date(today); start.setDate(start.getDate() - (days - 1));
    const sISO = dISO(start);
    const rows = db.prepare(
      `SELECT word_id, type, q FROM events WHERE user_id=? AND substr(at,1,10)>=?`
    ).all(req.user.id, sISO);
    const agg = new Map();
    const rootById = new Map(content.roots.map((x) => [x.id, x]));
    for (const row of rows) {
      const rootId = content.wordRootMap.get(row.word_id);
      if (!rootId) continue;
      let a = agg.get(rootId);
      if (!a) {
        a = { rootId, root: '', zh: '', studied: new Set(), reviews: 0, q1: 0, q3: 0, q5: 0 };
        agg.set(rootId, a);
        const r0 = rootById.get(rootId);
        if (r0) { a.root = r0.root; a.zh = r0.zh; }
      }
      if (row.type === 'study') a.studied.add(row.word_id);
      else { a.reviews++; a['q' + row.q]++; }
    }
    const out = [...agg.values()].map((a) => ({
      rootId: a.rootId, root: a.root, zh: a.zh, studied: a.studied.size, reviews: a.reviews,
      gradeDist: { q1: a.q1, q3: a.q3, q5: a.q5 }, accuracy: acc({ q1: a.q1, q3: a.q3, q5: a.q5 }),
    })).sort((a, b) => b.reviews - a.reviews).slice(0, limit);
    res.json(out);
  });
  return r;
}
module.exports = { statsRouter };
