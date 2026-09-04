/**
 * BreakdownBar 组件 — 单词拆解条(可交互 + mini 两模式)。
 * properties:
 *   parts       : Array  Word.breakdown 原样(含 type:'none' 段,内部过滤)
 *   interactive : Boolean 为真时每段可点;为假(mini)时纯静态文字
 * 交互模式点击某段触发 tapbreak,detail = { ref: 段.refId, type: 段.type };
 * type='none' 段只渲染一个窄隙,不渲染文字、不可点。
 * 组件内不 require utils、不导航。
 */
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
      return (parts || []).map((p, i) => ({
        _k: i,
        gap: p.type === 'none',
        text: p.type === 'none' ? '' : p.part,
        cls: p.type === 'none' ? '' : clsOf(p.type),
        ref: p.refId,
        type: p.type,
      }));
    },
    onTapPart(e) {
      if (!this.data.interactive) return;
      const d = e.currentTarget.dataset;
      if (!d || !d.ref) return;
      this.triggerEvent('tapbreak', { ref: d.ref, type: d.type });
    },
  },
});
