/**
 * AffixPop 组件 — 前后缀详情半屏弹层。
 * properties:
 *   show  : Boolean 是否显示(!!popAffix)
 *   affix : Object  词缀对象({ id, text, type:'prefix'|'suffix', zh, note? })
 *   words : Array   含该词缀的词名(前 8,字符串数组)
 * 关闭 = 右上 X 或点遮罩 → 触发 close 事件;catchtouchmove 阻止底层滚动。
 */
Component({
  options: { addGlobalClass: true },
  properties: {
    show: { type: Boolean, value: false },
    affix: { type: Object, value: null },
    words: { type: Array, value: [] },
  },
  methods: {
    onClose() {
      this.triggerEvent('close', {});
    },
    noop() {},
  },
});
