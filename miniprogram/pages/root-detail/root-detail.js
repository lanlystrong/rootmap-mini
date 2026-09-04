const { getContent } = require('../../utils/content');
const { familyProgressOf } = require('../../utils/stats');
const { makeWxStore } = require('../../utils/store');

// 迷你拆解配色类:type -> class(样式写在页面 wxss)。type==='none' 的段已在此过滤(不显示文字)。
const SEG_CLS = { prefix: 'seg-pre', root: 'seg-root', suffix: 'seg-suf' };

Page({
  data: {
    root: null,
    prog: { total: 0, learned: 0, familiar: 0 },
    rows: [],
    expandedStory: false,
    firstUnlearned: '',
  },

  onLoad(options) {
    this._rootId = (options && options.rootId) || '';
    this.render();
  },

  onShow() {
    // 从 word 页学完返回时刷新进度
    if (this._rootId) this.render();
  },

  render() {
    const rootId = this._rootId;
    const c = getContent();
    const root = c.roots.find(r => r.id === rootId);
    if (!root) {
      this.setData({ root: null, rows: [], prog: { total: 0, learned: 0, familiar: 0 } });
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
      segs: (w.breakdown || [])
        .filter(b => b.type !== 'none')
        .map((b, i) => ({ part: b.part, cls: SEG_CLS[b.type] || 'seg-root', _k: i })),
      senses: (w.senses || []).map((s, i) => ({ ...s, _k: i })),
    }));

    const firstUnlearned = words.length
      ? (words.find(w => !Object.prototype.hasOwnProperty.call(cards, w.id)) || words[0]).id
      : '';

    this.setData({ root, prog, rows, firstUnlearned, expandedStory: false });
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
});
