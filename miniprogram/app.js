// 词根地图 app.js — 应用外壳:版本号、更新检测、全局错误兜底、微信静默登录。
const api = require('./utils/api');
const reporter = require('./utils/reporter');
const store = require('./utils/store');

App({
  globalData: {
    version: '0.1.0',
  },

  onLaunch() {
    this.checkUpdate();
    this.registerErrorHandlers();
    this.silentLogin();
    // 内容只来自后端:冷启动预载(纯内存,不落本地存储);加载完成后才能清理下架卡片。
    this.preloadContent();
  },

  // 预载内容索引:从后端 /api/content 拉取并填内存。fire-and-forget(不阻塞启动),
  // 各页面 onShow 也会 ensureContent 兜底,故这里只是「提前开跑」。
  preloadContent() {
    const content = require('./utils/content');
    content.ensureContent()
      .then(() => this.pruneStaleCards())
      .catch(() => {});
  },

  // 交付集更新后,把已被移除的词的 SRS 卡片从本地进度里清掉。
  // 卡片按 wordId 索引,computeStats 的 learned 直接数卡片条数,孤儿卡片会让
  // 「已学 X/总词数」的 X 超过总数。内容就绪(后端已拉到)后才能清,离线时跳过。
  pruneStaleCards() {
    try {
      const s = store.makeWxStore();
      if (!s) return;
      const data = require('./utils/content').getContent();
      if (!data || !data.words) return; // 内容未就绪(离线/后端未就绪):不清理,避免误删进度
      const n = s.pruneCards(new Set(data.words.map((w) => w.id)));
      if (n) console.info(`[rootmap] 清理了 ${n} 张已下架单词的学习卡片`);
    } catch (e) {
      // 静默:数据加载失败不该阻断启动(页面自己会再 require 一次并报错)。
    }
  },

  // 微信静默登录:启动即 wx.login → code2session → 按 openid 自动建号/登录;
  // 成功后顺带 flush 本地积压的事件。任何失败(离线/服务端未就绪/未配置 secret)均静默,
  // 不影响纯本地学习流程。
  silentLogin() {
    // 已有 token 则复用,不再重复登录(避免 dev 兜底按新 code 建新号导致身份漂移);
    // 无 token 才静默登录,成功后 flush 本地积压事件。
    if (api.isAuthed()) {
      reporter.flush().catch(() => {});
      return;
    }
    api.wxLogin()
      .then(() => reporter.flush())
      .catch(() => {});
  },

  // 检测新版本:就绪后二次确认并重启应用(线上静默换包用)。
  checkUpdate() {
    if (!wx.getUpdateManager) return;
    const um = wx.getUpdateManager();
    um.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '发现新版本,是否立即重启应用?',
        confirmText: '重启',
        success(res) {
          if (res.confirm) um.applyUpdate();
        },
      });
    });
    um.onUpdateFailed(() => {
      // 静默:下次冷启动会再走一遍更新检测。
    });
  },

  // 全局错误兜底:仅记录日志,避免白屏;纯本地应用不向用户弹错误提示。
  registerErrorHandlers() {
    if (wx.onError) wx.onError((err) => console.error('[rootmap] onError:', err));
    if (wx.onUnhandledRejection) {
      wx.onUnhandledRejection((evt) => console.error('[rootmap] unhandledRejection:', evt && evt.reason));
    }
  },

  // 内容同步:冷启动从后端拉取最新词根/词缀/单词,填内存(见 preloadContent);
  // 数据只来源于后端接口,不写本地存储、无打包内置兜底。保留 syncContent 别名兼容旧调用。
  syncContent() {
    const content = require('./utils/content');
    content.ensureContent()
      .then(() => this.pruneStaleCards())
      .catch(() => {});
  },
});
