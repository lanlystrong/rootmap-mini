// server/src/middleware.js
const cors = require('cors');
const { logger } = require('./logger');

// 404 处理
const notFound = (req, res) => {
  const error = {
    code: 'not_found',
    message: '路由不存在',
    path: req.path,
    method: req.method
  };

  logger.warn(`404: ${req.method} ${req.path}`);
  res.status(404).json({ error });
};

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let error = {
    code: 'internal',
    message: '服务器内部错误'
  };

  // 处理不同类型的错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    error = {
      code: 'validation_error',
      message: '数据验证失败',
      details: err.message
    };
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    error = {
      code: 'unauthorized',
      message: '未授权访问'
    };
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    error = {
      code: 'forbidden',
      message: '禁止访问'
    };
  } else if (err.name === 'JsonSchemaValidation') {
    statusCode = 400;
    error = {
      code: 'json_schema_invalid',
      message: 'JSON Schema 验证失败',
      details: err.message
    };
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    error = {
      code: 'bad_json',
      message: 'JSON 解析失败'
    };
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    error = {
      code: 'payload_too_large',
      message: '请求体过大'
    };
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    error = {
      code: 'duplicate_entry',
      message: '数据已存在'
    };
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    error = {
      code: 'reference_error',
      message: '引用的数据不存在'
    };
  } else if (err.code === 'ER_BAD_NULL_ERROR') {
    statusCode = 400;
    error = {
      code: 'null_constraint',
      message: '必填字段不能为空'
    };
  }

  // 记录错误日志
  logger.error('Request error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  });

  // 在开发环境下返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    error.details = {
      message: err.message,
      stack: err.stack,
      name: err.name
    };
  }

  res.status(statusCode).json({ error });
};

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // 请求结束时的处理
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id || 'anonymous'
    };

    if (res.statusCode >= 400) {
      logger.warn('Request failed:', logData);
    } else {
      logger.info('Request completed:', logData);
    }
  });

  next();
};

// CORS 中间件
const corsHandler = cors();

// 内容类型检查
const contentType = (expectedType = 'application/json') => {
  return (req, res, next) => {
    const actualType = req.get('Content-Type');
    if (actualType && !actualType.includes(expectedType)) {
      return res.status(415).json({
        error: {
          code: 'unsupported_media_type',
          message: `Unsupported media type. Expected: ${expectedType}`
        }
      });
    }
    next();
  };
};

// 请求体大小限制
const bodyLimit = (limit = '1mb') => {
  return (req, res, next) => {
    // 这里可以添加请求体大小检查逻辑
    // express.json 中间件已经内置了 limit 选项
    next();
  };
};

// 健康检查中间件
const healthCheck = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
};

// API 版本控制
const versionHeader = (version = 'v1') => {
  return (req, res, next) => {
    res.set('API-Version', version);
    next();
  };
};

// 速率限制（简单实现）
const rateLimit = (options = {}) => {
  const { windowMs = 15 * 60 * 1000, max = 100 } = options;
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);
    userRequests.push(now);

    // 移除过期的请求
    const validRequests = userRequests.filter(time => time > windowStart);
    requests.set(key, validRequests);

    if (validRequests.length > max) {
      return res.status(429).json({
        error: {
          code: 'rate_limit_exceeded',
          message: '请求过于频繁，请稍后再试'
        },
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    next();
  };
};

// 错误日志记录
const errorLogger = (err, req, res, next) => {
  if (!err) return next();

  logger.error('Uncaught error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  });

  next(err);
};

// 安全头设置
const securityHeaders = (req, res, next) => {
  // 防止点击劫持
  res.setHeader('X-Frame-Options', 'DENY');

  // 启用 XSS 保护
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // 防止 MIME 类型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 启用内容安全策略
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'"
  );

  next();
};

module.exports = {
  notFound,
  errorHandler,
  requestLogger,
  cors: corsHandler,
  contentType,
  bodyLimit,
  healthCheck,
  versionHeader,
  rateLimit,
  errorLogger,
  securityHeaders
};