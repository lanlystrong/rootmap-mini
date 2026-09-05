# 词根地图 (rootmap-mini)

**词根构词联想学习 + SM-2 间隔复习**的本地微信小程序。以词根(spect「看」、dict「说」等)为线索串联同族单词,配合词缀拆解、同族联想与双语例句帮助记忆;学完的单词进入 SM-2 变体间隔复习队列,到期自动提醒。全部数据与进度均存本地,**无后端、无网络依赖**。

## 特性

- **首页仪表盘**:落地首页,一屏展示连续打卡、今日待复习、继续学习(上次学到哪个词根)、
  总体进度环(已学 X/201)与快捷入口,一键直达学习/复习。
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

1. 打开**微信开发者工具**,「导入项目」选择 `miniprogram/` 目录。
2. `miniprogram/project.config.json` 已配置正式 `appid`,可直接编译运行。
3. 进入后底部 Tab 四个:**首页 · 学习(词根地图)· 复习 · 我的**(均带图标)。首页仪表盘显示
   连续打卡 / 今日待复习 / 继续学习 / 总体进度环 / 快捷入口;从词根地图点开任意词根 →
   学单词闭环 → 复习页按到期复习 → 我的页查看统计/设置/重置。

## 测试与校验

- `npm test` —— Node 内置 test runner,`33/33` 通过(内容不变量 / 日期 / SM-2 / store / stats)。
- `npm run validate` —— 全量内容校验,输出
  `✓ 内容通过: 30 roots / 66 affixes / 201 words`,0 错误。
- `npm run test:server` —— 服务端单测(需先设 `MYSQL_*` 指向可用 MySQL,13 个)。

> `package.json` 已收在 `server/`,以上命令在 `server/` 目录下执行(脚本内路径已按相对位置调好)。

部分 DevTools 走查截图(`docs/qa/*.png`)待用户在微信开发者工具内补充。

## 上线前检查清单

正式提交微信审核 / 上线前逐项确认:

- [ ] **AppID**：确认 `miniprogram/project.config.json` 的 `appid` 是你自己的正式 AppID。
- [ ] **隐私协议**：小程序后台「设置 → 服务内容声明 → 用户隐私保护指引」按实际收集项填写。
     本应用**纯本地、零网络请求、不收集任何用户数据**,原则上勾选「不收集用户信息」即可。
- [ ] **域名校验**：本应用无网络请求,无需配置 request 合法域名。
- [ ] **版本号**：发版时同步更新 `miniprogram/app.js` 中 `globalData.version` 与 `server/package.json` 的 `version`。
- [ ] **真机回归**：在真机预览走通「首页 → 词根地图 → 学单词 → 复习 → 我的页」全流程,确认无控制台报错。
- [ ] **图标与分享**：确认底部 Tab 图标显示正常;词根/单词页右上角「转发」可分享并正确打开对应页面。

## 内容规模

- **30 个词根**(spect/vis/dict/scrib/port/duc/mit/struct/tract/vert/…),按词根家族落为 30 个
  `miniprogram/data/families/family-<root>.js` 数据模块。
- **66 个词缀**(前后缀)。
- **201 个单词**,落在 **CET-4/6 与通用高频**范畴,每词配构词拆解、释义、1~2 条双语例句与
  可选联想关系;词根家族内按关联关系组织。

## 项目结构

```
rootmap-mini/
  scripts/
    validate-content.js        # 内容不变量校验 CLI(全量扫描)
    gen-icons.js               # 生成底部 TabBar 图标(纯 Node,零依赖)→ miniprogram/assets/
  tests/                       # node:test 用例(content/date/srs/store/stats/validate)
  miniprogram/                 # 微信小程序工程(DevTools「导入项目」选此目录)
    project.config.json        # 微信开发者工具工程配置(appid)
    app.js  app.json  app.wxss # 应用外壳(版本/更新检测/错误兜底)+ 设计令牌(全局 class)
    assets/                    # TabBar 图标 tab-{home,learn,review,profile}[-on].png(81×81)
    data/                      # 内容:roots/affixes + families/family-<root>.js,data/index 汇总
    utils/
      content.js               # getContent():索引(roots/affixes/words/rootWords/search…)
      store.js                 # makeWxStore():进度/设置读写、reset(仅清进度)
      srs.js                   # SM-2 变体(EF/间隔/三档自评)
      stats.js                 # computeStats:已学/熟悉/今日待复习/连续打卡/近 14 天
      date.js                  # 本地日期 YYYY-MM-DD 工具
    pages/
      home/                    # 首页仪表盘(问候/待复习/继续学习/进度环/快捷入口)
      index/                   # 词根地图(学习 Tab:搜索 + 词根/词缀浏览)
      root-detail/             # 词根详情 + 家族单词列表
      word/                    # 学单词页(拆解/联想/例句/学完入池闭环)
      review/                  # 复习页(到期队列 + 三档自评会话)
      profile/                 # 我的页(统计/14 天/设置/重置/关于)
    components/                # 12 个可复用组件(RootCard/StatBar/ReviewCard/…)
  server/                      # 独立 Node 后端(账号/内容下发/事件统计,存 MySQL)
    package.json               # scripts: server / test:server / test / validate
    src/                       # app/server/db(mysql2) + auth/events/stats router + content
    test/                      # node:test 用例(13 个,连 MySQL)
    README.md                  # 服务端接口与运行说明
```
