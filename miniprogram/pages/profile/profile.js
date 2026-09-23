const { getContent, ensureContent, isLoaded } = require('../../utils/content');
const api = require('../../utils/api');
const { makeWxStore } = require('../../utils/store');
const { computeStats } = require('../../utils/stats');
const { todayISO } = require('../../utils/date');

// 每日复习上限固定选项(数值与显示串一一对应;0 = 不限)
const CAP_VALUES = [0, 10, 20, 30, 50];
const CAP_OPTIONS = ['不限', '10', '20', '30', '50'];
const FALLBACK_VERSION = '0.1.0';

const ZERO_STATS = { learned: 0, familiar: 0, dueToday: 0, streak: 0, last14: [] };
const DEFAULT_SETTINGS = { reviewCapPerDay: 0, expandAssoc: false };
const DEFAULT_PROFILE = { nickname: '', avatarUrl: '' };

// 临时头像文件扩展名 → mime;chooseAvatar 通常返回 png/jpeg/webp
function guessMime(filePath) {
  const ext = ((filePath || '').split('.').pop() || '').toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  return 'image/png';
}

Page({
  data: {
    version: FALLBACK_VERSION,
    stats: { ...ZERO_STATS, last14: [] },
    last14: [],
    counts: { roots: 0, affixes: 0, words: 0 },
    settings: { ...DEFAULT_SETTINGS },
    capOptions: CAP_OPTIONS,
    capIndex: 0,
    capText: CAP_OPTIONS[0], // 当前选中展示文本,picker 行右侧用
    // 用户头像/昵称(云端,来自服务端 users 表)
    profile: { ...DEFAULT_PROFILE },
    // 云端统计(静默登录后展示;云端数据不影响本地进度)
    cloud: { authed: false, err: '', loading: false,
             overview: null, daily: [], roots: [], gdPct: { q1: 0, q3: 0, q5: 0 } },
  },

  onLoad() {
    this._store = makeWxStore();
    const app = getApp();
    if (app && app.globalData && app.globalData.version) {
      this.setData({ version: app.globalData.version });
    }
  },

  // Tab 页每次进入都重算(可能刚从学单词页/复习页回来);登录态/云端统计也一并刷新
  onShow() {
    if (!isLoaded()) {
      ensureContent().then(() => { if (isLoaded()) this.onShow(); }).catch(() => {});
      return;
    }
    this._c = getContent();
    this.refresh();
    this.refreshCloudState();
    this.refreshProfile();
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

  // ===== 用户头像/昵称(云端) =====
  // 已静默登录则从服务端拉取个人资料;未登录/离线则保留默认空态。
  refreshProfile() {
    if (!api.isAuthed()) return;
    api.me().then((user) => {
      this.setData({
        profile: {
          nickname: (user && user.nickname) || '',
          avatarUrl: (user && user.avatarUrl) || '',
        },
      });
    }).catch(() => { /* offline:保留当前 */ });
  },

  // chooseAvatar:读取临时头像 → base64 data URL → 上传后端
  onChooseAvatar(e) {
    const tempPath = e.detail.avatarUrl;
    if (!tempPath) return;
    wx.getFileSystemManager().readFile({
      filePath: tempPath,
      encoding: 'base64',
      success: (res) => {
        const avatar = 'data:' + guessMime(tempPath) + ';base64,' + res.data;
        this.setData({ 'profile.avatarUrl': avatar }); // 先乐观更新
        api.saveProfile({ avatar }).catch(() => {
          wx.showToast({ title: '头像保存失败', icon: 'none' });
        });
      },
      fail: () => wx.showToast({ title: '读取头像失败', icon: 'none' }),
    });
  },

  // 输入实时同步到 data(type=nickname 的 blur value 在部分机型为空,靠 input 事件累计)
  onNicknameInput(e) {
    this.setData({ 'profile.nickname': e.detail.value || '' });
  },

  // 失焦/回车时写后端:优先 blur 的 value,为空则取 input 已累计的值
  onNicknameBlur(e) {
    const raw = (e && e.detail && e.detail.value) || this.data.profile.nickname || '';
    const nickname = String(raw).trim();
    this.setData({ 'profile.nickname': nickname });
    if (!nickname) return; // 空昵称不落库
    api.saveProfile({ nickname }).catch(() => {
      wx.showToast({ title: '昵称保存失败', icon: 'none' });
    });
  },

  // ===== 云端统计 =====
  // 未登录置空 cloud(不请求服务端);已登录则拉取云端统计。
  refreshCloudState() {
    const authed = api.isAuthed();
    if (!authed) {
      this.setData({
        cloud: { authed: false, err: '', loading: false,
                 overview: null, daily: [], roots: [], gdPct: { q1: 0, q3: 0, q5: 0 } },
      });
      return;
    }
    this.setData({ 'cloud.authed': true, 'cloud.err': '' });
    this.loadCloud();
  },

  // 拉取 overview/daily/roots,并在 js 侧预拼 accTxt / gdPct(wxml 不做算术)。
  loadCloud() {
    const p = Promise.all([api.overview(), api.daily(14), api.roots(30, 10)]);
    p.then(([ov, dl, rt]) => {
      const total = ov.reviewEvents || 0;
      const g = ov.gradeDist || { q1: 0, q3: 0, q5: 0 };
      const gdPct = total
        ? { q1: Math.round(g.q1 / total * 100), q3: Math.round(g.q3 / total * 100), q5: Math.round(g.q5 / total * 100) }
        : { q1: 0, q3: 0, q5: 0 };
      ov.accTxt = (total ? Math.round(ov.accuracy * 100) : 0) + '%';
      this.setData({
        'cloud.overview': ov,
        'cloud.daily': dl || [],
        'cloud.gdPct': gdPct,
        'cloud.roots': (rt || []).map((x) => ({ ...x, accTxt: Math.round(x.accuracy * 100) + '%' })),
        'cloud.loading': false,
        'cloud.err': '',
      });
    }).catch((e) => {
      // offline/未就绪静默;服务端错误显示一行
      this.setData({
        'cloud.loading': false,
        'cloud.err': e && e.offline ? '' : '云端统计加载失败,请确认已运行 npm run server',
      });
    });
  },

});
