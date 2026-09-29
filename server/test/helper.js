// server/test/helper.js
// 测试里不要内容热重载:每个用例的临时库建好就固定了,重读只会给 MySQL 加压、
// 给输出添乱。app.js 的 reloadMs() 是调用时现读这个变量,这里设了它就生效。
process.env.CONTENT_RELOAD_MS = '0';

const { once } = require('node:events');
const { createApp } = require('../src/app');
const { createDb, adminConnect } = require('../src/db');

function envConfig() {
  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '123456',
  };
}

let seq = 0;
function nextDbName() { return `rootmap_test_${process.pid}_${Date.now()}_${seq++}`; }

async function createTestDb(cfg) {
  const name = nextDbName();
  const admin = await adminConnect(cfg);
  await admin.query(`CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await admin.end();
  return name;
}

async function dropTestDb(cfg, name) {
  const admin = await adminConnect(cfg);
  await admin.query(`DROP DATABASE IF EXISTS \`${name}\``);
  await admin.end();
}

async function startServer({ code2session, withContent = true } = {}) {
  const cfg = envConfig();
  const name = await createTestDb(cfg);
  // 内容先灌,再建 app —— app 建好时就会从库里读一次内容。
  // seedContent 自己管 DDL(ownTxn 时会先建表),所以不用先 createDb。
  if (withContent) await seedTestContent({ ...cfg, database: name });

  const { app, db, reloadTimer } = await createApp({
    dbConfig: { ...cfg, database: name },
    wx: code2session ? { code2session } : {},
  });
  const srv = app.listen(0);
  await once(srv, 'listening');
  const base = `http://127.0.0.1:${srv.address().port}`;
  return {
    base, db,
    close: async () => {
      if (reloadTimer) clearInterval(reloadTimer);
      await new Promise((r) => srv.close(r));
      await db.end();
      await dropTestDb(cfg, name);
    },
  };
}

// 直接拿 db 门面做底层读写断言(db-content.test.js 用)。
async function withTestDb(fn) {
  const cfg = envConfig();
  const name = await createTestDb(cfg);
  const db = await createDb({ ...cfg, database: name });
  try { return await fn(db); }
  finally { await db.end(); await dropTestDb(cfg, name); }
}

// 往临时库里灌内容。
//
// 内容真源已经是 MySQL(见 src/content.js),所以每个测试库都必须**真的有内容**,
// 否则内容路由会拿到空数据集,测出来的"绿"是假的。
// 复用的是生产同一条写路径 seedContent,不在测试里另写一套装配逻辑。
//
// 走独立连接而不是连接池:seedContent 要 beginTransaction/commit,而 mysql2 的
// **池**没有这两个方法(只有 connection 有)—— 与 scripts/content-import.js 同理。
async function seedTestContent(dbConfigObj) {
  const mysql = require('mysql2/promise');
  const { seedContent } = require('../src/seedContent');
  const index = require('../../miniprogram/data/index');
  const conn = await mysql.createConnection(dbConfigObj);
  try {
    return await seedContent(conn, index, { replace: ['hand', 'dict', 'gen'] });
  } finally { await conn.end(); }
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

module.exports = { startServer, withTestDb, jfetch, envConfig };
