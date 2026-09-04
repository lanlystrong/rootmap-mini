const { getContent } = require('../../utils/content');
const api = require('../../utils/api');
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
    // 服务端登录/云端统计(仅登录展示;云端数据不影响本地进度)
    cloud: { authed: false, username: '', password: '', busy: false, err: '', loading: false,
             overview: null, daily: [], roots: [], gdPct: { q1: 0, q3: 0, q5: 0 } },
  },

  onLoad() {
    this._store = makeWxStore();
    this._c = getContent();
  },

  // Tab 页每次进入都重算(可能刚从学单词页/复习页回来);登录态/云端统计也一并刷新
  onShow() {
    this.refresh();
    this.refreshCloudState();
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

  // ===== 服务端登录/注册 + 云端统计(Task 7)=====
  // 未登录置空 cloud(不请求服务端);已登录取回会话并拉取云端统计。
  refreshCloudState() {
    const authed = api.isAuthed();
    if (!authed) {
      this.setData({
        cloud: { authed: false, username: '', password: '', busy: false, err: '', loading: false,
                 overview: null, daily: [], roots: [], gdPct: { q1: 0, q3: 0, q5: 0 } },
      });
      return;
    }
    const sess = api.getSession();
    this.setData({
      'cloud.authed': true,
      'cloud.username': (sess.user && sess.user.username) || '',
      'cloud.err': '',
    });
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

  // 登录/注册输入:data-k 区分 username / password,统一写 cloud.* 路径。
  onUserInput(e) {
    const k = e.currentTarget.dataset.k;
    if (!k || (k !== 'username' && k !== 'password')) return;
    this.setData({ ['cloud.' + k]: e.detail.value });
  },

  onLogin() {
    if (this.data.cloud.busy) return;
    const u = (this.data.cloud.username || '').trim();
    const pw = this.data.cloud.password || '';
    if (!u || !pw) return this.setData({ 'cloud.err': '请输入用户名和密码' });
    this.setData({ 'cloud.busy': true, 'cloud.err': '' });
    api.login(u, pw)
      .then(() => this.refreshCloudState())
      .catch((e) => {
        const msg = e && e.code === 'bad_credentials'
          ? '用户名或密码错误'
          : (e && e.offline ? '无法连接服务端,请确认已运行 npm run server' : '登录失败,请重试');
        this.setData({ 'cloud.err': msg });
      })
      .then(() => this.setData({ 'cloud.busy': false, 'cloud.password': '' }));
  },

  onRegister() {
    if (this.data.cloud.busy) return;
    const u = (this.data.cloud.username || '').trim();
    const pw = this.data.cloud.password || '';
    if (!/^[A-Za-z0-9_]{3,20}$/.test(u)) return this.setData({ 'cloud.err': '用户名须 3-20 位字母/数字/下划线' });
    if (pw.length < 6) return this.setData({ 'cloud.err': '密码至少 6 位' });
    this.setData({ 'cloud.busy': true, 'cloud.err': '' });
    api.register(u, pw)
      .then(() => this.refreshCloudState())
      .catch((e) => {
        const msg = e && e.code === 'username_taken'
          ? '用户名已被占用'
          : (e && e.offline ? '无法连接服务端,请确认已运行 npm run server' : '注册失败,请重试');
        this.setData({ 'cloud.err': msg });
      })
      .then(() => this.setData({ 'cloud.busy': false, 'cloud.password': '' }));
  },

  // 仅登出服务端会话(rm_token_v1/rm_user_v1);绝不动本地进度 rm_progress_v1。
  onLogout() {
    api.logout().then(() => this.refreshCloudState());
  },
});
