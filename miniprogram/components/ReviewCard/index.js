/**
 * ReviewCard 组件 — 复习页单词卡(纯展示,不 require utils、不导航)。
 * properties:
 *   word : Object 复习「展示对象」,由页面 computeView 预拼:
 *          { word, phonetic, senses:[{pos,zh,en,_k}], rootName, rootZh,
 *            firstExample:{en,zh}|null, tags }
 *   shown: Boolean 是否已翻面(背面=答案)
 * 正面(未翻)只显示词 + 音标(防提示),整卡可点 → triggerEvent('flip')。
 * 背面(已翻)显示释义 / 构词 / 例句 / 所属词根,不再响应翻面(三档自评在页面层)。
 */
Component({
  options: { addGlobalClass: true },
  properties: {
    word: { type: Object, value: null },
    shown: { type: Boolean, value: false },
  },
  methods: {
    onTap() {
      if (this.data.shown) return; // 背面不吞点击、不翻回
      this.triggerEvent('flip');
    },
  },
});
