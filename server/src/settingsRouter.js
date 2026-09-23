// server/src/settingsRouter.js
const express = require('express');
const { logUserAction } = require('./logger');

// 设置路由
function settingsRouter(db) {
  const router = express.Router();

  // 获取用户设置
  router.get('/', authRequired(db), async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await db.get('SELECT settings FROM users WHERE id = ?', [userId]);

      // 默认设置
      const defaultSettings = {
        dailyReviewLimit: 'unlimited', // unlimited | number
        expandAssocByDefault: true,
        studyReminders: true,
        reminderTime: '20:00',
        darkMode: false,
        language: 'zh-CN'
      };

      const settings = user?.settings ? { ...defaultSettings, ...JSON.parse(user.settings) } : defaultSettings;

      res.json({ settings });

    } catch (err) {
      console.error('Get settings error:', err);
      res.status(500).json({
        error: {
          code: 'get_settings_failed',
          message: 'Failed to get settings'
        }
      });
    }
  });

  // 更新用户设置
  router.put('/', authRequired(db), async (req, res) => {
    try {
      const userId = req.user.userId;
      const { settings } = req.body;

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({
          error: {
            code: 'invalid_settings',
            message: 'Settings must be an object'
          }
        });
      }

      // 验证设置值
      const validatedSettings = validateSettings(settings);
      if (!validatedSettings.valid) {
        return res.status(400).json({
          error: {
            code: 'invalid_settings_value',
            message: validatedSettings.message
          }
        });
      }

      // 更新数据库
      await db.run(
        'UPDATE users SET settings = ? WHERE id = ?',
        [JSON.stringify(validatedSettings.settings), userId]
      );

      // 记录用户行为
      logUserAction(userId, 'update_settings', { updatedFields: Object.keys(settings) });

      res.json({
        success: true,
        settings: validatedSettings.settings
      });

    } catch (err) {
      console.error('Update settings error:', err);
      res.status(500).json({
        error: {
          code: 'update_settings_failed',
          message: 'Failed to update settings'
        }
      });
    }
  });

  // 重置用户设置到默认值
  router.post('/reset', authRequired(db), async (req, res) => {
    try {
      const userId = req.user.userId;

      const defaultSettings = {
        dailyReviewLimit: 'unlimited',
        expandAssocByDefault: true,
        studyReminders: true,
        reminderTime: '20:00',
        darkMode: false,
        language: 'zh-CN'
      };

      await db.run(
        'UPDATE users SET settings = ? WHERE id = ?',
        [JSON.stringify(defaultSettings), userId]
      );

      logUserAction(userId, 'reset_settings');

      res.json({
        success: true,
        settings: defaultSettings
      });

    } catch (err) {
      console.error('Reset settings error:', err);
      res.status(500).json({
        error: {
          code: 'reset_settings_failed',
          message: 'Failed to reset settings'
        }
      });
    }
  });

  // 获取可用设置选项（前端参考）
  router.get('/schema', (req, res) => {
    const schema = {
      dailyReviewLimit: {
        type: 'string',
        enum: ['unlimited', '50', '100', '200', '500'],
        description: '每日复习单词上限'
      },
      expandAssocByDefault: {
        type: 'boolean',
        description: '学习时默认展开联想词根'
      },
      studyReminders: {
        type: 'boolean',
        description: '是否启用学习提醒'
      },
      reminderTime: {
        type: 'string',
        pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
        description: '学习提醒时间'
      },
      darkMode: {
        type: 'boolean',
        description: '深色模式'
      },
      language: {
        type: 'string',
        enum: ['zh-CN', 'en-US'],
        description: '应用语言'
      }
    };

    res.json({ schema });
  });

  return router;
}

// 验证设置值
function validateSettings(settings) {
  const defaultSettings = {
    dailyReviewLimit: 'unlimited',
    expandAssocByDefault: true,
    studyReminders: true,
    reminderTime: '20:00',
    darkMode: false,
    language: 'zh-CN'
  };

  // 合并用户设置和默认设置
  const mergedSettings = { ...defaultSettings, ...settings };

  // 验证 dailyReviewLimit
  if (!['unlimited', '50', '100', '200', '500'].includes(mergedSettings.dailyReviewLimit)) {
    return {
      valid: false,
      message: 'dailyReviewLimit must be one of: unlimited, 50, 100, 200, 500'
    };
  }

  // 验证 reminderTime 格式
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(mergedSettings.reminderTime)) {
    return {
      valid: false,
      message: 'reminderTime must be in HH:MM format'
    };
  }

  // 验证布尔值
  ['expandAssocByDefault', 'studyReminders', 'darkMode'].forEach(key => {
    if (typeof mergedSettings[key] !== 'boolean') {
      return {
        valid: false,
        message: `${key} must be a boolean`
      };
    }
  });

  // 验证语言
  if (!['zh-CN', 'en-US'].includes(mergedSettings.language)) {
    return {
      valid: false,
      message: 'language must be zh-CN or en-US'
    };
  }

  return { valid: true, settings: mergedSettings };
}

// 需要认证的中间件
function authRequired(db) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers?.authorization;
      const token = authHeader?.substring(7);

      if (!token) {
        return res.status(401).json({
          error: {
            code: 'missing_token',
            message: 'Authentication required'
          }
        });
      }

      const user = await db.getUserByToken(token);
      if (!user) {
        return res.status(401).json({
          error: {
            code: 'invalid_token',
            message: 'Invalid or expired token'
          }
        });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('Auth error:', err);
      return res.status(500).json({
        error: {
          code: 'auth_error',
          message: 'Authentication failed'
        }
      });
    }
  };
}

module.exports = { settingsRouter };