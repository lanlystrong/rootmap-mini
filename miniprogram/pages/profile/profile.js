const { getContent } = require('../../utils/content');
const { makeWxStore } = require('../../utils/store');
const { computeStats } = require('../../utils/stats');
const { todayISO } = require('../../utils/date');

// 每日复习上限固定选项(数值与显示串一一对应;0 = 不限)
const CAP_VALUES = [0, 10, 20, 30, 50];
const CAP_OPTIONS = ['不限', '10', '20', '30', '50'];
const VERSION = '0.1.0';

const ZERO_STATS = { learned: 0, familiar: 0, dueToday: 0, streak: 0, last14: [] };
const DEFAULT_SETTINGS = { reviewCapPerDay: 0, expandAssoc: false };

Page({
  data: {
    version: VERSION,
    stats: { ...ZERO_STATS, last14: [] },
    last14: [],
    counts: { roots: 0, affixes: 0, words: 0 },
    settings: { ...DEFAULT_SETTINGS },
    capOptions: CAP_OPTIONS,
    capIndex: 0,
    capText: CAP_OPTIONS[0], // 当前选中展示文本,picker 行右侧用
  },

  onLoad() {
    this._store = makeWxStore();
    this._c = getContent();
  },

  // Tab 页每次进入都重算(可能刚从学单词页/复习页回来)
  onShow() {
    this.refresh();
  },

  // onShow 内组装一次 setData:统计 + 设置 + 内容计数 + 14 天柱原样给 StatBar。
  refresh() {
    const c = this._c;
    const store = this._store;
    const stats = store
      ? computeStats(store.getProgress(), todayISO())
      : { ...ZERO_STATS, last14: [] };
    const settings = store ? store.getSettings() : { ...DEFAULT_SETTINGS };
    const counts = c
      ? { roots: c.roots.length, affixes: c.affixes.length, words: c.words.length }
      : { roots: 0, affixes: 0, words: 0 };
    const cap = settings.reviewCapPerDay || 0;
    const ci = CAP_VALUES.indexOf(cap);
    const safe = ci >= 0 ? ci : 0; // 0=不限 一定命中;异常值回落 0
    this.setData({
      stats,
      last14: stats.last14 || [],
      counts,
      settings,
      capIndex: safe,
      capText: CAP_OPTIONS[safe],
    });
  },

  // picker mode=selector: e.detail.value = 选中项下标 → 映射为真实数值存设置
  onCapChange(e) {
    const idx = Number(e.detail.value);
    const val = CAP_VALUES[idx] != null ? CAP_VALUES[idx] : 0;
    const store = this._store;
    if (store) store.saveSettings({ reviewCapPerDay: val });
    this.setData({
      'settings.reviewCapPerDay': val,
      capIndex: idx,
      capText: CAP_OPTIONS[idx] != null ? CAP_OPTIONS[idx] : CAP_OPTIONS[0],
    });
  },

  onExpandChange(e) {
    const val = !!e.detail.value;
    const store = this._store;
    if (store) store.saveSettings({ expandAssoc: val });
    this.setData({ 'settings.expandAssoc': val });
  },

  // 二次确认后重置:store.reset 只清 rm_progress_v1,rm_settings_v1 保留
  onResetTap() {
    const store = this._store;
    if (!store) return;
    wx.showModal({
      title: '确认重置',
      content: '将清空全部学习与复习进度(设置保留),确定继续?',
      confirmColor: '#EF4444',
      success: (res) => {
        if (!res.confirm) return;
        store.reset();
        this.refresh();
      },
    });
  },
});
