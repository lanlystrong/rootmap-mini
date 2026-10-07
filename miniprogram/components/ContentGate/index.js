// ContentGate —— 词库加载态/错误态的统一出口。
//
// 六个页面都需要同一件事:内容没就绪时别渲染正文,改渲染「加载中」或者
// 「出错了 + 重试按钮」。原先每页各写一遍 `ensureContent().then(...).catch(()=>{})`,
// 而 ensureContent 永不 reject,失败被静默吞成空白页 —— 抽到这里统一处理。
//
// state: 'ready' 时本组件不渲染任何东西(零高度),页面照常显示正文。
Component({
  options: { addGlobalClass: true },
  properties: {
    state: { type: String, value: 'idle' },   // idle | loading | ready | error
    err: { type: String, value: '' },
  },
  methods: {
    onRetry() { this.triggerEvent('retry'); },
  },
});
