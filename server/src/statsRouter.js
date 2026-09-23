// server/src/statsRouter.js
const express = require('express');
const { todayISO } = require('./time');

function clampInt(v, dflt, min, max, name) {
  if (v == null || v === '') return dflt;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) return { err: `${name} 须为 ${min}..${max} 的整数` };
  return n;
}

// 正确率口径:1 - 忘了(q1) / 三档总数;无 review 记 0。
function acc(g) { const t = g.q1 + g.q3 + g.q5; return t ? 1 - g.q1 / t : 0; }

function padt(n) { return n < 10 ? '0' + n : '' + n; }
function dISO(d) { return `${d.getFullYear()}-${padt(d.getMonth() + 1)}-${padt(d.getDate())}`; }

function statsRouter(db, content) {
  const r = express.Router();

  // 学习概览
  r.get('/overview', async (req, res) => {
    try {
      const uid = req.user.userId;
      const distinct = await db.get(
        "SELECT COUNT(DISTINCT word_id) n FROM events WHERE user_id=? AND type='study'", [uid]
      );
      const rows = await db.all(
        'SELECT type, q, COUNT(*) n FROM events WHERE user_id=? GROUP BY type, q', [uid]
      );
      const gradeDist = { q1: 0, q3: 0, q5: 0 };
      let studyEvents = 0, reviewEvents = 0;
      for (const row of rows) {
        if (row.type === 'study') studyEvents += row.n;
        else { reviewEvents += row.n; if (row.q) gradeDist['q' + row.q] = row.n; }
      }
      res.json({
        totalStudied: distinct.n,
        studyEvents,
        reviewEvents,
        gradeDist,
        lapses: gradeDist.q1,
        accuracy: acc(gradeDist)
      });
    } catch (err) {
      console.error('Get overview error:', err);
      res.status(500).json({ error: { code: 'get_overview_failed', message: 'Failed to get overview stats' } });
    }
  });

  // 每日统计(升序、今天在末、缺日补 0)
  r.get('/daily', async (req, res) => {
    try {
      const days = clampInt(req.query.days, 14, 1, 90, 'days');
      if (days.err) return res.status(400).json({ error: { code: 'bad_request', message: days.err } });

      const uid = req.user.userId;
      const today = todayISO();
      const start = new Date(today); start.setDate(start.getDate() - (days - 1));
      const sISO = dISO(start);

      const rows = await db.all(
        `SELECT substr(at,1,10) d, type, q, COUNT(*) n FROM events
         WHERE user_id=? AND substr(at,1,10)>=? GROUP BY substr(at,1,10), type, q`,
        [uid, sISO]
      );
      const map = new Map();
      for (const row of rows) {
        let e = map.get(row.d);
        if (!e) { e = { date: row.d, new: 0, reviews: 0, lapses: 0 }; map.set(row.d, e); }
        if (row.type === 'study') e.new = row.n;
        else { e.reviews += row.n; if (row.q === 1) e.lapses = row.n; }
      }
      const out = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(sISO); d.setDate(d.getDate() + i);
        const dI = dISO(d);
        out.push(map.get(dI) || { date: dI, new: 0, reviews: 0, lapses: 0 });
      }
      res.json(out);
    } catch (err) {
      console.error('Get daily stats error:', err);
      res.status(500).json({ error: { code: 'get_daily_failed', message: 'Failed to get daily stats' } });
    }
  });

  // 词根正确率榜(按 reviews 降序;wordId→rootId 用内存词典映射)
  r.get('/roots', async (req, res) => {
    try {
      const days = clampInt(req.query.days, 30, 1, 90, 'days');
      const limit = clampInt(req.query.limit, 15, 1, 30, 'limit');
      if (days.err) return res.status(400).json({ error: { code: 'bad_request', message: days.err } });
      if (limit.err) return res.status(400).json({ error: { code: 'bad_request', message: limit.err } });

      const uid = req.user.userId;
      const today = todayISO();
      const start = new Date(today); start.setDate(start.getDate() - (days - 1));
      const sISO = dISO(start);

      const rows = await db.all(
        `SELECT word_id, type, q FROM events WHERE user_id=? AND substr(at,1,10)>=?`, [uid, sISO]
      );

      const rootById = new Map(content.roots.map((x) => [x.id, x]));
      const agg = new Map();
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
        rootId: a.rootId,
        root: a.root,
        zh: a.zh,
        studied: a.studied.size,
        reviews: a.reviews,
        gradeDist: { q1: a.q1, q3: a.q3, q5: a.q5 },
        accuracy: acc({ q1: a.q1, q3: a.q3, q5: a.q5 })
      })).sort((a, b) => b.reviews - a.reviews).slice(0, limit);

      res.json(out);
    } catch (err) {
      console.error('Get roots stats error:', err);
      res.status(500).json({ error: { code: 'get_roots_failed', message: 'Failed to get roots stats' } });
    }
  });

  return r;
}

module.exports = { statsRouter };
