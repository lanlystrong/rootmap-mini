# 词根地图 · 英语单词学习小程序 — 设计文档

- **日期**: 2026-09-04
- **类型**: 微信小程序(原生,纯本地),首版可运行原型
- **工程位置**: `e:\projects\rootmap-mini`
- **产品代号**: 词根地图(RootMap)
- **UI 语言**: 中文为主,英文为内容主体

---

## 1. 背景与目标

面向**大学四六级(CET-4/6)与通用高频词**学习者的英语单词记忆小程序。核心主张:

> 不以"孤立单词"为单位,而以**词根 + 前后缀构词法**为主线讲透单词,学习时通过**联想**(同根词族/派生词形/同义反义/形近音近/词源助记)成组记忆;学完进入 **SM-2 记忆曲线复习计划**,到期自动提醒复习。

首版为**纯本地、可运行、可验证闭环**的原型:内置精选种子词库,进度存于 `wx storage`,在微信开发者工具即可完整走通「浏览词根地图 → 学习单词 → 形成复习计划 → 次日到期复习 → 曲线生效」。

## 2. 范围与非目标(首版)

### 范围内
- 原生微信小程序(WXML/WXSS/JS,CJS 模块),无第三方 UI 库。
- 内置种子内容:约 **30 个词根、~40 个前后缀、~250 个单词**,全部含构词拆解 + 联想 + 中英双语例句。
- 三条产品线:① 词根地图(学习);② 复习(SM-2 到期队列 + 自评回忆);③ 我的(统计 / 设置 / 重置)。
- 内容完整性自动校验(脚本门禁)+ 调度算法单元测试。

### 范围外(首版不做)
- 后端 / 云开发 / 账号登录 / 跨设备同步。
- 发音音频(仅显示音标;小程序无免费内置 TTS,在线词典发音后续再议)。
- 社交分享、打卡排行、导出导入、后台内容编辑 UI(改数据 = 直接改种子 JSON 再跑校验)。
- 真实生产发布所需的合规/隐私、多词书精细分级。

## 3. 技术方案

| 项 | 选型 | 说明 |
|---|---|---|
| 框架 | 原生小程序 | 无构建依赖,开发者工具直跑 |
| 模块 | CommonJS(`require`/`module.exports`) | 小程序原生支持;内容以 `.js` 数据模块内置 |
| 数据 | 静态种子(内置)+ `wx.setStorageSync` 进度 | 免服务器 |
| 调度 | SM-2(自研纯函数 `utils/srs.js`) | 无副作用、无 Date 全局依赖,可单测 |
| 测试 | Node `node:test`(`npm test`)+ 内容校验脚本 | 零框架 |

工程顶层 `package.json` 仅承载脚本(`scripts/validate-content.js`)与测试(`tests/`),**与小程序运行时解耦**(小程序只运行 `miniprogram/` 目录)。

## 4. 信息架构

底部 Tab 3 个:**学习(词根地图)· 复习 · 我的**。

| 页面 | 路径 | 内容 |
|---|---|---|
| 词根地图(首页) | `pages/index` | 顶部搜索(词根/单词);入口切换:【词根】【前后缀】;词根卡片网格 |
| 词根详情 | `pages/root-detail` | 词根讲解 + 变体 + 词源助记;家族单词列表(词/释义折叠/迷你拆解);逐词进入学习 |
| 学单词 | `pages/word` | 单词学习页:构词拆解 + 联想分组 + 双语例句;【记住了 / 再看看】推进 |
| 复习 | `pages/review` | 今日到期数 → 复习卡片流 → 完成统计;无到期显示空态 |
| 我的 | `pages/profile` | 统计、近 14 天学习条、设置(每日复习上限、内容展示开关)、数据重置、关于 |

**词根地图卡片网格**每张卡:字根(如 `spect`)+ 变体(如 spec/specul)+ 中文义(看)+ 家族单词数 + 家族"已学/已掌握"进度环。

**前后缀子视图**:与词根同构的前后缀卡片(如 `in- 向内`,`-tion 名词化`),点进展示说明 + 关联单词示例(从已有 Word 反查),不新建词库。

## 5. 数据模型

### 5.1 内容层(静态内置,种子 JSON→.js 数据模块)

```ts
// ---- 词根 ----
interface Root {
  id: string;                 // "root-spect"
  root: string;               // "spect"
  variants: string[];         // ["spec", "spect"]  词根拼写变体
  zh: string;                 // "看"
  meaning: string;            // 一句话释义(中文)
  story?: string;             // 词源故事/画面助记(联想素材之一)
}

// ---- 前后缀 ----
interface Affix {
  id: string;                 // "affix-in"
  text: string;               // "in-"
  type: "prefix" | "suffix";
  zh: string;                 // "向内 / 否定"
  note?: string;              // 说明(含 in- 双重语义提醒等)
}

// ---- 单词 ----
interface WordSense { pos: string; zh: string; en?: string }  // 义项,通常 1~3 条

interface BreakdownPart {
  part: string;               // 该段拼写,如 "in"
  type: "prefix" | "root" | "suffix" | "none";
  zh?: string;                // 该段含义(构词直观化用)
  refId?: string;             // prefix/suffix → affix.id; root → root.id
}

interface WordAssoc {
  synonyms?: string[];        // 同义词(word id)
  antonyms?: string[];        // 反义词(word id)
  derivatives?: string[];     // 派生词形(word id)
  confusing?: { id: string; diff: string }[];  // 形近/音近易混 + 一句话辨析
  story?: string;             // 词源助记(该词专属,可覆盖 root.story)
}

interface Word {
  id: string;                 // "inspect"
  word: string;               // "inspect"
  phonetic: string;           // "/ɪnˈspekt/"
  senses: WordSense[];
  breakdown: BreakdownPart[];   // 约束:各段 part 顺次拼接 === word
  tags: ("cet4" | "cet6" | "高频")[];
  examples: { en: string; zh: string }[];  // 1~2 条,中英对照
  assoc: WordAssoc;
}
```

**关系约定**
- 同根词族:由 `breakdown` 中 `type:"root"` 的段反查——**同一 `rootId` 的所有 Word 即一族**(不在 assoc 里重复存),避免双向引用漂移。
- 派生词形 / 同义 / 反义 / 易混:以 `word id` 引用;展示时按需从索引反查显示(种子校验保证可解析)。
- 展示裁剪:列表页/复习卡只用 id→(word, phonetic) 的反查表(内存索引),进入详情页才加载全文。

**内容不变量(校验脚本强制)**:
1. `breakdown` 各段 `part` 拼接 === `word`(大小写不敏感首字母除外)。
2. 每个 root/suffix/prefix 引用(`refId`)必须存在。
3. `assoc` 内所有 `id` 必须存在,且**不包含自身**。
4. 每词 `examples.length ≥ 1`,且 `senses.length ≥ 1`、`phonetic` 非空。
5. `root.variants` 非空;根 `root.id` 全局唯一。
6. 每个 Word 的 `breakdown` **恰好含 1 个 `type:"root"` 段**且其 `refId` 指向存在的 Root —— 保证词根地图可及性(无孤儿词),词根地图仅呈现这些词根。

### 5.2 运行时内容索引(`utils/content.js`)

加载种子后构建:`byId(wordId→Word)`、`byRoot(rootId→Word[])`、`byAffix`、`byTag`、搜索(词根/单词前缀匹配)。纯函数 + 惰性单例,无副作用。

### 5.3 用户进度层(wx storage,版本化)

存储键:`rm_progress_v1`、`rm_settings_v1`(写入 try/catch,失败降级内存态)。

```ts
interface SrsState {
  ef: number;           // 初始 2.5
  intervalDays: number; // 当前间隔天数
  reps: number;         // 连续通过复习次数
  dueDate: string;      // 'YYYY-MM-DD';到期 = dueDate <= 今天
}

interface CardProgress {
  srs: SrsState;
  lapses: number;         // 累计"忘了"次数
  studiedAt: string;      // 首次学成日期(写入即入池)
  lastReviewAt?: string;
}
// 卡片有记录 = 已学/在池;熟悉与否按 srs.reps ≥ 2 派生,不另存状态位,避免双源漂移。

interface DailyLog { [date: string]: { new: number; reviews: number; lapses: number } }

interface Progress {
  version: 1;
  cards: Record<string, CardProgress>;  // key = word.id
  log: DailyLog;
}

interface Settings {
  reviewCapPerDay: number;  // 0 = 不限制
  expandAssoc: boolean;     // 学习页默认展开联想(默认折叠)
}
```

**统计口径**:已学词 = `cards` 有记录(即已入池);熟悉词 = `srs.reps ≥ 2`;今日待复习 = `cards` 中 `dueDate ≤ today`。连续打卡 = 自今日或昨日往前,`log` 中连续有"学习或复习记录"的天数(今天有记录则以今天为尾,否则以昨天为尾;今天与昨天均无记录则为 0)。

## 6. SM-2 复习调度规范(`utils/srs.js`)

纯函数、**无全局 Date / 无存储副作用**;日期只做字符串运算,由调用方传入 `todayISO`(便于测试与跨零点一致性)。日粒度:学成次日可复习。

### 三档自评 → 分数

| UI | q | 语义 |
|---|---|---|
| 忘了 | 1 | 失败:间隔归 1 天、reps 归零、EF −0.2(下限 1.3) |
| 模糊 | 3 | 通过但吃力:推进 reps 与间隔,**EF 按 SM-2 公式下调** |
| 记得 | 5 | 顺利通过:推进,EF +0.1 |

### 状态迁移

```
initial 状态(学成"记住了"那一刻写入):
  { ef: 2.5, intervalDays: 1, reps: 1, dueDate: today + 1 }
  // 把"学成"视为一次成功复习(rep1):次日即为首次到期复习。

复习当天传入 grade(q) 与 todayISO:
  if q < 3 (忘了):
    reps = 0; intervalDays = 1
    ef = max(1.3, ef - 0.2)
  else (q = 3 或 5):
    reps += 1
    intervalDays =
        reps === 1 ? 1
      : reps === 2 ? 6
      : round(intervalDays * ef)          // ef 取更新前值
    ef = clamp(1.3, ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))   // q5:+0.1; q3:−0.14
  dueDate = todayISO + intervalDays
```

> 示例(初始后连续"记得"):学成次日 → 第 2 天复习(间隔 1)→ 第 8 天复习(间隔 6)→ 第 24 天复习(间隔 16,本次乘数 ef=2.6)→ 第 67 天复习(间隔 43,乘数 ef=2.7)→ ……间隔按 ×EF 增长,EF 随"记得"每次 +0.1。
> "忘了"后:间隔重置 1 天并降 EF,reps 归零 → 重新走 1→6→×EF 上升坡。

### 复习会话行为
- 复习队列 = 池内所有 `dueDate ≤ today`;顺序:**最久未到期(旧)优先**,同天按 intervalDays 升序(先短后长)。
- 复习中的"模糊/忘了"卡片**当天不重新入队**(day 粒度,SRS 已重排到期日),避免死循环。
- 会话结束:把本日 `reviews`、`lapses` 记入 `log`;若到期数被 `reviewCapPerDay` 截断,剩余卡片仍显示"还有 N 张待复习"。

## 7. 关键交互设计

### 7.1 词根地图首页
- 卡片网格(2 列)按根字母排序;每卡显示字根/变体/中文义/家族词数/进度环。
- 顶部搜索:命中词根名或单词 → 跳到对应词根详情 / 单词学习页。
- 入口切换【词根 | 前后缀】。

### 7.2 词根详情页
- 头部:字根大字 + 变体 chips + 中文义 + 词源故事(可折叠)。
- "本族单词"列表:每行 word + 音标 + 折叠释义 + 迷你拆解(如 `in·spect` 分段着色);已学词有状态角标。
- 底部【开始学习本族】按序进入 `pages/word`。

### 7.3 学单词页(防信息过载,自上而下)
1. 顶部词头条:word 大字 + 音标 + tag(四六级/高频)。
2. **构词拆解条**:`in-`+`spect`+`-ion` 分段着色;点前后缀段 → 底部弹层显示该 affix 含义;点词根段 → 回到该词根详情。
3. 释义(义项列表)。
4. **联想分组**:标题栏带计数的折叠卡(默认折叠,`expandAssoc` 设置可默认展开):
   - 同根词族(chips,点击 → 学/看那个词)
   - 派生词形(chips)
   - 同义 / 反义(chips)
   - 形近易混(列表:词 + 一句话辨析)
   - 词源助记(文本)
5. 双语例句 1~2 条。
6. 底部操作条:
   - 【再看看】→ 停留,可上下滑动浏览联想/例句,不写进度。
   - 该词**未在池**时显示【记住了】:写 `CardProgress`(initial 状态,§6)+ 记 `log[today].new`,跳到本族下一个未学词;本族学完 → 返回词根详情并提示。
   - 该词**已在池**(曾学过)时按钮改为【完成 · 返回族列表】,只做跳转,**不重复写入 / 不重复计入 new**。

> 同族词在词根地图内 **线性推进**(上一词/下一词),既避免漫游,又强化"成组学"。

### 7.4 复习页
1. 入场:今日到期 N(≤ 上限)、预计 X 分钟;【开始复习】。
2. 卡片:正面 word + 音标 → 内心回想 → 点击翻面:释义 + 构词 + 例句 + 所属词根名。翻面前不展示联想(避免提示)。
3. 三键【忘了 / 模糊 / 记得】→ `srs.review` 更新 → 下一张。
4. 全部完成 → 结果卡:本次复习 X、忘了 N 张(列为"待再熟"),下次最早到期日。空态页引导去词根地图学新词。

### 7.5 我的页
- 顶部:今日待复习、累计已学、熟悉词、连续打卡(天数环)。
- 近 14 天每日 `new`/`reviews` 柱状(纯 view 高度实现,无图表库)。
- 设置:每日复习上限(0=不限)、学习页是否默认展开联想。
- 【重置学习数据】二次确认后清空 `rm_progress_v1`。
- 关于:版本、内容规模说明。

## 8. 设计系统(视觉令牌)

- 主色渐变 `#3B82F6 → #4F46E5`(学习);复习/完成强调 `#10B981`;警示「忘了」`#EF4444`、「模糊」`#F59E0B`;文字灰阶(标题 `#0F172A`/正文 `#334155`/次要 `#64748B`);背景 `#F8FAFC`,卡片白。
- 圆角统一按 rpx 缩放(卡片大圆角、按钮 pill);轻投影。
- 构词拆解配色规范:前缀=青、词根=主蓝、后缀=紫(三段可区分),段与段间用圆点或细线分隔;整段可点,命中率高。
- 复用组件的样式类集中在 `app.wxss`(设计令牌 + 通用 class),页面/组件内样式就近。

## 9. 组件清单(`miniprogram/components/`)

`RootCard`、`AffixRow`、`BreakdownBar`(含段点击)、`AffixPop`(词缀弹层)、`WordStudyCard`、`AssocSection`(联想分组)、`ExampleList`、`ReviewCard`、`ProgressRing`、`StatBar`(14 天柱)、`Chip`、`EmptyState`。

## 10. 种子词库内容计划

- **词根(~30 个,首批候选)**:spect(看)、vis/vid(看)、dict(说)、scrib/script(写)、port(搬)、duc/duct(引导)、mit/mis(送)、struct(建)、tract(拉)、vert/vers(转)、form(形)、press(压)、grad/gress(步)、ced/ceed/cess(行走)、pend/pens(悬挂/付)、pos/pon(放置)、tend/tent(伸向)、cept/cip(拿)、ven/vent(来)、pel/puls(推)、val/vail(力量/价值)、phon(声音)、graph(写/画)、log(说/学科)、luc/lux(光)、man(手)、mob/mot(动)、nov(新)、norm(规则)、numer(数)。
- **前后缀(~40 个)**:前缀 in-/im-/ir-/un-/re-/pre-/pro-/de-/dis-/con-/com-/ex-/e-/sub-/super-/trans-/inter-/anti-/auto-/bi-/co-/counter-/fore-/mis-/non-/over-/post-/semi-/tri-/under-;后缀 -tion/-sion/-ment/-ness/-ity/-able/-ible/-less/-ful/-ous/-ize/-ify/-er/-or/-ist/-ive/-al/-ic/-ance/-ence 等。
- **单词(~250 个)**:自上述词根各派生 6~10 个高频词,全部落在 **CET-4/6 与通用高频**范畴。每个词必须满足 §5.1 不变量,配 1~2 条中英例句(例句地道、难度贴合)。

内容以**结构化数据 + 自动校验**方式产出(不手抄):内容按词根家族直接落为 `miniprogram/data/families/family-<root>.js` 数据模块,由 `scripts/validate-content.js` 强制 §5.1 的 6 条不变量;关联字段错一处即失败,杜绝断裂引用。样例词条见附录 A。全量内容经 `npm run validate` 门禁(全量扫描)+ `npm test` 用例(破坏性回归)双重把关。

## 11. 工程结构

```
e:\projects\rootmap-mini\
  project.config.json            # 微信开发者工具工程(指向 miniprogram/)
  package.json                   # scripts: validate / test; 依赖仅 dev(node:test)
  .gitignore                     # node_modules 等
  docs\superpowers\specs\…design.md
  docs\superpowers\plans\…plan.md
  scripts\
    validate-content.js          # 内容不变量校验(§5.1),CLI 读 data/index.js 全量扫描
  tests\
    srs.test.js
    date.test.js
    validate-content.test.js     # 用样例数据跑不变量(含人为破坏用例)
  miniprogram\
    app.js  app.json  app.wxss
    data\  index.js              # {roots, affixes, words} 汇总
           roots.js  affixes.js  # module.exports 数组
           families\family-<root>.js   # 每词根一族,module.exports = Word[]
    utils\ content.js  srs.js  store.js  date.js
    pages\ index\  root-detail\  word\  review\  profile\
    components\ RootCard\  WordStudyCard\  ReviewCard\  BreakdownBar\  …
```

## 12. 测试与验证

### 自动化(`npm test`,node:test)
- `srs.test.js`:连续"记得"间隔序列 1→6→16(→43 递增)、EF 升降与下限 1.3、"忘了"归零重置、"模糊"通过且 EF 下调、dueDate 计算、跨日比较边界。
- `date.test.js`:addDays / isDue / 连续打卡判定(跨月/跨年)。
- `validate-content.test.js`:抽样词条跑 §5.1 全部不变量(含人为破坏用例 → 应失败)。

### 内容校验门禁
`npm run validate` 对全量种子跑不变量,失败即报错(接入 `npm test` 前先跑)。

### 手工验证(微信开发者工具)
完整走通:词根地图 → 词根详情 → 学 3 个词【记住了】→ 复习页显示明日到期 → 修改 dueDate 模拟到期 → 复习三档各点一次 → 检查间隔/EF/统计变化 → 我的页统计与连续打卡 → 重置数据。逐页截图、控制台无报错。

## 13. 错误处理与边界

- 内容加载:数据模块加载失败 → 启动 Toast「内容加载失败」并空态兜底(不入崩溃)。
- 进度读写:写入 try/catch,失败降级为内存态并提示一次;读取遇版本不符/字段缺失 → 丢弃并重建,不静默抛错。
- 无效跳转:词根/单词 id 找不到 → 友好提示并返回上一页。
- 时间:所有比较基于日期字符串(本地时区 `YYYY-MM-DD`),避免零点/时区漂移;`todayISO` 由调用方统一注入。
- 复习截断:每日上限只影响**本日可复习数量**,不影响下次调度(被截断卡片仍按原到期日保留)。
- 空态:首页无内容 / 复习无到期 / 我的无记录,均有引导文案与 CTA。

## 14. 里程碑(供 writing-plans 细化)

1. M0 工程骨架:目录、`project.config.json`、git、.gitignore、README 简介。
2. M1 内容管线:数据 schema + 校验脚本 + 种子数据源 → `data/*.js`(30 根/~40 词缀/~250 词)。
3. M2 应用外壳 + 设计令牌 + Tab + 词根地图首页。
4. M3 词根详情 + 学单词页 + `store.js` 进度写入。
5. M4 `utils/srs.js` + 全部单元测试(先于 UI 依赖)。
6. M5 复习页与复习会话。
7. M6 我的页:统计 / 14 天柱状 / 设置 / 重置。
8. M7 打磨 + 开发者工具全流程走查 + 截图 + 修 bug。

---

## 附录 A · 词条样例(数据形态示范)

```js
// root-spect 词根样例
{ id: "root-spect", root: "spect", variants: ["spect", "spec"],
  zh: "看", meaning: "看、观察", story: "源自拉丁语 specere「看」→ 望远镜、观众都在'看'。" }

// affix 样例
{ id: "affix-in", text: "in-", type: "prefix", zh: "向内 / 进入",
  note: "在 b/m/p 前变 im-;也有否定义,如 inactive(不活跃)。" }

// word 样例
{ id: "inspect", word: "inspect", phonetic: "/ɪnˈspekt/",
  senses: [ { pos: "v.", zh: "检查;审视", en: "to look at carefully" } ],
  breakdown: [
    { part: "in", type: "prefix", zh: "向内", refId: "affix-in" },
    { part: "spect", type: "root", zh: "看", refId: "root-spect" } ],
  tags: ["cet4", "高频"],
  examples: [ { en: "The engineer inspected the bridge for cracks.",
               zh: "工程师检查了桥梁是否有裂缝。" } ],
  assoc: { story: "in(向内)+spect(看)= 凑近仔细看 → 检查。" } }
// 同根词族不重复罗列:凡 breakdown 含 refId:"root-spect" 的 Word 自动成族(如 visible/vision/spectator/retrospect…)
```

> 同义/反义等字段在**跨根成对**时才填写(如 inspect ↔ examine / glance),避免与"同根词族"重复冗余;内容产出时遵循"一族主信息由根承载、assoc 只放根之外的联想"的取舍,防止单条词内容爆炸。该取舍在 M1 内容产出与评审中进一步校准。
