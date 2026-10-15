const { getContent, ensureContent, isLoaded, attachTo, retry } = require('../../utils/content');
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
    // 词库加载态,由 content.attachTo 统一维护
    contentState: 'idle',
    contentErr: '',
    contentReady: false,
  },

  onLoad(options) {
    this._opts = options || {};
    this._rootId = (options && options.rootId) || '';
    // 必须始终订阅加载态:attachTo 负责把 contentReady 同步成 true。
    // 原先只在「内容未就绪」时才订阅,于是预加载完成后(从词根列表/拆解条点进来)
    // 这一支走不到,contentReady 永远为 false,正文被 wx:if 挡住 → 整页空白。
    // 就绪回调直接重渲染(不递归 onLoad),避免重复订阅。
    if (!isLoaded()) ensureContent();
    attachTo(this, function () { this.render(); });
  },

  onRetryContent() {
    retry();
  },

  onShow() {
    // 从 word 页学完返回时刷新进度;内容未就绪时先等后端,避免空索引崩。
    if (!isLoaded()) {
      ensureContent();
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
