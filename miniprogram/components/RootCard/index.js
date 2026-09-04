/**
 * RootCard 组件 — 词根地图首页的单张词根卡。
 * properties:
 *   root : Object 词根对象(父页已并入 familyProgressOf 的 total/learned/familiar)
 * 整卡点击仅向上冒泡自定义事件 select(不自行 navigate,由页面统一跳转)。
 */
Component({
  options: { addGlobalClass: true },
  properties: {
    root: { type: Object, value: null },
  },
  methods: {
    onCardTap() {
      const id = this.data.root && this.data.root.id;
      if (id) this.triggerEvent('select', { id });
    },
  },
});
