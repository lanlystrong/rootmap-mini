// server/src/logger.js
const winston = require('winston');
const path = require('path');

// 日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// 日志颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue'
};

// 添加颜色支持
winston.addColors(colors);

// 日志格式
const format = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // 添加元数据
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }

    return msg;
  })
);

// 根据环境选择日志级别
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'warn';
};

// 创建 Winston logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports: [
    // 错误日志文件
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 组合日志文件
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 在开发环境下添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      format
    )
  }));
}

// 创建 HTTP 请求日志记录器
const httpLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.json(),
    winston.format.timestamp()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/http.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// 创建数据库操作日志记录器
const dbLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.json(),
    winston.format.timestamp()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/database.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// 创建用户行为日志记录器
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.json(),
    winston.format.timestamp()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/audit.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// 辅助函数：记录请求日志
function logRequest(req, res, duration) {
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
    httpLogger.warn('Request failed', logData);
  } else {
    httpLogger.info('Request completed', logData);
  }
}

// 辅助函数：记录数据库操作
function logDbOperation(operation, table, data, userId) {
  dbLogger.info('Database operation', {
    operation,
    table,
    data,
    userId,
    timestamp: new Date().toISOString()
  });
}

// 辅助函数：记录用户行为
function logUserAction(userId, action, details) {
  auditLogger.info('User action', {
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
}

// 辅助函数：记录错误
function logError(error, context = {}) {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
}

// 创建日志目录（如果不存在）
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

module.exports = {
  logger,
  httpLogger,
  dbLogger,
  auditLogger,
  logRequest,
  logDbOperation,
  logUserAction,
  logError
};