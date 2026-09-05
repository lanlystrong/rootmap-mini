# 词根地图 · 服务端 (server)

为「词根地图」微信小程序配套的自建 Node.js HTTP 服务端,承载三件事:

1. **账号**:用户名 + 密码注册/登录,签发 Bearer 会话 token(注册即登录)。
2. **内容下发**:把 `miniprogram/data/index.js` 这份词典**单源**以只读 JSON API 暴露出去
   (30 词根 / 66 词缀 / 201 词,服务端不改写词条字段)。
3. **事件统计**:接收「学了某词 / 对某词做了三档复习自评」学习事件,按用户聚合出云端统计
   (overview / 近 N 天 daily / 词根榜)。

## 定位与边界

- **学习进度仍存小程序本地**(`rm_progress_v1`),本服务端**不存进度、不回写 SM-2 状态**;
  本地离线学习流程完全不变,服务端只做账号、内容下发与事件统计。
- 内容本期**接口做足、客户端渲染仍走本地**:`checksum` 已就绪,小程序切网络内容属后续任务。
- 明文 HTTP + 明文 token 仅面向**本机开发联调**,详见文末「安全声明」。

## 环境要求

- **Node.js ≥ 22**(本仓库在 v24.16.0 实测)。
- 数据库使用 **MySQL**,经 `mysql2/promise` 连接池访问;依赖为 `express` + `mysql2`。

## 安装与运行

```bash
npm install          # 安装 express + mysql2(在 server/ 目录下执行)
npm run server       # 启动,监听 http://127.0.0.1:3000
```

启动成功会打印:

```
[rootmap-server] listening on http://127.0.0.1:3000 (mysql: 127.0.0.1:3306/rootmap)
```

### 环境变量覆盖

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `PORT` | `3000` | 监听端口。示例:`PORT=4000 npm run server` |
| `HOST` | `127.0.0.1` | 监听地址,默认仅回环(明文 HTTP 安全档位)。需对外暴露时设 `HOST=0.0.0.0` |
| `MYSQL_HOST` | `127.0.0.1` | MySQL 地址 |
| `MYSQL_PORT` | `3306` | MySQL 端口 |
| `MYSQL_USER` | `root` | MySQL 用户名 |
| `MYSQL_PASSWORD` | 空 | MySQL 密码 |
| `MYSQL_DATABASE` | `rootmap` | 应用库,启动时自动建表 |

> 连接信息全部来自环境变量,仓库内不存任何账号密码。

## 测试

```bash
npm run test:server   # 服务端单测(node --test,13 个:auth/content/events/stats/http 冒烟)
npm test              # 全量(含小程序侧内容不变量/日期/SRS/store/stats/api/reporter,40 个)
npm run validate      # 全量内容校验,期望:✓ 内容通过: 30 roots / 66 affixes / 201 words
```

> `npm run test:server` 需先设 `MYSQL_*` 指向可用 MySQL,且该账号须具备 `CREATE DATABASE` /
> `DROP DATABASE` 权限(测试为每个用例创建并删除独立数据库以隔离)。

## API 一览

- 基址:`http://127.0.0.1:3000`,统一前缀 `/api`。
- 统一 JSON;错误体固定为 `{error: {code, message}}`。
- 鉴权列「—」表示公开;**Bearer** 表示需请求头 `Authorization: Bearer <token>`。
- `at` 取值:`YYYY-MM-DD` 或 `YYYY-MM-DDTHH:mm:ss`(非法日期 / 可滚转日期会被拒);缺省为服务端当前时刻。

### auth(4)

| 方法 | 路径 | 鉴权 | 入参(body) | 返回 |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | — | `{username, password}`。username `3-20` 位字母/数字/下划线;password `6-72` 位 | `201 {token, user:{id, username}}`;重名 `409 username_taken`;非法 `400` |
| POST | `/api/auth/login` | — | `{username, password}` | `200 {token, user:{id, username}}`;凭证错 `401 bad_credentials` |
| POST | `/api/auth/logout` | Bearer | 无 | `204`(删除该 token,无响应体) |
| GET | `/api/auth/me` | Bearer | 无 | `200 {user:{id, username}}` |

### content(7,公开只读)

| 方法 | 路径 | 鉴权 | 入参 | 返回 |
| --- | --- | --- | --- | --- |
| GET | `/api/content/meta` | — | 无 | `200 {name:'rootmap', counts:{roots,affixes,words}, checksum, version}`;`checksum` 为三表 id 序列 sha1 |
| GET | `/api/content/roots` | — | 无 | `200` 全部词根对象数组 |
| GET | `/api/content/affixes` | — | 无 | `200` 全部词缀对象数组 |
| GET | `/api/content/words` | — | 无 | `200` 全部单词对象数组(全字段) |
| GET | `/api/content/words/:id` | — | path `id` = 单词拼写 | `200` 单词对象;不存在 `404 not_found` |
| GET | `/api/content/roots/:id` | — | path `id` | `200 {root, words:[该词根族全部单词]}`;不存在 `404` |
| GET | `/api/content/affixes/:id` | — | path `id` | `200 {affix, words:[含该词缀的单词]}`;不存在 `404` |

### events(1,受保护)

| 方法 | 路径 | 鉴权 | 入参(body) | 返回 |
| --- | --- | --- | --- | --- |
| POST | `/api/events` | Bearer | `{events:[{type, wordId, q?, at?}]}` | `200 {accepted, ignored, truncated?}` |

`POST /api/events` 逐条校验语义:

- `type ∈ {study, review}`;`wordId` 必填且必须存在于词典 —— **未知词不计入错误**,`ignored+1` 不落库。
- `review` 必带 `q ∈ {1,3,5}`(忘了/模糊/记得);`study` **不得**带 `q`。
- 单批 ≤ 200 条,超出截断为前 200 条并附 `truncated:true`。
- `at` 见上文约定;缺省 = 服务端当前时刻(本地时区)。

### stats(3,受保护,均限当前登录用户)

| 方法 | 路径 | 鉴权 | 入参 | 返回 |
| --- | --- | --- | --- | --- |
| GET | `/api/stats/overview` | Bearer | 无 | `200 {totalStudied, studyEvents, reviewEvents, gradeDist:{q1,q3,q5}, lapses, accuracy}`;accuracy = `1 - q1/(q1+q3+q5)`(无 review 为 0) |
| GET | `/api/stats/daily` | Bearer | query `days=14`(默认 14,范围 1..90) | `200 [{date:'YYYY-MM-DD', new, reviews, lapses}…]` 升序、**今天在末**、缺日补 0 |
| GET | `/api/stats/roots` | Bearer | query `days=30`(默认 30,1..90)、`limit=15`(默认 15,≤30) | `200 [{rootId, root, zh, studied, reviews, gradeDist, accuracy}…]` 按 reviews 降序 |

空数据返回全 0 / 空数组,不报错。入参越界/非整数 → `400 bad_request`。

## 与小程序联调

> 说明:目录重组后小程序侧**暂未接入本服务端**(`miniprogram/utils/api.js` / `reporter.js`
> 已移除,小程序回到纯本地模式)。服务端当前作为独立 API 运行,以下联调姿势供后续重新接入时复用:

1. **本机起服务**:在 `server/` 目录执行 `npm run server`(默认 `http://127.0.0.1:3000`,
   需先设 `MYSQL_*`)。
2. **关闭域名校验**:微信开发者工具 → 右上角「详情」→「本地设置」→ **勾选「不校验合法域名、
   web-view(业务域名)、TLS 版本以及 HTTPS 证书」**。因为本服务是 `http://127.0.0.1` 明文
   HTTP,不勾选会被小程序拦截。
3. **冒烟验证**:按下文「curl 示例」注册/登录/上报/查统计,并用 MySQL 客户端确认
   `users` / `sessions` / `events` 三表数据落库。

## curl 示例

```bash
# 注册(注册即登录,返回 token)
curl -s -X POST http://127.0.0.1:3000/api/auth/register -H 'content-type: application/json' -d '{"username":"demo","password":"secret123"}'

# 登录(拿 token)
curl -s -X POST http://127.0.0.1:3000/api/auth/login -H 'content-type: application/json' -d '{"username":"demo","password":"secret123"}'

# 用 token 查本人
curl -s http://127.0.0.1:3000/api/auth/me -H 'authorization: Bearer <token>'

# 内容元信息(公开)
curl -s http://127.0.0.1:3000/api/content/meta

# 上报学习事件(受保护):study 不带 q;review 带 q=1|3|5;未知词被忽略不计错
curl -s -X POST http://127.0.0.1:3000/api/events -H 'authorization: Bearer <token>' \
  -H 'content-type: application/json' \
  -d '{"events":[{"type":"study","wordId":"inspect"},{"type":"review","wordId":"inspect","q":5}]}'

# 云端统计(受保护)
curl -s http://127.0.0.1:3000/api/stats/overview -H 'authorization: Bearer <token>'
curl -s 'http://127.0.0.1:3000/api/stats/daily?days=14' -H 'authorization: Bearer <token>'
```

## 安全声明

本服务定位为**本机开发联调档位**:

- 传输走明文 HTTP,会话 token 以明文随 `Authorization` 头传输,**未启用 TLS**,仅限
  `127.0.0.1` 本机联调。
- 密码以 scrypt(随机 salt, 常量时间比较)哈希存储;SQL 全部参数化。
- 账号即「用户名 + 密码」,无 `wx.login`/openid(游客 appid 无法换取)。
- **生产部署不在本轮范围**:若上线需 HTTPS + 备案合法域名、关闭 DevTools 域名校验开关、并把
  明文 token 换成更健壮的方案(如短期 JWT / OpenID 改造)。本机联调期间请勿在公网暴露该端口。
