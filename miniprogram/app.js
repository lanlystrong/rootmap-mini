// 词根地图 app.js — 应用外壳:版本号、更新检测、全局错误兜底。
App({
  globalData: {
    version: '0.1.0',
  },

  onLaunch() {
    this.checkUpdate();
    this.registerErrorHandlers();
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
});
