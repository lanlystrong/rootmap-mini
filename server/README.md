# 词根地图服务端

一个为微信小程序"词根地图"提供后端服务的 Node.js 应用。

## 功能特性

- 🔐 微信静默登录认证
- 📊 学习数据统计和分析
- 🔄 智能复习算法（基于艾宾浩斯遗忘曲线）
- 📝 学习事件记录
- 🗂️ 词根和单词数据管理
- 📈 用户进度追踪
- 🔧 可配置的用户设置

## 技术栈

- **后端框架**: Express.js
- **数据库**: MySQL 8.0+
- **认证**: JWT + 微信小程序授权
- **日志**: Winston
- **数据验证**: Joi
- **安全**: Helmet + CORS + 速率限制

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 环境配置

复制 `.env.example` 为 `.env` 并配置相关参数：

```bash
cp .env.example .env
```

必要配置项：
- `MYSQL_HOST`: 数据库主机地址
- `MYSQL_USER`: 数据库用户名
- `MYSQL_PASSWORD`: 数据库密码
- `MYSQL_DATABASE`: 数据库名称
- `WX_APPID`: 微信小程序 AppID
- `WX_SECRET`: 微信小程序 AppSecret

### 3. 数据库初始化

应用启动时会自动创建所需的数据表。如果需要手动初始化：

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rootmap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 授予权限（可选）
mysql -u root -p -e "GRANT ALL PRIVILEGES ON rootmap.* TO 'root'@'localhost';"
```

### 4. 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务将在 `http://127.0.0.1:3000` 启动。

## 内容数据流水线

内容以**词根为中心**组织:每个词恰有 1 个词根段,按词根分族;前缀后缀作为辅助拆解段。
数据分「手写精选层 + 生成层」两层,在 `miniprogram/data/index.js` 合并后交付。

```
[第 1 段]  server/scripts/generate-cet4.js
  miniprogram/data/{roots,affixes}(手写,作为 morphology 基底)
  + server/data/raw-cet4/*.json(CET4 + GaoZhong 语料)
  → server/data/cet4/index.js        5554 词,其中 1316 词可拆解(其余整词 none)
        │
        │  产物只是「逐词猜拆解」的全量语料,不是交付集
        ▼
[第 2 段]  server/scripts/generate-content.js
  倒过来以词根为起点收词:只收拆得动的词、按词根分族、与手写精选层合并
  → miniprogram/data/generated/**    生成层(209 个族)
  → miniprogram/data/index.js        交付集 213 根 / 151 缀 / 1350 词
        │
        ▼
[入库]     server/src/seed.js  → 清空并重灌 6 张内容表(单事务)
```

第 1 段的 1316 条可拆解词来自两条通道:1252 条由形态学规则直接拆出(根变体 + 词缀 + R7
有界残段),64 条由语料 `relWord`「同根」声明背书(R8)。两条通道都会产出伪词源,
因此候选词必须**逐词人工审校**,否决结果落在 `generate-cet4.js` 的 `NO_DECOMPOSE`
(现 251 条,其中 222 条是「规则本会收下、人审否决」)。`generate-cet4.js` 导出
`blacklistPressure()` 把这两个数暴露出来,`server/test/dataset-merge.test.js` 的 ⑩ 号用例
钉住它们 —— 改动任何拆解规则都会让它们变,从而强制重跑审校。

### 命令顺序

```bash
npm run generate:cet4      # 第 1 段:语料 → 可拆解词表(仅在改词典/拆解算法时跑)
npm run generate:content   # 第 2 段:装配交付集(读第 1 段产物 + 手写层)
npm run validate           # 内容校验:213 roots / 151 affixes / 1350 words
npm run audit              # 内容质检:硬红线非零即退出码 1
npm run seed               # 校验通过后清空并重灌 6 张内容表
npm run verify:db          # 逐字段核对交付集 vs 数据库(截断/丢失/孤儿行,0 才退出码 0)
npm run generate:content -- --check   # 只比对不写盘:磁盘交付集与生成结果是否一致
```

只有改了**形态学词典或拆解算法**时才需要重跑第 1 段,之后必须重跑第 2 段
(顺序固定:`generate:cet4` → `generate:content` → `validate` → `seed`)。日常改内容不必碰第 1 段。
`server/data/` 不进版本控制,所以第 1 段的产物无法在 PR diff 里评审 —— 改拆解规则时
请连同 `blacklistPressure()` 的两个数字一起说明变化。

### 三道门禁

| 门禁 | 位置 | 作用 |
|---|---|---|
| 生成器契约 | `generate-cet4.js` 结尾断言 + `generate-content.js` Pass B | 产物必须满足拆解算法的结构性约束 |
| 交付集红线 | `generate-content.js` Pass C(写盘前)、`seed.js`(连库前) | 不合规就**不写盘 / 不连库**,不留中间态 |
| 内容质检 | `npm run audit` | 音标可疑字符、例句残留 HTML / `(= …)` 片段、跨词重复例句等 |

### 为什么交付集不能传 `generated: true`

`scripts/validate-content.js` 的 `opts.generated` 是给**生成器**用的严格契约(词缀段文本必须与
词典 `text` 完全一致、单字母前缀只能是 `e-`、同 type 同 text 的词缀唯一)。它对交付集会大面积误报:

1. **手写层刻意使用同化后的表面形做段文本** —— `support` 的段是 `sup-`(refId 指向 `affix-sub`)、
   `attract` 的段是 `at-`(→ `affix-ad`)、`oppress` 的段是 `op-`(→ `affix-ob`)。这是拉丁同化,
   是手写层的设计而不是缺陷(实测 15 例)。
2. **手写层刻意保留 `in-` 的两条同形词缀** —— 「向内/进入」(`affix-in`)与「不/非」
   (`affix-in-neg`)分列,段的 `refId` 各自指向对应那条。生成器的变体索引是 first-wins,容纳不下
   这种区分,故在产物里被 `morphology.js` 的 `MERGED_AFFIX_IN` 合并成一条。

因此交付集只用通用红线校验(`npm run validate` + `npm run audit`);生成侧的契约由第 1 段与
第 2 段的 Pass B 在装配时保证。反向的 `npm run audit -- --generated` 会明确报出这两类差异,
用来复查产物本身。

### 该改哪里

| 想改什么 | 改哪里 |
|---|---|
| 单个词条/词根/词缀的文案、例句、拆解 | `miniprogram/data/{roots.js,affixes.js,families/}`(手写层,人工维护) |
| 拆解算法、词根词缀词典、覆盖面 | `server/src/morphology.js` + `server/scripts/generate-cet4.js` → 重跑第 1、2 段 |
| 生成层的排序/分族/合并规则 | `server/scripts/generate-content.js` → 重跑第 2 段 |

**生成器只写 `miniprogram/data/generated/` 与 `miniprogram/data/index.js`,对手写层只读**,
所以重新装配不可能破坏手写内容;`server/test/dataset-merge.test.js` 用逐字段快照把这个不变量钉死。

### 重建前提

语料目录 `server/data/`(含 37 MB 的 `raw-cet4/` 与产物 `cet4/index.js`)**被 `.gitignore` 排除**,
只存在于本机。因此**新克隆的仓库无法重新生成内容** —— 它只能使用已提交的生成层与手写层。
需要重建时得先取回 kajweb/dict 的 CET4 JSONL 放到 `server/data/raw-cet4/`。生成文件头记录了
输入内容的 sha1,可用于确认产出对应的输入版本。

> ⚠️ **当前 `miniprogram/data/generated/`(209 个文件)尚未纳入版本控制**,而
> `miniprogram/data/index.js` 已改为 `require('./generated')`。也就是说:**此刻直接
> `git commit` 会让新克隆在加载交付集时抛异常**(缺 `./generated`)。
> 提交前必须先把生成层一起加进版本控制:
>
> ```bash
> git add miniprogram/data/generated miniprogram/data/index.js
> ```
>
> 手写层(`roots.js`/`affixes.js`/`families/`)一直是有版本控制的,只有生成层漏了 ——
> 这不是本次扩词引入的,而是它第一次暴露出来(在此之前 `index.js` 只合并手写层,
> 生成层从未进过仓库)。
>
> 另外,生成层与 `index.js` **必须固定 LF 行尾**(根目录 `.gitattributes` 已声明)。
> 这两处是 `--check` 逐字节比较的对象,而本仓库 `core.autocrlf=true`:不做声明时 git 检出
> 会把 LF 换成 CRLF,`--check` 随即报「不一致」,重跑生成器又把工作区刷回 LF —— 两边打架。
> 新克隆之所以能开箱即用,靠的就是这条声明。


## API 文档

### 认证接口

#### POST /api/auth/wechat
微信登录
```json
{
  "code": "微信登录code"
}
```

响应：
```json
{
  "token": "session_token",
  "user": {
    "id": 1,
    "openid": "user_openid"
  },
  "expires_at": "2024-01-01T00:00:00.000Z"
}
```

#### GET /api/auth/me
获取当前用户信息

#### POST /api/auth/logout
退出登录

### 内容接口

#### GET /api/content/meta
获取内容元数据

#### GET /api/content/roots
获取所有词根

#### GET /api/content/roots/:id
获取词根详情及关联单词

#### GET /api/content/search
搜索词根和单词
```
?q=查询关键词&mode=root|word|all
```

### 事件接口（需要认证）

#### POST /api/events
批量上报学习事件
```json
{
  "events": [
    {
      "type": "learn",
      "wordId": "word1",
      "rootId": "root1",
      "at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/events/review/:wordId
复习单词
```json
{
  "a": 1,
  "q": 1
}
```

#### GET /api/events/due
获取今日待复习单词列表

### 统计接口（需要认证）

#### GET /api/stats/overview
获取学习概览

#### GET /api/stats/daily?days=14
获取每日统计数据

#### GET /api/stats/roots?days=30&limit=15
获取词根正确率统计

### 设置接口（需要认证）

#### GET /api/settings
获取用户设置

#### PUT /api/settings
更新用户设置
```json
{
  "settings": {
    "dailyReviewLimit": "100",
    "expandAssocByDefault": true
  }
}
```

## 数据库设计

### 主要表结构

#### users
- `id`: 用户ID
- `openid`: 微信openid
- `created_at`: 创建时间
- `settings`: 用户设置(JSON)

#### sessions
- `token`: 会话token
- `user_id`: 用户ID
- `created_at`: 创建时间
- `expires_at`: 过期时间

#### events
- `id`: 事件ID
- `user_id`: 用户ID
- `type`: 事件类型(learn/review)
- `word_id`: 单词ID
- `root_id`: 词根ID
- `q`: 问题选项
- `a`: 用户答案
- `correct`: 是否正确
- `interval_hours`: 复习间隔
- `at`: 事件时间

#### word_progress
- `user_id`: 用户ID
- `word_id`: 单词ID
- `learned_at`: 学习时间
- `reviewed_at`: 复习时间
- `review_count`: 复习次数
- `correct_count`: 正确次数
- `level`: 学习等级(new/learning/familiar/master)
- `next_review`: 下次复习时间

#### root_progress
- `user_id`: 用户ID
- `root_id`: 词根ID
- `learned_words`: 已学单词列表(JSON)
- `reviewed_at`: 复习时间
- `review_count`: 复习次数
- `correct_count`: 正确次数
- `level`: 学习等级

## 开发指南

### 添加新的API端点

1. 在相应的路由文件中添加新路由
2. 实现业务逻辑
3. 添加适当的中间件
4. 编写测试用例

### 数据库迁移

如果需要修改表结构，可以在 `db.js` 中的 `TABLE_DDL` 数组中添加新的DDL语句。应用启动时会自动执行迁移。

### 日志

应用使用 Winston 记录日志，日志文件位于 `./logs/` 目录：
- `combined.log`: 所有日志
- `error.log`: 错误日志
- `http.log`: HTTP请求日志
- `database.log`: 数据库操作日志
- `audit.log`: 用户行为日志

### 错误处理

API 使用统一的错误格式：
```json
{
  "error": {
    "code": "error_code",
    "message": "Error message"
  }
}
```

## 部署

### 使用 Docker

```bash
# 构建镜像
docker build -t rootmap-server .

# 运行容器
docker run -p 3000:3000 \
  -e MYSQL_HOST=mysql \
  -e MYSQL_USER=root \
  -e MYSQL_PASSWORD=password \
  -e MYSQL_DATABASE=rootmap \
  rootmap-server
```

### 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status
```

## 常见问题

### Q: 数据库连接失败
A: 检查 `.env` 文件中的数据库配置，确保MySQL服务正在运行。

### Q: 微信登录失败
A: 检查微信小程序的AppID和AppSecret是否正确配置。

### Q: 端口被占用
A: 修改 `.env` 文件中的 `PORT` 配置，或使用其他端口。

## 许可证

MIT License