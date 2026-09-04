/**
 * Chip 组件 — 通用小标签。
 * properties:
 *   text : String 标签文字
 *   cls  : String 追加在 .chip 上的修饰类(见 index.wxss 中 .chip.chip-* 色系类)
 * 点击任意 chip 会向上冒泡自定义事件 chipsel,detail = { text };纯展示场景可不监听。
 */
Component({
  options: { addGlobalClass: true },
  properties: {
    text: { type: String, value: '' },
    cls: { type: String, value: '' },
  },
  methods: {
    onTap() {
      this.triggerEvent('chipsel', { text: this.data.text });
    },
  },
});
