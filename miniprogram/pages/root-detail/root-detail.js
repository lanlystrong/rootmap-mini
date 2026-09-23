const { getContent, ensureContent, isLoaded } = require('../../utils/content');
const { familyProgressOf } = require('../../utils/stats');
const { makeWxStore } = require('../../utils/store');

Page({
  data: {
    navTitle: '词根地图',
    root: null,
    prog: { total: 0, learned: 0, familiar: 0 },
    rows: [],
    expandedStory: false,
    firstUnlearned: '',
  },

  onLoad(options) {
    this._opts = options || {};
    this._rootId = (options && options.rootId) || '';
    if (!isLoaded()) {
      ensureContent().then(() => { if (isLoaded()) this.onLoad(this._opts); }).catch(() => {});
      return;
    }
    this.render();
  },

  onShow() {
    // 从 word 页学完返回时刷新进度;内容未就绪时先等后端,避免空索引崩。
    if (!isLoaded()) {
      ensureContent().then(() => { if (isLoaded()) this.onShow(); }).catch(() => {});
      return;
    }
    if (this._rootId) this.render();
  },

  render() {
    const rootId = this._rootId;
    const c = getContent();
    const root = c.roots.find(r => r.id === rootId);
    if (!root) {
      this.setData({ navTitle: '词根家族', root: null, rows: [], prog: { total: 0, learned: 0, familiar: 0 } });
      return;
    }
    const words = c.rootWords(rootId);
    const store = makeWxStore();
    const cards = (store && store.getProgress().cards) || {};
    const prog = familyProgressOf(words, cards);

    const rows = words.map(w => ({
      id: w.id,
      word: w.word,
      phonetic: w.phonetic,
      learned: Object.prototype.hasOwnProperty.call(cards, w.id),
      showSenses: false,
      parts: w.breakdown || [],
      senses: (w.senses || []).map((s, i) => ({ ...s, _k: i })),
    }));

    const firstUnlearned = words.length
      ? (words.find(w => !Object.prototype.hasOwnProperty.call(cards, w.id)) || words[0]).id
      : '';

    this.setData({ navTitle: root.root, root, prog, rows, firstUnlearned, expandedStory: false });
  },

  toggleStory() {
    this.setData({ expandedStory: !this.data.expandedStory });
  },

  toggleRow(e) {
    const id = e.currentTarget.dataset.id;
    const rows = this.data.rows.map(r => (r.id === id ? { ...r, showSenses: !r.showSenses } : r));
    this.setData({ rows });
  },

  goWord(e) {
    wx.navigateTo({ url: '/pages/word/word?wordId=' + e.currentTarget.dataset.id });
  },

  startStudy() {
    if (!this.data.root || !this.data.firstUnlearned) return;
    wx.navigateTo({
      url: '/pages/word/word?rootId=' + this.data.root.id + '&wordId=' + this.data.firstUnlearned,
    });
  },

  onShareAppMessage() {
    const r = this.data.root;
    return {
      title: r ? `词根 ${r.root}(${r.zh}) 家族词` : '词根地图 · 词根构词学单词',
      path: r ? `/pages/root-detail/root-detail?rootId=${r.id}` : '/pages/index/index',
    };
  },
});
