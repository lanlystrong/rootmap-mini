const { getContent } = require('../../utils/content');
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
  },

  onShow() {
    this.refresh();
  },

  refresh() {
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

    // 折叠态:词根首组展开、其余收起;前后缀默认全收起。
    this._collapsed = { root: {}, affix: {} };
    this._rootGroups.forEach((g, i) => { this._collapsed.root[g.key] = i !== 0; });
    this._affixSections.forEach(sec => sec.groups.forEach(g => { this._collapsed.affix[g.key] = true; }));

    this.setData({
      filter: 'all',
      expanded: false,
      searching: false, kw: '', rootHits: [], wordHits: [],
    });
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

  onSearchInput(e) {
    const kw = (e.detail.value || '').trim();
    if (!kw) {
      this.setData({ kw: '', searching: false, rootHits: [], wordHits: [] });
      return;
    }
    const c = getContent();
    const rootHits = c.searchRoot(kw).map(r => ({ ...r, variants: r.variants || [] }));
    const wordHits = c.searchWord(kw);
    this.setData({ kw, searching: true, rootHits, wordHits });
  },

  clearSearch() {
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
    if (wx.hideKeyboard) wx.hideKeyboard();
  },
});
