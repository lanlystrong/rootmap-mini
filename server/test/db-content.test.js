const test = require('node:test');
const assert = require('node:assert');
const { withTestDb } = require('./helper');
const { loadContent } = require('../src/content');

test('createDb 建齐三表(users/sessions/events)且 events 可写读回', async () => {
  await withTestDb(async (db) => {
    const info = await db.run(
      "INSERT INTO users(username,pass_hash,salt,created_at) VALUES(?,?,?,?)",
      ['u1', 'h', 's', '2026-09-04T00:00:00']
    );
    await db.run(
      "INSERT INTO events(user_id,type,word_id,q,at) VALUES(?,?,?,?,?)",
      [info.lastInsertRowid, 'review', 'spectator', 3, '2026-09-04T13:00:00']
    );
    const r = await db.get("SELECT * FROM events");
    assert.equal(r.user_id, info.lastInsertRowid);
    assert.equal(r.type, 'review');
    assert.equal(r.q, 3);
    assert.equal(r.word_id, 'spectator');
  });
});

test('content 单源:计数 30/66/201、wordSet 含词、wordRootMap/rootWords 正确', () => {
  const c = loadContent();
  assert.equal(c.roots.length, 30); assert.equal(c.affixes.length, 66); assert.equal(c.words.length, 201);
  assert.ok(c.wordSet.has('spectator'));
  assert.equal(c.rootOfWord('spectator'), 'root-spect');          // breakdown root refId(本数据 spect/spectat 族)
  assert.equal(c.rootOfWord('notexist'), undefined);
  assert.ok(c.rootWords('root-spect').some(w => w.id === 'spectator'));
  assert.ok(c.meta.counts.words === 201 && /^[0-9a-f]{40}$/.test(c.meta.checksum));
});
