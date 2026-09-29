# 词根地图 · 上线就绪审计报告（AUDIT-GOLIVE）

> 生成日期：2026-09-24
> 范围：服务端代码 + 小程序端配置 + 部署/合规
> 结论：**核心阻断项（HTTPS 域名、隐私协议 URL、真机 WX_SECRET）已部分消除，剩余项见文末「仍待办」**

---

## 一、本轮已修复的问题

| # | 问题 | 修复方式 | 状态 |
|---|------|----------|------|
| 1 | 服务端从不加载 `.env`，`WX_SECRET`/`MYSQL_PASSWORD` 等生产变量读不到；`init-db.js` 误 `require('dotenv')` 但该包**未安装**会直接报错 | 新增零依赖 `server/src/loadEnv.js`（仅补充缺失键，真实环境变量优先级更高）；`server.js`、`init-db.js` 接入 | ✅ |
| 2 | `.env` 中 `MYSQL_DATABASE=rootmap` 与代码默认/已验证库 `rootmap_1` 不一致，加载器生效后会导致导入/校验指向空库 | 改为 `rootmap_1`，并加注释 | ✅ |
| 3 | 小程序端 `BASE` 硬编码 `http://127.0.0.1:3000`（IP + HTTP，违反小程序硬约束） | 抽成 `miniprogram/config.js` 的 `BASE_URL`，域名就绪改一处即可 | ✅ |
| 4 | `CORS` 全开（`cors()` 无参，含鉴权端点） | 改为读 `CORS_ORIGIN` 环境变量白名单；未配置时降级放行并打印告警 | ✅ |
| 5 | `/families` 按 `word.pos` 分组，但交付词无顶层 `pos`，**全部坠入“其他”** | 取 `senses[0].pos`，新增 `bucketPos()` 按首字母稳健分桶（覆盖 n./v/vi/vt/adj/adv/conj/prep 等） | ✅ |
| 6 | `meta.checksum` 仅哈希 id 集合、version 写死，改释义/音标/例句不触发客户端更新 | 改为对全量内容做键序规范化后 SHA-1 哈希；version 提升为 `1.0.0` | ✅ |
| 7 | 缺《隐私保护指引》（微信审核硬性要求） | 新增 `server/public/privacy.html`，由 `express.static('public')` 托管；域名就绪即 `https://域名/privacy.html` 可作隐私协议 URL | ✅ |
| 8 | PM2 `env_production` 缺 `HOST`/`NODE_ENV` 覆盖，生产可能绑回环或被 `.env` 的 `development` 影响 | `env_production` 显式 `NODE_ENV=production`、`HOST=0.0.0.0`、`MYSQL_DATABASE` 兜底 | ✅ |

### 2026-09-29 全量修复轮（同批）

| # | 问题 | 修复方式 | 状态 |
|---|------|----------|------|
| 9 | **内容真源矛盾**（原待办 6）：线上只读静态 `data/index.js`，MySQL 里的内容从不参与服务 | `src/content.js` 改为 MySQL 优先 + 可变 holder（按引用传给各路由，原地重算索引）；`app.js` 启动读库 + `setInterval` 热重载（`CONTENT_RELOAD_MS`，默认 60s，`0` 关闭）；读不到才降级静态文件**并告警**，`/health` 的 `content.source` 会显式报 `file(db-error)`/`file(empty-db)` | ✅ |
| 10 | **事件截断静默丢数据**：客户端队列上限 1000、服务端单批上限 200，超出部分既不入库也不留在队列 | `miniprogram/utils/reporter.js` 按 `MAX_BATCH=200` 切块顺序发送，每块只摘除该块前缀；某块回 `truncated` 时只摘 `accepted+ignored` 并停止后续块 | ✅ |
| 11 | **`sessions.expires_at` 时区/格式错**：存 `toISOString()`（带 `T`/`Z`/毫秒）却与 `NOW()` 做字符串比较，`T`(0x54) > 空格(0x20) → token 实际多活约一天；响应里的值与库里也不是同一个 | `src/time.js` 新增 `sqlAt()/sqlAtPlusDays()`；`/wechat` 响应与落库用同一个字符串 | ✅ |
| 12 | 过期会话从不清扫（`idx_sessions_expires` 建了从没用上） | 每次登录成功前 `DELETE FROM sessions WHERE expires_at <= NOW()` | ✅ |
| 13 | **`migrateLegacyUsers` 迁移失败即永久丢用户**：备份表名调了两次 `Date.now()`(CREATE/SELECT 各一次)、`DROP TABLE IF NOT EXISTS` 语法写反、恢复异常被 `catch` 吞掉而此时 `users` 已删 | 表名提成一次性变量；改 `IF EXISTS`；恢复段失败**重新抛出**并打日志 | ✅ |
| 14 | 自研限流 `Map` **只重写 value、从不删 key** → 内存无界增长 | 换 `express-rate-limit`（已在依赖中，MemoryStore 自带周期清扫），429 响应体保持不变；注释写明 MemoryStore 每进程一份、PM2 多实例总额限 ×N | ✅ |
| 15 | 死表死字段：`word_progress`/`root_progress`/`error_logs` 三表零调用；`events` 的 `root_id/a/correct/interval_hours` 只有死函数 `recordEvent` 写 | 删三表 DDL + 全部门面方法；加幂等 `migrateDropDeadEventColumns`（查 `information_schema` 后 DROP 列与 `idx_events_root`） | ✅ |
| 16 | JWT 死代码：`authRouter.verifyToken` 零调用，但 `jsonwebtoken` 依赖与 `JWT_SECRET` 配置仍在，易被误以为线上用 JWT | 彻底删除：函数、`require`、`package.json` 依赖、`.env.example`/`ecosystem.config.js`/本文档的环境变量项 | ✅ |
| 17 | `settingsRouter.js` 未挂载且内部引用未定义的 `authRequired` —— 一旦启用必崩 | 整个文件删除，`app.js` 里的注释挂载行清掉 | ✅ |
| 18 | 测试断言硬编码上一代计数（`213/151/1350`），6 个用例误报失败 | 更新为实测的 `223/151/1450`；保留字面量绊线意图，只在失败信息里加提示 | ✅ |
| 19 | `test/helper.js` 每个文件建**全新空库** —— 内容切 DB 真源后，内容路由会拿到空数据集，测出来的「绿」是假的 | `startServer` 先用生产同一条写路径 `seedContent` 把交付集灌进去 | ✅ |

### 验证结果（冒烟）
- `loadEnv` 生效：`NODE_ENV=development`、`MYSQL_DATABASE=rootmap_1`、`CORS_ORIGIN` 为空（本地预期）。
- `meta.version=1.0.0`，`checksum` 随内容变更而改变（改一词释义 → 哈希变化）。
- `/families` 分组恢复：noun 688 / verb 353 / adjective 350 / adverb 54 / other 5（other 仅剩 conj/prep 等异常词性，不再吞掉全部词）。
- `middleware` / `contentRouter` / `init-db` 均成功加载；`init-db` 连库并初始化成功（印证 `rootmap_1` 生效）。

---

## 二、仍待办（上线前必须 / 建议）

### 🔴 必须（依赖你正在申请的域名 / 微信后台操作）
1. **HTTPS + 备案域名**：小程序 `request` 域名必须是 HTTPS 且已备案。服务端当前 `app.listen` 为纯 HTTP，需前置 **nginx 反代 + TLS**（示例见第三节）。
2. **小程序端 `BASE_URL`**：域名就绪后，将 `miniprogram/config.js` 的 `BASE_URL` 改为 `https://你的备案域名`。
3. **微信后台配置**：开发管理 → 服务器域名 → 将 `https://你的域名` 加入 request 合法域名；隐私协议入口填写 `https://你的域名/privacy.html`。
4. **`WX_SECRET`**：在微信公众平台获取，填入生产机 `server/.env`（已被 git 忽略）或启动 Shell 环境变量（优先级更高）。**务必保证生产 `NODE_ENV=production`**，否则 `buildCode2Session` 走开发兜底（`dev_xxx` openid），真机登录失败。
5. **隐私政策占位**：`server/public/privacy.html` 中的 `[运营者邮箱]`、`[运营主体名称]` 需替换为真实信息，并确保实际数据处理与文本一致。

### 🟠 强烈建议（功能/架构完整性）
6. ~~**内容真源架构矛盾**~~ —— **已解决（见上表 #9）**：DB 为运行时真源，60s 热重载，静态文件降级为兜底且必告警。
7. ~~**SM-2 复习算法未接通**~~ —— **本条结论有误，已更正**：SM-2 **在客户端跑得好好的**（`miniprogram/utils/srs.js`，忘了/模糊/记得 三档自评 → interval/ef 更新），这是有意的设计：`next_review` 存在客户端本地，不依赖服务端。
   服务端 `/api/events` 只落 `type/word_id/q/at`（原始行为日志，供统计用）**不是缺陷** —— 复制一份 SM-2 到服务端只会让两端算法分叉，且无法跨设备合并。真正未做的是**跨设备续学**（把复习状态同步到账号），那是功能增量而非 bug，需要产品先定方向。
   （`word_progress`/`correct`/`a`/`interval_hours` 那些服务端字段已作为零调用死代码删除，见上表 #15。）

### 🟡 可选清理
8. ~~**JWT 死代码**~~ —— **已解决（见上表 #16）**：函数、依赖、`JWT_SECRET` 配置全部删除。
9. ~~**`migrateLegacyUsers` 表名 bug**~~ —— **已解决（见上表 #13）**。
10. **监控/CI**：当前有 PM2 日志与测试脚本，但无外部监控告警、无 CI/CD 流水线。运营建议补。
11. **限流仍是每进程一份**：`express-rate-limit` 的 MemoryStore 不跨进程共享，PM2 多实例时总限额 = `max` × 实例数。要全局一致需接 Redis 共享 store（本轮明确不做，单实例部署够用）。

---

## 三、nginx HTTPS 反代示例（部署时填）

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;   # 你的备案域名

    ssl_certificate     /etc/nginx/ssl/your-domain/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/your-domain/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    # 微信支付/回调等如需上传,可调大
    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;   # 指向 rootmap-server(PM2 监听)
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> 配合：`pm2 start ecosystem.config.js --env production`（确保生产机 `server/.env` 含正确的 `WX_SECRET`/`MYSQL_PASSWORD`，或 Shell 已 export）。

---

## 四、生产环境变量核对清单

| 变量 | 来源建议 | 说明 |
|------|----------|------|
| `NODE_ENV` | PM2 `env_production` 已置 `production` | 必须 production，否则真机登录走开发兜底 |
| `HOST` | PM2 `env_production` 已置 `0.0.0.0` | 绑定外部 |
| `PORT` | 3000 | 与 nginx `proxy_pass` 一致 |
| `MYSQL_DATABASE` | `rootmap_1` | 内容已导入并验证的库 |
| `WX_SECRET` | 生产机 `.env` 或 Shell export | **必须填真实值** |
| `MYSQL_PASSWORD` | 生产机 `.env` 或 Shell export | 勿写死进 git |
| `CORS_ORIGIN` | `https://your-domain.com` | 生产务必配置白名单 |
| `CONTENT_RELOAD_MS` | 可选，默认 `60000` | 内容热重载间隔，`0` 关闭 |

> 会话**不需要任何密钥**：`sessions` 表存的是 `crypto.randomBytes(24)` 生成的 48 位随机 token，
> 校验就是查库比对，从未用过 JWT。原先的 `JWT_SECRET` 已随死代码一并删除。
