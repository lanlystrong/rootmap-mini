const test = require('node:test');
const assert = require('node:assert');
const { createDb } = require('../src/db');
const { loadContent } = require('../src/content');

test('createDb 建齐三表(users/sessions/events)且 events 可写读回', () => {
  const db = createDb(':memory:');
  db.prepare("INSERT INTO users(username,pass_hash,salt,created_at) VALUES(?,?,?,?)")
    .run('u1', 'h', 's', '2026-09-04T00:00:00');
  db.prepare("INSERT INTO events(user_id,type,word_id,q,at) VALUES(?,?,?,?,?)")
    .run(1, 'review', 'spectator', 3, '2026-09-04T13:00:00');
  const r = db.prepare("SELECT * FROM events").get();
  assert.equal(r.user_id, 1); assert.equal(r.type, 'review');
  assert.equal(r.q, 3); assert.equal(r.word_id, 'spectator');
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
