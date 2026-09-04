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
