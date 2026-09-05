const { getContent } = require('../../utils/content');
const { makeWxStore } = require('../../utils/store');
const { computeStats } = require('../../utils/stats');
const { todayISO } = require('../../utils/date');

const ZERO = { learned: 0, familiar: 0, dueToday: 0, streak: 0, last14: [] };

Page({
  data: {
    streak: 0,
    streakText: '今天开始打卡',
    dueToday: 0,
    learned: 0,
    familiar: 0,
    total: 0,
    continueRoot: null,   // { rootId, wordId, root, zh } | null(全部学完为 null)
    continueText: '从第一个词根开始学习',
    continueBtn: '开始学习',
  },

  onLoad() {
    this._store = makeWxStore();
    this._c = getContent();
  },

  // Tab 页每次进入都重算(刚从学单词页/复习页回来,进度可能已变)
  onShow() {
    this.refresh();
  },

  refresh() {
    const c = this._c;
    const store = this._store;
    if (!c || !store) return;
    const progress = store.getProgress();
    const stats = computeStats(progress, todayISO());
    const cards = progress.cards || {};
    const total = c.words.length;
    const lastRootId = (store.getSettings().lastRootId) || null;

    // 找「下一个未学词」:优先上次学到的词根族,否则按字母序取第一个有未学词的族。
    const nextUnlearned = (rootId) => {
      const ws = c.rootWords(rootId);
      return ws.find(w => !Object.prototype.hasOwnProperty.call(cards, w.id)) || null;
    };
    let target = null;
    if (lastRootId) {
      const w = nextUnlearned(lastRootId);
      if (w) target = { rootId: lastRootId, wordId: w.id };
    }
    if (!target) {
      for (const r of c.sortedRoots) {
        const w = nextUnlearned(r.id);
        if (w) { target = { rootId: r.id, wordId: w.id }; break; }
      }
    }

    let continueRoot = null;
    let continueText = '从第一个词根开始学习';
    let continueBtn = '开始学习';
    if (target) {
      const root = c.roots.find(r => r.id === target.rootId);
      continueRoot = {
        rootId: target.rootId,
        wordId: target.wordId,
        root: root ? root.root : '',
        zh: root ? root.zh : '',
      };
      continueText = `上次学到 ${root ? root.root : ''}${root && root.zh ? ' · ' + root.zh : ''}`;
      continueBtn = '继续学习';
    } else if (total > 0 && stats.learned >= total) {
      continueText = '太棒了,所有单词已学完';
      continueBtn = '去复习巩固';
    }

    this.setData({
      streak: stats.streak,
      streakText: stats.streak > 0 ? `连续 ${stats.streak} 天` : '今天开始打卡',
      dueToday: stats.dueToday,
      learned: stats.learned,
      familiar: stats.familiar,
      total,
      continueRoot,
      continueText,
      continueBtn,
    });
  },

  // 今日待复习:有到期 → 复习页;无到期 → 学习页。
  goDue() {
    if (this.data.dueToday > 0) this.goReview();
    else this.goLearn();
  },

  goLearn() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  goReview() {
    wx.switchTab({ url: '/pages/review/review' });
  },

  // 继续学习:有下一个未学词 → 直达该词;全部学完 → 复习页巩固。
  continueStudy() {
    const t = this.data.continueRoot;
    if (t) {
      wx.navigateTo({ url: `/pages/word/word?rootId=${t.rootId}&wordId=${t.wordId}` });
    } else {
      this.goReview();
    }
  },

  // 首页作为落地页,支持转发拉新。
  onShareAppMessage() {
    return {
      title: '词根地图 · 词根联想学单词',
      path: '/pages/home/home',
    };
  },
});
