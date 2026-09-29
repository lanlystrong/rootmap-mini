// server/src/app.js
const express = require('express');
const { createDb } = require('./db');
const { createContent, applyDataset, loadContentFromDb, loadContentFromFile } = require('./content');
const { contentRouter } = require('./contentRouter');
const { authRouter, authRequired } = require('./authRouter');
const { eventsRouter } = require('./eventsRouter');
const { statsRouter } = require('./statsRouter');
const {
  notFound,
  errorHandler,
  requestLogger,
  cors: corsHandler,
  healthCheck,
  versionHeader,
  rateLimit,
  securityHeaders
} = require('./middleware');

// 内容热重载间隔(ms)。0 = 关闭。设成较小值方便本地调内容时观察。
// 每次调用现读环境变量(而不是模块加载时读一次):测试进程在 require 本模块之后
// 才把 CONTENT_RELOAD_MS 设成 0,模块级常量会错过。
function reloadMs() { return Number(process.env.CONTENT_RELOAD_MS || 60_000); }

// 启动时读一次内容。DB 读不到才降级到构建产物,并**大声告警** ——
// 此时跑的是过期内容,内容流水线一改就可能出现"库里改了但服务上是旧的"。
async function loadInitialContent(pool, content) {
  try {
    await loadContentFromDb(pool, content);
    if (!content.words.length) {
      console.warn('[content] ⚠ MySQL 里没有内容(库是空的?),已降级到构建产物 data/index.js。');
      console.warn('[content]   跑 `npm run content:import` 把交付集灌进库,或检查 MYSQL_DATABASE 指向。');
      loadContentFromFile(content); // 真的去读文件 —— 只告警不读,等于把空壳推给客户端
      return 'file(empty-db)';
    }
    return 'db';
  } catch (err) {
    console.error('[content] ⚠ 从 MySQL 读内容失败,降级到构建产物 data/index.js:', err.message);
    loadContentFromFile(content);
    return 'file(db-error)';
  }
}

// 起一个定时器重读内容。读失败**不动现有内容** —— 宁可继续服务旧内容,
// 也不要把空壳推给正在用的客户端。
function startContentReload(pool, content) {
  const ms = reloadMs();
  if (!ms) return null;
  const t = setInterval(async () => {
    try {
      // 先读进一个**临时** holder 校验,再决定要不要替换线上这份。
      // 库被清空/导入中断时会读到 0 词 —— 那种结果绝不能原地覆盖,否则正在用的
      // 客户端下一次拉取就是空数据集,而且没有任何报错。
      const probe = createContent();
      await loadContentFromDb(pool, probe);
      if (!probe.words.length) {
        console.error('[content] 热重载读到 0 词(库是空的?),**保留现有内容不动**。');
        console.error('[content]   跑 `npm run content:import` 把交付集灌进库。');
        return;
      }
      const before = content.meta && content.meta.checksum;
      applyDataset(content, {
        roots: probe.roots, affixes: probe.affixes, words: probe.words,
      });
      const after = content.meta && content.meta.checksum;
      if (before !== after) {
        console.log(`[content] 已热重载: ${content.meta.counts.roots} 根 / ${content.meta.counts.affixes} 缀 / ${content.meta.counts.words} 词 (checksum ${after.slice(0, 8)})`);
      }
    } catch (err) {
      console.error('[content] 热重载失败,继续使用现有内容:', err.message);
    }
  }, ms);
  if (t.unref) t.unref(); // 别因为这个定时器让进程挂住不退
  return t;
}

// 创建应用工厂函数
async function createApp({ dbConfig, wx = {} } = {}) {
  // 初始化数据库
  const db = await createDb(dbConfig);

  // 加载内容数据。真源是 MySQL;读不到才降级到构建产物 data/index.js。
  // content 是一个**可变 holder**,下面所有路由都按引用持有它 ——
  // 之后热重载在同一个对象上重算索引,路由无需重建。
  const content = createContent();
  const contentFrom = await loadInitialContent(db.pool, content);

  // 创建 Express 应用
  const app = express();

  // 安全相关设置
  app.disable('x-powered-by'); // 隐藏 Express 框架信息

  // 中间件顺序很重要！
  app.use(corsHandler); // 跨域支持
  app.use(securityHeaders); // 安全头设置
  app.use(express.json({ limit: '5mb' })); // JSON 解析(头像 base64 上传)
  app.use(express.urlencoded({ extended: true })); // URL 编码
  app.use(requestLogger); // 请求日志
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // 速率限制

  // API 版本控制
  app.use('/api', versionHeader('v1'));

  // 健康检查端点。额外带上内容来源与计数 —— 内容降级到构建产物时,
  // 光看 status:'ok' 是发现不了的,而那正是最需要被看见的时候。
  app.get('/health', (req, res) => healthCheck(req, res, {
    content: {
      source: contentFrom,                    // 'db' | 'file(db-error)' | 'file(empty-db)'
      counts: content.meta ? content.meta.counts : null,
      checksum: content.meta ? content.meta.checksum : null,
      reloadMs: reloadMs(),
    },
  }));

  // 静态文件服务（如果有）
  app.use(express.static('public'));

  // 路由配置
  app.use('/api/content', contentRouter(content));

  // 认证相关路由（不需要认证）
  app.use('/api/auth', authRouter(db, wx));

  // 需要认证的路由
  app.use('/api/events', authRequired(db), eventsRouter(db, content));
  app.use('/api/stats', authRequired(db), statsRouter(db, content));

  // API 文档（可选）
  if (process.env.NODE_ENV === 'development') {
    app.use('/api-docs', require('./swagger')());
  }

  // 404 处理
  app.use(notFound);

  // 错误处理
  app.use(errorHandler);

  // 内容热重载。放在最后:路由都挂好了再起定时器,避免启动窗口内重入。
  const reloadTimer = startContentReload(db.pool, content);

  // 优雅关闭
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    if (reloadTimer) clearInterval(reloadTimer);
    await db.end();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    if (reloadTimer) clearInterval(reloadTimer);
    await db.end();
    process.exit(0);
  });

  // 数据库连接错误处理
  db.pool.on('error', (err) => {
    console.error('Database connection error:', err);
  });

  return { app, db, content, reloadTimer, contentFrom };
}

module.exports = { createApp, startContentReload, loadInitialContent };