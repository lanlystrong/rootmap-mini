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

  // 清掉交付集里已不存在的词的卡片(返回被清掉的条数)。
  // 为什么需要:卡片按 wordId 索引,而 computeStats 的 learned 直接数卡片条数
  // (`Object.values(cards).length`),没有对照交付集 —— 单词一旦从数据集里被移除,
  // 它的卡片就成了孤儿,「已学」会超过「总数」。familyProgressOf 有 has() 守卫,
  // computeStats 没有,所以必须在入口处清理,而不是指望各处都记得守卫。
  // log 不清:它是「某天学了多少」的历史流水,删词不改变历史。
  //
  // 空集合视为「调用方出了问题」而不是「全都不在架」—— 交付集若因故加载成空,
  // 空集若照常执行就会**静默清空全部学习进度**。宁可不清,也不能清错。
  function pruneCards(validIds) {
    const ok = validIds instanceof Set ? validIds : new Set(validIds || []);
    if (!ok.size) return 0;
    const p = read();
    let n = 0;
    for (const id of Object.keys(p.cards)) {
      if (!ok.has(id)) { delete p.cards[id]; n++; }
    }
    if (n) persist(p);
    return n;
  }
  function getSettings() {
    try { const raw = storage.get(KEY_S); if (raw) { const s = JSON.parse(raw); return { ...DEFAULT_SETTINGS, ...s }; } } catch (e) {}
    return { ...DEFAULT_SETTINGS };
  }
  function saveSettings(patch) { const cur = getSettings(); try { storage.set(KEY_S, JSON.stringify({ ...cur, ...patch })); } catch (e) {} }

  return { getProgress, markStudied, applyReview, dueWords, pruneCards, reset, getSettings, saveSettings };
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
