const { getContent, ensureContent, isLoaded, attachTo, retry } = require('../../utils/content');
const { makeWxStore } = require('../../utils/store');
const { todayISO } = require('../../utils/date');
const reporter = require('../../utils/reporter');

const GROUP_KEYS = ['family', 'deriv', 'syn', 'ant', 'confuse', 'story'];

Page({
  data: {
    navTitle: '词根地图',
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
    // 词库加载态,由 content.attachTo 统一维护
    contentState: 'idle',
    contentErr: '',
    contentReady: false,
  },

  onLoad(options) {
    this._opts = options || {};
    // 必须始终订阅加载态:attachTo 负责把 contentReady 同步成 true。
    // 原先只在「内容未就绪」时才订阅,于是预加载完成后进入本页时 contentReady
    // 永远为 false,正文被 wx:if 挡住 → 整页空白(与 root-detail 同款缺陷)。
    // 就绪回调直接重渲染(不递归 onLoad),避免重复订阅。
    if (!isLoaded()) ensureContent();
    attachTo(this, function () { this.render(); });
  },

  onRetryContent() {
    retry();
  },

  // 从 this._opts 渲染当前词。onLoad 拆分出来是为了让 attachTo 的回调能安全重入。
  render() {
    const o = this._opts;
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
      navTitle: word.word,
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
      if (this._rootId) store.saveSettings({ lastRootId: this._rootId }); // 供首页「继续学习」定位上次学到的词根
      wx.vibrateShort && wx.vibrateShort({ type: 'light', fail: () => {} });
      reporter.recordStudy(word.id); reporter.flush();
    }
    this.next();
  },

  doneReturn() {
    wx.navigateBack();
  },

  // 跳过:翻到下一个词,但**不**记为已学。
  // 之前底部只有「再看看 / 记住了」,想「先翻翻看」也被迫把每个词标记成学会了 ——
  // 逛一个 47 词的大家族(root-stan)就能把进度刷满,那这个进度也就没意义了。
  skip() {
    this.next(true);
  },

  lookBack() {
    this.prev();
  },

  prev() {
    const i = this._cur;
    if (!i) return; // 首词禁用
    this.showAt(i - 1);
  },

  next(skipped) {
    const family = this._family;
    const i = this._cur;
    if (!family || !family.length) return;
    if (i + 1 < family.length) {
      this.showAt(i + 1);
    } else {
      wx.navigateBack();
      // 跳着看完最后一个词不等于学完,文案要说实话
      wx.showToast({ title: skipped ? '已到本族末尾' : '本族已学完', icon: 'none' });
    }
  },

  // 同根词族 / 派生 / 同义 / 反义 chips → 跳到对应词页
  goWord(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    const url = '/pages/word/word?wordId=' + id;
    // 已在词页时用 redirectTo 替换,避免点联想词无限 navigateTo 压栈(10 层上限崩溃)。
    const pages = getCurrentPages();
    const cur = pages[pages.length - 1];
    if (cur && cur.route === 'pages/word/word') wx.redirectTo({ url });
    else wx.navigateTo({ url });
  },

  onShareAppMessage() {
    const w = this.data.w;
    return {
      title: w ? `词根联想学「${w.word}」` : '词根地图 · 词根构词学单词',
      path: w ? `/pages/word/word?wordId=${w.id}` : '/pages/index/index',
    };
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
