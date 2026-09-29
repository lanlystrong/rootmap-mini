> ⚠️ **本文档已过时（2026-09-29 标注）** —— 保留是为了留住当时的设计决策上下文，**不是当前实现的说明**。
> 与现状的主要出入：
> - **内容真源**：文中按「本地静态文件 + 后端补用户」的思路设计，现在内容真源是 **MySQL**，
>   运行时只读库 + 60s 热重载（`server/src/content.js` / `app.js`）。
> - **会话机制**：文中多处提到 JWT，实际线上从未用 JWT —— 会话是 `sessions` 表里的 48 位随机 token。
>   遗留的 JWT 死代码已在 2026-09-29 彻底删除，本文提到的 JWT 设计**未落地**。
> - **服务端 SRS / 进度表**：文中规划的服务端复习状态最终**没有实现**（那批表是零调用死代码，已删）。
>   SM-2 有意只跑在客户端（`miniprogram/utils/srs.js`），跨设备续学尚未做。
> - 复核入口：`README.md`（现状）、`server/AUDIT-GOLIVE.md`（修复记录）。

# 词根地图 · 服务端设计(账号 / 内容下发 / 事件统计)

> 目标(本轮):为既有的纯本地微信小程序「词根地图」(30 词根/66 词缀/201 词、SM-2 复习)
> 新增一个**自建 Node.js HTTP API 服务端**,承载:多用户账号、词典内容下发、学习事件
> 收集与云端统计。**学习进度仍以小程序本地 `rm_progress_v1` 为唯一真源**,服务端不存进度、
> 不回写 SRS;本地离线学习流程完全不变。
>
> 依据:用户已拍板 —— 形态 = Express + SQLite;内容下发本轮做**服务端 API 做足 + 小程序
> 渲染仍走本地**,客户端切网络内容留作后续独立任务;账号 = 用户名+密码(scrypt + 会话
> token);统计展示 = 我的页新增「云端统计」卡(登录可见)。
>
> **驱动裁定(§6 详述)**:用户选项字面为 better-sqlite3,但其原生预编译在本机 Node 24/Windows
> `npm install` 超时不可靠;Node 24 内置 `node:sqlite`(DatabaseSync)API 与 better-sqlite3
> 同形、零依赖必能跑 —— 故 SQLite 驱动锁定 **node:sqlite**,Express 为唯一新增依赖。
> 若用户坚持 better-sqlite3,仅需替换 db.js 内部驱动调用,表结构与接口不变。

## 1. 架构与目录

同仓 monorepo 新增 `server/` 子目录,复用 `miniprogram/data/index.js` 作为**词典单源**
(CommonJS,导出 `{roots, affixes, words}`,已被 Task 1 校验器背书,内容不复制):

```
rootmap-mini/
  miniprogram/          # 现有小程序(本轮仅小改:加 api/reporter、我的页登录+云端统计)
    app.json            # 不变
    utils/  pages/  components/  data/
      # 新增: utils/api.js, utils/reporter.js
      # 修改: pages/profile/profile.* (登录区 + 云端统计卡)
      # 修改: pages/word/word.js, pages/review/review.js (各 +1 行事件上报调用)
  server/
    package.json         # deps: express(唯一新增);SQLite 走内置 node:sqlite
    src/
      app.js             # 组装 Express app(纯函数,供测试注入临时库/端口)
      server.js          # 启动入口(读 PORT 默认 3000)
      db.js              # node:sqlite(DatabaseSync)建表/初始化;接受 dbPath(测试用 :memory:)
      auth.js            # scrypt 哈希、register/login/logout/me、Bearer 中间件
      content.js         # require 小程序 data → 路由 + 启动时建 wordId→rootId 索引
      events.js          # 事件批量写入与校验
      stats.js           # 服务端聚合(overview/daily/roots)
      middleware.js      # json body、日志、统一错误、请求计时(可选小件)
    test/
      helper.js          # 起临时 app(:memory: 库,port 0),返回 baseURL
      auth.test.js  content.test.js  events.test.js  stats.test.js
    README.md            # 服务端运行/联调/测试说明
    data/                # 运行时 SQLite 文件(server/data/rootmap.db,gitignore)
```

根 `package.json` 追加脚本与依赖(不碰现有 test/validate 脚本语义):
- `"server": "node server/src/server.js"`, `"test:server": "node --test \"server/test/**/*.test.js\""`
- deps 追加 `express`;SQLite 用 **Node 24 内置 `node:sqlite`**,无需额外依赖(驱动裁定见 §6)。
- `.gitignore` 增加 `server/data/*.db*`、`node_modules/`(已有)。

## 2. 数据模型(SQLite 单库;驱动 = node:sqlite,API 与 better-sqlite3 同形)

```sql
users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,          -- 规则见 §4
  pass_hash TEXT NOT NULL,                -- scrypt(见 §4)
  salt TEXT NOT NULL,
  created_at TEXT NOT NULL                -- ISO datetime
);
sessions(
  token TEXT PRIMARY KEY,                 -- crypto.randomBytes(24).hex
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL                -- 默认 30 天
);
events(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK(type IN ('study','review')),
  word_id TEXT NOT NULL,                  -- = Word.id(=word 拼写)
  q INTEGER,                              -- 仅 review:1|3|5;study 为 NULL
  at TEXT NOT NULL                        -- ISO datetime(客户端本机时刻,含日期)
);
CREATE INDEX idx_events_user_at ON events(user_id, at);
CREATE INDEX idx_events_user_type ON events(user_id, type);
```

聚合一律从 events 表按 `substr(at,1,10)` 取日、`COUNT/GROUP BY` 实时算(本机规模足够,
无需物化)。**无进度表、无 SRS 服务端状态** —— 这是与「进度云同步」的本质区别。

## 3. API 契约(v1,前缀 `/api`)

公共约定:JSON;`Content-Type: application/json`;错误统一
`{error: {code, message}}`;未带/失效 token 的受保护接口 → `401 {error:{code:'unauthorized'}}`;
参数非法 → `400`;唯一冲突 → `409`;不存在 → `404`;成功 `2xx`。受保护接口带
`Authorization: Bearer <token>`。本机联调用 `urlCheck:false`,无 TLS(§6)。

### 3.1 auth(公开)
- `POST /api/auth/register` body `{username, password}` → `201 {token, user:{id, username}}`(注册即登录)。
  - username:`/^[A-Za-z0-9_]{3,20}$/`;password:`6..72` 字符。冲突 → `409 code:'username_taken'`。
- `POST /api/auth/login` body `{username, password}` → `200 {token, user}`;校验失败 →
  `401 code:'bad_credentials'`。
- `POST /api/auth/logout`(Bearer)→ `204`;删除该 token。
- `GET /api/auth/me`(Bearer)→ `200 {user:{id, username}}`。

### 3.2 content(公开只读)
- `GET /api/content/meta` → `200 {name:'rootmap', counts:{roots:30, affixes:66, words:201},
  checksum, version:'0.1.0'}`。checksum = 对 `roots+affixes+words` 的 id 序列做 sha1(十六进制),
  供客户端以后判断是否需要拉全量。
- `GET /api/content/roots` → `200 roots[]`;`GET /api/content/affixes` → `200 affixes[]`;
  `GET /api/content/words` → `200 words[]`(全字段)。
- `GET /api/content/words/:id` → 200 word / 404。
- `GET /api/content/roots/:id` → `200 {root, words: 该族全部 word}`(word 序 = data 内族序)/ 404。
- `GET /api/content/affixes/:id` → `200 {affix, words:[该词缀出现的 word…]}` / 404。
- 载荷即 `data/index.js` 原对象(直接 `require` 后返回),服务端**不改写**词条字段。

### 3.3 events(受保护)
- `POST /api/events` body `{events:[{type, wordId, q?, at?}]}`
  - 逐条校验:`type ∈ {study,review}`;`wordId` 必须存在于词典(服务端 content 索引校验,
    未知词 `ignored+1` 不落库);`review` 必带 `q∈{1,3,5}`、`study` 不得带 q;
    `at` 缺省=服务端当前时刻,给定则须 `YYYY-MM-DDTHH:mm:ss` 或 `YYYY-MM-DD` 且为合法日期。
  - 返回 `200 {accepted:n, ignored:m}` —— accepted 入库条数。
  - 一次 ≤ 200 条(超出截断 + `truncated:true`)。
  - 语义:study=学了某词一次(与 markStudied 幂等语义一致,重复 study 允许如实记录);
    review=对该词一次三档自评(q 记录,服务端因此可得正确率分布,本地 log 只有计数)。

### 3.4 stats(受保护,均限当前登录用户)
- `GET /api/stats/overview` → `200 {
    totalStudied: 去重 word 数(有≥1 study),  studyEvents, reviewEvents,
    gradeDist:{q1,q3,q5}(review 计数), lapses: q1 计数(口径=三档自评「忘了」),
    accuracy: 1 - q1/(q1+q3+q5) 或 0(无 review)}`
- `GET /api/stats/daily?days=14`(默认 14,1..90)→ `200 [{date:'YYYY-MM-DD', new, reviews,
  lapses}…]`,按日升序、**今天在末**、缺日补 0 —— 与小程序 `computeStats().last14` 同构,
  客户端可直接喂给既有 `StatBar`。
- `GET /api/stats/roots?days=30&limit=15` → `200 [{rootId, root, zh, studied(study 去重词数),
  reviews, gradeDist, accuracy}…]`,按 reviews 降序,limit ≤ 30。wordId→rootId 映射由启动时
  对 data 内容扫描 breakdown root 段 refId 建立(与 utils/content.js 同逻辑)。
- 空数据返回全 0/空数组,不报错。

## 4. 鉴权与安全(本机档位,清晰标注)

- 密码哈希:`crypto.scryptSync(password, salt, 64)`,salt=randomBytes(16).hex,常量时间比较。
- 会话:登录/注册签发随机 24B token,存 sessions,`expires_at = now + 30d`;Bearer 中间件查表,
  过期即删并 401。登出删 token。
- 无 wx.login / openid(游客 appid 无法换取),账号即用户名+密码。
- 本地明文 HTTP、`urlCheck:false` 仅限本机开发;文档明示生产需 HTTPS + 合法域名 + 换强 token
  (如 JWT/OpenID 改造),本轮不做。
- SQL 一律参数化(better-sqlite3 prepared statements),杜绝注入;body 解析设 `limit: '1mb'`。

## 5. 客户端接入(本轮小改)

### 5.1 `miniprogram/utils/api.js`(新增)
- `API_BASE` 常量默认 `http://127.0.0.1:3000`,单点可改。
- token 存 `wx` storage key `rm_token_v1`(登录态)、用户名缓存 `rm_user_v1`。
- `request(method, path, {auth, body})`:封装 `wx.request` → Promise;成功解 JSON;401 →
  清登录态并 reject `{code:'unauthorized'}`;网络失败 reject `{offline:true}`(调用方据此静默)。
- 导出 `register(username, pass)`/`login`/`logout`/`me`/`postEvents(events)`/`overview()`/
  `daily(days)`/`roots(days)` —— 或更薄的 `api.*`,实现自由,契约见 §3。
- 不依赖任何页面;`wx` 缺省时安全降级(本机 node 冒烟可 stub)。

### 5.2 `miniprogram/utils/reporter.js`(新增)
- `recordStudy(wordId)`、`recordReview(wordId, q)` —— 内部生成 `{type, wordId, q, at: 本地时间}`
  追加到持久化待发队列(storage key `rm_events_pending_v1`,上限如 1000,超限丢最旧并计数)。
- `flush()`:未登录/离线 → 保留队列并静默返回;成功发送则清空已确认;失败保留待下次。
- 触发时机:各页面(见下)调用 record*,并在 **app onShow / 页面 onShow / 事件后** 尝试 flush
  (fire-and-forget,Promise 不阻塞 UI)。学习/复习**本地写始终先于并独立于上报**。
- 目的:即便离线也尽量不丢事件;极端丢数据仅影响云端统计,不影响本地学习。

### 5.3 埋点(各 +1 处,不引入页面逻辑)
- `pages/word/word.js` `markLearned()`:`store.markStudied(...)` 成功后 `reporter.recordStudy(w.id); reporter.flush();`。
- `pages/review/review.js` `grade()`:`applyReview` 成功后 `reporter.recordReview(id, q); reporter.flush();`
  (grade 已有 `phase!=='reviewing'` 守卫,埋点在其后)。

### 5.4 `pages/profile`(登录区 + 云端统计卡)
- 顶部下方新增「服务端」卡(未登录):username/password 两输入 + 【登录】/【注册】两按钮 + 一行
  提示(游客 appid 本地联调:先 `npm run server`,DevTools 需勾不校验域名)。失败用内联错误文案。
- 登录成功:显示 username + 【退出登录】;该卡下方出现「云端统计」卡(加载态 → 数据):
  - 概览行:累计学习词 / 复习次数 / 正确率 %(accuracy)。
  - 三档分布 mini 条(忘了红/模糊琥珀/记得绿,复用配色,不复用组件亦可,纯 view)。
  - 近 14 天活动:复用既有 `StatBar`(daily 响应与 last14 同构)。空态文案「暂无云端数据,先学几个词吧」。
  - 词根正确率 Top 榜(≤10):词根 + 复习数 + 正确率%,仅在有 review 时渲染。
- 本地统计卡、本地设置、重置一律不动;云端统计只读,登录态与本地数据互相独立。
- 登录态变化时 profile 刷新;登出清 api 登录态(不动本地进度)。

## 6. 依赖与驱动裁定(已验证)

- **Express 5.2.1**:纯 JS,本机 `npm install express` 已验证通过(`require` 可用,无原生编译)。
  唯一新增依赖。
- **SQLite 驱动 = Node 内置 `node:sqlite`(`DatabaseSync`)**:本机 Node v24.16.0 实测可用,
  免安装、零编译。其 `db.prepare(sql).run/get/all` + `db.exec` 的 API 与 better-sqlite3 同形,
  db.js 因此可平滑替换。用户选项字面曾为 better-sqlite3,但其原生预编译在本机 npm install
  超时不可靠、会阻塞「本机开发运行即可」;此为驱动裁定(better-sqlite3 备选:仅改 db.js 内部
  一行 require,表结构与接口不变)。表 SQL 与 db.js 接口按 spec §2/§3 形状实现,不依赖驱动细节。
- 服务端测试:`node --test server/test/**/*.test.js` 用 `:memory:` 库 + `port 0` 起真实 HTTP,
  覆盖:注册/登录/重复用户名/坏凭证/token 过期与登出、content 各路由与 404、事件校验
  (非法 type/未知词/q 缺失/超 200 截断)、stats 三接口空态与造数态(造 study/review 事件后核对
  overview/daily/roots 数字)。
- 现有 `npm test` 31/31 与 `npm run validate` 30/66/201 **必须保持**;本轮不动 data/utils 既有逻辑
  (只新增文件 + profile/word/review 增量)。
- 微信开发者工具人工验证(登录注册、云端统计卡渲染、埋点后数字变化、断网不阻塞学习)
  本机无 DevTools → 标「待用户验证」,不伪造截图。

## 7. 明确不做(边界)

- 不做学习进度云同步/跨设备续学、不回写 SRS。
- 不做内容版本热更新推送(checksum 仅就绪,客户端切网络内容为后续任务)。
- 不做 openid/微信登录、不做生产 TLS/部署、不做管理后台与全站排行榜。
- 不改 getContent 同步契约、不改 app.json 页面路由(云端统计并入我的页)。

## 8. 验收要点

1. `npm i`(新增 express)成功;`npm run server` 起 3000 无异常(SQLite 用内置 node:sqlite)。
2. `npm test` 31/31、`npm run validate` 30/66/201、`npm run test:server` 全绿。
3. curl/测试可走通:register→login→me→content 全量→postEvents→stats 数字与造数一致。
4. 小程序:我的页可注册/登录/登出;登录后云端统计卡正确渲染(含 StatBar 与正确率);
   学习/复习各一次后 overview 与 daily 反映该行为;关掉服务端小程序仍可正常离线学习。
