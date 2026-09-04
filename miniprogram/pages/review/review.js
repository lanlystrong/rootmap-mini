const { getContent } = require('../../utils/content');
const { makeWxStore } = require('../../utils/store');
const { todayISO } = require('../../utils/date');

// 复习会话状态机: idle → reviewing → done
// 复习进度/自评只走 store.applyReview(SM-2 变体封装在 utils/srs),本页不实现算法。
Page({
  data: {
    phase: 'idle',   // 'idle' | 'reviewing' | 'done'
    dueTotal: 0,     // 今天到期总张数(未扣上限)
    cap: 0,          // 每日复习上限,0 = 不限
    queue: [],       // 本次会话卡片 wordId 队列(按 dueDate 升序)
    i: 0,            // 当前队列下标
    shown: false,    // 是否已翻面(自评按钮只在翻面后出现)
    cur: null,       // 当前词「展示副本」(computeView 拼好,直接喂 ReviewCard)
    done: null,      // 完成态汇总 { total, dueLeft }
  },

  onLoad() {
    this._store = makeWxStore();
    this._c = getContent();
  },

  // Tab 每次进入:idle 态都重算当天到期(可能学新词后第二天才到期)
  onShow() {
    if (this.data.phase === 'idle') this.loadDue();
  },

  loadDue() {
    const store = this._store;
    if (!store) return;
    const cap = store.getSettings().reviewCapPerDay || 0;
    const due = store.dueWords(todayISO());
    const queue = cap > 0 ? due.slice(0, cap) : due;
    this.setData({
      phase: 'idle',
      dueTotal: due.length,
      cap,
      queue,
      i: 0,
      shown: false,
      cur: null,
      done: null,
    });
    if (queue.length) this.setCur(0); // 非空时预拼第一张;为空走空态
  },

  // 预拼第 i 张的展示对象:词/音标 + 全部释义 + 根(拼写/义)+ 首条例句 + tags
  setCur(i) {
    const queue = this.data.queue;
    if (i < 0 || i >= queue.length) {
      this.setData({ cur: null });
      return;
    }
    const c = this._c;
    const w = c.byId(queue[i]);
    if (!w) {
      this.setData({ cur: null });
      return;
    }
    const rootSeg = (w.breakdown || []).find(b => b.type === 'root' && b.refId);
    const root = rootSeg ? c.roots.find(r => r.id === rootSeg.refId) : null;
    const ex = (w.examples && w.examples[0]) || null;
    this.setData({
      cur: {
        word: w.word,
        phonetic: w.phonetic || '',
        senses: (w.senses || []).map((s, idx) => ({ pos: s.pos, zh: s.zh, en: s.en, _k: idx })),
        rootName: root ? root.root : '',
        rootZh: root ? root.zh : '',
        firstExample: ex ? { en: ex.en, zh: ex.zh } : null,
        tags: w.tags || [],
      },
    });
  },

  start() {
    if (!this.data.queue.length) return;
    this.setData({ phase: 'reviewing', i: 0, shown: false });
    this.setCur(0);
  },

  flip() {
    this.setData({ shown: true });
  },

  grade(e) {
    if (this.data.phase !== 'reviewing') return;
    const q = Number(e.currentTarget.dataset.q); // 1 忘了 / 3 模糊 / 5 记得
    const store = this._store;
    const queue = this.data.queue;
    const today = todayISO();
    const id = queue[this.data.i];
    if (store && id) store.applyReview(id, q, today);
    const ni = this.data.i + 1;
    if (ni >= queue.length) {
      // 已到期的词可能因本轮自评被重新推后 → 完成汇总按最新 dueWords 为准
      const dueLeft = store ? store.dueWords(today).length : 0;
      this.setData({ phase: 'done', done: { total: queue.length, dueLeft } });
    } else {
      this.setData({ i: ni, shown: false });
      this.setCur(ni);
    }
  },

  finish() {
    this.setData({ phase: 'idle' });
    this.loadDue();
  },

  // 空态 CTA:复习是 Tab 页,回首页必须 switchTab
  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },
});
