/**
 * AssocSection 组件 — 通用联想分组折叠卡。
 * properties:
 *   title : String 分组标题(如「同根词族」)
 *   count : Number 标题旁计数(为 0/缺省时不显示)
 *   open  : Boolean 是否展开(受父页 groupOpen 控制)
 * 点头部触发 toggle 事件(父页翻转 groupOpen);内容为默认 slot,仅 open 时渲染。
 */
Component({
  options: { addGlobalClass: true },
  properties: {
    title: { type: String, value: '' },
    count: { type: Number, value: 0 },
    open: { type: Boolean, value: false },
  },
  methods: {
    onToggle() {
      this.triggerEvent('toggle', {});
    },
  },
});
