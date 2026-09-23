/**
 * BreakdownBar 组件 — 单词拆解条(可交互 + mini 两模式)。
 * properties:
 *   parts       : Array  Word.breakdown 原样(含 type:'none' 段,内部处理)
 *   interactive : Boolean 为真时每段可点;为假(mini)时纯静态文字
 * 交互模式点击某段触发 tapbreak,detail = { ref: 段.refId, type: 段.type };
 * type='none' 段不可点(它没有词根/词缀可跳转)。
 * 组件内不 require utils、不导航。
 *
 * type='none' 段的两种渲染——这一条是关键:
 *   短残段(≤ RESIDUE_VISIBLE_MAX,手写层的静音 e:re·vis·e)只留窄隙,是刻意的「不渲染噪声」;
 *   长残段(生成层的 -ation/-ology/-ific 这类词典未收的派生后缀)**必须显示为灰色文字**。
 *   曾经一律只留 8rpx 窄隙,于是 generalization 的拆解条只显示 "gener" —— 残段越长丢得越多,
 *   整条拼不回原词。现在长残段以灰色补全,拆解条永远拼得出完整单词(S5 的视觉版)。
 */
const RESIDUE_VISIBLE_MAX = 2;

Component({
  options: { addGlobalClass: true },
  properties: {
    parts: { type: Array, value: [] },
    interactive: { type: Boolean, value: false },
  },
  data: {
    segs: [],
  },
  observers: {
    parts(parts) {
      this.setData({ segs: this.derive(parts) });
    },
  },
  attached() {
    // 组件创建时父级传入的初值不触发 observer,这里补一次派生。
    const parts = this.data.parts;
    if (parts && parts.length && !this.data.segs.length) {
      this.setData({ segs: this.derive(parts) });
    }
  },
  methods: {
    derive(parts) {
      const clsOf = (t) => (t === 'prefix' ? 'bp-pre' : t === 'root' ? 'bp-root' : t === 'suffix' ? 'bp-suf' : '');
      return (parts || []).map((p, i) => {
        if (p.type === 'none') {
          const narrow = String(p.part || '').length <= RESIDUE_VISIBLE_MAX;
          return {
            _k: i,
            gap: narrow,
            visible: !narrow,
            text: narrow ? '' : p.part,
            cls: narrow ? '' : 'bp-none',
            ref: undefined, // 不可点:没有可跳转的条目
            type: p.type,
          };
        }
        return {
          _k: i,
          gap: false,
          visible: true,
          text: p.part,
          cls: clsOf(p.type),
          ref: p.refId,
          type: p.type,
        };
      });
    },
    onTapPart(e) {
      if (!this.data.interactive) return;
      const d = e.currentTarget.dataset;
      if (!d || !d.ref) return;
      this.triggerEvent('tapbreak', { ref: d.ref, type: d.type });
    },
  },
});
