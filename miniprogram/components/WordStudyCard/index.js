/**
 * WordStudyCard 组件 — 学单词页词头条卡片。
 * properties:
 *   word   : Object 词原始对象(word.word/phonetic/tags/breakdown)
 *   inPool : Boolean 已在词库(绿角标)
 * 卡内渲染词头 + 标签 chips + 可交互 BreakdownBar;把 breakdown-bar 的 tapbreak
 * 原样 re-trigger 给父页(父页负责导航 / 弹词缀层)。
 */
Component({
  options: { addGlobalClass: true },
  properties: {
    word: { type: Object, value: null },
    inPool: { type: Boolean, value: false },
  },
  methods: {
    onTapBreak(e) {
      this.triggerEvent('tapbreak', e.detail);
    },
  },
});
