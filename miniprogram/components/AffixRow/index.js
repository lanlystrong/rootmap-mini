/**
 * AffixRow 组件 — 词根地图「前后缀」模式的一行。
 * properties:
 *   affix : Object 词缀对象({ id, text, type:'prefix'|'suffix', zh, note? })
 *   words : Array  父页传入的关联词(affixWords(affix.id).slice(0,8),每项含 id/word)
 * 点击行首展开/收起关联词区(内部 data.expanded,默认收起);
 * 点击某个词 chip 向上冒泡自定义事件 wordtap,detail = { id },由父页跳 word 页。
 */
Component({
  options: { addGlobalClass: true },
  properties: {
    affix: { type: Object, value: null },
    words: { type: Array, value: [] },
  },
  data: {
    expanded: false,
  },
  methods: {
    onHeadTap() {
      this.setData({ expanded: !this.data.expanded });
    },
    onWordTap(e) {
      const id = e.currentTarget.dataset.id;
      if (id) this.triggerEvent('wordtap', { id });
    },
  },
});
