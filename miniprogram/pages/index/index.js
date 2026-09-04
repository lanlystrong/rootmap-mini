const { getContent } = require('../../utils/content');
const { familyProgressOf } = require('../../utils/stats');
const { makeWxStore } = require('../../utils/store');

Page({
  data: {
    mode: 'root',
    roots: [],
    affixes: [],
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
    const roots = c.sortedRoots.map(r => ({ ...r, ...familyProgressOf(c.rootWords(r.id), cards) }));
    // 每个词缀附带其关联词(前 8 个),供 AffixRow 展开时渲染 chips。
    const affixes = c.affixes.map(a => ({ ...a, words: c.affixWords(a.id).slice(0, 8) }));
    this.setData({ roots, affixes, searching: false, kw: '', rootHits: [], wordHits: [] });
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
});
