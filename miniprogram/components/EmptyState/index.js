/**
 * EmptyState 组件 — 空态占位(居中灰字 + 浅色图标)。
 * properties:
 *   text : String 提示文案
 */
Component({
  options: { addGlobalClass: true },
  properties: {
    text: { type: String, value: '' },
  },
});
