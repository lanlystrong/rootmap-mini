const { getContent, ensureContent, isLoaded, attachTo, retry } = require('../../utils/content');
const { familyProgressOf } = require('../../utils/stats');
const { makeWxStore } = require('../../utils/store');

// 词根进度三分:未学 / 学习中 / 已掌握。
function statusOf(r) {
  if (r.learned === 0) return 'new';
  if (r.total > 0 && r.learned >= r.total) return 'done';
  return 'learning';
}

Page({
  data: {
    mode: 'root',
    filter: 'all',        // all | new | learning | done(仅词根视图)
    expanded: false,      // 全局展开/收起
    rootGroups: [],       // [{ key,label,learned,total,collapsed,items:[root] }]
    affixSections: [],    // [{ type,label,groups:[{ key,label,collapsed,items:[affix] }] }]
    kw: '',
    searching: false,
    rootHits: [],
    wordHits: [],
    // 词库加载态,由 content.attachTo 统一维护
    contentState: 'idle',
    contentErr: '',
    contentReady: false,
  },

  onLoad() {
    attachTo(this, function () { this.onShow(); });
  },

  onRetryContent() {
    retry();
  },

  onShow() {
    if (!isLoaded()) {
      ensureContent();
      return;
    }
    // 第一次进来才重置视图状态。之前每次 onShow 都 reset,于是「点进词根详情 →
    // 学完返回」会把用户展开的分组、选中的筛选、输入到一半的搜索词全抹掉 ——
    // 内容其实一个字没变,却要重新展开一遍。
    if (!this._booted) {
      this._booted = true;
      this.refresh(true);
      return;
    }
    this.refresh(false);
  },

  onUnload() {
    if (this._searchTimer) { clearTimeout(this._searchTimer); this._searchTimer = null; }
  },

  refresh(resetView) {
    const c = getContent();
    const store = makeWxStore();
    const cards = (store && store.getProgress().cards) || {};
    this._c = c;
    this._cards = cards;

    // 词根:分组 + 每根进度 + 组级进度聚合。
    this._rootGroups = c.groupedRoots().map(g => {
      const items = g.items.map(r => ({ ...r, ...familyProgressOf(c.rootWords(r.id), cards) }));
      const learned = items.reduce((s, r) => s + r.learned, 0);
      const total = items.reduce((s, r) => s + r.total, 0);
      return { key: g.key, label: g.label, items, learned, total };
    });

    // 前后缀:type 拆两大区块,组内每词缀附关联词(前 8)。
    this._affixSections = c.affixSections().map(sec => ({
      ...sec,
      groups: sec.groups.map(g => ({
        key: g.key,
        label: g.label,
        items: g.items.map(a => ({ ...a, words: c.affixWords(a.id).slice(0, 8) })),
      })),
    }));

    // 折叠态:首次进入用默认值(词根首组展开、其余收起;前后缀全收起);
    // 之后进入保留用户上次的手动折叠/展开。
    const prev = this._collapsed || { root: {}, affix: {} };
    this._collapsed = { root: { ...prev.root }, affix: { ...prev.affix } };
    if (resetView) {
      this._rootGroups.forEach((g, i) => { this._collapsed.root[g.key] = i !== 0; });
      this._affixSections.forEach(sec => sec.groups.forEach(g => { this._collapsed.affix[g.key] = true; }));
      this.setData({ filter: 'all', expanded: false, searching: false, kw: '', rootHits: [], wordHits: [] });
    } else {
      // 内容变了的话,正在搜的关键词要按新内容重算一遍命中,否则命中列表是旧的。
      if (this.data.kw) this.runSearch(this.data.kw);
    }
    this.render();
  },

  // 依据 filter/expanded/_collapsed 计算渲染数据(纯函数式,无副作用)。
  render() {
    const filter = this.data.filter;
    const expanded = this.data.expanded;

    const rootGroups = this._rootGroups
      .map(g => {
        const items = filter === 'all' ? g.items : g.items.filter(r => statusOf(r) === filter);
        if (!items.length) return null;
        const learned = items.reduce((s, r) => s + r.learned, 0);
        const total = items.reduce((s, r) => s + r.total, 0);
        const collapsed = expanded ? false : this._collapsed.root[g.key];
        return { key: g.key, label: g.label, items, learned, total, collapsed };
      })
      .filter(Boolean);

    const affixSections = this._affixSections.map(sec => ({
      ...sec,
      groups: sec.groups.map(g => ({
        key: g.key,
        label: g.label,
        items: g.items,
        collapsed: expanded ? false : this._collapsed.affix[g.key],
      })),
    }));

    this.setData({ rootGroups, affixSections });
  },

  switchMode(e) {
    this.setData({
      mode: e.currentTarget.dataset.mode,
      searching: false,
      kw: '',
      rootHits: [],
      wordHits: [],
    });
  },

  setFilter(e) {
    const f = e.currentTarget.dataset.f;
    // 非「全部」时自动展开,保证筛选结果可见;「全部」回到折叠态。
    this.setData({ filter: f, expanded: f !== 'all' });
    this.render();
  },

  toggleExpandAll() {
    const expanded = !this.data.expanded;
    if (!expanded) {
      // 收起:重置为默认折叠态(词根首组展开)。
      this._rootGroups.forEach((g, i) => { this._collapsed.root[g.key] = i !== 0; });
      this._affixSections.forEach(sec => sec.groups.forEach(g => { this._collapsed.affix[g.key] = true; }));
    }
    this.setData({ expanded });
    this.render();
  },

  toggleRootGroup(e) {
    const key = e.currentTarget.dataset.key;
    this._collapsed.root[key] = !this._collapsed.root[key];
    this.render();
  },

  toggleAffixGroup(e) {
    const key = e.currentTarget.dataset.key;
    this._collapsed.affix[key] = !this._collapsed.affix[key];
    this.render();
  },

  // 搜索:每敲一个字符都要扫 1450 词 + 223 词根,还要把整棵命中结果 setData 回去。
  // 中文输入法组字期间会连着触发好几次 input(拼音串越来越长),不防抖就是十几轮
  // 全表扫描叠加,低端机上输入框会明显发涩。200ms 是手感与开销的折中。
  onSearchInput(e) {
    this._kwRaw = e.detail.value || ''; // 留着原始输入:全空格时 kw 为空,回车时要用原文兜底
    const kw = this._kwRaw.trim();
    if (this._searchTimer) { clearTimeout(this._searchTimer); this._searchTimer = null; }
    if (!kw) {
      this.setData({ kw: '', searching: false, rootHits: [], wordHits: [] });
      return;
    }
    this._searchTimer = setTimeout(() => {
      this._searchTimer = null;
      this.runSearch(kw);
    }, 200);
  },

  runSearch(kw) {
    const c = getContent();
    if (!c) return;
    const rootHits = c.searchRoot(kw).map(r => ({ ...r, variants: r.variants || [] }));
    const wordHits = c.searchWord(kw);
    this.setData({ kw, searching: true, rootHits, wordHits });
  },

  clearSearch() {
    if (this._searchTimer) { clearTimeout(this._searchTimer); this._searchTimer = null; }
    this.setData({ kw: '', searching: false, rootHits: [], wordHits: [] });
  },

  goRoot(e) {
    wx.navigateTo({ url: '/pages/root-detail/root-detail?rootId=' + e.currentTarget.dataset.id });
  },

  goWord(e) {
    wx.navigateTo({ url: '/pages/word/word?wordId=' + e.currentTarget.dataset.id });
  },

  onAffixWordTap(e) {
    wx.navigateTo({ url: '/pages/word/word?wordId=' + e.detail.id });
  },

  onPullDownRefresh() {
    this.refresh();
    wx.stopPullDownRefresh();
  },

  onSearchConfirm() {
    // 回车时把还挂在防抖窗口里的那次搜索立刻跑掉,不然用户会看到「打完字按回车,
    // 结果列表又晚 200ms 才出」。
    if (this._searchTimer) {
      clearTimeout(this._searchTimer);
      this._searchTimer = null;
      const kw = (this.data.kw || '').trim() || (this._kwRaw || '').trim();
      if (kw) this.runSearch(kw);
    }
    if (wx.hideKeyboard) wx.hideKeyboard();
  },
});
