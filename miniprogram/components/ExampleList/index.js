/**
 * ExampleList 组件 — 例句列表(白卡)。
 * properties:
 *   examples : Array [{ en, zh }]
 */
Component({
  options: { addGlobalClass: true },
  properties: {
    examples: { type: Array, value: [] },
  },
});
