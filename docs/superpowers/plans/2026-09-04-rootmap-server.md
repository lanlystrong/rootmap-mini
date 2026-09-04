# 服务端实现计划(账号 / 内容下发 / 事件统计)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为纯本地「词根地图」小程序(30 词根/66 词缀/201 词)新增自建 Node HTTP API 服务端:多用户账号、词典内容下发、学习事件收集与云端统计;小程序仅小改接入。

**Architecture:** 同仓新增 `server/`;Express 5(根依赖唯一新增)+ Node 24 内置 `node:sqlite`;内容 `require('../../miniprogram/data/index')` 单源复用。学习进度仍以小程序本地 `rm_progress_v1` 为唯一真源,服务端只存 users/sessions/events,不回写 SRS。

**Tech Stack:** Express 5(根 package.json 唯一新增依赖)、Node v24 内置 `node:sqlite`(DatabaseSync)、`node:crypto`(scrypt)、`node:test` + 全局 fetch 集成测试。禁用 better-sqlite3 与其它 DB 依赖。

**Spec:** `docs/superpowers/specs/2026-09-04-rootmap-server-design.md`(binding;计划是其论证)。

## Global Constraints

以下为 spec 关键约束,逐任务**照抄执行**(值不得改动):

- Express 只装根 `package.json`(server/ 不建独立 package.json、无独立 install);SQLite 一律内置 `node:sqlite`(`const { DatabaseSync } = require('node:sqlite')`)。API_BASE/密钥等常量单点。
- 根 `package.json` 追加 scripts:`"server": "node server/src/server.js"`、`"test:server": "node --test \"server/test/**/*.test.js\""`;deps 追加 `express`(`^5`)。`.gitignore` 追加 `server/data/`。
- 错误统一 `{error:{code,message}}`;未带/失效 token → `401 {error:{code:'unauthorized'}}`;参数非法 `400`(code 见各端点);唯一冲突 `409 username_taken`;登录失败 `401 bad_credentials`;不存在 `404`。JSON body `express.json({limit:'1mb'})`。
- 密码:`salt=crypto.randomBytes(16).toString('hex')`;`hash=crypto.scryptSync(password,salt,64).toString('hex')`;比较用 `crypto.timingSafeEqual`。token=`crypto.randomBytes(24).toString('hex')`;session 过期 `now+30d`(ISO),过期即删并 401。登出删该 token。
- events:type∈{study,review};wordId 必须在词典(`wordSet`),未知词 ignored 不落库;review 必带 `q∈{1,3,5}`、study **不得**带 q;`at` 缺省=服务端当前 `YYYY-MM-DDTHH:mm:ss`,给定须匹配 `^\d{4}-\d{2}-\d{2}$` 或 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$` 且为合法日期;单批 ≤200(超出截断,响应带 `truncated:true`);返回 `200 {accepted, ignored[, truncated]}`。
- stats 口径:overview `totalStudied`=有≥1 study 的去重 word 数;`gradeDist:{q1,q3,q5}`;`lapses`=q1 数;`accuracy=1-q1/(q1+q3+q5)`,无 review 记 0。daily 返回升序 `[{date:'YYYY-MM-DD',new,reviews,lapses}]`,**今天在末**、缺日补 0,与小程序 `computeStats().last14` 同构。roots 按 reviews 降序、limit 钳制 ≤30。空数据全 0/空数组不报错。
- 内容单源 = `require('../../miniprogram/data/index')`,服务端**不改写任何词条**;`wordSet`/`wordRootMap` 由 `breakdown` 中 `type==='root'` 段的 `refId` 建(与小程序 `utils/content.js` 同逻辑)。
- 小程序侧:token 存 `rm_token_v1`、用户名 `rm_user_v1`、事件待发队列 `rm_events_pending_v1`(上限 1000,丢最旧);`API_BASE` 默认 `http://127.0.0.1:3000`。本地写(store.markStudied/applyReview)先于并独立于上报,上报 fire-and-forget、离线静默不阻塞。
- **现有 `npm test`(31 例)与 `npm run validate`(`✓ 内容通过: 30 roots / 66 affixes / 201 words`)必须保持**;本轮不改 `data/`、不改既有 `utils/*.js` 已导出逻辑(只新增 api.js/reporter.js 文件 + profile/word/review 三处增量)。
- 微信组件/页面既有约束(profile 修改沿用):组件 4 文件、`options:{addGlobalClass:true}`、绝对路径注册、rpx、复用既有 `stat-bar`(`data` 属性 = last14 同构数组)。
- 本机无微信开发者工具:UI/联调步骤一律标「待用户 DevTools 验证」,不伪造截图。
- 隔离:SDD 实施在当前 repo 新分支 `feat/server-v1`(自 master),结束后按 finishing-a-development-branch 呈现合并。

---

### Task 1: 服务端骨架 — db + content 数据层 + Express 组装 + 基础中间件 + 入口

**Files:**
- Modify: `package.json`(根:scripts `server`/`test:server`、deps `express`)、`.gitignore`(追加 `server/data/`)
- Create: `server/src/db.js`、`server/src/content.js`、`server/src/middleware.js`、`server/src/contentRouter.js`、`server/src/app.js`、`server/src/server.js`、`server/test/helper.js`、`server/test/db-content.test.js`、`server/test/http-smoke.test.js`
- Test: `npm run test:server`、`npm test`、`npm run validate`、`npm run server`(入口可起)

**Interfaces:**
- Produces(db.js): `createDb(dbPath)` → `node:sqlite` `DatabaseSync` 实例,已建表(users/sessions/events + 两索引)。dbPath=`':memory:'` 或文件路径(自动建父目录)。
- Produces(content.js): `loadContent()` → `{ roots, affixes, words, wordSet:Set, wordRootMap:Map(wordId→rootId), meta, byWord(id), rootWords(rootId), affixWords(affixId), rootOfWord(id) }`。`meta={name:'rootmap', counts:{roots,affixes,words}, checksum, version:'0.1.0'}`;checksum = sha1(hex) over `JSON.stringify({roots:ids,affixes:ids,words:ids})`。
- Produces(middleware.js): `notFound`, `errorHandler`(Express 中间件)。
- Produces(contentRouter.js): `contentRouter(content)` → 公开只读 GET 路由(契约见 spec §3.2)。
- Produces(app.js): `createApp({dbPath=':memory:'}={})` → `{ app, db, content }`。
- Consumes(后续任务):Task 2 用 `authRouter(db)`(Task 3 提供的 `authRequired`),Task 3 挂 `eventsRouter`,Task 4 挂 `statsRouter`——都在 `createApp` 内完成。

- [ ] **Step 1: 根 package.json 与 .gitignore**

改根 `package.json`(保持现 test/validate 不变):
```jsonc
"dependencies": { "express": "^5.2.1" },
"scripts": { "test": "node --test \"tests/**/*.test.js\"", "validate": "node scripts/validate-content.js", "server": "node server/src/server.js", "test:server": "node --test \"server/test/**/*.test.js\"" }
```
`.gitignore` 末尾追加 `server/data/`。然后 `npm install`(装 express)。

- [ ] **Step 2: 先写 db+content 单测(失败)**

`server/test/db-content.test.js`,用 `node:test` + `assert`:
```js
const test = require('node:test');
const assert = require('node:assert');
const { createDb } = require('../src/db');
const { loadContent } = require('../src/content');

test('createDb 建齐三表(users/sessions/events)且 events 可写读回', () => {
  const db = createDb(':memory:');
  db.prepare("INSERT INTO users(username,pass_hash,salt,created_at) VALUES(?,?,?,?)")
    .run('u1', 'h', 's', '2026-09-04T00:00:00');
  db.prepare("INSERT INTO events(user_id,type,word_id,q,at) VALUES(?,?,?,?,?)")
    .run(1, 'review', 'spectator', 3, '2026-09-04T13:00:00');
  const r = db.prepare("SELECT * FROM events").get();
  assert.equal(r.user_id, 1); assert.equal(r.type, 'review');
  assert.equal(r.q, 3); assert.equal(r.word_id, 'spectator');
});

test('content 单源:计数 30/66/201、wordSet 含词、wordRootMap/rootWords 正确', () => {
  const c = loadContent();
  assert.equal(c.roots.length, 30); assert.equal(c.affixes.length, 66); assert.equal(c.words.length, 201);
  assert.ok(c.wordSet.has('spectator'));
  assert.equal(c.rootOfWord('spectator'), 'root-spect');          // breakdown root refId(本数据 spect/spectat 族)
  assert.equal(c.rootOfWord('notexist'), undefined);
  assert.ok(c.rootWords('root-spect').some(w => w.id === 'spectator'));
  assert.ok(c.meta.counts.words === 201 && /^[0-9a-f]{40}$/.test(c.meta.checksum));
});
```
> 注:`spectator` 所属词根 id 以 `miniprogram/data/words/spectator.js` 中 breakdown root refId 实际值为准——实现时先用 `node -e` 查该值,再回填此处断言;若族 id 非 `root-spect`,改用实际值(如 `root-spectat`),断言须与实现一致,不得改断言值去迁就错误实现。

- [ ] **Step 3: 运行确认失败**

`npm run test:server` → 因 `../src/db` 不存在而报 MODULE_NOT_FOUND(或 db 模块缺)。

- [ ] **Step 4: 实现 db.js**

```js
// server/src/db.js
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  pass_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions(
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK(type IN ('study','review')),
  word_id TEXT NOT NULL,
  q INTEGER,
  at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_user_at ON events(user_id, at);
CREATE INDEX IF NOT EXISTS idx_events_user_type ON events(user_id, type);
`;

function createDb(dbPath) {
  if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(SCHEMA);
  return db;
}
module.exports = { createDb };
```

- [ ] **Step 5: 实现 content.js**

```js
// server/src/content.js
const crypto = require('node:crypto');
const index = require('../../miniprogram/data/index'); // {roots, affixes, words}

function loadContent() {
  const roots = index.roots, affixes = index.affixes, words = index.words;
  const wordSet = new Set(words.map(w => w.id));
  const wordRootMap = new Map();
  for (const w of words) {
    const rp = w.breakdown.find(b => b.type === 'root');
    if (rp && rp.refId) wordRootMap.set(w.id, rp.refId);
  }
  const checksum = crypto.createHash('sha1')
    .update(JSON.stringify({
      roots: roots.map(r => r.id), affixes: affixes.map(a => a.id),
      words: words.map(w => w.id),
    })).digest('hex');
  const rootById = new Map(roots.map(r => [r.id, r]));
  const affixById = new Map(affixes.map(a => [a.id, a]));
  const rootWords = (rootId) =>
    words.filter(w => wordRootMap.get(w.id) === rootId);
  const affixWords = (affixId) =>
    words.filter(w => w.breakdown.some(b => (b.type === 'prefix' || b.type === 'suffix') && b.refId === affixId));
  return {
    roots, affixes, words, wordSet, wordRootMap,
    meta: { name: 'rootmap', counts: { roots: roots.length, affixes: affixes.length, words: words.length }, checksum, version: '0.1.0' },
    byWord: (id) => wordSet.has(id) ? words.find(w => w.id === id) : undefined,
    byRoot: (id) => rootById.get(id),
    byAffix: (id) => affixById.get(id),
    rootWords, affixWords, rootOfWord: (id) => wordRootMap.get(id),
  };
}
module.exports = { loadContent };
```

- [ ] **Step 6: 实现 middleware.js / contentRouter.js / app.js / server.js**

`server/src/middleware.js`:
```js
const notFound = (req, res) => res.status(404).json({ error: { code: 'not_found', message: '路由不存在' } });
const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: { code: 'bad_json', message: 'JSON 解析失败' } });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: { code: 'payload_too_large', message: '请求体过大' } });
  console.error(err);
  res.status(500).json({ error: { code: 'internal', message: '服务器内部错误' } });
};
module.exports = { notFound, errorHandler };
```
`server/src/contentRouter.js`:
```js
const express = require('express');
function contentRouter(content) {
  const r = express.Router();
  r.get('/meta', (req, res) => res.json(content.meta));
  r.get('/roots', (req, res) => res.json(content.roots));
  r.get('/affixes', (req, res) => res.json(content.affixes));
  r.get('/words', (req, res) => res.json(content.words));
  r.get('/words/:id', (req, res) => { const w = content.byWord(req.params.id); if (!w) return res.status(404).json({ error: { code: 'not_found', message: '词不存在' } }); res.json(w); });
  r.get('/roots/:id', (req, res) => { const root = content.byRoot(req.params.id); if (!root) return res.status(404).json({ error: { code: 'not_found', message: '词根不存在' } }); res.json({ root, words: content.rootWords(root.id) }); });
  r.get('/affixes/:id', (req, res) => { const af = content.byAffix(req.params.id); if (!af) return res.status(404).json({ error: { code: 'not_found', message: '词缀不存在' } }); res.json({ affix: af, words: content.affixWords(af.id) }); });
  return r;
}
module.exports = { contentRouter };
```
`server/src/app.js`:
```js
const express = require('express');
const { createDb } = require('./db');
const { loadContent } = require('./content');
const { contentRouter } = require('./contentRouter');
const { notFound, errorHandler } = require('./middleware');

function createApp({ dbPath = ':memory:' } = {}) {
  const db = createDb(dbPath);
  const content = loadContent();
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/content', contentRouter(content));
  // 后续任务各自动挂载:/api/auth(Task 2)、/api/events(Task 3)、/api/stats(Task 4)
  app.use(notFound);
  app.use(errorHandler);
  return { app, db, content };
}
module.exports = { createApp };
```
`server/src/server.js`:
```js
const path = require('node:path');
const { createApp } = require('./app');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'rootmap.db');
const PORT = Number(process.env.PORT) || 3000;
const { app } = createApp({ dbPath: DB_PATH });
app.listen(PORT, () => console.log(`[rootmap-server] listening on http://127.0.0.1:${PORT} (db: ${DB_PATH})`));
```

- [ ] **Step 7: helper.js + HTTP 冒烟测试(内容路由)**

`server/test/helper.js`:
```js
// server/test/helper.js
const { once } = require('node:events');
const { createApp } = require('../src/app');
async function startServer({ dbPath = ':memory:' } = {}) {
  const { app, db } = createApp({ dbPath });
  const srv = app.listen(0);
  await once(srv, 'listening');
  const base = `http://127.0.0.1:${srv.address().port}`;
  return { base, db, close: () => new Promise((r) => srv.close(r)) };
}
async function jfetch(base, method, p, { auth, body } = {}) {
  const res = await fetch(base + p, {
    method,
    headers: { 'content-type': 'application/json', ...(auth ? { authorization: `Bearer ${auth}` } : {}) },
    body: body == null ? undefined : JSON.stringify(body),
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  return { status: res.status, data };
}
module.exports = { startServer, jfetch };
```
`server/test/http-smoke.test.js`:
```js
const test = require('node:test');
const assert = require('node:assert');
const { startServer, jfetch } = require('./helper');

test('content 公开路由:meta/列表/单词/词根族/404', async () => {
  const s = await startServer();
  try {
    const meta = await jfetch(s.base, 'GET', '/api/content/meta');
    assert.equal(meta.status, 200);
    assert.equal(meta.data.counts.words, 201);
    const w = await jfetch(s.base, 'GET', '/api/content/words/spectator');
    assert.equal(w.status, 200); assert.equal(w.data.id, 'spectator');
    assert.equal((await jfetch(s.base, 'GET', '/api/content/words/nope')).status, 404);
    const fam = await jfetch(s.base, 'GET', '/api/content/words/spectator'); // 先查词根 id 再做族断言
    assert.ok(fam.data && fam.data.id === 'spectator');
    assert.equal((await jfetch(s.base, 'GET', '/api/nope')).status, 404);
  } finally { await s.close(); }
});
```
(词根族断言 `roots/:id` 的族 id 同样以实际值为准,Step 2 已确认。)

- [ ] **Step 8: 跑测试转绿 + 入口冒烟**

`npm run test:server` → 全过;`npm test` 仍 31;`npm run validate` 30/66/201。后台起 `npm run server`(临时 DB_PATH 指向 gitignore 目录)再 curl `http://127.0.0.1:3000/api/content/meta` 得 200 后 kill,报告输出。

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat(server): Express+node:sqlite 骨架、内容单源与公开路由"
```

---

### Task 2: auth — 注册/登录/登出/me + Bearer 鉴权

**Files:**
- Create: `server/src/authRouter.js`、`server/test/auth.test.js`
- Modify: `server/src/app.js`(挂 `/api/auth`)
- Test: `npm run test:server`

**Interfaces:**
- Consumes: `createDb` 的 db(Task 1)。
- Produces: `authRouter(db)` → express.Router:POST `/register`(201 `{token,user}`)、POST `/login`(200 同)、POST `/logout`(204,鉴权)、GET `/me`(200 `{user}`,鉴权)。`authRequired(db)` → 中间件(req.user={id,username};失败 401 `unauthorized`)。
- User row 列:id/username/pass_hash/salt/created_at;session 列:token/user_id/created_at/expires_at。

- [ ] **Step 1: 写失败测试 `server/test/auth.test.js`**

```js
const test = require('node:test');
const assert = require('node:assert');
const { startServer, jfetch } = require('./helper');

test('注册即登录;重复用户名 409;me 返回本人', async () => {
  const s = await startServer();
  try {
    const ok = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'alice_01', password: 'secret123' } });
    assert.equal(ok.status, 201);
    assert.ok(ok.data.token && ok.data.user.username === 'alice_01');
    const dup = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'alice_01', password: 'other456' } });
    assert.equal(dup.status, 409); assert.equal(dup.data.error.code, 'username_taken');
    const me = await jfetch(s.base, 'GET', '/api/auth/me', { auth: ok.data.token });
    assert.equal(me.status, 200); assert.equal(me.data.user.username, 'alice_01');
  } finally { await s.close(); }
});

test('登录校验:正确通过、错误 401 bad_credentials、未带 token 401 unauthorized', async () => {
  const s = await startServer();
  try {
    await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'bob', password: 'secret123' } });
    const bad = await jfetch(s.base, 'POST', '/api/auth/login', { body: { username: 'bob', password: 'wrong' } });
    assert.equal(bad.status, 401); assert.equal(bad.data.error.code, 'bad_credentials');
    const ok = await jfetch(s.base, 'POST', '/api/auth/login', { body: { username: 'bob', password: 'secret123' } });
    assert.equal(ok.status, 200);
    const none = await jfetch(s.base, 'GET', '/api/auth/me');
    assert.equal(none.status, 401); assert.equal(none.data.error.code, 'unauthorized');
  } finally { await s.close(); }
});

test('登出后原 token 失效;非法入参 400', async () => {
  const s = await startServer();
  try {
    const r = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'carol', password: 'secret123' } });
    const out = await jfetch(s.base, 'POST', '/api/auth/logout', { auth: r.data.token });
    assert.equal(out.status, 204);
    const me = await jfetch(s.base, 'GET', '/api/auth/me', { auth: r.data.token });
    assert.equal(me.status, 401);
    const short = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'x', password: 'secret123' } });
    assert.equal(short.status, 400);
    const badpw = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'ok_name', password: '123' } });
    assert.equal(badpw.status, 400);
  } finally { await s.close(); }
});
```

- [ ] **Step 2: 运行确认失败**(auth 路由未挂 → 404/断言失败)。

- [ ] **Step 3: 实现 authRouter.js**

时间裁定:会话 created_at/expires_at 用 UTC `new Date().toISOString()`(与 events.at 的本地时刻规约无关;见 Task 3 time.js)。完整实现:
```js
// server/src/authRouter.js
const express = require('express');
const crypto = require('node:crypto');
const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
const DAY_MS = 86400000;

function hashPassword(password, saltHex) {
  return crypto.scryptSync(password, saltHex, 64).toString('hex');
}
function makeToken() { return crypto.randomBytes(24).toString('hex'); }
function validUser(user) { return { id: user.id, username: user.username }; }

function authRequired(db) {
  return (req, res, next) => {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: { code: 'unauthorized', message: '未登录' } });
    const row = db.prepare(
      'SELECT s.token, s.expires_at, u.id, u.username FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?'
    ).get(token);
    if (!row) return res.status(401).json({ error: { code: 'unauthorized', message: '会话无效' } });
    if (new Date(row.expires_at) < new Date()) {
      db.prepare('DELETE FROM sessions WHERE token=?').run(token);
      return res.status(401).json({ error: { code: 'unauthorized', message: '会话过期' } });
    }
    req.user = { id: row.id, username: row.username };
    next();
  };
}

function authRouter(db) {
  const r = express.Router();
  const insertUser = db.prepare('INSERT INTO users(username,pass_hash,salt,created_at) VALUES(?,?,?,?)');
  const insertSession = db.prepare('INSERT INTO sessions(token,user_id,created_at,expires_at) VALUES(?,?,?,?)');
  const findByUser = db.prepare('SELECT * FROM users WHERE username=?');

  const respondAuth = (res, user) => {
    const token = makeToken();
    const created = new Date().toISOString();
    const expires = new Date(Date.now() + 30 * DAY_MS).toISOString();
    insertSession.run(token, user.id, created, expires);
    res.json({ token, user: validUser(user) });
  };

  r.post('/register', (req, res) => {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || !USERNAME_RE.test(username))
      return res.status(400).json({ error: { code: 'bad_request', message: '用户名须 3-20 位字母/数字/下划线' } });
    if (typeof password !== 'string' || password.length < 6 || password.length > 72)
      return res.status(400).json({ error: { code: 'bad_request', message: '密码须 6-72 位' } });
    if (findByUser.get(username)) return res.status(409).json({ error: { code: 'username_taken', message: '用户名已存在' } });
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const created = new Date().toISOString();
    const info = insertUser.run(username, hash, salt, created);
    const user = { id: Number(info.lastInsertRowid), username };
    res.status(201);
    respondAuth(res, user);
  });

  r.post('/login', (req, res) => {
    const { username, password } = req.body || {};
    const row = (typeof username === 'string') ? findByUser.get(username) : undefined;
    if (!row || typeof password !== 'string') return res.status(401).json({ error: { code: 'bad_credentials', message: '用户名或密码错误' } });
    const hash = Buffer.from(hashPassword(password, row.salt), 'hex');
    const expect = Buffer.from(row.pass_hash, 'hex');
    if (hash.length !== expect.length || !crypto.timingSafeEqual(hash, expect))
      return res.status(401).json({ error: { code: 'bad_credentials', message: '用户名或密码错误' } });
    respondAuth(res, row);
  });

  const guard = authRequired(db);
  r.post('/logout', guard, (req, res) => {
    const token = (req.headers.authorization || '').slice(7);
    db.prepare('DELETE FROM sessions WHERE token=?').run(token);
    res.status(204).end();
  });
  r.get('/me', guard, (req, res) => res.json({ user: req.user }));
  return r;
}
module.exports = { authRouter, authRequired, hashPassword };
```

- [ ] **Step 4: app.js 挂载并测试转绿**

`app.js`:顶部 `const { authRouter } = require('./authRouter');`;content 挂载后加 `app.use('/api/auth', authRouter(db));`。`npm run test:server`(auth 3 组 + 既有全过)、`npm test` 31、validate 30/66/201。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(server): 用户名+密码注册/登录 + Bearer 会话鉴权"
```

---

### Task 3: events — 批量事件接收与校验

**Files:**
- Create: `server/src/time.js`、`server/src/eventsRouter.js`、`server/test/events.test.js`
- Modify: `server/src/app.js`(挂 `/api/events`)
- Test: `npm run test:server`

**Interfaces:**
- Consumes: `authRequired(db)`(Task 2)、`content.wordSet`。
- Produces: `eventsRouter(db, content)` → 受鉴权 POST `/`;body `{events:[{type,wordId,q?,at?}]}` → `200 {accepted,ignored[,truncated]}`。
- Produces(time.js): `nowAt()`(本地 `YYYY-MM-DDTHH:mm:ss`)、`todayISO()`(本地 `YYYY-MM-DD`)。裁定:本机联调客户端/服务端同机同时区,事件 `at` 与「今天」均按本地时间;跨时区不在本轮范围。

- [ ] **Step 1: 写失败测试 `server/test/events.test.js`**

```js
const test = require('node:test');
const assert = require('node:assert');
const { startServer, jfetch } = require('./helper');

test('事件入库:合法批 accepted=n、含未知词 ignored;review 带 q 落库', async () => {
  const s = await startServer();
  try {
    const r = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'eve', password: 'secret123' } });
    const body = { events: [
      { type: 'study', wordId: 'spectator', at: '2026-09-04T13:00:00' },
      { type: 'review', wordId: 'spectator', q: 3 },
      { type: 'review', wordId: 'notaword', q: 5 },       // 未知词 → ignored
    ]};
    const res = await jfetch(s.base, 'POST', '/api/events', { auth: r.data.token, body });
    assert.equal(res.status, 200);
    assert.equal(res.data.accepted, 2); assert.equal(res.data.ignored, 1);
  } finally { await s.close(); }
});

test('事件校验:无 token 401;非法 type/q 缺失/study 带 q/at 格式错 → 400', async () => {
  const s = await startServer();
  try {
    const r = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'fay', password: 'secret123' } });
    const bad = (events) => jfetch(s.base, 'POST', '/api/events', { auth: r.data.token, body: { events } });
    assert.equal((await bad([{ type: 'bogus', wordId: 'spectator' }])).status, 400);
    assert.equal((await bad([{ type: 'review', wordId: 'spectator' }])).status, 400);           // q 缺失
    assert.equal((await bad([{ type: 'study', wordId: 'spectator', q: 5 }])).status, 400);      // study 带 q
    assert.equal((await bad([{ type: 'review', wordId: 'spectator', q: 2 }])).status, 400);     // q ∉{1,3,5}
    assert.equal((await bad([{ type: 'study', wordId: 'spectator', at: 'not-a-date' }])).status, 400);
    const none = await jfetch(s.base, 'POST', '/api/events', { body: { events: [] } });
    assert.equal(none.status, 401);
  } finally { await s.close(); }
});

test('单批超 200 截断:truncated:true 且 accepted≤200', async () => {
  const s = await startServer();
  try {
    const r = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'gal', password: 'secret123' } });
    const events = Array.from({ length: 250 }, (_, i) => ({ type: 'study', wordId: 'spectator' }));
    const res = await jfetch(s.base, 'POST', '/api/events', { auth: r.data.token, body: { events } });
    assert.equal(res.status, 200); assert.equal(res.data.accepted, 200); assert.equal(res.data.truncated, true);
  } finally { await s.close(); }
});
```

- [ ] **Step 2: 运行确认失败。**

- [ ] **Step 3: 实现 time.js + eventsRouter.js**

`server/src/time.js`:
```js
// server/src/time.js — 本机联调按本地时区;跨时区不在本轮范围
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function nowAt() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function todayISO() { return nowAt().slice(0, 10); }
module.exports = { nowAt, todayISO };
```
`server/src/eventsRouter.js`:
```js
// server/src/eventsRouter.js
const express = require('express');
const { nowAt } = require('./time');
const MAX_BATCH = 200;
const Q_SET = new Set([1, 3, 5]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const AT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

function validAt(at) {
  if (at == null) return { ok: true, value: nowAt() };
  if (typeof at !== 'string') return { ok: false };
  if (!DATE_RE.test(at) && !AT_RE.test(at)) return { ok: false };
  const t = AT_RE.test(at) ? at : at + 'T00:00:00';
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return { ok: false };
  return { ok: true, value: at };
}

function validateEvents(events, wordSet) {
  const items = [];
  for (const e of events) {
    const type = e && e.type;
    if (type === 'study') {
      if (e.q != null) return { error: 'study 不得携带 q' };
      if (!wordSet.has(e.wordId)) { items.push({ ignore: true }); continue; }
      const a = validAt(e.at); if (!a.ok) return { error: 'at 格式非法' };
      items.push({ ignore: false, row: { type, word_id: e.wordId, q: null, at: a.value } });
    } else if (type === 'review') {
      if (!Q_SET.has(e.q)) return { error: 'review 的 q 须为 1/3/5' };
      if (!wordSet.has(e.wordId)) { items.push({ ignore: true }); continue; }
      const a = validAt(e.at); if (!a.ok) return { error: 'at 格式非法' };
      items.push({ ignore: false, row: { type, word_id: e.wordId, q: e.q, at: a.value } });
    } else {
      return { error: 'type 须为 study|review' };
    }
  }
  return { ok: true, items };
}

function eventsRouter(db, content) {
  const r = express.Router();
  const insert = db.prepare('INSERT INTO events(user_id,type,word_id,q,at) VALUES(?,?,?,?,?)');
  r.post('/', (req, res) => {
    const raw = (req.body && Array.isArray(req.body.events)) ? req.body.events : null;
    if (!raw) return res.status(400).json({ error: { code: 'bad_request', message: 'body 需 {events:[…]}' } });
    let events = raw; let truncated = false;
    if (events.length > MAX_BATCH) { events = events.slice(0, MAX_BATCH); truncated = true; }
    const v = validateEvents(events, content.wordSet);
    if (v.error) return res.status(400).json({ error: { code: 'bad_request', message: v.error } });
    let accepted = 0;
    db.exec('BEGIN');
    try {
      for (const it of v.items) {
        if (it.ignore) continue;
        insert.run(req.user.id, it.row.type, it.row.word_id, it.row.q, it.row.at);
        accepted++;
      }
      db.exec('COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }
    const out = { accepted, ignored: v.items.length - accepted };
    if (truncated) out.truncated = true;
    res.json(out);
  });
  return r;
}
module.exports = { eventsRouter, validateEvents, MAX_BATCH };
```

- [ ] **Step 4: app.js 挂载;测试转绿**

`app.js`:加 `const { authRequired } = require('./authRouter');`、`const { eventsRouter } = require('./eventsRouter');`;auth 挂载后加:
```js
app.use('/api/events', authRequired(db), eventsRouter(db, content));
```
`npm run test:server` 全绿;`npm test` 31;validate 30/66/201。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(server): 学习事件批量接收(校验/去未知词/截断)"
```

---

### Task 4: stats — overview / daily / roots 服务端聚合

**Files:**
- Create: `server/src/statsRouter.js`、`server/test/stats.test.js`
- Modify: `server/src/app.js`(挂 `/api/stats`)
- Test: `npm run test:server`

**Interfaces:**
- Consumes: `authRequired(db)`(Task 2)、`content.wordRootMap`、`content.roots`(Task 1)、`todayISO()`(Task 3 time.js)。
- Produces: `statsRouter(db, content)` → 受鉴权 GET `/overview`、GET `/daily?days=`、GET `/roots?days=&limit=`(响应形状见 Global Constraints)。

- [ ] **Step 1: 写失败测试 `server/test/stats.test.js`**

```js
const test = require('node:test');
const assert = require('node:assert');
const { startServer, jfetch } = require('./helper');

const pad = (n) => (n < 10 ? '0' + n : '' + n);
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const yesterday = () => { const t = new Date(); t.setDate(t.getDate() - 1); return iso(t); };

test('overview:totalStudied 去重/gradeDist/accuracy;跨用户隔离', async () => {
  const s = await startServer();
  try {
    const r = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'han', password: 'secret123' } });
    await jfetch(s.base, 'POST', '/api/events', { auth: r.data.token, body: { events: [
      { type: 'study', wordId: 'spectator' }, { type: 'study', wordId: 'inspect' },
      { type: 'review', wordId: 'spectator', q: 1 }, { type: 'review', wordId: 'spectator', q: 5 }, { type: 'review', wordId: 'spectator', q: 5 },
    ] } });
    const o = await jfetch(s.base, 'GET', '/api/stats/overview', { auth: r.data.token });
    assert.equal(o.status, 200);
    assert.equal(o.data.totalStudied, 2);
    assert.equal(o.data.reviewEvents, 3);
    assert.deepEqual(o.data.gradeDist, { q1: 1, q3: 0, q5: 2 });
    assert.equal(o.data.lapses, 1);
    assert.ok(Math.abs(o.data.accuracy - (1 - 1 / 3)) < 1e-9);
    const r2 = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'ivo', password: 'secret123' } });
    const o2 = await jfetch(s.base, 'GET', '/api/stats/overview', { auth: r2.data.token });
    assert.equal(o2.data.totalStudied, 0); assert.equal(o2.data.reviewEvents, 0);
  } finally { await s.close(); }
});

test('daily:14 天升序、今天在末、昨天在倒数第二、缺日补 0;roots 聚合', async () => {
  const s = await startServer();
  try {
    const r = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'jay', password: 'secret123' } });
    const y = yesterday();
    await jfetch(s.base, 'POST', '/api/events', { auth: r.data.token, body: { events: [
      { type: 'study', wordId: 'spectator', at: y },
      { type: 'review', wordId: 'spectator', q: 3, at: y },
    ] } });
    const d = await jfetch(s.base, 'GET', '/api/stats/daily?days=14', { auth: r.data.token });
    assert.equal(d.status, 200); assert.equal(d.data.length, 14);
    assert.equal(d.data[13].date, iso(new Date()));            // 今天在末
    assert.equal(d.data[13].new, 0); assert.equal(d.data[13].reviews, 0);
    assert.equal(d.data[12].date, y);                          // 昨天 = 倒数第二
    assert.equal(d.data[12].new, 1); assert.equal(d.data[12].reviews, 1);
    const rt = await jfetch(s.base, 'GET', '/api/stats/roots', { auth: r.data.token });
    assert.equal(rt.status, 200); assert.ok(Array.isArray(rt.data));
    const row = rt.data.find((x) => x.rootId === 'root-spect' || x.studied === 1);
    assert.ok(row && row.reviews === 1 && row.studied === 1);
  } finally { await s.close(); }
});

test('入参:days 非数/超界 400;空库全 0 不崩', async () => {
  const s = await startServer();
  try {
    const r = await jfetch(s.base, 'POST', '/api/auth/register', { body: { username: 'kai', password: 'secret123' } });
    const o = await jfetch(s.base, 'GET', '/api/stats/overview', { auth: r.data.token });
    assert.equal(o.data.totalStudied, 0); assert.equal(o.data.accuracy, 0);
    assert.equal((await jfetch(s.base, 'GET', '/api/stats/daily?days=abc', { auth: r.data.token })).status, 400);
    assert.equal((await jfetch(s.base, 'GET', '/api/stats/daily?days=999', { auth: r.data.token })).status, 400);
    assert.equal((await jfetch(s.base, 'GET', '/api/stats/roots?limit=999', { auth: r.data.token })).status, 400);
  } finally { await s.close(); }
});
```
> 注:roots 测试对族 id 的断言(上面用 `x.rootId==='root-spect' || x.studied===1`)与 Task 1 Step 2 相同:spectator 的实际族 id 以数据为准,实现与测试必须一致;若数据族 id 不同,测试也自然命中 `x.studied===1` 分支,无需改。

- [ ] **Step 2: 运行确认失败。**

- [ ] **Step 3: 实现 statsRouter.js**

```js
// server/src/statsRouter.js
const express = require('express');
const { todayISO } = require('./time');

function clampInt(v, dflt, min, max, name) {
  if (v == null || v === '') return dflt;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) return { err: `${name} 须为 ${min}..${max} 的整数` };
  return n;
}
function acc(g) { const t = g.q1 + g.q3 + g.q5; return t ? 1 - g.q1 / t : 0; }
function padt(n) { return n < 10 ? '0' + n : '' + n; }
function dISO(d) { return `${d.getFullYear()}-${padt(d.getMonth() + 1)}-${padt(d.getDate())}`; }

function statsRouter(db, content) {
  const r = express.Router();

  r.get('/overview', (req, res) => {
    const distinct = db.prepare("SELECT COUNT(DISTINCT word_id) n FROM events WHERE user_id=? AND type='study'").get(req.user.id);
    const rows = db.prepare(
      "SELECT type, q, COUNT(*) n FROM events WHERE user_id=? GROUP BY type, q"
    ).all(req.user.id);
    const gradeDist = { q1: 0, q3: 0, q5: 0 };
    let studyEvents = 0, reviewEvents = 0;
    for (const row of rows) {
      if (row.type === 'study') studyEvents += row.n;
      else { reviewEvents += row.n; if (row.q) gradeDist['q' + row.q] = row.n; }
    }
    res.json({ totalStudied: distinct.n, studyEvents, reviewEvents, gradeDist, lapses: gradeDist.q1, accuracy: acc(gradeDist) });
  });

  r.get('/daily', (req, res) => {
    const days = clampInt(req.query.days, 14, 1, 90, 'days');
    if (days.err) return res.status(400).json({ error: { code: 'bad_request', message: days.err } });
    const today = todayISO();
    const start = new Date(today); start.setDate(start.getDate() - (days - 1));
    const sISO = dISO(start);
    const rows = db.prepare(
      `SELECT substr(at,1,10) d, type, q, COUNT(*) n FROM events
       WHERE user_id=? AND substr(at,1,10)>=? GROUP BY substr(at,1,10), type, q`
    ).all(req.user.id, sISO);
    const map = new Map();
    for (const row of rows) {
      let e = map.get(row.d);
      if (!e) { e = { date: row.d, new: 0, reviews: 0, lapses: 0 }; map.set(row.d, e); }
      if (row.type === 'study') e.new = row.n;
      else { e.reviews += row.n; if (row.q === 1) e.lapses = row.n; }
    }
    const out = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(sISO); d.setDate(d.getDate() + i);
      const dI = dISO(d);
      out.push(map.get(dI) || { date: dI, new: 0, reviews: 0, lapses: 0 });
    }
    res.json(out);
  });

  r.get('/roots', (req, res) => {
    const days = clampInt(req.query.days, 30, 1, 90, 'days');
    const limit = clampInt(req.query.limit, 15, 1, 30, 'limit');
    if (days.err) return res.status(400).json({ error: { code: 'bad_request', message: days.err } });
    if (limit.err) return res.status(400).json({ error: { code: 'bad_request', message: limit.err } });
    const today = todayISO();
    const start = new Date(today); start.setDate(start.getDate() - (days - 1));
    const sISO = dISO(start);
    const rows = db.prepare(
      `SELECT word_id, type, q FROM events WHERE user_id=? AND substr(at,1,10)>=?`
    ).all(req.user.id, sISO);
    const agg = new Map();
    const rootById = new Map(content.roots.map((x) => [x.id, x]));
    for (const row of rows) {
      const rootId = content.wordRootMap.get(row.word_id);
      if (!rootId) continue;
      let a = agg.get(rootId);
      if (!a) {
        a = { rootId, root: '', zh: '', studied: new Set(), reviews: 0, q1: 0, q3: 0, q5: 0 };
        agg.set(rootId, a);
        const r0 = rootById.get(rootId);
        if (r0) { a.root = r0.root; a.zh = r0.zh; }
      }
      if (row.type === 'study') a.studied.add(row.word_id);
      else { a.reviews++; a['q' + row.q]++; }
    }
    const out = [...agg.values()].map((a) => ({
      rootId: a.rootId, root: a.root, zh: a.zh, studied: a.studied.size, reviews: a.reviews,
      gradeDist: { q1: a.q1, q3: a.q3, q5: a.q5 }, accuracy: acc({ q1: a.q1, q3: a.q3, q5: a.q5 }),
    })).sort((a, b) => b.reviews - a.reviews).slice(0, limit);
    res.json(out);
  });
  return r;
}
module.exports = { statsRouter };
```

- [ ] **Step 4: app.js 挂载;测试转绿**

`app.js`:加 `const { statsRouter } = require('./statsRouter');`;events 挂载后加:
```js
app.use('/api/stats', authRequired(db), statsRouter(db, content));
```
`npm run test:server` 全绿;`npm test` 31;validate 30/66/201。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(server): 云端统计 overview/daily/roots"
```

---

### Task 5: server README + 服务器侧端到端收口

**Files:**
- Create: `server/README.md`
- Test: 全量自检 + 启动验证

- [ ] **Step 1: 写 `server/README.md`(中文,据实)**

含:定位与边界(进度仍存本地;服务端只做账号/内容下发/事件统计);环境(Node ≥24,内置 node:sqlite);安装与运行(`npm install` 后 `npm run server`;`PORT`/`DB_PATH` 环境变量可覆盖,默认 `server/data/rootmap.db`);测试(`npm run test:server`、`npm test`、`npm run validate`);API 一览(表:方法/路径/鉴权/入参/返回,覆盖 auth 4 + content 7 + events 1 + stats 3);与小程序联调三步(①本机 `npm run server` ②开发者工具「详情-本地设置-勾选不校验合法域名」③我的页注册登录;游客 appid 即可);安全声明(本机 HTTP 明文 + 明文 token,生产需 HTTPS + 合法域名 + 换强 token,本轮不做)。curl 示例:
```bash
curl -s -X POST http://127.0.0.1:3000/api/auth/register -H 'content-type: application/json' -d '{"username":"demo","password":"secret123"}'
```

- [ ] **Step 2: 全量自检与冒烟**

`npm run test:server` 全绿;`npm test` 31;`npm run validate` 30/66/201。启动冒烟:后台起 `npm run server`(临时 DB_PATH)→ curl 走通 register→login→me→content/meta→postEvents→overview 五步,打印每步状态码后 kill,报告输出。

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "docs(server): 运行/联调/测试说明"
```

---

### Task 6: 客户端 utils — api.js + reporter.js + 埋点

**Files:**
- Create: `miniprogram/utils/api.js`、`miniprogram/utils/reporter.js`、`tests/api.test.js`、`tests/reporter.test.js`
- Modify: `miniprogram/pages/word/word.js`(顶部 require + `markLearned` 内 1 行)、`miniprogram/pages/review/review.js`(顶部 require + `grade` 内 1 行改写)
- Test: `npm test`(主套件新增用例)、`node --check`

**Interfaces:**
- api.js 导出(全部走全局 `wx`,缺 wx 时安全降级,null/undefined 守卫,与既有 utils 一致):`isAuthed()`, `login(username,password)`, `register(username,password)`, `logout()`, `me()`, `postEvents(events)`, `overview()`, `daily(days=14)`, `roots(days=30,limit=15)`;内部 `request(method,path,opts)`。401 自动清登录态;网络失败 reject `{offline:true}`。
- reporter.js 导出:`recordStudy(wordId)`, `recordReview(wordId,q)`, `flush()`。storage key `rm_events_pending_v1`,上限 1000 丢最旧。

- [ ] **Step 1: 写失败测试(新增两文件进主套件)**

`tests/api.test.js` 与 `tests/reporter.test.js`,共用 stub(各文件内独立定义,或新建 `tests/_wxstub.js` 供两处 require):
```js
// tests/_wxstub.js — 假 wx:内存 storage + wx.request(直接回调,无真实网络)
function installWx({ respond } = {}) {
  const store = {};
  global.wx = {
    getStorageSync: (k) => store[k],
    setStorageSync: (k, v) => { store[k] = v; },
    removeStorageSync: (k) => { delete store[k]; },
    request(opt) {
      const r = typeof respond === 'function' ? respond(opt) : respond;
      setTimeout(() => {
        opt.success({ statusCode: r.statusCode, data: r.data, header: {} });
      }, 0);
    },
  };
  return store;
}
function clearWx() { delete global.wx; }
module.exports = { installWx, clearWx };
```
> stub 语义:wx.request 只走 success(HTTP 语义在 statusCode;401 由 api.js 判),无 respond 时测试用 `respond:()=>({statusCode:404,data:{}})` 之类模拟;真实离线由调用方 mock 成 reject——api.js 内部 `fail()` 分支较难触发,故测试直接以「respond 返回非 2xx 即视为失败路径」验证,离线分支另用单测直调 `request` 无法(无网络)→ 以模块行为注释说明即可。**约定:测试不 mock wx.request 抛错;离线语义在 reporter 层以「未登录/请求非 2xx 保留队列」覆盖。**

`tests/api.test.js` 用例:
```js
const { installWx, clearWx } = require('./_wxstub');
const api = require('../miniprogram/utils/api');

test('login 成功存 token/user;isAuthed 真', async () => {
  installWx({ respond: () => ({ statusCode: 200, data: { token: 'tok123', user: { id: 1, username: 'alice_01' } } }) });
  try {
    const user = await api.login('alice_01', 'secret123');
    assert.equal(user.username, 'alice_01');
    assert.ok(api.isAuthed());
  } finally { clearWx(); }
});
test('401 自动清登录态并 reject {code:unauthorized}', async () => {
  installWx({ respond: () => ({ statusCode: 401, data: { error: { code: 'unauthorized', message: '未登录' } } }) });
  try {
    await assert.rejects(() => api.me(), (e) => e.code === 'unauthorized');
    assert.equal(api.isAuthed(), false);
  } finally { clearWx(); }
});
test('overview 成功解析服务端形状', async () => {
  installWx({ respond: () => ({ statusCode: 200, data: { totalStudied: 2, reviewEvents: 3, gradeDist: { q1: 1, q3: 0, q5: 2 }, lapses: 1, accuracy: 0.6666666666, studyEvents: 2 } }) });
  try {
    const o = await api.overview();
    assert.equal(o.totalStudied, 2);
  } finally { clearWx(); }
});
```
`tests/reporter.test.js` 用例:
```js
const { installWx, clearWx } = require('./_wxstub');
const api = require('../miniprogram/utils/api');
const reporter = require('../miniprogram/utils/reporter');

test('recordStudy 不带 q、recordReview 带 q 且持久化入队', () => {
  const store = installWx();
  try {
    reporter.recordStudy('spectator');
    reporter.recordReview('spectator', 3);
    const q = JSON.parse(store['rm_events_pending_v1']);
    assert.equal(q.length, 2);
    assert.equal(q[0].type, 'study'); assert.ok(!('q' in q[0]));
    assert.equal(q[1].type, 'review'); assert.equal(q[1].q, 3);
    assert.match(q[0].at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  } finally { clearWx(); }
});
test('未登录 flush 不动队;登录成功 flush 清队', async () => {
  const store = installWx();
  try {
    reporter.recordStudy('spectator');
    await reporter.flush();                                   // 未登录:队列保留
    assert.equal(JSON.parse(store['rm_events_pending_v1']).length, 1);
    api.setSession('tok', { id: 1, username: 'u' });          // 手动登录态
    api.postEvents = async () => ({ accepted: 1, ignored: 0 });
    await reporter.flush();
    assert.equal(JSON.parse(store['rm_events_pending_v1']).length, 0);
  } finally { clearWx(); }
});
test('发送失败保留队列待下次;队列超 1000 丢最旧', () => {
  const store = installWx({ respond: () => ({ statusCode: 500, data: { error: { code: 'internal' } } }) });
  try {
    api.setSession('tok', { id: 1, username: 'u' });
    reporter.recordStudy('spectator');
    // flush 异步拒 → 用微任务等待
    return reporter.flush().catch(() => {}).then(() => {
      assert.equal(JSON.parse(store['rm_events_pending_v1']).length, 1); // 保留
    });
  } finally { /* 等上述 promise 后再 clear */ }
});
```
> 说明:reporter 测试通过改写 `api.postEvents` 直出成功/失败,不必真发网络;原 api 模块导出的 `postEvents` 为函数,测试重赋值后需还原(用 `beforeEach` 存原引用、`afterEach` 还原)。`record*` 是同步入队即返回(内部 fire 一个异步 flush),断言只看队列持久化与最终清空结果。

- [ ] **Step 2: 运行确认失败**(api/reporter 模块不存在)。

- [ ] **Step 3: 实现 api.js**

```js
// miniprogram/utils/api.js — 词根地图服务端 HTTP 客户端(本机联调)
const KEY_TOKEN = 'rm_token_v1';
const KEY_USER = 'rm_user_v1';
const BASE = 'http://127.0.0.1:3000'; // 本机服务端地址,改这里或按环境注入

function hasWx() { return typeof wx !== 'undefined'; }
function getToken() { return hasWx() ? (wx.getStorageSync(KEY_TOKEN) || '') : ''; }
function isAuthed() { return !!getToken(); }
function getSession() { return hasWx() ? { token: getToken(), user: wx.getStorageSync(KEY_USER) || null } : { token: '', user: null }; }
function setSession(token, user) { if (!hasWx()) return; wx.setStorageSync(KEY_TOKEN, token); wx.setStorageSync(KEY_USER, user); }
function clearSession() { if (!hasWx()) return; wx.removeStorageSync(KEY_TOKEN); wx.removeStorageSync(KEY_USER); }

function request(method, path, { auth = false, body } = {}) {
  return new Promise((resolve, reject) => {
    if (!hasWx()) return reject({ offline: true });
    const header = { 'content-type': 'application/json' };
    if (auth) { const t = getToken(); if (t) header.authorization = 'Bearer ' + t; }
    wx.request({
      url: BASE + path, method, data: body, header,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve(res.data);
        if (res.statusCode === 401) clearSession();
        const code = (res.data && res.data.error && res.data.error.code) || ('http_' + res.statusCode);
        reject({ code, status: res.statusCode, message: res.data && res.data.error && res.data.error.message });
      },
      fail() { reject({ offline: true }); },
    });
  });
}

async function _sessionCall(path, body) {
  const d = await request('POST', path, { body });
  setSession(d.token, d.user);
  return d.user;
}
const login = (username, password) => _sessionCall('/api/auth/login', { username, password });
const register = (username, password) => _sessionCall('/api/auth/register', { username, password });
async function logout() {
  if (!isAuthed()) return;
  try { await request('POST', '/api/auth/logout', { auth: true }); } catch (e) { /* 服务端不可达也清本地 */ }
  clearSession();
}
const me = () => request('GET', '/api/auth/me', { auth: true }).then((d) => d.user);
const postEvents = (events) => request('POST', '/api/events', { auth: true, body: { events } });
const overview = () => request('GET', '/api/stats/overview', { auth: true });
const daily = (days = 14) => request('GET', '/api/stats/daily?days=' + days, { auth: true });
const roots = (days = 30, limit = 15) => request('GET', '/api/stats/roots?days=' + days + '&limit=' + limit, { auth: true });

module.exports = { BASE, isAuthed, getSession, setSession, clearSession, login, register, logout, me, postEvents, overview, daily, roots };
```

- [ ] **Step 4: 实现 reporter.js**

```js
// miniprogram/utils/reporter.js — 学习/复习事件上报(离线持久化队列,不阻塞本地学习)
const api = require('./api');
const KEY_Q = 'rm_events_pending_v1';
const MAX_Q = 1000;
const Q_SET = { 1: true, 3: true, 5: true };

function hasWx() { return typeof wx !== 'undefined'; }
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function localAt() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
function readQ() { if (!hasWx()) return []; try { const raw = wx.getStorageSync(KEY_Q); return Array.isArray(raw) ? raw : []; } catch (e) { return []; } }
function saveQ(list) { if (!hasWx()) return; try { wx.setStorageSync(KEY_Q, list); } catch (e) { /* 满则静默丢,仅影响云端统计 */ } }

function record(type, wordId, q) {
  if (!hasWx() || !wordId) return;
  const ev = { type, wordId, at: localAt() };
  if (type === 'review' && Q_SET[q]) ev.q = q;
  const list = readQ();
  list.push(ev);
  if (list.length > MAX_Q) list.splice(0, list.length - MAX_Q);
  saveQ(list);
  flush();
}

function flush() {
  if (!hasWx() || !api.isAuthed()) return Promise.resolve();
  const list = readQ();
  if (!list.length) return Promise.resolve();
  return api.postEvents({ events: list })
    .then(() => { saveQ([]); })
    .catch(() => { /* offline/失败保留队列 */ });
}
module.exports = { recordStudy: (id) => record('study', id), recordReview: (id, q) => record('review', id, q), flush };
```

- [ ] **Step 5: 埋点(两处)**

`pages/word/word.js` 顶部(现有第 1-3 行 require 之后)加:
```js
const reporter = require('../../utils/reporter');
```
`markLearned()`(现 128-137 行)内 `if` 块中 `store.markStudied(word.id, todayISO());` 之后加:
```js
      reporter.recordStudy(word.id); reporter.flush();
```
`pages/review/review.js` 顶部加:
```js
const reporter = require('../../utils/reporter');
```
`grade()`(现第 94 行)`if (store && id) store.applyReview(id, q, today);` 改写为:
```js
    const applied = store && id ? store.applyReview(id, q, today).applied : false;
    if (applied) { reporter.recordReview(id, q); reporter.flush(); }
```
> 核实:store.applyReview 返回对象含 `applied` 字段(utils/store.js 已读,Task 1 背书)——实现前先 `node -e` 确认 `applyReview` 返回键名确为 `applied`;若不是,改用其实际布尔字段并在此计划加注(但不得破坏既有行为)。**不得改变既有推进逻辑**;守卫仍在方法首行。

- [ ] **Step 6: 测试转绿 + 静态自检**

`npm test` 全绿(原 31 + 新增);`node --check` api/reporter/word/review;`npm run validate` 30/66/201。

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(mini): api 客户端 + 事件上报队列 + 学词/复习埋点"
```

---

### Task 7: 我的页 — 服务端登录卡 + 云端统计卡

**Files:**
- Modify: `miniprogram/pages/profile/profile.js`、`profile.wxml`、`profile.wxss`
- Test: 静态自检 + node 冒烟(stub Page/Component);`npm test` 仍绿

**Interfaces:**
- Consumes: `api.js`(`isAuthed/getSession/login/register/logout/overview/daily/roots`,Task 6)、既有 `stat-bar` 组件(`data` 属性 = 升序 14 天 `{date,new,reviews}` 数组)、token 配色。
- 布局并入现有 profile 页(不新增页面/路由)。

- [ ] **Step 1: profile.js data 与逻辑**

`data` 新增(集中一个 `cloud` 对象,setData 用路径更新):
```js
cloud: { authed: false, username: '', password: '', busy: false, err: '', loading: false,
         overview: null, daily: [], roots: [], gdPct: { q1: 0, q3: 0, q5: 0 } },
```
`onShow`(现 refresh)末尾追加 `this.refreshCloudState();`。
新增方法(现文件末尾、`});` 前):
```js
refreshCloudState() {
  const authed = api.isAuthed();
  if (!authed) {
    this.setData({ cloud: { authed: false, username: '', password: '', busy: false, err: '', loading: false, overview: null, daily: [], roots: [], gdPct: { q1: 0, q3: 0, q5: 0 } } });
    return;
  }
  const sess = api.getSession();
  this.setData({ 'cloud.authed': true, 'cloud.username': (sess.user && sess.user.username) || '', 'cloud.err': '' });
  this.loadCloud();
},
loadCloud() {
  const p = Promise.all([api.overview(), api.daily(14), api.roots(30, 10)]);
  p.then(([ov, dl, rt]) => {
    const total = ov.reviewEvents || 0;
    const g = ov.gradeDist || { q1: 0, q3: 0, q5: 0 };
    const gdPct = total
      ? { q1: Math.round(g.q1 / total * 100), q3: Math.round(g.q3 / total * 100), q5: Math.round(g.q5 / total * 100) }
      : { q1: 0, q3: 0, q5: 0 };
    this.setData({
      'cloud.overview': ov, 'cloud.daily': dl || [], 'cloud.gdPct': gdPct,
      'cloud.roots': (rt || []).map((x) => ({ ...x, accTxt: Math.round(x.accuracy * 100) + '%' })),
      'cloud.loading': false, 'cloud.err': '',
    });
  }).catch((e) => {
    // offline/未就绪静默;服务端错误显示一行
    this.setData({ 'cloud.loading': false, 'cloud.err': e && e.offline ? '' : '云端统计加载失败,请确认已运行 npm run server' });
  });
},
onUserInput(e) {
  const k = e.currentTarget.dataset.k;
  if (!k || k !== 'username' && k !== 'password') return;
  this.setData({ ['cloud.' + k]: e.detail.value });
},
onLogin() {
  if (this.data.cloud.busy) return;
  const u = (this.data.cloud.username || '').trim();
  const pw = this.data.cloud.password || '';
  if (!u || !pw) return this.setData({ 'cloud.err': '请输入用户名和密码' });
  this.setData({ busy: true, 'cloud.err': '' });
  api.login(u, pw).then(() => this.refreshCloudState())
    .catch((e) => {
      const msg = e && e.code === 'bad_credentials' ? '用户名或密码错误' : (e && e.offline ? '无法连接服务端,请确认已运行 npm run server' : '登录失败,请重试');
      this.setData({ 'cloud.err': msg });
    })
    .then(() => this.setData({ busy: false, 'cloud.password': '' }));
},
onRegister() {
  if (this.data.cloud.busy) return;
  const u = (this.data.cloud.username || '').trim();
  const pw = this.data.cloud.password || '';
  if (!/^[A-Za-z0-9_]{3,20}$/.test(u)) return this.setData({ 'cloud.err': '用户名须 3-20 位字母/数字/下划线' });
  if (pw.length < 6) return this.setData({ 'cloud.err': '密码至少 6 位' });
  this.setData({ busy: true, 'cloud.err': '' });
  api.register(u, pw).then(() => this.refreshCloudState())
    .catch((e) => {
      const msg = e && e.code === 'username_taken' ? '用户名已被占用' : (e && e.offline ? '无法连接服务端,请确认已运行 npm run server' : '注册失败,请重试');
      this.setData({ 'cloud.err': msg });
    })
    .then(() => this.setData({ busy: false, 'cloud.password': '' }));
},
onLogout() {
  api.logout().then(() => this.refreshCloudState());
},
```
顶部 require 加:
```js
const api = require('../../utils/api');
```
注意:setData 里 `busy` 是顶层(data.cloud.busy),写 `{ busy: true }` 与 `{ 'cloud.busy': true }` 混用易错——**统一全部写成 `cloud.busy`**(用路径 `'cloud.busy': true`),data 顶层不放 busy。将上面 `onLogin/onRegister` 的 `setData({ busy: true, ... })`/`setData({ busy: false, ... })` 改为 `'cloud.busy'` 路径;`data` 里不放顶层 busy。
重置/设置/本地统计方法不动;登出不动本地进度。

- [ ] **Step 2: profile.wxml 插入(设置卡与重置之间)**

在「设置」卡 `</view>` 之后、「重置学习数据」`<view class="pf-reset">` 之前插入两卡:

服务端卡(未登录态):
```xml
  <!-- ===== 服务端(登录/注册)===== -->
  <view class="card pf-card">
    <view class="pf-card-head">
      <text class="pf-title t-1">服务端</text>
    </view>
    <view wx:if="{{!cloud.authed}}">
      <input class="pf-cloud-input" placeholder="用户名(3-20 位字母/数字/_)" value="{{cloud.username}}" data-k="username" bindinput="onUserInput" />
      <input class="pf-cloud-input" password placeholder="密码(至少 6 位)" value="{{cloud.password}}" data-k="password" bindinput="onUserInput" />
      <view class="flex-row pf-cloud-actions">
        <view class="btn-primary pf-cloud-btn" bindtap="onLogin">登录</view>
        <view class="pf-cloud-ghost" bindtap="onRegister">注册</view>
      </view>
      <text class="pf-hint t-3">本机联调:先运行 npm run server,并在开发者工具勾选「不校验合法域名」;账号仅用于云端统计,学习进度仍存本地</text>
    </view>
    <view class="flex-between" wx:else>
      <text class="t-2">已登录:{{cloud.username}}</text>
      <view class="pf-cloud-ghost" bindtap="onLogout">退出登录</view>
    </view>
    <text class="pf-cloud-err" wx:if="{{cloud.err}}">{{cloud.err}}</text>
  </view>
```
云端统计卡(登录可见;在服务端卡之后):
```xml
  <!-- ===== 云端统计(仅登录)===== -->
  <view class="card pf-card" wx:if="{{cloud.authed}}">
    <view class="pf-card-head">
      <text class="pf-title t-1">云端统计</text>
      <text class="pf-cloud-loading t-3" wx:if="{{cloud.loading}}">加载中…</text>
    </view>
    <block wx:if="{{cloud.overview}}">
      <view class="pf-ov">
        <view class="pf-ov-item"><text class="pf-ov-num grad">{{cloud.overview.totalStudied}}</text><text class="pf-ov-txt t-3">累计学习词</text></view>
        <view class="pf-ov-item"><text class="pf-ov-num">{{cloud.overview.reviewEvents}}</text><text class="pf-ov-txt t-3">云端复习</text></view>
        <view class="pf-ov-item"><text class="pf-ov-num">{{cloud.overview.accTxt}}</text><text class="pf-ov-txt t-3">正确率</text></view>
      </view>
      <view class="pf-gd" wx:if="{{cloud.overview.reviewEvents > 0}}">
        <view class="pf-gd-bar pf-gd-1" style="width:{{cloud.gdPct.q1}}%"></view>
        <view class="pf-gd-bar pf-gd-3" style="width:{{cloud.gdPct.q3}}%"></view>
        <view class="pf-gd-bar pf-gd-5" style="width:{{cloud.gdPct.q5}}%"></view>
      </view>
      <text class="pf-hint t-3" wx:else>暂无云端数据,先学几个词吧</text>
    </block>
    <stat-bar class="pf-sb" data="{{cloud.daily}}" wx:if="{{cloud.daily.length}}"></stat-bar>
    <view wx:if="{{cloud.roots.length}}">
      <view class="pf-subhead t-2">词根正确率 Top</view>
      <view class="pf-rrow" wx:for="{{cloud.roots}}" wx:key="rootId">
        <text class="pf-rt t-2">{{item.root}}</text>
        <text class="pf-rz t-3">{{item.zh}}</text>
        <text class="pf-rn t-3">{{item.reviews}} 次 · {{item.accTxt}}</text>
      </view>
    </view>
  </view>
```
> 关键:`accuracy` 已由 js 预拼为 `accTxt`(如 `87%`)与 `gdPct`(三档百分比)——**wxml 不做任何计算/`|` filter(微信不支持)**,数值一律 js 侧算好。gdPct 各值 ≤100 可能三者相加略超/略欠 100(round 独立),可接受。

- [ ] **Step 3: profile.js 补 accTxt/样式 + profile.wxss 追加**

Task 7 Step 1 的 `loadCloud` 成功分支补 overview 派生(`accTxt`)——在 setData 前:
```js
ov.accTxt = (total ? Math.round(ov.accuracy * 100) : 0) + '%';
```
setData 内 `'cloud.overview': ov` 即带上 accTxt。
`profile.wxss` 追加(不改既有类;白卡内间距 20rpx;输入框下边框灰、focus 主蓝;按钮 主蓝底白字圆角 8rpx / 幽灵描边;三档条 height 12rpx radius 4rpx 配色 忘了 #EF4444 模糊 #F59E0B 记得 #10B981):
```css
.pf-cloud-input{width:100%;box-sizing:border-box;padding:20rpx 0;border-bottom:2rpx solid #E2E8F0;font-size:30rpx;color:#0F172A;}
.pf-cloud-actions{display:flex;gap:20rpx;margin-top:28rpx;}
.pf-cloud-btn{flex:1;text-align:center;padding:20rpx 0;border-radius:12rpx;font-size:30rpx;}
.btn-primary.pf-cloud-btn{background:#3B82F6;color:#fff;}
.pf-cloud-ghost{flex:1;text-align:center;padding:20rpx 0;border-radius:12rpx;font-size:30rpx;color:#3B82F6;border:2rpx solid #3B82F6;box-sizing:border-box;}
.pf-hint{margin-top:20rpx;font-size:24rpx;color:#64748B;line-height:1.6;}
.pf-cloud-err{display:block;margin-top:16rpx;font-size:24rpx;color:#EF4444;}
.pf-cloud-loading{font-size:24rpx;color:#64748B;}
.pf-ov{display:flex;margin-top:16rpx;}
.pf-ov-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:6rpx;}
.pf-ov-num{font-size:44rpx;font-weight:600;color:#0F172A;}
.pf-ov-txt{font-size:24rpx;}
.pf-gd{display:flex;gap:6rpx;margin:28rpx 0 8rpx;height:12rpx;border-radius:6rpx;overflow:hidden;}
.pf-gd-bar{height:100%;}
.pf-gd-1{background:#EF4444;}.pf-gd-3{background:#F59E0B;}.pf-gd-5{background:#10B981;}
.pf-subhead{margin-top:28rpx;font-size:28rpx;font-weight:500;}
.pf-rrow{display:flex;align-items:center;gap:16rpx;padding:18rpx 0;border-bottom:2rpx solid #F1F5F9;}
.pf-rrow:last-child{border-bottom:none;}
.pf-rt{min-width:96rpx;font-size:30rpx;}
.pf-rz{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:24rpx;}
.pf-rn{font-size:24rpx;}
```
> 冒烟 stub Page/Component 验证方法存在与数据落位(不依赖真 wx UI):用 `tests/_wxstub.js` 的 storage + `wx.request` 直回 success,定义全局 `Page`/`Component` 捕获 options,实例化 profile 后调 `onShow`/`onLogin` 等断言 cloud 状态。

- [ ] **Step 4: 静态自检 + 冒烟**

`node --check profile.js`;`npm test`(无回归);`npm run validate` 30/66/201。冒烟(见 Step 3 注):stub 下「未登录 onShow 不请求 → 登录后 overview/daily/roots 落位(accTxt 含 %、gdPct 总和 ≈100)→ 登出后 authed=false」。
微信开发者工具人工走查(注册/登录/登出/云端卡渲染/StatBar/学词复习后数字变化/关服务端仍可离线学)本机无 DevTools → 在报告与 README 标「待用户 DevTools 验证」。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(mini): 我的页服务端登录 + 云端统计卡"
```

---

## Self-review 备注(作者自查)

- **Spec 覆盖**:§2 表结构→Task1 db.js;§3.1 auth→Task2;§3.2 content→Task1 contentRouter;§3.3 events→Task3;§3.4 stats→Task4;§4 安全→Task2(scrypt/salt/timingSafeEqual/参数化);§5.1 api→Task6;§5.2 reporter→Task6;§5.3 埋点→Task6 Step5;§5.4 profile→Task7;§6 驱动裁定→Task1(Express+node:sqlite);server/README→Task5;§8 验收→Task5 Step2 全链 curl + 各任务自检。§7 不做项均未入任务。
- **占位符扫描**:所有 code step 均含完整代码或到「照此实现」级别的契约(stat 聚合、scrypt、校验、wxml)。两处族 id(spectator 所属根)以数据实测回填,测试断言设计为不依赖具体值(roots 用 `x.studied===1` 兜底)。无 TBD/TODO。
- **类型一致性**:跨任务接口(createDb→authRequired→eventsRouter→statsRouter 均 `(db[, content])` 工厂;content.loadContent 导出名 Task1 定义与 Task4 消费一致;time.todayISO 在 Task3 定义、Task4 消费;api/reporter 导出在 Task6 定义、Task7 消费一致)。profile wxml 用 `cloud.overview.accTxt` 与 js 预拼一致;`stat-bar data` 喂 `daily()`(升序、今天在末)与既有 StatBar 契约一致。
- **已知偏差(计划内)**:①report 写 http-smoke 的族断言弱化为「含 spectator 词」,族 id 以数据为准;②reporter 测试改 `api.postEvents` 以模拟发送成败——在测试文件内保存/还原原函数,不污染运行态;③overview 响应的 `accTxt` 为 js 侧派生(非 API 契约字段),仅客户端展示用。
