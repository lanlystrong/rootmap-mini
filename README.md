# 词根地图 (rootmap-mini)

**词根构词联想学习 + SM-2 间隔复习**的本地微信小程序。以词根(spect「看」、dict「说」等)为线索串联同族单词,配合词缀拆解、同族联想与双语例句帮助记忆;学完的单词进入 SM-2 变体间隔复习队列,到期自动提醒。学习进度与设置存本地、可离线;另支持**微信静默登录**把学习事件同步到自建服务端的云端统计(可选)。

## 特性

- **首页仪表盘**:落地首页,一屏展示连续打卡、今日待复习、继续学习(上次学到哪个词根)、
  总体进度环(已学 X/1350)与快捷入口,一键直达学习/复习。
- **词根地图**:213 个词根按字母序浏览,每族展示词根变体、含义与家族单词进度。
- **词缀索引**:151 个前后缀列表,展开可见关联词,点击直达单词页。
- **构词拆解着色**:单词按 前缀(青)/ 词根(蓝)/ 后缀(紫)分段着色,段可点跳转。
- **同族联想与辨析**:同族词、近义/反义、形近易混、词源助记分组展示。
- **双语例句**:每个单词配 1~2 条地道中英对照例句。
- **三档 SM-2 复习**:翻面回想 → 忘了 / 模糊 / 记得 自评,间隔按 EF 增长(1→6→×EF);
  支持每日复习上限(0 = 不限)。
- **我的页统计**:今日待复习 / 累计已学 / 熟悉词 / 连续打卡,近 14 天 新学(蓝)·复习(绿)柱状,
  设置项可写,支持一键重置学习数据(设置保留)。
- **微信静默登录 + 云端统计**:启动即 `wx.login` 静默登录(openid 自动建号),学/复习事件
  同步到自建服务端;登录后我的页展示云端正确率 / 词根正确率榜 / 近 14 天(离线学习不受影响)。
- **纯本地存储**:学习进度与设置存微信本地缓存(`rm_progress_v1` / `rm_settings_v1`),可离线使用。
- **内容自动校验**:词根/词缀/单词结构不变量由校验脚本强制,杜绝断裂引用。

## 运行

1. 打开**微信开发者工具**,「导入项目」选择 `miniprogram/` 目录。
2. `miniprogram/project.config.json` 已配置正式 `appid`,可直接编译运行。
3. 进入后底部 Tab 四个:**首页 · 学习(词根地图)· 复习 · 我的**(均带图标)。首页仪表盘显示
   连续打卡 / 今日待复习 / 继续学习 / 总体进度环 / 快捷入口;从词根地图点开任意词根 →
   学单词闭环 → 复习页按到期复习 → 我的页查看统计/设置/重置。

## 测试与校验

- `npm test` —— Node 内置 test runner,`72/72` 通过(服务端 28 + 小程序 44:内容不变量 /
  日期 / SM-2 / store / stats / 数据集保真)。
- `npm run validate` —— 内容校验,输出
  `✓ 内容通过: 213 roots / 151 affixes / 1350 words`,0 错误。
- `npm run test:server` / `npm run test:mini` —— 只跑其中一套。
- `npm run audit` —— 内容质检(硬红线非零即退出码 1);`npm run generate:cet4` ——
  第 1 段:语料 → 可拆解词表(仅在改形态学词典/拆解算法时需要);`npm run generate:content` ——
  第 2 段:从 CET4 语料重新装配交付集;`npm run seed` —— 校验通过后清空并重灌 6 张内容表;
  `npm run verify:db` —— 逐字段核对交付集与数据库(截断/丢失/孤儿行)。
  改动第 1 段后顺序固定:`generate:cet4` → `generate:content` → `validate` → `seed` → `verify:db`。

> `package.json` 已收在 `server/`,以上命令在 `server/` 目录下执行(脚本内路径已按相对位置调好)。

部分 DevTools 走查截图(`docs/qa/*.png`)待用户在微信开发者工具内补充。

## 上线前检查清单

正式提交微信审核 / 上线前逐项确认:

- [ ] **AppID**：确认 `miniprogram/project.config.json` 的 `appid` 是你自己的正式 AppID。
- [ ] **隐私协议**：小程序后台「设置 → 服务内容声明 → 用户隐私保护指引」按实际收集项填写。
     本应用会**通过微信静默登录收集 openid,并把学习/复习事件上报到自建服务端**用于云端统计,
     需在指引中如实声明「收集微信 openid」「收集学习行为数据」。
- [ ] **域名校验**：小程序会请求自建服务端(默认 `http://127.0.0.1:3000`),上线须改为 **HTTPS**
     域名并在后台配置「request 合法域名」;本机联调在开发者工具勾选「不校验合法域名」即可。
- [ ] **版本号**：发版时同步更新 `miniprogram/app.js` 中 `globalData.version` 与 `server/package.json` 的 `version`。
- [ ] **真机回归**：在真机预览走通「首页 → 词根地图 → 学单词 → 复习 → 我的页」全流程,确认无控制台报错。
- [ ] **图标与分享**：确认底部 Tab 图标显示正常;词根/单词页右上角「转发」可分享并正确打开对应页面。

## 内容规模

以**词根为中心**组织:每个词都恰好归入一个词根家族(词条的拆解里恰有 1 个词根段),
前缀后缀作为辅助拆解段参与着色与跳转。

- **213 个词根** —— 30 个手写精选根(spect/vis/dict/scrib/port/duc/mit/struct/tract/vert/…)
  + 183 个从 CET4 语料倒排得到的根,共 213 族。中位族大小 5,均值 6.3,最大 47(`root-stan`),
  最小 1(`root-verb`,靠手写词 adverb 存活;另有 30 个根同样是单薄族)。
- **151 个词缀**(前后缀)。
- **1350 个单词** —— 201 条手写精选词 + 1149 条从 CET4 语料生成,落在 **CET-4/6 与通用高频**
  范畴,每词配构词拆解、释义、1~2 条双语例句与可选联想关系;词根家族内按
  「高频 → 拆解段数少 → 词短」排序,手写词排在各族最前。

> 扩词口径:**以已有词根为轴**去语料里找同族词,而不是把语料里剩下的词硬拆到某个根上。
> 候选来自两条独立通道 —— 词根变体的有界残段匹配(R7)、词典 `relWord`「同根」声明的背书(R8),
> 并集后**逐词人工审校**(实测伪词源率 35%,362 个候选否决 125 个),裁定结果写进
> `server/scripts/generate-cet4.js` 的 `NO_DECOMPOSE`,由 `server/test/dataset-merge.test.js`
> 的 ⑧⑩ 两条回归钉住。新增词的音标/释义/例句**全部取自语料**,零新写内容、零伪数据。

数据分两层,`miniprogram/data/index.js` 在运行时合并:

| 层 | 位置 | 维护方式 |
|---|---|---|
| 手写精选层 | `data/roots.js`、`data/affixes.js`、`data/families/` | **人工维护**。生成器只读不写,永不覆盖 |
| 生成层 | `data/generated/` | **自动产出**。由 `npm run generate:content` 从 CET4 语料装配,勿手改 |
| 合并入口 | `data/index.js` | 由生成器写出,手写条目整条优先,词根 `variants` 取并集 |

> ⚠️ **生成层 `data/generated/`(209 个文件)目前尚未纳入版本控制**,而 `data/index.js` 已经
> `require('./generated')` —— 此刻直接提交会让**新克隆加载交付集时抛异常**。提交前请先
> `git add miniprogram/data/generated miniprogram/data/index.js`(已暂存,待提交)。
> 这两处还需固定 LF 行尾,根目录 `.gitattributes` 已声明 —— 原因见 `server/README.md`「重建前提」。

合并后的每一族在运行时由词条的根段 `refId` 反查(`rootWords()`),族文件只是 `words` 扁平数组的
分区,因此同一词根的词可以同时出现在两层里,运行时零影响。

## 项目结构

```
rootmap-mini/
  scripts/
    validate-content.js        # 内容不变量校验 CLI(全量扫描)
    gen-icons.js               # 生成底部 TabBar 图标(纯 Node,零依赖)→ miniprogram/assets/
  server/scripts/              # 内容流水线(见 server/README.md)
    generate-cet4.js           #   第 1 段:语料 → 可拆解词表(改词典/拆解算法时才跑)
    generate-content.js        #   第 2 段:装配交付集(读第 1 段产物 + 手写层)
    verify-db.js               #   逐字段核对交付集 vs 数据库(seed 之后跑)
  .gitattributes               # 交付集里被逐字节比对的文件固定 LF(见 server/README.md)
  tests/                       # node:test 用例(content/date/srs/store/stats/validate)
  miniprogram/                 # 微信小程序工程(DevTools「导入项目」选此目录)
    project.config.json        # 微信开发者工具工程配置(appid)
    app.js  app.json  app.wxss # 应用外壳(版本/更新检测/错误兜底/清孤儿卡片)+ 设计令牌
    assets/                    # TabBar 图标 tab-{home,learn,review,profile}[-on].png(81×81)
    data/                      # 内容交付集
      roots.js  affixes.js     #   手写精选层(人工维护,生成器只读)
      families/family-*.js     #   手写精选族(30 个根)
      generated/               #   生成层 209 个族(由 server/scripts/generate-content.js 产出,勿手改)
      index.js                 #   合并入口:手写层 + 生成层(由生成器写出)
    utils/
      content.js               # getContent():索引(roots/affixes/words/rootWords/search…)
      store.js                 # makeWxStore():进度/设置读写、pruneCards(清已下架词的卡片)、reset
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
  server/                      # 独立 Node 后端(微信静默登录 openid/内容下发/事件统计,存 MySQL)
    package.json               # scripts: server / test:server / test / validate
    src/                       # app/server/db(mysql2) + auth/events/stats router + content
    test/                      # node:test 用例(13 个,连 MySQL)
    README.md                  # 服务端接口与运行说明
```
