/**
 * StatBar 组件 — 近 14 天每日「新学(new)蓝 / 复习(reviews)绿」并排细柱图。
 *
 * properties:
 *   data : Array  computeStats 的 last14:14 项 { date:'YYYY-MM-DD', new, reviews },
 *                 今天在末。长度不足 14 时组件自行在头部补 0 填充(尾部锚定)。
 *
 * 派生口径(observer/attached):以 14 天内「当日合计 new+reviews」最大值 max 归一,
 *   第 i 天映射为 { dateLabel(MM/DD), newH, revH, any, today }:
 *     newH = new / max * 100、revH = reviews / max * 100(数字,单位 %,柱高内联
 *     style="height:{{newH}}%")。max 为 0(14 天全无活动)→ 全 0 高,只留基线点。
 *   any=false(当日无活动)不渲染柱,只留底部小圆点作基线;today 用高亮标签区分。
 *
 * 纯 view 实现,无图表库;组件不 require utils、不导航。
 */
const PLOT_DAYS = 14;

function pct(n, max) {
  if (max <= 0) return 0;
  return Math.round((n / max) * 1000) / 10; // 保留 1 位小数
}

Component({
  options: { addGlobalClass: true },
  properties: {
    data: { type: Array, value: [] },
  },
  data: {
    bars: [],
  },
  observers: {
    data(list) {
      this.setData({ bars: this.derive(list) });
    },
  },
  attached() {
    // 组件创建时父级传入的初值不触发 observer,这里补一次派生。
    const list = this.data.data;
    if (list && list.length && !this.data.bars.length) {
      this.setData({ bars: this.derive(list) });
    }
  },
  methods: {
    derive(list) {
      const days = (list || []).slice(-PLOT_DAYS).map((d) => ({
        date: (d && d.date) || '',
        n: (d && d.new) || 0,
        r: (d && d.reviews) || 0,
      }));
      while (days.length < PLOT_DAYS) days.unshift({ date: '', n: 0, r: 0 });
      const max = days.reduce((m, d) => Math.max(m, d.n + d.r), 0);
      return days.map((d, i) => ({
        _k: i,
        any: d.n + d.r > 0,
        today: i === PLOT_DAYS - 1,
        label: d.date ? d.date.slice(5).replace('-', '/') : '',
        newH: d.n > 0 ? pct(d.n, max) : 0,
        revH: d.r > 0 ? pct(d.r, max) : 0,
      }));
    },
  },
});
