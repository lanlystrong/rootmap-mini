const test = require('node:test');
const assert = require('node:assert');
const { startServer, jfetch } = require('./helper');

test('content 公开路由:meta/列表/单词/词根族/404', async () => {
  const s = await startServer();
  try {
    const meta = await jfetch(s.base, 'GET', '/api/content/meta');
    assert.equal(meta.status, 200);
    assert.equal(meta.data.counts.words, 201);
    const w = await jfetch(s.base, 'GET', '/api/content/words/spectator');
    assert.equal(w.status, 200); assert.equal(w.data.id, 'spectator');
    assert.equal((await jfetch(s.base, 'GET', '/api/content/words/nope')).status, 404);
    const fam = await jfetch(s.base, 'GET', '/api/content/roots/root-spect');
    assert.equal(fam.status, 200);
    assert.ok(Array.isArray(fam.data.words) && fam.data.words.some(x => x.id === 'spectator'));
    assert.equal(fam.data.root.id, 'root-spect');
    assert.equal((await jfetch(s.base, 'GET', '/api/nope')).status, 404);
  } finally { await s.close(); }
});
