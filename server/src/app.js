// server/src/app.js
const express = require('express');
const { createDb } = require('./db');
const { loadContent } = require('./content');
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

// 创建应用工厂函数
async function createApp({ dbConfig, wx = {} } = {}) {
  // 初始化数据库
  const db = await createDb(dbConfig);

  // 加载内容数据
  const content = loadContent();

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

  // 健康检查端点
  app.get('/health', healthCheck);

  // 静态文件服务（如果有）
  app.use(express.static('public'));

  // 路由配置
  app.use('/api/content', contentRouter(content));

  // 认证相关路由（不需要认证）
  app.use('/api/auth', authRouter(db, wx));

  // 需要认证的路由
  app.use('/api/events', authRequired(db), eventsRouter(db, content));
  app.use('/api/stats', authRequired(db), statsRouter(db, content));

  // 用户设置端点（需要认证）
  // app.use('/api/settings', authRequired(db), require('./settingsRouter')(db));

  // API 文档（可选）
  if (process.env.NODE_ENV === 'development') {
    app.use('/api-docs', require('./swagger')());
  }

  // 404 处理
  app.use(notFound);

  // 错误处理
  app.use(errorHandler);

  // 优雅关闭
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await db.end();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await db.end();
    process.exit(0);
  });

  // 数据库连接错误处理
  db.pool.on('error', (err) => {
    console.error('Database connection error:', err);
  });

  return { app, db, content };
}

module.exports = { createApp };