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

// storage 对象 → 解析后的进度对象。
// progress 是**整份学习进度**(1450 张卡片量级),原来每调一次 read() 就 JSON.parse 一次、
// 每写一次就 stringify 一次:复习时每点一次自评 = 一次全量 parse + 一次全量 stringify,
// 中低端机上点得发涩。缓存一份解析结果,写盘时顺手把缓存指到同一个对象。
//
// 挂在 **storage 对象**上而不是闭包变量上:同一个 storage 上开两个 store 实例
// (页面各自 makeWxStore 那种)也必须看到同一份内存态,否则 A 写完 B 还在用旧缓存读,
// 「读-改-写」会互相覆盖。WeakMap 保证 storage 没了缓存也跟着回收。
const CACHES = new WeakMap();

function createStore(storage) {
  function read() {
    const hit = CACHES.get(storage);
    if (hit) return hit;
    let p = defaults();
    try {
      const raw = storage.get(KEY_P);
      if (raw) { const parsed = JSON.parse(raw); if (parsed && parsed.version === 1) p = parsed; }
    } catch (e) { /* 坏 JSON:当空进度,不阻断 */ }
    CACHES.set(storage, p);
    return p;
  }
  function persist(p) {
    CACHES.set(storage, p);
    try { storage.set(KEY_P, JSON.stringify(p)); } catch (e) { /* 静默降级内存态 */ }
  }

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
  function reset() { CACHES.delete(storage); try { storage.set(KEY_P, JSON.stringify(defaults())); } catch (e) {} }

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
let wxStore = null;           // 全局只建一个 store 实例

// 全局单例:原来每次调用都新建一个 store,于是每个页面各有一份 JSON 解析缓存
// (对不上,还会互相把对方的修改覆盖掉 —— 谁后写谁赢)。单例之后既共享内存态,
// 也保证「读-改-写」不会被另一个页面的读刷新打断。
function makeWxStore() {
  if (typeof wx === 'undefined') return null;
  if (wxStore) return wxStore;
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
  wxStore = createStore({ get: k => wx.getStorageSync(k), set });
  return wxStore;
}

module.exports = { createStore, makeWxStore };
