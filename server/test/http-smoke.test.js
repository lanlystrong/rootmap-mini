const test = require('node:test');
const assert = require('node:assert');
const { startServer, jfetch } = require('./helper');

test('content 公开路由:meta/列表/单词/词根族/404', async () => {
  const s = await startServer();
  try {
    const meta = await jfetch(s.base, 'GET', '/api/content/meta');
    assert.equal(meta.status, 200);
    assert.equal(meta.data.counts.words, 1450);   // 绊线:交付集扩词后刻意更新
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

// 回归:中文释义搜索曾必抛 500 —— 词条的释义在 senses[] 里,代码却读顶层 word.zh,
// 于是「英文部分没命中」的查询走到 undefined.toLowerCase()。这个 bug 只在搜索中文时
// 暴露,英文查询恰好短路在第一个条件上,所以一直没被发现。
test('回归:search?mode=word 支持中文释义查询且不 500', async () => {
  const s = await startServer();
  try {
    const r = await jfetch(s.base, 'GET', '/api/content/search?q=' + encodeURIComponent('检查') + '&mode=word');
    assert.equal(r.status, 200, '中文搜索不应 500');
    assert.ok(Array.isArray(r.data.words) && r.data.words.length > 0, '「检查」应命中 inspect/inspection 等词');
    // 命中必须真的来自释义而不是碰巧:结果里至少有一个词的 senses 含该串
    assert.ok(r.data.words.some(w => (w.senses || []).some(x => (x.zh || '').includes('检查'))));
    // 一个必然无命中的查询也必须 200(空结果 ≠ 报错)
    assert.equal((await jfetch(s.base, 'GET', '/api/content/search?q=zzzzqq&mode=word')).status, 200);
  } finally { await s.close(); }
});

// /api/content/words 是全量词库 JSON(871 KB),小程序冷启动首屏就靠这一条。
// compression 依赖装了但一直没 require,于是每个用户都在裸下三倍流量。
test('/api/content/words 走 gzip', async () => {
  const s = await startServer();
  try {
    const r = await fetch(s.base + '/api/content/words', { headers: { 'Accept-Encoding': 'gzip' } });
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('content-encoding'), 'gzip', '未压缩:冷启动要下全量明文');
    assert.ok((await r.arrayBuffer()).byteLength > 100000, '词库应远大于 100 KB');
  } finally { await s.close(); }
});

// 回归:/recommended?type=popular 曾用 content.roots.sort() 原地排序,把「按热度」的顺序
// 泄漏到之后所有 /roots 响应上 —— 用户看到的词根地图顺序会随请求历史变化。
test('回归:recommended 不得改动 /roots 的返回顺序', async () => {
  const s = await startServer();
  try {
    const ids = (r) => r.data.map(x => x.id).join(','); // /roots 直接返回数组
    const before = ids(await jfetch(s.base, 'GET', '/api/content/roots'));
    assert.equal((await jfetch(s.base, 'GET', '/api/content/recommended?type=popular')).status, 200);
    const after = ids(await jfetch(s.base, 'GET', '/api/content/roots'));
    assert.equal(after, before, '/roots 顺序被 recommended 的原地排序污染了');
  } finally { await s.close(); }
});
