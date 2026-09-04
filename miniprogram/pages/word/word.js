const { getContent } = require('../../utils/content');
const { makeWxStore } = require('../../utils/store');
const { todayISO } = require('../../utils/date');
const reporter = require('../../utils/reporter');

const GROUP_KEYS = ['family', 'deriv', 'syn', 'ant', 'confuse', 'story'];

Page({
  data: {
    w: null,          // 当前词原始对象(供 WordStudyCard 直接消费)
    view: null,       // 当前词「展示副本」:联想等已拼好的就绪数组,避免 wxml 复杂计算
    familyIndex: 0,
    familyTotal: 0,
    isFirst: true,
    isLast: false,
    inPool: false,
    emptyFamily: false,
    groupOpen: {},
    popAffix: null,
    popWords: [],
  },

  onLoad(options) {
    const o = options || {};
    const c = getContent();
    const word = o.wordId ? c.byId(o.wordId) : null;
    let rootId = o.rootId || null;
    if (!rootId && word) {
      const rootSeg = (word.breakdown || []).find(b => b.type === 'root' && b.refId);
      rootId = rootSeg ? rootSeg.refId : null;
    }
    const family = rootId ? c.rootWords(rootId) : [];
    const store = makeWxStore();
    const expandAssoc = !!(store && store.getSettings().expandAssoc);

    this._c = c;
    this._store = store;
    this._family = family;
    this._rootId = rootId;

    const groupOpen = {};
    GROUP_KEYS.forEach(k => { groupOpen[k] = !!expandAssoc; });

    if (!family.length) {
      this.setData({
        w: null,
        view: null,
        familyIndex: 0,
        familyTotal: 0,
        isFirst: true,
        isLast: false,
        inPool: false,
        emptyFamily: true,
        groupOpen,
        popAffix: null,
        popWords: [],
      });
      return;
    }

    const start = Math.max(0, family.findIndex(x => x.id === o.wordId));
    this.setData({ groupOpen, popAffix: null, popWords: [] });
    this.showAt(start);
  },

  showAt(i) {
    const family = this._family;
    const c = this._c;
    if (!family || i < 0 || i >= family.length) return;
    const word = family[i];
    const prevId = this.data.w ? this.data.w.id : null;
    this._cur = i;
    const store = this._store;
    const cards = (store && store.getProgress().cards) || {};
    const familyTotal = family.length;
    const patch = {
      w: word,
      familyIndex: i,
      familyTotal,
      isFirst: i === 0,
      isLast: i === familyTotal - 1,
      inPool: Object.prototype.hasOwnProperty.call(cards, word.id),
      emptyFamily: false,
    };
    if (word.id !== prevId) {
      patch.view = this.buildView(word, family, c);
    }
    this.setData(patch);
  },

  // 词切换时才重拼联想展示字段;wxml 直接消费已就绪数组。
  buildView(word, family, c) {
    const assoc = word.assoc || {};
    const familyList = family
      .filter(x => x.id !== word.id)
      .map(x => ({ id: x.id, word: x.word }));
    const pick = ids => (ids || [])
      .map(id => c.byId(id))
      .filter(Boolean)
      .map(x => ({ id: x.id, word: x.word }));
    const confuseList = (assoc.confusing || []).map(item => {
      const w = c.byId(item.id);
      return { id: item.id, word: w ? w.word : item.id, diff: item.diff || '' };
    });
    const rootSeg = (word.breakdown || []).find(b => b.type === 'root' && b.refId);
    const root = rootSeg ? c.roots.find(r => r.id === rootSeg.refId) : null;
    const storyText = assoc.story || (root && root.story) || '';
    return {
      word: word.word,
      phonetic: word.phonetic || '',
      tags: word.tags || [],
      senses: (word.senses || []).map((s, i) => ({ ...s, _k: i })),
      familyList,
      derivList: pick(assoc.derivatives),
      synList: pick(assoc.synonyms),
      antList: pick(assoc.antonyms),
      confuseList,
      storyText,
      examples: (word.examples || []).slice(0, 2).map((x, i) => ({ ...x, _k: i })),
    };
  },

  // ===== 底部操作条 =====
  onMainAction() {
    if (this.data.inPool) this.doneReturn();
    else this.markLearned();
  },

  markLearned() {
    const store = this._store;
    const word = this.data.w;
    if (!store || !word) return;
    const cards = store.getProgress().cards;
    if (!Object.prototype.hasOwnProperty.call(cards, word.id)) {
      store.markStudied(word.id, todayISO());
      reporter.recordStudy(word.id); reporter.flush();
    }
    this.next();
  },

  doneReturn() {
    wx.navigateBack();
  },

  lookBack() {
    this.prev();
  },

  prev() {
    const i = this._cur;
    if (!i) return; // 首词禁用
    this.showAt(i - 1);
  },

  next() {
    const family = this._family;
    const i = this._cur;
    if (!family || !family.length) return;
    if (i + 1 < family.length) {
      this.showAt(i + 1);
    } else {
      wx.navigateBack();
      wx.showToast({ title: '本族已学完', icon: 'none' });
    }
  },

  // 同根词族 / 派生 / 同义 / 反义 chips → 跳到对应词页
  goWord(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({ url: '/pages/word/word?wordId=' + id });
  },

  // BreakdownBar tapbreak:root → 词根详情;prefix/suffix → 弹词缀层
  onBreak(e) {
    const d = e.detail || {};
    const ref = d.ref;
    if (!ref) return;
    if (d.type === 'root') {
      wx.navigateTo({ url: '/pages/root-detail/root-detail?rootId=' + ref });
      return;
    }
    const affix = this._c.affixes.find(a => a.id === ref);
    if (!affix) return;
    this.setData({
      popAffix: affix,
      popWords: this._c.affixWords(ref).slice(0, 8).map(w => w.word),
    });
  },

  onAffixClose() {
    this.setData({ popAffix: null, popWords: [] });
  },

  toggleGroup(e) {
    const k = e.currentTarget.dataset.k;
    if (!k || !(k in this.data.groupOpen)) return;
    this.setData({ groupOpen: { ...this.data.groupOpen, [k]: !this.data.groupOpen[k] } });
  },
});
