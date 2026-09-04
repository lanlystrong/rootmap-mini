# 词根地图 (rootmap-mini)

**词根构词联想学习 + SM-2 间隔复习**的本地微信小程序。以词根(spect「看」、dict「说」等)为线索串联同族单词,配合词缀拆解、同族联想与双语例句帮助记忆;学完的单词进入 SM-2 变体间隔复习队列,到期自动提醒。全部数据与进度均存本地,**无后端、无网络依赖**。

## 特性

- **词根地图**:30 个核心词根按字母序浏览,每族展示词根变体、含义与家族单词进度。
- **词缀索引**:66 个前后缀列表,展开可见关联词,点击直达单词页。
- **构词拆解着色**:单词按 前缀(青)/ 词根(蓝)/ 后缀(紫)分段着色,段可点跳转。
- **同族联想与辨析**:同族词、近义/反义、形近易混、词源助记分组展示。
- **双语例句**:每个单词配 1~2 条地道中英对照例句。
- **三档 SM-2 复习**:翻面回想 → 忘了 / 模糊 / 记得 自评,间隔按 EF 增长(1→6→×EF);
  支持每日复习上限(0 = 不限)。
- **我的页统计**:今日待复习 / 累计已学 / 熟悉词 / 连续打卡,近 14 天 新学(蓝)·复习(绿)柱状,
  设置项可写,支持一键重置学习数据(设置保留)。
- **纯本地存储**:学习进度与设置存微信本地缓存(`rm_progress_v1` / `rm_settings_v1`),可离线使用。
- **内容自动校验**:词根/词缀/单词结构不变量由校验脚本强制,杜绝断裂引用。

## 运行

1. 打开**微信开发者工具**,「导入项目」选择本仓库根目录。
2. `project.config.json` 已配置 `miniprogramRoot=miniprogram/` 与游客 `appid`(touristappid),
   可直接编译运行。
3. 进入后底部 Tab 三个:**学习(词根地图)· 复习 · 我的**。从词根地图点开任意词根 → 学单词
   闭环 → 复习页按到期复习 → 我的页查看统计/设置/重置。

## 测试与校验

- `npm test` —— Node 内置 test runner,`31/31` 通过(内容不变量 / 日期 / SM-2 / store / stats)。
- `npm run validate` —— 全量内容校验,输出
  `✓ 内容通过: 30 roots / 66 affixes / 201 words`,0 错误。

部分 DevTools 走查截图(`docs/qa/*.png`)待用户在微信开发者工具内补充。

## 内容规模

- **30 个词根**(spect/vis/dict/scrib/port/duc/mit/struct/tract/vert/…),按词根家族落为 30 个
  `miniprogram/data/families/family-<root>.js` 数据模块。
- **66 个词缀**(前后缀)。
- **201 个单词**,落在 **CET-4/6 与通用高频**范畴,每词配构词拆解、释义、1~2 条双语例句与
  可选联想关系;词根家族内按关联关系组织。

## 项目结构

```
rootmap-mini/
  project.config.json          # 微信开发者工具工程(指向 miniprogram/)
  package.json                 # scripts: test / validate; 仅 dev 依赖 node:test
  scripts/
    validate-content.js        # 内容不变量校验 CLI(全量扫描)
  tests/                       # node:test 用例(content/date/srs/store/stats/validate)
  miniprogram/
    app.js  app.json  app.wxss # 应用外壳 + 设计令牌(全局 class:card/grad/t-1..3/btn-*)
    data/                      # 内容:roots/affixes + families/family-<root>.js,data/index 汇总
    utils/
      content.js               # getContent():索引(roots/affixes/words/rootWords/search…)
      store.js                 # makeWxStore():进度/设置读写、reset(仅清进度)
      srs.js                   # SM-2 变体(EF/间隔/三档自评)
      stats.js                 # computeStats:已学/熟悉/今日待复习/连续打卡/近 14 天
      date.js                  # 本地日期 YYYY-MM-DD 工具
    pages/
      index/                   # 词根地图首页(搜索 + 词根/词缀浏览)
      root-detail/             # 词根详情 + 家族单词列表
      word/                    # 学单词页(拆解/联想/例句/学完入池闭环)
      review/                  # 复习页(到期队列 + 三档自评会话)
      profile/                 # 我的页(统计/14 天/设置/重置/关于)
    components/                # 12 个可复用组件(RootCard/StatBar/ReviewCard/…)
```
