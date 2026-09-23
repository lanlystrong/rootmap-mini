// server/src/authRouter.js
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// 微信登录配置
const WX_LOGIN_URL = 'https://api.weixin.qq.com/sns/jscode2session';

// 生成随机token
function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

// 验证JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'missing_token',
        message: 'Missing authorization token'
      }
    });
  }

  const token = authHeader.substring(7);
  const secret = process.env.JWT_SECRET || 'rootmap-secret-key';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: 'invalid_token',
        message: 'Invalid or expired token'
      }
    });
  }
}

// 认证中间件 - 从token获取用户
async function authFromToken(db, token) {
  if (!token) return null;

  try {
    const user = await db.getUserByToken(token);
    return user || null;
  } catch (err) {
    console.error('Auth error:', err);
    return null;
  }
}

// 认证中间件工厂
function authRequired(db) {
  return async (req, res, next) => {
    const token = req.headers.authorization?.substring(7);
    if (!token) {
      return res.status(401).json({ error: { code: 'unauthorized', message: 'Authentication required' } });
    }

    const user = await authFromToken(db, token);
    if (!user) {
      return res.status(401).json({ error: { code: 'unauthorized', message: 'Invalid or expired token' } });
    }

    req.user = { userId: user.id, openid: user.openid };
    next();
  };
}

// 构建 code2session:有 secret 走真实微信 jscode2session;无 secret 且非生产走开发兜底(稳定 dev openid)。
function buildCode2Session({ appid, secret }) {
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return async () => { const e = new Error('WX_SECRET not configured'); throw e; };
    }
    return async (code) => ({ openid: 'dev_' + code });
  }
  return async (code) => {
    const response = await axios.get(WX_LOGIN_URL, {
      params: {
        appid,
        secret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });
    const { openid, errcode, errmsg } = response.data;
    if (!openid) {
      const e = new Error(errmsg || 'code2session failed');
      e.errcode = errcode;
      throw e;
    }
    return { openid };
  };
}

// 微信登录处理
async function handleWechatLogin(db, wx, code) {
  try {
    // 调用 code2session(真实微信或开发兜底)获取 openid
    const { openid } = await wx.code2session(code);

    if (!openid) {
      throw new Error('Failed to get openid from WeChat');
    }

    // 查找或创建用户
    let user = await db.get('SELECT * FROM users WHERE openid = ?', [openid]);
    if (!user) {
      user = await db.createUser(openid);
      console.log('New user created:', user);
    }

    // 创建会话
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天后过期
    await db.createSession(user.id, token, expiresAt);

    return {
      token,
      user: {
        id: user.id,
        openid: user.openid,
        created_at: user.created_at
      },
      expires_at: expiresAt.toISOString()
    };
  } catch (err) {
    console.error('WeChat login error:', err);
    throw err;
  }
}

// 认证路由
function authRouter(db, wx) {
  const router = require('express').Router();

  // 微信登录接口
  router.post('/wechat', async (req, res) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: { code: 'bad_request', message: 'WeChat code is required' } });
      }

      // 处理微信登录
      const result = await handleWechatLogin(db, wx, code);
      res.json(result);

    } catch (err) {
      console.error('WeChat login error:', err);
      res.status(401).json({
        error: { code: 'wx_login_failed', message: err.message || 'WeChat login failed' }
      });
    }
  });

  // 获取当前用户信息
  router.get('/me', authRequired(db), async (req, res) => {
    try {
      const user = await db.get('SELECT id, openid, nickname, avatar_url, created_at FROM users WHERE id = ?', [req.user.userId]);

      if (!user) {
        return res.status(404).json({
          error: {
            code: 'user_not_found',
            message: 'User not found'
          }
        });
      }

      res.json({
        user: {
          id: user.id,
          openid: user.openid,
          openidLabel: `用户${user.openid.slice(-4)}`, // 显示后4位作为用户标识
          nickname: user.nickname || null,
          avatarUrl: user.avatar_url || null
        }
      });

    } catch (err) {
      console.error('Get user error:', err);
      res.status(500).json({
        error: {
          code: 'internal_error',
          message: 'Internal server error'
        }
      });
    }
  });

  // 更新个人资料(昵称/头像;头像为 data URL 图片)
  router.put('/profile', authRequired(db), async (req, res) => {
    try {
      const userId = req.user.userId;
      const { nickname, avatar } = req.body || {};

      const sets = [];
      const params = [];

      if (nickname !== undefined) {
        sets.push('nickname = ?');
        params.push(String(nickname).trim().slice(0, 64));
      }
      if (avatar !== undefined) {
        if (avatar !== null && !(typeof avatar === 'string' && avatar.startsWith('data:image/'))) {
          return res.status(400).json({
            error: { code: 'invalid_avatar', message: 'avatar must be a data:image URL or null' }
          });
        }
        sets.push('avatar_url = ?');
        params.push(avatar);
      }

      if (!sets.length) {
        return res.status(400).json({
          error: { code: 'bad_request', message: 'nickname or avatar is required' }
        });
      }

      params.push(userId);
      await db.run(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);

      const user = await db.get('SELECT id, openid, nickname, avatar_url FROM users WHERE id = ?', [userId]);
      res.json({
        user: {
          id: user.id,
          openid: user.openid,
          nickname: user.nickname || null,
          avatarUrl: user.avatar_url || null
        }
      });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({
        error: { code: 'internal_error', message: 'Failed to update profile' }
      });
    }
  });

  // 退出登录
  router.post('/logout', authRequired(db), async (req, res) => {
    try {
      const token = req.headers.authorization?.substring(7);

      // 从数据库删除会话
      await db.deleteSession(token);

      res.status(204).end();

    } catch (err) {
      console.error('Logout error:', err);
      res.status(500).json({
        error: {
          code: 'internal_error',
          message: 'Failed to logout'
        }
      });
    }
  });

  // 更新用户设置
  router.put('/settings', authRequired(db), async (req, res) => {
    try {
      const { settings } = req.body;
      const userId = req.user.userId;

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({
          error: {
            code: 'invalid_settings',
            message: 'Settings must be an object'
          }
        });
      }

      await db.run(
        'UPDATE users SET settings = ? WHERE id = ?',
        [JSON.stringify(settings), userId]
      );

      res.json({
        success: true,
        settings
      });

    } catch (err) {
      console.error('Update settings error:', err);
      res.status(500).json({
        error: {
          code: 'internal_error',
          message: 'Failed to update settings'
        }
      });
    }
  });

  // 获取用户设置
  router.get('/settings', authRequired(db), async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await db.get('SELECT settings FROM users WHERE id = ?', [userId]);

      const settings = user?.settings || {
        dailyReviewLimit: 'unlimited', // unlimited | number
        expandAssocByDefault: true
      };

      res.json({
        settings
      });

    } catch (err) {
      console.error('Get settings error:', err);
      res.status(500).json({
        error: {
          code: 'internal_error',
          message: 'Failed to get settings'
        }
      });
    }
  });

  // 检查token是否有效（用于客户端验证）
  router.get('/verify', authRequired(db), (req, res) => {
    res.json({
      valid: true,
      user: {
        id: req.user.userId,
        openid: req.user.openid
      }
    });
  });

  return router;
}

module.exports = { authRouter, authRequired, verifyToken, buildCode2Session };