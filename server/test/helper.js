// server/test/helper.js
const { once } = require('node:events');
const { createApp } = require('../src/app');
const { createDb, adminConnect } = require('../src/db');

function envConfig() {
  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
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

async function startServer() {
  const cfg = envConfig();
  const name = await createTestDb(cfg);
  const { app, db } = await createApp({ dbConfig: { ...cfg, database: name } });
  const srv = app.listen(0);
  await once(srv, 'listening');
  const base = `http://127.0.0.1:${srv.address().port}`;
  return {
    base, db,
    close: async () => {
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
