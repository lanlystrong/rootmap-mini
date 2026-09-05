const srs = require('./srs');
const { isDue } = require('./date');
const KEY_P = 'rm_progress_v1';
const KEY_S = 'rm_settings_v1';
const DEFAULT_SETTINGS = { reviewCapPerDay: 0, expandAssoc: false };

function defaults() { return { version: 1, cards: {}, log: {} }; }

function bumpLog(log, iso, field, n) {
  log[iso] = log[iso] || { new: 0, reviews: 0, lapses: 0 };
  log[iso][field] += n;
  return log[iso];
}

function createStore(storage) {
  function read() {
    try { const raw = storage.get(KEY_P); if (!raw) return defaults(); const p = JSON.parse(raw); return p && p.version === 1 ? p : defaults(); }
    catch (e) { return defaults(); }
  }
  function persist(p) { try { storage.set(KEY_P, JSON.stringify(p)); } catch (e) { /* 静默降级内存态 */ } }

  function getProgress() { return read(); }
  function markStudied(wordId, iso) {
    const p = read();
    if (p.cards[wordId]) return p;                       // 幂等
    p.cards[wordId] = { srs: srs.initialStudyState(iso), lapses: 0, studiedAt: iso };
    bumpLog(p.log, iso, 'new', 1);
    persist(p); return p;
  }
  function applyReview(wordId, q, iso) {
    const p = read();
    const c = p.cards[wordId];
    if (!c) return { progress: p, applied: false };
    c.srs = srs.review(c.srs, q, iso);
    c.lastReviewAt = iso;
    bumpLog(p.log, iso, 'reviews', 1);
    if (q === srs.Q_FORGOT) { c.lapses += 1; bumpLog(p.log, iso, 'lapses', 1); }
    persist(p); return { progress: p, applied: true };
  }
  function dueWords(iso) {
    const p = read();
    return Object.entries(p.cards)
      .filter(([, c]) => isDue(c.srs.dueDate, iso))
      .sort(([, a], [, b]) => (a.srs.dueDate < b.srs.dueDate ? -1 : a.srs.dueDate > b.srs.dueDate ? 1 : a.srs.intervalDays - b.srs.intervalDays))
      .map(([id]) => id);
  }
  function reset() { try { storage.set(KEY_P, JSON.stringify(defaults())); } catch (e) {} }
  function getSettings() {
    try { const raw = storage.get(KEY_S); if (raw) { const s = JSON.parse(raw); return { ...DEFAULT_SETTINGS, ...s }; } } catch (e) {}
    return { ...DEFAULT_SETTINGS };
  }
  function saveSettings(patch) { const cur = getSettings(); try { storage.set(KEY_S, JSON.stringify({ ...cur, ...patch })); } catch (e) {} }

  return { getProgress, markStudied, applyReview, dueWords, reset, getSettings, saveSettings };
}

let warnedWriteFail = false; // 仅提示一次的存储写失败标记(模块级)

function makeWxStore() {
  if (typeof wx === 'undefined') return null;
  const set = (k, v) => {
    try {
      wx.setStorageSync(k, v);
    } catch (e) {
      if (!warnedWriteFail && wx.showToast) {
        warnedWriteFail = true;
        wx.showToast({ title: '保存失败，请检查存储空间', icon: 'none' });
      }
    }
  };
  return createStore({ get: k => wx.getStorageSync(k), set });
}

module.exports = { createStore, makeWxStore };
