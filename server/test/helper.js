// server/test/helper.js
const { once } = require('node:events');
const { createApp } = require('../src/app');
async function startServer({ dbPath = ':memory:' } = {}) {
  const { app, db } = createApp({ dbPath });
  const srv = app.listen(0);
  await once(srv, 'listening');
  const base = `http://127.0.0.1:${srv.address().port}`;
  return { base, db, close: () => new Promise((r) => srv.close(r)) };
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
module.exports = { startServer, jfetch };
