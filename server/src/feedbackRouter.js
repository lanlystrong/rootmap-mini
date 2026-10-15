// server/src/feedbackRouter.js
const express = require('express');
const { nowAt } = require('./time');

const CATEGORIES = new Set(['suggestion', 'bug', 'other']);
const MAX_CONTENT = 2000;
const MAX_CONTACT = 128;

function feedbackRouter(db) {
  const r = express.Router();

  // 提交反馈(受鉴权)
  r.post('/', async (req, res) => {
    try {
      const body = req.body || {};
      const content = typeof body.content === 'string' ? body.content.trim() : '';
      if (!content) {
        return res.status(400).json({ error: { code: 'bad_request', message: '反馈内容不能为空' } });
      }
      if (content.length > MAX_CONTENT) {
        return res.status(400).json({ error: { code: 'bad_request', message: `反馈内容不超过 ${MAX_CONTENT} 字` } });
      }
      // 未知分类回落 'other',不让客户端乱塞值进 ENUM。
      const category = CATEGORIES.has(body.category) ? body.category : 'other';
      // 联系方式选填;非字符串或全空白一律视为未填。
      const contact = typeof body.contact === 'string' ? body.contact.trim().slice(0, MAX_CONTACT) : null;

      const createdAt = nowAt();
      const result = await db.run(
        'INSERT INTO feedback (user_id, category, content, contact, created_at) VALUES (?,?,?,?,?)',
        [req.user.userId, category, content, contact, createdAt]
      );

      res.json({ id: result.lastInsertRowid, createdAt });
    } catch (err) {
      console.error('Feedback submit error:', err);
      res.status(500).json({ error: { code: 'feedback_failed', message: '提交失败,请稍后再试' } });
    }
  });

  return r;
}

module.exports = { feedbackRouter };
