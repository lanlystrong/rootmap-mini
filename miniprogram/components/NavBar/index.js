/**
 * NavBar — 全局统一自定义导航栏。
 * - 自动适配状态栏高度（wx.getWindowInfo / getSystemInfoSync 兜底）。
 * - 标题居中；导航栏高度按胶囊按钮位置对齐，视觉与原生栏一致。
 * - 二级页（页面栈 > 1）自动显示返回键；首页等 Tab 页不显示。
 * - 点击返回：navigateBack；栈底则 switchTab 回首页，避免空栈报错。
 */
Component({
  options: {
    addGlobalClass: true,
    multipleSlots: false
  },
  properties: {
    title: {
      type: String,
      value: '词根地图'
    }
  },
  data: {
    statusBarH: 20,   // 状态栏高度(px)
    navH: 44,         // 导航栏内容高度(px)
    totalH: 64,       // 状态栏 + 导航栏 总高(px)
    back: false       // 是否显示返回键
  },
  lifetimes: {
    attached() {
      let statusBarH = 20;
      let navH = 44;
      try {
        const info = (typeof wx.getWindowInfo === 'function')
          ? wx.getWindowInfo()
          : wx.getSystemInfoSync();
        if (info && info.statusBarHeight) statusBarH = info.statusBarHeight;

        const mb = (typeof wx.getMenuButtonBoundingClientRect === 'function')
          ? wx.getMenuButtonBoundingClientRect()
          : null;
        if (mb && mb.top && mb.height) {
          // 标准公式：导航栏高度 = (胶囊上沿 - 状态栏) * 2 + 胶囊高度
          navH = (mb.top - statusBarH) * 2 + mb.height;
        }
      } catch (e) {
        // 取默认值即可，不影响功能
      }

      const pages = getCurrentPages();
      const back = pages.length > 1;

      this.setData({ statusBarH, navH, totalH: statusBarH + navH, back });
    }
  },
  methods: {
    onBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack();
      } else {
        wx.switchTab({ url: '/pages/home/home' });
      }
    }
  }
});
