# 词根地图小程序 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `e:\projects\rootmap-mini` 实现一个原生微信小程序「词根地图」:以词根构词法讲解单词、联想成组学习、SM-2 记忆曲线复习的纯本地可运行首版。

**Architecture:** 纯逻辑层(`utils/srs.js` `utils/date.js` `utils/content.js` `utils/store.js` `utils/stats.js` + `data/*`)全部为**无 wx 依赖的 CommonJS**,可被 Node `node:test` 直接单测;小程序页面只做数据渲染与交互。内容以 per-root 的家族文件 + `data/index.js` 汇总,由 `scripts/validate-content.js` 强制 6 条数据不变量。种子进度存 `wx storage`(`rm_progress_v1`/`rm_settings_v1`)。

**Tech Stack:** 原生微信小程序(WXML/WXSS/JS,CJS);Node ≥18 `node:test`(零框架);内置 `.js` 数据模块。

**Spec:** `docs/superpowers/specs/2026-09-04-rootmap-mini-design.md`

## Global Constraints

以下为 spec 全局约束,每个任务默认继承,取值逐字来自 spec:

- **平台**: 原生微信小程序,CommonJS 模块,无第三方库/无 npm 运行时依赖;小程序只运行 `miniprogram/`;`package.json` 仅承载 `npm test` / `npm run validate`。
- **日期**: 一律本地时区字符串 `YYYY-MM-DD`;到期判断 = `dueDate <= today`;`todayISO` 由调用方注入(纯函数不 new Date)。
- **SM-2**: 初值 `ef:2.5`、`reps:1`、`intervalDays:1`,`dueDate=today+1`(学成即 rep1,次日首次到期)。自评→q:忘了=1、模糊=3、记得=5。迁移:q<3 → reps=0、intervalDays=1、`ef=clamp(1.3, ef−0.2)`;q≥3 → reps+=1,intervalDays = `reps===1?1 : reps===2?6 : round(intervalDays*ef)`(用更新前 ef),`ef=clamp(1.3, ef + 0.1 − (5−q)*(0.08+(5−q)*0.02))`;dueDate=today+intervalDays。`clamp(x)=Math.max(1.3, round100(x))`。
- **存储键**: `rm_progress_v1`、`rm_settings_v1`;写入 try/catch,失败降级内存态;读遇 `version!==1` → 丢弃重建。默认设置 `{reviewCapPerDay:0, expandAssoc:false}`。
- **统计口径**: 已学 = cards 有记录;熟悉 = `srs.reps≥2`;待复习 = `dueDate≤today`;连续打卡 = 今日/昨日为尾向前连续有 `new||reviews` 的天数。
- **内容不变量(validate 强制,逐字)**: ① breakdown 各段 `part` 拼接 === `word`(忽略大小写);② root/suffix/prefix 引用(`refId`)必须存在;③ `assoc` 内所有 id 必须存在且不含自身;④ 每词 `examples.length≥1` 且每条有 `en`+`zh`、`senses.length≥1`、`phonetic` 非空;⑤ root `id` 唯一、`variants` 非空;⑥ 每词 breakdown **恰好 1 个 `type:"root"` 段**,`refId` 指向存在的 Root。
- **词根 id 格式**: `root-<text>`(如 `root-spect`);词缀 id 格式 `affix-<text>`(如 `affix-in`)。
- **内容规模目标**: 30 个词根(名单见 Task 7–9)、约 40 个前后缀、单词总量 ≥200(每族 6~10 为主,受词汇约束可少)、每词 1~2 条中英对照例句。
- **视觉**: 主色渐变 `#3B82F6→#4F46E5`、成功 `#10B981`、忘了 `#EF4444`、模糊 `#F59E0B`、背景 `#F8FAFC` 卡片白、文字灰阶(标题 `#0F172A`/正文 `#334155`/次要 `#64748B`);构词拆解配色 前缀=青/词根=主蓝/后缀=紫。
- **无发音**: 仅显示 `phonetic` 文本,不做音频。

## File Structure

```
e:\projects\rootmap-mini\
  package.json                  # scripts: test / validate
  project.config.json           # 开发者工具工程(miniprogramRoot=miniprogram/)
  .gitignore                    # node_modules、*.log
  README.md                     # 简介 + 如何跑
  docs\superpowers\specs\2026-09-04-rootmap-mini-design.md
  docs\superpowers\plans\2026-09-04-rootmap-mini.md      (本文件)
  scripts\
    validate-content.js         # exports.errorsFor(data) + CLI(读 miniprogram/data/index.js)
  tests\
    helpers\content-fixture.js  # 冒烟样本(spect 族 4 词,结构合法)
    date.test.js
    srs.test.js
    content.test.js             # 测 buildIndex(用 fixture 注入,不依赖真实数据量)
    store.test.js               # 用内存 storage 测 createStore
    stats.test.js
    validate-content.test.js    # errorsFor + 人为破坏用例
  miniprogram\
    app.js  app.json  app.wxss
    data\
      index.js                  # {roots, affixes, words} 汇总
      roots.js                  # Root[]
      affixes.js                # Affix[]
      families\
        family-spect.js         # Word[](每词根一个文件,后续按名单新增)
    utils\
      date.js                   # toISO/todayISO/addDaysISO/diffDaysISO/isDue
      srs.js                    # initialStudyState/review/Q_* 常量
      content.js                # buildIndex({roots,affixes,words}) + getContent()
      store.js                  # createStore(storage)/makeWxStore()
      stats.js                  # computeStats/familyProgressOf/streakCompute
    pages\
      index\ (词根地图首页)
      root-detail\
      word\
      review\
      profile\
    components\
      RootCard\ AffixRow\ BreakdownBar\ AffixPop\ WordStudyCard\
      AssocSection\ ExampleList\ ReviewCard\ ProgressRing\ StatBar\ Chip\ EmptyState
```

**跨模块接口(供后续任务引用,先于数据存在即稳定):**
- `date.js`: `toISO(Date):str`、`todayISO():str`、`addDaysISO(iso, days):str`、`diffDaysISO(a,b):int`、`isDue(iso, today):bool`
- `srs.js`: `initialStudyState(todayISO):SrsState`、`review(prevSrs, q, todayISO):SrsState`;常量 `EF_MIN=1.3` `Q_FORGOT=1` `Q_HAZY=3` `Q_GOOD=5`。`SrsState={ef,intervalDays,reps,dueDate}`
- `content.js`: `buildIndex({roots,affixes,words})` → `{roots, affixes, words, byId, rootWords(rid), affixWords(aid), sortedRoots, searchRoot(q), searchWord(q)}`;`getContent()` = `buildIndex(require('data/index'))`
- `store.js`: `createStore(storage)`(`storage={get(k),set(k,v)}`) → `{getProgress, markStudied(wordId,today), applyReview(wordId,q,today), dueWords(today), reset, getSettings, saveSettings}`;`markStudied` 已有卡片则**跳过不重复写**;`applyReview` 返回 `{progress, applied}`。`makeWxStore()` 用 wx storage 包一层(无 wx 时返回 null)
- `stats.js`: `computeStats(progress, today)` → `{learned, familiar, dueToday, streak, last14:[{date,new,reviews}]}`;`familyProgressOf(words, cards)` → `{total, learned, familiar}`;`streakCompute(log, today):int`

---

### Task 1: 工程骨架 + 内容校验器

**Files:**
- Create: `package.json`, `project.config.json`, `.gitignore`, `README.md`
- Create: `scripts/validate-content.js`
- Create: `tests/helpers/content-fixture.js`, `tests/validate-content.test.js`
- Create: `miniprogram/data/index.js`, `miniprogram/data/roots.js`, `miniprogram/data/affixes.js`, `miniprogram/data/families/family-spect.js`

**Interfaces:**
- Consumes: 无(本任务从零搭起)。
- Produces: `scripts/validate-content.js` 的 `errorsFor(data)→string[]`(供后续测试与 CLI);`miniprogram/data/index.js` 的 `module.exports={roots,affixes,words}`(Task 4 的 `content.js` 与 CLI 依赖它);`tests/helpers/content-fixture.js` 导出 `{roots, affixes, words}` 合法冒烟样本。

- [ ] **Step 1: 写失败的校验器测试**

`tests/validate-content.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert');
const fixture = require('./helpers/content-fixture');
const { errorsFor } = require('../scripts/validate-content');

function deepClone(o){ return JSON.parse(JSON.stringify(o)); }

test('合法样本不产生错误', () => {
  assert.deepStrictEqual(errorsFor(deepClone(fixture)), []);
});

test('拼接错误被捕获', () => {
  const d = deepClone(fixture);
  d.words[0].breakdown[0].part = 'ix'; // in+... -> ixspect != inspect
  const errs = errorsFor(d);
  assert.ok(errs.some(e => /inspect/.test(e) && /拼接|concat/i.test(e)));
});

test('assoc 引用不存在或自引用被捕获', () => {
  const d = deepClone(fixture);
  const w = d.words.find(x => x.id === 'respect');
  w.assoc.synonyms = ['no-such-word'];
  const d2 = deepClone(fixture);
  const w2 = d2.words.find(x => x.id === 'respect');
  w2.assoc.synonyms = ['respect'];
  assert.ok(errorsFor(d).some(e => /no-such-word/.test(e)));
  assert.ok(errorsFor(d2).some(e => /自身|self/i.test(e)));
});

test('每词必须恰有一个词根段', () => {
  const d = deepClone(fixture);
  const w = d.words[0];
  w.breakdown = w.breakdown.filter(b => b.type !== 'root');
  assert.ok(errorsFor(d).some(e => /词根/.test(e)));
});

test('examples/senses/phonetic 缺失被捕获', () => {
  const d = deepClone(fixture);
  d.words[0].examples = [];
  const d2 = deepClone(fixture);
  d2.words[1].phonetic = '';
  assert.ok(errorsFor(d).some(e => /example/i.test(e)));
  assert.ok(errorsFor(d2).some(e => /phonetic/i.test(e)));
});
```

- [ ] **Step 2: 运行测试验证失败**

Run: `node --test tests/validate-content.test.js`
Expected: FAIL — `Cannot find module '../scripts/validate-content'` 或 `errorsFor is not a function`。

- [ ] **Step 3: 创建 fixture 数据与校验器实现**

`tests/helpers/content-fixture.js`(合法样本:1 词根 spect、4 词缀、4 词):

```js
const roots = [
  { id: 'root-spect', root: 'spect', variants: ['spect', 'spec'], zh: '看',
    meaning: '看、观察', story: '源自拉丁语 specere「看」。' },
];
const affixes = [
  { id: 'affix-in',  text: 'in-',  type: 'prefix', zh: '向内/进入', note: '在 b/m/p 前变 im-。' },
  { id: 'affix-re',  text: 're-',  type: 'prefix', zh: '再次/向后' },
  { id: 'affix-pro', text: 'pro-', type: 'prefix', zh: '向前/支持' },
  { id: 'affix-ator', text: '-ator', type: 'suffix', zh: '…者(名词化)' },
];
const words = [
  { id: 'inspect', word: 'inspect', phonetic: '/ɪnˈspekt/',
    senses: [{ pos: 'v.', zh: '检查;审视', en: 'to look at carefully' }],
    breakdown: [
      { part: 'in', type: 'prefix', zh: '向内', refId: 'affix-in' },
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
    ],
    tags: ['cet4', '高频'],
    examples: [{ en: 'The engineer inspected the bridge for cracks.', zh: '工程师检查了桥梁是否有裂缝。' }],
    assoc: {} },
  { id: 'respect', word: 'respect', phonetic: '/rɪˈspekt/',
    senses: [{ pos: 'v.', zh: '尊重', en: 'to admire deeply' }],
    breakdown: [
      { part: 're', type: 'prefix', zh: '再次/回', refId: 'affix-re' },
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
    ],
    tags: ['cet4', '高频'],
    examples: [{ en: 'Students respect their teacher.', zh: '学生们尊重老师。' }],
    assoc: { synonyms: ['inspect'], story: '一再( re )回头看( spect )对方 → 尊重。' } },
  { id: 'prospect', word: 'prospect', phonetic: '/ˈprɒspekt/',
    senses: [{ pos: 'n.', zh: '前景;可能性', en: 'the possibility that something will happen' }],
    breakdown: [
      { part: 'pro', type: 'prefix', zh: '向前', refId: 'affix-pro' },
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
    ],
    tags: ['cet4'],
    examples: [{ en: 'There is little prospect of rain today.', zh: '今天下雨的可能性很小。' }],
    assoc: { antonyms: ['inspect'] } },
  { id: 'spectator', word: 'spectator', phonetic: '/spekˈteɪtə/',
    senses: [{ pos: 'n.', zh: '观众;旁观者', en: 'a person watching an event' }],
    breakdown: [
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
      { part: 'ator', type: 'suffix', zh: '…者', refId: 'affix-ator' },
    ],
    tags: ['cet6'],
    examples: [{ en: 'The spectators cheered the players.', zh: '观众为选手们欢呼。' }],
    assoc: {} },
];
module.exports = { roots, affixes, words };
```

`miniprogram/data/families/family-spect.js`、`roots.js`、`affixes.js`、`index.js`:fixture 内容分别落盘(roots.js/affixes.js 导出上面的数组;family-spect.js 导出 `words`;index.js 汇总):

```js
// miniprogram/data/index.js
const roots = require('./roots');
const affixes = require('./affixes');
const familySpect = require('./families/family-spect');
module.exports = { roots, affixes, words: [...familySpect] };
```

`scripts/validate-content.js`:

```js
// 纯函数:返回错误字符串数组;空数组 = 通过。CLI 在 require.main 时读取 miniprogram/data/index.js。
function errorsFor(data) {
  const out = [];
  const rootSet = new Set(data.roots.map(r => r.id));
  const affixSet = new Set(data.affixes.map(a => a.id));
  const seenIds = new Set();
  data.roots.forEach(r => { if (r.id && seenIds.has(r.id)) out.push(`root id 重复: ${r.id}`); if (r.id) seenIds.add(r.id); });
  if (new Set(data.roots.map(r => r.id)).size !== data.roots.length) out.push('roots: id 非唯一');

  const byId = new Map(data.words.map(w => [w.id, w]));
  data.words.forEach(w => {
    const base = `word "${w.id}": `;
    if (!w.id) return;
    if (!w.word || !w.phonetic || !w.senses || w.senses.length < 1) out.push(base + '缺 word/phonetic/senses');
    if (!w.examples || w.examples.length < 1 || w.examples.some(e => !e.en || !e.zh)) out.push(base + 'examples 需 ≥1 条且含 en+zh');
    const concat = (w.breakdown || []).map(b => b.part).join('');
    if (concat.toLowerCase() !== String(w.word).toLowerCase()) out.push(base + `拼接不匹配: "${concat}" !== "${w.word}"`);
    const rootParts = (w.breakdown || []).filter(b => b.type === 'root');
    if (rootParts.length !== 1) out.push(base + '必须恰有 1 个 root 段');
    else if (!rootSet.has(rootParts[0].refId)) out.push(base + `root refId 不存在: ${rootParts[0].refId}`);
    (w.breakdown || []).forEach(b => {
      if (b.type !== 'none' && (!b.refId || !(b.type === 'root' ? rootSet : affixSet).has(b.refId)))
        out.push(base + `非法 ${b.type} 引用: ${b.refId}`);
    });
    const a = w.assoc || {};
    ['synonyms', 'antonyms', 'derivatives'].forEach(k => {
      (a[k] || []).forEach(id => {
        if (!byId.has(id)) out.push(base + `assoc.${k} 不存在: ${id}`);
        if (id === w.id) out.push(base + `assoc.${k} 含自身`);
      });
    });
    (a.confusing || []).forEach(c => {
      if (!byId.has(c.id)) out.push(base + `assoc.confusing 不存在: ${c.id}`);
      if (c.id === w.id) out.push(base + 'assoc.confusing 含自身');
      if (!c.diff || !c.diff.trim()) out.push(base + 'confusing 缺辨析 diff');
    });
  });
  data.roots.forEach(r => { if (!r.id || !r.root || !r.zh || !r.variants || r.variants.length < 1) out.push(`root 缺字段: ${r.id || r.root}`); });
  data.affixes.forEach(a => { if (!a.id || !a.text || (a.type !== 'prefix' && a.type !== 'suffix')) out.push(`affix 缺字段: ${a.id || a.text}`); });
  return out;
}

if (require.main === module) {
  const data = require('../miniprogram/data/index.js');
  const errs = errorsFor(data);
  if (errs.length) { errs.forEach(e => console.error('✗ ' + e)); console.error(`✗ ${errs.length} 处错误`); process.exit(1); }
  console.log(`✓ 内容通过: ${data.roots.length} roots / ${data.affixes.length} affixes / ${data.words.length} words`);
}
module.exports = { errorsFor };
```

- [ ] **Step 4: 运行测试验证通过**

Run: `node --test tests/`
Expected: validate-content 组全部 PASS。

- [ ] **Step 5: 创建脚手架文件**

`package.json`:
```json
{ "name": "rootmap-mini", "version": "0.1.0", "private": true,
  "scripts": { "test": "node --test tests/", "validate": "node scripts/validate-content.js" } }
```
`project.config.json`:
```json
{ "description": "词根地图 - 词根构词英语单词学习小程序",
  "compileType": "miniprogram", "appid": "touristappid", "projectname": "rootmap-mini",
  "miniprogramRoot": "miniprogram/", "libVersion": "latest",
  "setting": { "urlCheck": false, "es6": true, "postcss": true, "minified": true, "newFeature": true } }
```
`.gitignore`:
```
node_modules/
*.log
.DS_Store
```
`README.md`: 3 行简介 + `npm test`/`npm run validate` + 「用微信开发者工具打开本目录(miniprogramRoot=miniprogram/)即可运行」。

- [ ] **Step 6: 全量测试 + 校验 CLI**

Run: `npm test` → 全 PASS;`npm run validate` → `✓ 内容通过: 1 roots / 4 affixes / 4 words`。

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: 工程骨架 + 内容校验器(不变量门禁)+ 冒烟数据"
```

---

### Task 2: 日期工具(date.js,TDD)

**Files:**
- Create: `miniprogram/utils/date.js`
- Test: `tests/date.test.js`

**Interfaces:**
- Consumes: 无。
- Produces: `toISO(Date)→'YYYY-MM-DD'`、`todayISO()→string`、`addDaysISO(iso, days)→string`、`diffDaysISO(aISO,bISO)→int`、`isDue(iso, todayISO)→bool`(lexicographic)。Task 3/5/6/8+ 依赖。

- [ ] **Step 1: 写失败测试** `tests/date.test.js`

```js
const test = require('node:test');
const assert = require('node:assert');
const { toISO, todayISO, addDaysISO, diffDaysISO, isDue } = require('../miniprogram/utils/date');

test('toISO 补零', () => assert.equal(toISO(new Date(2026, 8, 4)), '2026-09-04'));
test('todayISO 是 YYYY-MM-DD', () => assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/));
test('addDaysISO 跨月/跨年/负数', () => {
  assert.equal(addDaysISO('2026-02-27', 3), '2026-03-02');
  assert.equal(addDaysISO('2026-12-31', 1), '2027-01-01');
  assert.equal(addDaysISO('2026-01-01', -1), '2025-12-31');
  assert.equal(addDaysISO('2026-09-04', 0), '2026-09-04');
});
test('diffDaysISO', () => assert.equal(diffDaysISO('2026-09-04', '2026-09-10'), 6));
test('isDue 边界', () => {
  assert.ok(isDue('2026-09-04', '2026-09-04'));
  assert.ok(isDue('2026-09-03', '2026-09-04'));
  assert.ok(!isDue('2026-09-05', '2026-09-04'));
});
```

- [ ] **Step 2: 运行验证失败**

Run: `node --test tests/date.test.js`
Expected: FAIL — module not found。

- [ ] **Step 3: 实现 date.js**

```js
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function todayISO() { return toISO(new Date()); }
function addDaysISO(iso, days) {
  const [y, m, dd] = iso.split('-').map(Number);
  return toISO(new Date(y, m - 1, dd + days));
}
function diffDaysISO(aISO, bISO) {
  const [y1, m1, d1] = aISO.split('-').map(Number);
  const [y2, m2, d2] = bISO.split('-').map(Number);
  return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000);
}
function isDue(iso, today) { return iso <= today; }
module.exports = { toISO, todayISO, addDaysISO, diffDaysISO, isDue };
```

- [ ] **Step 4: 运行验证通过**

Run: `npm test`
Expected: date 组 PASS。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: 日期工具(date.js)含单测"
```

---

### Task 3: SM-2 调度器(srs.js,TDD)

**Files:**
- Create: `miniprogram/utils/srs.js`
- Test: `tests/srs.test.js`

**Interfaces:**
- Consumes: `date.addDaysISO`。
- Produces: 常量 `EF_MIN=1.3` `Q_FORGOT=1` `Q_HAZY=3` `Q_GOOD=5`;`initialStudyState(todayISO)→SrsState`;`review(prev, q, todayISO)→SrsState`。Task 5 store、复习页依赖。

- [ ] **Step 1: 写失败测试** `tests/srs.test.js`

```js
const test = require('node:test');
const assert = require('node:assert');
const srs = require('../miniprogram/utils/srs');
const { EF_MIN } = srs;

test('学成初始态: ef2.5 / reps1 / interval1 / 次日到期', () => {
  const s = srs.initialStudyState('2026-09-04');
  assert.deepStrictEqual(s, { ef: 2.5, intervalDays: 1, reps: 1, dueDate: '2026-09-05' });
});

test('连续"记得":间隔 1→6→16→43 递增', () => {
  const s1 = srs.initialStudyState('2026-09-04');           // due 09-05
  const s2 = srs.review(s1, srs.Q_GOOD, '2026-09-05');      // reps2 → 6
  assert.deepStrictEqual({ ...s2 }, { ef: 2.6, intervalDays: 6, reps: 2, dueDate: '2026-09-11' });
  const s3 = srs.review(s2, srs.Q_GOOD, '2026-09-11');      // reps3 → round(6*2.6)=16
  assert.equal(s3.intervalDays, 16); assert.equal(s3.dueDate, '2026-09-27'); assert.equal(s3.ef, 2.7);
  const s4 = srs.review(s3, srs.Q_GOOD, '2026-09-27');      // round(16*2.7)=43
  assert.equal(s4.intervalDays, 43); assert.equal(s4.ef, 2.8);
});

test('"忘了"归零重置并降 EF', () => {
  let s = srs.initialStudyState('2026-09-04');
  s = srs.review(s, srs.Q_GOOD, '2026-09-05');
  s = srs.review(s, srs.Q_GOOD, '2026-09-11');              // ef2.7 reps3 interval16
  const r = srs.review(s, srs.Q_FORGOT, '2026-09-27');
  assert.equal(r.reps, 0); assert.equal(r.intervalDays, 1);
  assert.equal(r.ef, 2.5); assert.equal(r.dueDate, '2026-09-28');
});

test('"模糊"算通过但降 EF(q3 → −0.14)', () => {
  let s = srs.initialStudyState('2026-09-04');
  const r = srs.review(s, srs.Q_HAZY, '2026-09-05');
  assert.equal(r.reps, 2); assert.equal(r.intervalDays, 6);
  assert.ok(r.ef < 2.5);  // 2.5 − 0.14 = 2.36
  assert.equal(Math.round(r.ef * 100), 236);
});

test('EF 不低于 1.3', () => {
  let s = { ef: 1.31, intervalDays: 16, reps: 5, dueDate: '2026-09-04' };
  const r = srs.review(s, srs.Q_FORGOT, '2026-09-04');
  assert.equal(r.ef, EF_MIN);
});

test('lapse 后重新爬坡 1→6', () => {
  let s = srs.review({ ef: 2.5, intervalDays: 16, reps: 5, dueDate: '2026-09-01' }, srs.Q_FORGOT, '2026-09-10');
  assert.deepStrictEqual({ reps: s.reps, intervalDays: s.intervalDays }, { reps: 0, intervalDays: 1 });
  const good1 = srs.review(s, srs.Q_GOOD, s.dueDate);
  assert.equal(good1.intervalDays, 1);   // reps1
  const good2 = srs.review(good1, srs.Q_GOOD, good1.dueDate);
  assert.equal(good2.intervalDays, 6);   // reps2
});
```

- [ ] **Step 2: 运行验证失败**

Run: `node --test tests/srs.test.js` → FAIL module not found。

- [ ] **Step 3: 实现 srs.js**

```js
const { addDaysISO } = require('./date');
const EF_MIN = 1.3, EF0 = 2.5;
const Q_FORGOT = 1, Q_HAZY = 3, Q_GOOD = 5;

function clampEF(ef) { return Math.max(EF_MIN, Math.round(ef * 100) / 100); }

function initialStudyState(todayISO) {
  return { ef: EF0, intervalDays: 1, reps: 1, dueDate: addDaysISO(todayISO, 1) };
}

function review(prev, q, todayISO) {
  let { ef, intervalDays, reps } = prev;
  if (q < 3) {                       // 忘了
    reps = 0; intervalDays = 1; ef = clampEF(ef - 0.2);
  } else {                           // 记得 / 模糊
    reps += 1;
    if (reps === 1) intervalDays = 1;
    else if (reps === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * ef);   // ef 为更新前值
    const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
    ef = clampEF(ef + delta);
  }
  return { ef, intervalDays, reps, dueDate: addDaysISO(todayISO, intervalDays) };
}

module.exports = { EF_MIN, EF0, Q_FORGOT, Q_HAZY, Q_GOOD, initialStudyState, review };
```

- [ ] **Step 4: 运行验证通过**

Run: `npm test` → srs 组 PASS。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: SM-2 调度器(srs.js)含序列/重置/EF 单测"
```

---

### Task 4: 内容索引(content.js,TDD)

**Files:**
- Create: `miniprogram/utils/content.js`
- Test: `tests/content.test.js`

**Interfaces:**
- Consumes: `tests/helpers/content-fixture`(测试注入);生产路径 `require('../data/index')`。
- Produces: `buildIndex({roots,affixes,words})` → `{ roots, affixes, words, byId, rootWords(rid), affixWords(aid), sortedRoots, searchRoot(q), searchWord(q) }`;`getContent()`。Task 8+ 页面渲染依赖。

- [ ] **Step 1: 写失败测试** `tests/content.test.js`

```js
const test = require('node:test');
const assert = require('node:assert');
const fixture = require('./helpers/content-fixture');
const { buildIndex } = require('../miniprogram/utils/content');

const idx = buildIndex(fixture);

test('byId 命中', () => assert.equal(idx.byId('inspect').word, 'inspect'));
test('rootWords 聚合该根全族(4 词)且含词根段', () => {
  const list = idx.rootWords('root-spect');
  assert.equal(list.length, 4);
  assert.ok(list.every(w => w.breakdown.some(b => b.type === 'root' && b.refId === 'root-spect')));
});
test('affixWords 反查', () => {
  const ids = idx.affixWords('affix-in').map(w => w.id);
  assert.ok(ids.includes('inspect'));
});
test('sortedRoots 按 root 文本字母序', () => {
  assert.deepStrictEqual(idx.sortedRoots.map(r => r.root), ['spect']);
});
test('searchWord / searchRoot 子串命中', () => {
  assert.equal(idx.searchWord('spec')[0].id, 'inspect');
  assert.equal(idx.searchRoot('spec')[0].id, 'root-spect');
});
test('未知 id 返回空结果不抛错', () => {
  assert.equal(idx.rootWords('root-nope').length, 0);
  assert.equal(idx.byId('nope'), undefined);
  assert.equal(idx.searchWord('zzz').length, 0);
});
```

- [ ] **Step 2: 运行验证失败** — `node --test tests/content.test.js` → FAIL。

- [ ] **Step 3: 实现 content.js**

```js
function buildIndex({ roots, affixes, words }) {
  const byId = new Map(words.map(w => [w.id, w]));
  const rootWordsMap = new Map();   // rootId -> Word[]
  const affixWordsMap = new Map();  // affixId -> Word[]
  words.forEach(w => {
    const rootPart = w.breakdown.find(b => b.type === 'root');
    if (rootPart && rootPart.refId) {
      if (!rootWordsMap.has(rootPart.refId)) rootWordsMap.set(rootPart.refId, []);
      rootWordsMap.get(rootPart.refId).push(w);
    }
    w.breakdown.filter(b => (b.type === 'prefix' || b.type === 'suffix') && b.refId).forEach(b => {
      if (!affixWordsMap.has(b.refId)) affixWordsMap.set(b.refId, []);
      affixWordsMap.get(b.refId).push(w);
    });
  });
  const sortedRoots = [...roots].sort((a, b) => a.root.localeCompare(b.root));
  const searchWord = (q) => {
    const s = String(q || '').toLowerCase();
    if (!s) return [];
    return words.filter(w => w.word.toLowerCase().includes(s)).slice(0, 20);
  };
  const searchRoot = (q) => {
    const s = String(q || '').toLowerCase();
    if (!s) return [];
    return roots.filter(r => [r.root, ...(r.variants || [])].some(t => t.toLowerCase().includes(s))).slice(0, 20);
  };
  return {
    roots, affixes, words,
    byId: id => byId.get(id),
    rootWords: rid => rootWordsMap.get(rid) || [],
    affixWords: aid => affixWordsMap.get(aid) || [],
    sortedRoots, searchWord, searchRoot,
  };
}

let cached = null;
function getContent() {
  if (!cached) cached = buildIndex(require('../data/index'));
  return cached;
}

module.exports = { buildIndex, getContent };
```

- [ ] **Step 4: 运行验证通过**

Run: `npm test` → content 组 PASS。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: 内容索引(content.js)含词根/词缀/搜索单测"
```

---

### Task 5: 进度存取 store.js(TDD)

**Files:**
- Create: `miniprogram/utils/store.js`
- Test: `tests/store.test.js`

**Interfaces:**
- Consumes: `srs.initialStudyState/review/Q_FORGOT`、`date.isDue`。
- Produces: `createStore(storage)→Store`;`makeWxStore()→Store|null`。Store 方法见 File Structure。Task 8-11 页面与复习会话依赖。

- [ ] **Step 1: 写失败测试** `tests/store.test.js`

```js
const test = require('node:test');
const assert = require('node:assert');
const { createStore } = require('../miniprogram/utils/store');

function memStorage() { const m = {}; return { get: k => (k in m ? m[k] : ''), set: (k, v) => { m[k] = v; } }; }

test('markStudied 写初态且同日仅记一次 new', () => {
  const s = createStore(memStorage());
  s.markStudied('inspect', '2026-09-04');
  s.markStudied('inspect', '2026-09-04');          // 幂等
  const p = s.getProgress();
  assert.ok(p.cards.inspect);
  assert.equal(p.log['2026-09-04'].new, 1);
  assert.equal(p.cards.inspect.srs.dueDate, '2026-09-05');
});

test('applyReview 更新 SRS 并记 reviews/lapses', () => {
  const s = createStore(memStorage());
  s.markStudied('inspect', '2026-09-04');
  const r1 = s.applyReview('inspect', 5, '2026-09-05');     // 记得
  assert.equal(r1.applied, true);
  assert.equal(s.getProgress().cards.inspect.srs.intervalDays, 6);
  assert.equal(s.getProgress().log['2026-09-05'].reviews, 1);
  const r2 = s.applyReview('inspect', 1, '2026-09-11');     // 忘了
  assert.equal(r2.applied, true);
  const p = s.getProgress();
  assert.equal(p.cards.inspect.lapses, 1);
  assert.equal(p.log['2026-09-11'].reviews, 1);
  assert.equal(p.log['2026-09-11'].lapses, 1);
});

test('dueWords 到期排序:最久未到期在前;同日间隔短在前', () => {
  const mem = memStorage();
  const seed = { version: 1, log: {}, cards: {
    oldDue:    { srs: { ef: 2.5, intervalDays: 6,  reps: 2, dueDate: '2026-09-02' }, lapses: 0, studiedAt: '2026-09-01' },
    newDue:    { srs: { ef: 2.5, intervalDays: 16, reps: 3, dueDate: '2026-09-08' }, lapses: 0, studiedAt: '2026-09-01' },
    sameShort: { srs: { ef: 2.5, intervalDays: 3,  reps: 1, dueDate: '2026-09-06' }, lapses: 0, studiedAt: '2026-09-01' },
    sameLong:  { srs: { ef: 2.5, intervalDays: 8,  reps: 2, dueDate: '2026-09-06' }, lapses: 0, studiedAt: '2026-09-01' },
  } };
  mem.set('rm_progress_v1', JSON.stringify(seed));       // 存储键名见 spec §5.3
  const s = createStore(mem);
  const due = s.dueWords('2026-09-08');
  assert.deepStrictEqual(due, ['oldDue', 'sameShort', 'sameLong', 'newDue']);
  // oldDue(09-02)最早 → 同日 09-06 按 intervalDays 升序(3 先于 8)→ newDue(09-08)最晚
});
test('applyReview 不存在的词 no-op', () => {
  const s = createStore(memStorage());
  assert.equal(s.applyReview('ghost', 5, '2026-09-05').applied, false);
});
test('重置清空', () => {
  const s = createStore(memStorage());
  s.markStudied('a', '2026-09-04');
  s.reset();
  assert.deepStrictEqual(s.getProgress(), { version: 1, cards: {}, log: {} });
});
test('设置默认值与保存', () => {
  const s = createStore(memStorage());
  assert.deepStrictEqual(s.getSettings(), { reviewCapPerDay: 0, expandAssoc: false });
  s.saveSettings({ reviewCapPerDay: 20, expandAssoc: true });
  assert.deepStrictEqual(s.getSettings(), { reviewCapPerDay: 20, expandAssoc: true });
});
```

- [ ] **Step 2: 运行验证失败**

Run: `node --test tests/store.test.js` → FAIL。

- [ ] **Step 3: 实现 store.js**

```js
const srs = require('./srs');
const { isDue } = require('./date');
const KEY_P = 'rm_progress_v1';
const KEY_S = 'rm_settings_v1';
const DEFAULT_SETTINGS = { reviewCapPerDay: 0, expandAssoc: false };

function defaults() { return { version: 1, cards: {}, log: {} }; }

function bumpLog(log, iso, field, n) {
  log[iso] = log[iso] || { new: 0, reviews: 0, lapses: 0 };
  log[iso][field] += n;
  return log[iso];
}

function createStore(storage) {
  function read() {
    try { const raw = storage.get(KEY_P); if (!raw) return defaults(); const p = JSON.parse(raw); return p && p.version === 1 ? p : defaults(); }
    catch (e) { return defaults(); }
  }
  function persist(p) { try { storage.set(KEY_P, JSON.stringify(p)); } catch (e) { /* 静默降级内存态 */ } }

  function getProgress() { return read(); }
  function markStudied(wordId, iso) {
    const p = read();
    if (p.cards[wordId]) return p;                       // 幂等
    p.cards[wordId] = { srs: srs.initialStudyState(iso), lapses: 0, studiedAt: iso };
    bumpLog(p.log, iso, 'new', 1);
    persist(p); return p;
  }
  function applyReview(wordId, q, iso) {
    const p = read();
    const c = p.cards[wordId];
    if (!c) return { progress: p, applied: false };
    c.srs = srs.review(c.srs, q, iso);
    c.lastReviewAt = iso;
    bumpLog(p.log, iso, 'reviews', 1);
    if (q === srs.Q_FORGOT) { c.lapses += 1; bumpLog(p.log, iso, 'lapses', 1); }
    persist(p); return { progress: p, applied: true };
  }
  function dueWords(iso) {
    const p = read();
    return Object.entries(p.cards)
      .filter(([, c]) => isDue(c.srs.dueDate, iso))
      .sort(([, a], [, b]) => (a.srs.dueDate < b.srs.dueDate ? -1 : a.srs.dueDate > b.srs.dueDate ? 1 : a.srs.intervalDays - b.srs.intervalDays))
      .map(([id]) => id);
  }
  function reset() { try { storage.set(KEY_P, JSON.stringify(defaults())); } catch (e) {} }
  function getSettings() {
    try { const raw = storage.get(KEY_S); if (raw) { const s = JSON.parse(raw); return { ...DEFAULT_SETTINGS, ...s }; } } catch (e) {}
    return { ...DEFAULT_SETTINGS };
  }
  function saveSettings(patch) { const cur = getSettings(); try { storage.set(KEY_S, JSON.stringify({ ...cur, ...patch })); } catch (e) {} }

  return { getProgress, markStudied, applyReview, dueWords, reset, getSettings, saveSettings };
}

function makeWxStore() {
  if (typeof wx === 'undefined') return null;
  return createStore({ get: k => wx.getStorageSync(k), set: (k, v) => wx.setStorageSync(k, v) });
}

module.exports = { createStore, makeWxStore };
```

- [ ] **Step 4: 运行验证通过**

Run: `npm test` → store 组 PASS。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: 进度存取 store.js(幂等标记/复习更新/到期队列/重置/设置)"
```

---

### Task 6: 统计 stats.js(TDD)

**Files:**
- Create: `miniprogram/utils/stats.js`
- Test: `tests/stats.test.js`

**Interfaces:**
- Consumes: `date.addDaysISO`。
- Produces: `computeStats(progress, today)→{learned,familiar,dueToday,streak,last14}`、`familyProgressOf(words, cards)→{total,learned,familiar}`、`streakCompute(log,today)→int`。Task 11 profile 与首页进度环依赖。

- [ ] **Step 1: 写失败测试** `tests/stats.test.js`

```js
const test = require('node:test');
const assert = require('node:assert');
const { computeStats, familyProgressOf, streakCompute } = require('../miniprogram/utils/stats');
const { initialStudyState } = require('../miniprogram/utils/srs');

function mk(overrides) { return { version: 1, cards: {}, log: {}, ...overrides }; }
function card(iso, reps) { return { srs: { ...initialStudyState(iso), reps }, lapses: 0, studiedAt: iso }; }

test('computeStats 口径', () => {
  const p = mk({
    cards: {
      a: card('2026-09-01', 2),     // 熟悉; due=09-02(到期)
      b: card('2026-09-01', 1),     // 未熟; due=09-02(到期)
      c: card('2026-09-10', 1),     // 未来到期 09-11
    },
    log: { '2026-09-03': { new: 1, reviews: 2, lapses: 0 } },
  });
  const s = computeStats(p, '2026-09-10');
  assert.equal(s.learned, 3);
  assert.equal(s.familiar, 1);      // 仅 a(reps2)
  assert.equal(s.dueToday, 2);      // a、b
  assert.equal(s.streak, 0);        // log 仅 09-03,今日/昨日无
  assert.equal(s.last14.length, 14);
});

test('连续打卡:今日为尾;昨日为尾;无则 0', () => {
  const log = { '2026-09-08': { new: 1, reviews: 0, lapses: 0 }, '2026-09-09': { new: 1, reviews: 0, lapses: 0 } };
  assert.equal(streakCompute(log, '2026-09-09'), 2);
  assert.equal(streakCompute(log, '2026-09-10'), 2);   // 以昨日(09-09)为尾,09-09+09-08 → 连续 2 天
  assert.equal(streakCompute({}, '2026-09-10'), 0);
});

test('familyProgressOf', () => {
  const words = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const cards = { a: card('2026-09-01', 3), b: card('2026-09-01', 1) };
  assert.deepStrictEqual(familyProgressOf(words, cards), { total: 3, learned: 2, familiar: 1 });
});
```

> 说明:`card()` 里 `srs={...initialStudyState(iso), reps}` 保留了 initial 的 `dueDate=iso+1`。a/b(09-01)→due 09-02 均 ≤ 今日(09-10)→ dueToday=2;c(09-10)→due 09-11 未到期。

- [ ] **Step 2: 运行验证失败**

Run: `node --test tests/stats.test.js` → FAIL。

- [ ] **Step 3: 实现 stats.js**

```js
const { addDaysISO } = require('./date');

function hasAny(log, iso) { const d = log[iso]; return !!(d && (d.new || d.reviews)); }

function streakCompute(log, today) {
  const cursor = hasAny(log, today) ? today : addDaysISO(today, -1);
  if (!hasAny(log, cursor)) return 0;
  let streak = 0;
  for (let d = cursor; hasAny(log, d); d = addDaysISO(d, -1)) streak++;
  return streak;
}

function computeStats(progress, today) {
  const cards = progress.cards || {};
  const entries = Object.values(cards);
  const learned = entries.length;
  const familiar = entries.filter(c => c.srs.reps >= 2).length;
  const dueToday = entries.filter(c => c.srs.dueDate <= today).length;
  const log = progress.log || {};
  const streak = streakCompute(log, today);
  const last14 = [];
  for (let i = 13; i >= 0; i--) {
    const d = addDaysISO(today, -i);
    const l = log[d] || { new: 0, reviews: 0, lapses: 0 };
    last14.push({ date: d, new: l.new || 0, reviews: l.reviews || 0 });
  }
  return { learned, familiar, dueToday, streak, last14 };
}

function familyProgressOf(words, cards) {
  const ids = new Set(words.map(w => w.id));
  let learned = 0, familiar = 0;
  Object.entries(cards).forEach(([id, c]) => {
    if (!ids.has(id)) return;
    learned++;
    if (c.srs.reps >= 2) familiar++;
  });
  return { total: words.length, learned, familiar };
}

module.exports = { computeStats, familyProgressOf, streakCompute };
```

- [ ] **Step 4: 运行验证通过**

Run: `npm test` → stats 组 PASS。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: 统计 stats.js(口径/打卡/14 天/词族进度)"
```

---

### Task 7: 内容产出 · 前 10 词根家族

**Files:**
- Modify: `miniprogram/data/roots.js`、`affixes.js`、`families/family-*.js`(新增)、`data/index.js`

**Interfaces:**
- Consumes: fixture 已建的数据文件与 Task 1 校验器。
- Produces: 首批 10 个词根及家族完整 Word 数据(被 Task 8/9 扩展、Task 10+ UI 消费)。

- [ ] **Step 1: 新增词根与词缀记录(roots.js / affixes.js)**

在 `roots.js` 中把 spect 条目扩充到完整(含 `story`),并追加以下 10 个词根条目(**前 10 族含 spect**):`spect(看)`、`vis/vid(看)`、`dict(说)`、`scrib/script(写)`、`port(搬运)`、`duc/duct(引导)`、`mit/mis(送/放出)`、`struct(建造)`、`tract(拉/拖)`、`vert/vers(转)`。词根条目格式:`{ id:'root-<text>', root, variants:[...], zh, meaning, story? }`。spect 族由 fixture 的 4 词扩充到 ≥6 词。

在 `affixes.js` 按需增补上述家族将引用的词缀(前缀以 `-` 结尾、`type:'prefix'`;后缀以 `-` 开头、`type:'suffix'`),保证每个 breakdown 的 refId 都存在。常用:前缀 `re- pro- de- dis- con- com- ex- e- pre- sub- trans- inter- un- im- in-`;后缀 `-tion -sion -ment -ive -able -ible -er -or -al -ous -ity`。允许收录暂时未被引用的词缀(后续家族会用)。

- [ ] **Step 2: 新增家族文件**

每词根一个 `miniprogram/data/families/family-<root>.js`,`module.exports = [ ...Word ]`。**必须遵守**:

1. 每词满足 Task 1 的 6 条不变量(尤其:各段 `part` 拼接 === 词;恰 1 个 `root` 段 `refId` 指向本族词根;`senses/phonetic/examples` 齐全)。
2. 词根语义把持:同一族内各词的 root 段拼写须是 `variants` 之一(如 duc 族可用 `duc`/`duct`)。
3. **词形不占族名额**:同一词根的派生词形(produce→product/production/productive)放主词的 `assoc.derivatives`,不单列为家族新词。
4. 联想取舍:同族互指不重复;`synonyms/antonyms/confusing` 仅在**跨根或跨词**时才填(如 inspect↔examine);`confusing` 必须带一句话 `diff`;`story` 可选(缺省用词根 story 兜底)。
5. 例句 1~2 条、中英对照、难度贴合 CET4/6;生僻义不作主义项。
6. 词根 `-e` 结尾派生可用 `{ part:'e', type:'none' }` 段占位(渲染层隐藏,但仍参与拼接校验)。

**族规模**:每族 ≥5 词;前 10 族合计 ≥60 词(最终 30 族 ≥200)。

`data/index.js` 把每个新家族 `require` 进 `words`:
```js
const familySpect = require('./families/family-spect');
const familyVis = require('./families/family-vis');
// ... 每个新增家族一行
module.exports = { roots, affixes, words: [...familySpect, ...familyVis, /* ... */] };
```

- [ ] **Step 3: 跑校验门禁**

Run: `npm run validate`
Expected: `✓ 内容通过: N roots / M affixes / ≥60 words`,**0 错误**。有任何错误逐条修复后重跑。

- [ ] **Step 4: 回归**

Run: `npm test` → 全绿(Task 1-6 用例不依赖具体词量)。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(content): 前 10 词根家族数据(≥60 词)通过不变量校验"
```

---

### Task 8: 内容产出 · 中 10 词根家族

**Files:**
- Modify: `roots.js`、`affixes.js`、`families/family-*.js`(新增)、`data/index.js`

**Interfaces:**
- 同 Task 7;新增词根(中 10 族):`form(形状)`、`press(压)`、`grad/gress(步/走)`、`ced/ceed/cess(行走/让步)`、`pend/pens(悬挂/付)`、`pos/pon(放置)`、`tend/tent(伸向)`、`cept/cip(拿)`、`ven/vent(来)`、`pel/puls(推)`。

- [ ] **Step 1:** 按 Task 7 Step 1-2 的同一规范为这 10 族新增词根记录、补齐所需词缀、新增家族文件并接入 `data/index.js`;全部 Word 满足 6 条不变量与词形/联想取舍规则。
- [ ] **Step 2: 跑校验门禁** — `npm run validate` → 0 错误、总量 ≥120。
- [ ] **Step 3: 回归** — `npm test` 全绿。
- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(content): 中 10 词根家族数据(≥120 词)"
```

---

### Task 9: 内容产出 · 后 10 词根 + 全量收口

**Files:**
- Modify: `roots.js`、`affixes.js`、`families/family-*.js`(新增)、`data/index.js`

**Interfaces:**
- 完成 spec §10 的 30 词根全覆盖。新增词根(后 10 族):`val/vail(价值/力量)`、`phon(声音)`、`graph(写/画)`、`log(说/学科)`、`luc/lux(光)`、`man(手)`、`mob/mot(动)`、`nov(新)`、`norm(规则)`、`numer(数)`。

- [ ] **Step 1:** 按 Task 7 规范补齐后 10 族;每族满足不变量、规模 ≥5。
- [ ] **Step 2: 全量门禁** — `npm run validate` → 0 错误;控制台应打印 `30 roots / 约40 affixes / ≥200 words`。roots=30 且 words≥200 即达标;affixes 计数报告即可。
- [ ] **Step 3: 抽样复核(提交说明)** — 抽查 5 个词的 phonetic/释义/例句是否自然(如 respect/conduct/transport/construct/educate),不合格就地修。
- [ ] **Step 4: 回归** — `npm test` 全绿。
- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(content): 后 10 词根家族 + 全量 30 根≥200 词收口"
```

---

### Task 10: 应用外壳 + 设计令牌 + Tab 骨架

**Files:**
- Create: `miniprogram/app.js`、`app.json`、`app.wxss`
- Create: `miniprogram/pages/{index,root-detail,word,review,profile}/*`(5 个最小可渲染 stub)

**Interfaces:**
- Consumes: 无(纯外壳)。
- Produces: 底部 3 Tab(学习/复习/我的)与可加载页面壳,供 Task 11-14 填充。

- [ ] **Step 1: app.json(注册页面 + 文本型 tabBar)**

```json
{
  "pages": [
    "pages/index/index",
    "pages/root-detail/root-detail",
    "pages/word/word",
    "pages/review/review",
    "pages/profile/profile"
  ],
  "window": {
    "navigationBarTitleText": "词根地图",
    "navigationBarBackgroundColor": "#FFFFFF",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#F8FAFC"
  },
  "tabBar": {
    "color": "#64748B", "selectedColor": "#3B82F6",
    "backgroundColor": "#FFFFFF", "borderStyle": "white",
    "list": [
      { "pagePath": "pages/index/index", "text": "学习" },
      { "pagePath": "pages/review/review", "text": "复习" },
      { "pagePath": "pages/profile/profile", "text": "我的" }
    ]
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

- [ ] **Step 2: app.wxss 设计令牌**

把 spec §8 令牌写成基础样式 + 通用类:`.card{background:#fff;border-radius:24rpx;box-shadow:0 2rpx 12rpx rgba(15,23,42,.06);padding:24rpx}`、`.grad{background:linear-gradient(135deg,#3B82F6,#4F46E5)}`、文字色 `.t-1{color:#0F172A}` `.t-2{color:#334155}` `.t-3{color:#64748B}`、`.pill`、`.btn-primary/.btn-ghost/.btn-danger`、`.chip`、`.flex-row/.flex-between`。

- [ ] **Step 3: app.js 空壳** — `App({ globalData: {} })`。
- [ ] **Step 4: 5 个 stub 页面**

每个页面 4 件套(`.js/.json/.wxml/.wxss`):`.json` 设标题(首页「词根地图」、词根详情「词根家族」、学单词「学单词」、复习「复习」、我的「我的」);`.js` 仅 `Page({ data: {} })`;wxml 居中灰字「建设中」。新建 `sitemap.json`:`{"rules":[{"action":"allow","page":"*"}]}`。

- [ ] **Step 5: 手工验证(微信开发者工具)**

打开工程根目录(自动定位 `miniprogram/`),确认:5 页面可切换、底部 3 Tab 文案正确、无控制台报错。截图存 `docs/qa/m10-shell.png`。

> 若本环境无微信开发者工具,此项交用户执行,并在完成说明中标注「待用户 DevTools 验证」。

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: 应用外壳 + 设计令牌 + Tab 骨架(5 页面 stub)"
```

---

### Task 11: 词根地图首页 + 词根详情

**Files:**
- Create: `miniprogram/components/RootCard/*`、`AffixRow/*`、`Chip/*`、`ProgressRing/*`、`EmptyState/*`
- Modify: `pages/index/*`、`pages/root-detail/*`(组件 BreakdownBar 迷你拆解在 Task 12 落位,此处列表先用彩色 text 拼装亦可)

**Interfaces:**
- Consumes: `getContent()`(sortedRoots/roots/affixes/rootWords/affixWords/byId)、`stats.familyProgressOf`、`store.makeWxStore()`。
- Produces: 首页(词根卡片网格 + 词根/前后缀切换 + 搜索跳转)与词根详情(讲解 + 家族列表 + 开始学习跳 `pages/word?rootId=…&wordId=首词`)。为 Task 12 学单词页提供入口参数 `wordId`、`rootId`。

- [ ] **Step 1: 首页 JS 组装数据**

`pages/index/index.js`:
```js
const { getContent } = require('../../utils/content');
const { familyProgressOf } = require('../../utils/stats');
const { makeWxStore } = require('../../utils/store');

Page({
  data: { mode: 'root', roots: [], affixes: [], kw: '' },
  onShow() { this.refresh(); },
  refresh() {
    const c = getContent();
    const store = makeWxStore();
    const cards = store ? store.getProgress().cards : {};
    const roots = c.sortedRoots.map(r => ({ ...r, ...familyProgressOf(c.rootWords(r.id), cards) }));
    this.setData({ roots, affixes: c.affixes });
  },
  switchMode(e) { this.setData({ mode: e.currentTarget.dataset.mode }); this.refresh(); },
  onSearchInput(e) { this.setData({ kw: e.detail.value }); },
  goRoot(e) { wx.navigateTo({ url: `/pages/root-detail/root-detail?rootId=${e.currentTarget.dataset.id}` }); },
  goWord(e) { wx.navigateTo({ url: `/pages/word/word?wordId=${e.currentTarget.dataset.id}` }); },
});
```
`RootCard` 展示:root 大字 + variants chips + zh/meaning + `total/learned` 徽标 + `ProgressRing(learned/total)`;onTap 跳词根详情。词根模式用 `roots`;前后缀模式用 `affixes`(`AffixRow` 显示 text/type/zh/note,onTap 展开关联词 `affixWords` 前 8 个的列表)。首页搜索 `input`(`bindinput`)后按 `kw` 用 `searchRoot/searchWord` 过滤当前视图,命中单词直接跳 word 页、命中词根跳 root-detail;结果空 → `EmptyState`。

- [ ] **Step 2: 词根详情页**

`pages/root-detail/index.js`:`onLoad(options)` 取 `rootId` → `getContent()` 取 root、`rootWords(rootId)`;再取 store cards 算 `familyProgressOf`。wxml:头部(字根大字 + variants + zh/meaning + 可折叠 story)+ 进度 + 家族词列表(每行:迷你拆解着色拼装 + word + 折叠释义,已学词加 ✓ 角标)→ 底部【开始学习本族】:跳 `pages/word/word?rootId=X&wordId=<族内第一个未学词的 id,全学完则第一个>`。

- [ ] **Step 3: 手工验证(DevTools/用户)**

词根地图:≥30 词根卡、每卡家族词数与进度;切换前后缀视图;搜「spec」→ 命中 spect、搜「inspect」→ 命中词。词根详情:spect 家族列表完整、点词可跳到 word 页(stub 可暂显 id)。
- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: 词根地图首页 + 词根详情 + 家族列表"
```

---

### Task 12: 学单词页 + 学习闭环 + BreakdownBar 组件

**Files:**
- Create: `miniprogram/components/BreakdownBar/*`、`WordStudyCard/*`、`AssocSection/*`、`ExampleList/*`、`AffixPop/*`
- Modify: `pages/word/*`、复用 `pages/root-detail` 的迷你拆解(改由 BreakdownBar 的 mini 模式渲染)

**Interfaces:**
- Consumes: `getContent().byId/rootWords/affixWords`、`makeWxStore().getProgress/markStudied`、settings。
- Produces: 完成「学词 → markStudied → 家族内推进」闭环,进度供复习页/我的页消费。

- [ ] **Step 1: BreakdownBar 组件(可交互 + mini 两模式)**

`components/BreakdownBar/index.js` 接收 `parts`(breakdown 数组),`properties:{ parts:Array, interactive:Boolean }`。渲染:前缀段青 `#06B6D4`、词根段主蓝 `#3B82F6`、后缀段紫 `#8B5CF6`、`type==='none'` 段隐藏文字只留窄隙;interactive 时段点击触发 `triggerEvent('tapbreak', { ref, type })`。minic 模式(interactive=false)用于列表行内拆解。词根详情页将列表拆解换用该组件 mini 模式。

- [ ] **Step 2: 学单词页状态与数据**

`pages/word/index.js`:
```js
const { getContent } = require('../../utils/content');
const { makeWxStore } = require('../../utils/store');
const { todayISO } = require('../../utils/date');

Page({
  data: { w: null, family: [], familyIndex: 0, inPool: false, isLast: false, expandAssoc: false, popAffix: null },
  onLoad(o) {
    const c = getContent();
    const rootId = o.rootId || (o.wordId ? (() => { const w = c.byId(o.wordId); return w && w.breakdown.find(b => b.type === 'root').refId; })() : null);
    const family = rootId ? c.rootWords(rootId) : [];
    const store = makeWxStore();
    this._c = c; this._store = store; this._family = family;
    const start = rootId ? Math.max(0, family.findIndex(x => x.id === o.wordId)) : 0;
    this.setData({ expandAssoc: !!(store && store.getSettings().expandAssoc), family });
    this.showAt(start);
  },
  showAt(i) {
    const w = this._family[i]; if (!w) return;
    this._cur = i;
    const cards = this._store ? this._store.getProgress().cards : {};
    this.setData({ w, familyIndex: i, inPool: !!cards[w.id], isLast: i === this._family.length - 1 });
  },
  onBreak(e) {
    const { ref, type } = e.detail;
    if (type === 'root') wx.navigateTo({ url: `/pages/root-detail/root-detail?rootId=${ref}` });
    else this.setData({ popAffix: ref });
  },
  onAffixClose() { this.setData({ popAffix: null }); },
  markLearned() {
    const s = this._store; if (!s) return;
    const w = this.data.w; if (!w) return;
    if (!s.getProgress().cards[w.id]) s.markStudied(w.id, todayISO());
    this.next();
  },
  doneReturn() { wx.navigateBack(); },
  prev() { this.showAt(Math.max(0, this._cur - 1)); },
  next() {
    const n = this._cur + 1;
    if (n >= this._family.length) { wx.navigateBack(); wx.showToast({ title: '本族已学完', icon: 'none' }); return; }
    this.showAt(n);
  },
  goWord(e) { wx.navigateTo({ url: `/pages/word/word?wordId=${e.currentTarget.dataset.id}` }); },
});
```
> `markLearned` 幂等(store 保证不重复计 new);`onLoad` 无 rootId 时从 wordId 反推词根。已在池的词按钮显示「完成 · 返回」→ `doneReturn`。

- [ ] **Step 3: 学单词 WXML 结构(自上而下,防信息过载)**

1. 词头条:word 大字 + phonetic + tags chip;inPool 显示「已在词库」角标。
2. **构词拆解**:WordStudyCard 内放可交互 BreakdownBar。
3. 释义列表(pos + zh)。
4. **AssocSection 折叠分组**(标题带计数,默认折叠;`expandAssoc` 设置默认展开):
   - 同根词族 = `rootWords(rootId)` 去除当前词 → 词 chips → 点跳 `word?wordId=…`。
   - 派生词形 = `assoc.derivatives` 的 id → `byId` 名 chips。
   - 同义/反义 = `assoc.synonyms/antonyms` → chips(带「同义/反义」角标)。
   - 形近易混 = `assoc.confusing` 的 `{id,diff}` 列表。
   - 词源助记 = `assoc.story || root.story`。
5. ExampleList(1~2 条,en 主色 + zh 灰)。
6. 底部固定条:左【再看看】→ prev/next 族内翻;右【记住了】(未在池)或【完成 · 返回】(在池)。
7. AffixPop:半屏弹层,标题 = 词缀 text + zh,内容 = `affixWords(ref)` 前 8 个关联词名 + note。
- [ ] **Step 4: 手工验证(DevTools/用户)**

学 spect 族 3 词【记住了】→ 词根地图 spect 卡进度增长、我的页已学 +3、复习页显示「明日到期 3」;点词根段可回词根详情;点前后缀段弹 AffixPop。
- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: 学单词页 + BreakdownBar + 联想分组 + 学习闭环"
```

---

### Task 13: 复习页 + SM-2 会话

**Files:**
- Create: `miniprogram/pages/review/*`、`components/ReviewCard/*`

**Interfaces:**
- Consumes: `store.dueWords/applyReview/getSettings`、`getContent().byId`、`srs.Q_*`。
- Produces: 复习会话完整闭环;reviews/lapses 写入 log(store 内),供 profile 统计。

- [ ] **Step 1: 复习会话逻辑**

`pages/review/index.js` 状态机 `idle → reviewing → done`:
```js
const { makeWxStore } = require('../../utils/store');
const { getContent } = require('../../utils/content');
const { todayISO } = require('../../utils/date');

Page({
  data: { phase: 'idle', dueTotal: 0, cap: 0, queue: [], i: 0, shown: false, done: null },
  onShow() { if (this.data.phase === 'idle') this.loadDue(); },
  loadDue() {
    const store = makeWxStore(); if (!store) return;
    const cap = store.getSettings().reviewCapPerDay || 0;
    const today = todayISO();
    const due = store.dueWords(today);
    const queue = cap > 0 ? due.slice(0, cap) : due;
    this._store = store;
    this.setData({ phase: 'idle', dueTotal: due.length, cap, queue, i: 0, shown: false, done: null });
  },
  start() { if (this.data.queue.length) this.setData({ phase: 'reviewing', i: 0, shown: false }); },
  flip() { this.setData({ shown: true }); },
  grade(e) {
    const q = Number(e.currentTarget.dataset.q);
    const id = this.data.queue[this.data.i];
    this._store.applyReview(id, q, todayISO());
    const ni = this.data.i + 1;
    if (ni >= this.data.queue.length) {
      const dueLeft = this._store.dueWords(todayISO()).length;
      this.setData({ phase: 'done', shown: false, done: { total: this.data.queue.length, dueLeft } });
    } else this.setData({ i: ni, shown: false });
  },
  finish() { this.setData({ phase: 'idle', queue: [], i: 0, shown: false, done: null }); this.loadDue(); },
});
```
当前词经 `getContent().byId(queue[i])` 取;翻面前只显示 word + phonetic(不显示构词/联想以免提示),翻面后显示释义 + 简短构词(首段 root 名)+ 首条例句 + 所属词根名(由词根段 refId → root.root)。三键 `data-q=1/3/5`。

- [ ] **Step 2: 复习页 WXML**

- idle:大数字「今日待复习 N」(+「(上限 M)」若 cap>0)+【开始复习】;N=0 → EmptyState「今天没有到期的词,去词根地图学点新的」+ CTA 跳首页。
- reviewing:顶部 `i+1 / total` 进度 + ReviewCard(shown 前「点击翻面」/ shown 后三键)。
- done:结果卡「本次复习 X 张,还剩 Y 张待复习」+【完成】。
- [ ] **Step 3: 手工验证(DevTools/用户)**

Task 12 学 3 词后,手动把 `wx.getStorageSync('rm_progress_v1')` 中该 3 词 `dueDate` 改成今天 → 复习记得/模糊/忘了各点一次 → 核对 SRS 变化(忘了 reps0、记得 interval6)与 log。
- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: 复习页 + SM-2 自评会话"
```

---

### Task 14: 我的页 + 端到端 QA 收口

**Files:**
- Create: `miniprogram/pages/profile/*`、`components/StatBar/*`(14 天柱)
- Create: `docs/qa/*.png`(走查截图)

**Interfaces:**
- Consumes: `computeStats`、`store`(重置/设置)、`getContent`。
- Produces: 完整可演示首版。

- [ ] **Step 1: profile 页**

统计卡 ×3(今日待复习 / 累计已学 / 熟悉词)+ 连续打卡徽标;近 14 天 StatBar(纯 view 柱高 = `new`(蓝)与 `reviews`(绿)双色并排,纵轴按当日合计归一)。设置:每日复习上限(`picker`:0/10/20/30/50,0=不限)、学习页默认展开联想(`switch`),写 `saveSettings`。底部【重置学习数据】→ `wx.showModal` 二次确认 → `store.reset()` → 刷新。关于:版本 + `roots/affixes/words` 计数。

- [ ] **Step 2: 端到端走查(用户/DevTools,按 spec §12)**

1. 词根地图 → spect → 学族内 3 词【记住了】→ 首页/我的已学 +3、复习 tab 显示明日到期。
2. 改 `rm_progress_v1` 中该 3 词 `dueDate` 为今天 → 复习页三档各点一次 → 回看 SRS(忘了 reps0、记得 interval6)与 log。
3. 我的页 14 天柱、连续打卡、重置流程。
4. 截图 `docs/qa/{m10-shell,m11-index,m12-word,m13-review,m14-profile}.png`;控制台无报错;`npm test` 与 `npm run validate` 均绿。
- [ ] **Step 3: README 收尾**(简介/特性/运行/测试/内容规模)。
- [ ] **Step 4: 最终 Commit**

```bash
git add -A && git commit -m "feat: 我的页(统计/14 天/设置/重置) + 端到端 QA"
```
