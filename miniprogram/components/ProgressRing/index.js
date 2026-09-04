/**
 * ProgressRing 组件 — 纯 view 圆环进度(size 单位 rpx)。
 * properties:
 *   learned : Number 已学词数
 *   total   : Number 总数(0 时整环置灰)
 *   size    : Number 直径(rpx)
 * 内部白色内圆挖出环带;conic-gradient 按 pct 上色。不支持 conic-gradient 的旧机型退化为整蓝环。
 */
Component({
  options: { addGlobalClass: true },
  properties: {
    learned: { type: Number, value: 0 },
    total: { type: Number, value: 0 },
    size: { type: Number, value: 64 },
  },
  data: {
    pct: 0,
    hole: 46,
    fs: 15,
  },
  lifetimes: {
    attached() {
      this.compute();
    },
  },
  observers: {
    'learned, total, size': function () {
      this.compute();
    },
  },
  methods: {
    compute() {
      const t = Number(this.data.total) || 0;
      const l = Number(this.data.learned) || 0;
      const s = Number(this.data.size) || 64;
      const pct = t > 0 ? Math.min(100, Math.round((l / t) * 100)) : 0;
      const hole = Math.round(s * 0.72);
      const fs = Math.max(10, Math.round(s * 0.24));
      this.setData({ pct, hole, fs });
    },
  },
});
