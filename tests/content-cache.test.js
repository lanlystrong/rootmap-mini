// tests/content-cache.test.js — 词库本地副本(checksum 缓存)的加载顺序
//
// 这里测的是 utils/content.js 的 ensureContent:它有内存状态,每个用例前都要
// 重新 require 一次模块,否则上一条用例的 cached 会让下一条直接命中内存、什么都不请求。
const test = require('node:test');
const assert = require('node:assert');
const fixture = require('./helpers/content-fixture');

const CONTENT = require.resolve('../miniprogram/utils/content.js');
const API = require.resolve('../miniprogram/utils/api.js');

function freshContent() {
  delete require.cache[CONTENT];
  return require(CONTENT);
}

// 假服务端:按 URL 路由,记录请求次数。
// full = roots/affixes/words 三个全量接口(各算一次「全量下载」),meta = 校验和接口。
// offline 置 true 时所有请求都 fail(模拟断网 —— api 层会转成 {offline:true})。
function installServer({ checksum = 'sum-1', offline = false } = {}) {
  const store = {};
  const hits = { meta: 0, full: 0 };
  global.wx = {
    getStorageSync: (k) => (k in store ? store[k] : ''),
    setStorageSync: (k, v) => { store[k] = v; },
    removeStorageSync: (k) => { delete store[k]; },
    request(opt) {
      const url = opt.url || '';
      setTimeout(() => {
        if (offline) return opt.fail({ errMsg: 'request:fail' });
        if (url.indexOf('/api/content/meta') >= 0) {
          hits.meta++;
          return opt.success({ statusCode: 200, data: { meta: { checksum, version: '1.0.0' } } });
        }
        hits.full++;
        const d = url.indexOf('/words') >= 0 ? fixture.words
          : url.indexOf('/affixes') >= 0 ? fixture.affixes
            : fixture.roots;
        opt.success({ statusCode: 200, data: d });
      }, 0);
    },
  };
  return { store, hits };
}

test.afterEach(() => { delete global.wx; });

test('无本地副本:拉全量并记下 checksum', async () => {
  const { store, hits } = installServer({ checksum: 'sum-1' });
  const c = freshContent();
  assert.equal(c.getState(), 'idle');
  const idx = await c.ensureContent();
  assert.equal(c.getState(), 'ready');
  assert.equal(idx.byId('inspect').word, 'inspect');
  assert.equal(hits.full, 3, 'roots/affixes/words 三条都要拉');
  assert.equal(store.rm_content_v1.checksum, 'sum-1', '副本必须带 checksum,否则下次无法判断新鲜度');
});

test('副本 checksum 与服务端一致:只问 meta,不再全量下载', async () => {
  const first = installServer({ checksum: 'sum-1' });
  await freshContent().ensureContent();
  assert.equal(first.hits.full, 3);
  const saved = first.store.rm_content_v1;

  // 模拟冷启动:同一份 storage,全新进程
  const second = installServer({ checksum: 'sum-1' });
  second.store.rm_content_v1 = saved;
  const c = freshContent();
  await c.ensureContent();

  assert.equal(second.hits.meta, 1, '必须问一次 meta 才知道能不能用缓存');
  assert.equal(second.hits.full, 0, 'checksum 没变就不该重下 871 KB');
  assert.equal(c.getState(), 'ready');
});

test('服务端内容变了(checksum 不同):重下全量并覆盖副本', async () => {
  const first = installServer({ checksum: 'sum-1' });
  await freshContent().ensureContent();
  const stale = first.store.rm_content_v1;

  const second = installServer({ checksum: 'sum-2' });
  second.store.rm_content_v1 = stale;
  const c = freshContent();
  await c.ensureContent();

  assert.equal(second.hits.full, 3, '内容变了必须重下,不能拿旧的当真的');
  assert.equal(second.store.rm_content_v1.checksum, 'sum-2');
});

test('断网 + 有副本:用副本开跑,不算错误', async () => {
  const first = installServer({ checksum: 'sum-1' });
  await freshContent().ensureContent();
  const saved = first.store.rm_content_v1;

  const second = installServer({ offline: true }); // 全挂
  second.store.rm_content_v1 = saved;              // 但本地副本还在
  const c = freshContent();
  const idx = await c.ensureContent();
  assert.equal(c.getState(), 'ready', '有验证过的副本就不该把用户挡在门外');
  assert.equal(c.getError(), '');
  assert.ok(idx.byId('spectator'), '用的是上次下载的那份内容');
});

test('断网 + 无副本:error 态 + 人话原因,retry 后不卡 loading', async () => {
  installServer({ offline: true });
  const c = freshContent();
  const idx = await c.ensureContent();
  assert.equal(idx, null);
  assert.equal(c.getState(), 'error');
  assert.equal(c.getError(), '连不上服务器,请检查网络');
  // 失败后 inflight 必须已清空,否则重试会被并进那次注定失败的请求里,点了没反应
  await c.retry();
  assert.equal(c.getState(), 'error', '仍然离线,重试后应回到 error 而不是永远 loading');
});

test("require('./api') 抛错也要落到 error 态,不能卡在 loading", async () => {
  const c = freshContent();
  // 让 require('./api') 直接抛:Node 读 require.cache 里的 exports 时会触发这个 getter
  require.cache[API] = { id: API, filename: API, loaded: true, exports: {} };
  Object.defineProperty(require.cache[API], 'exports', {
    get() { throw new Error('api 模块坏了'); },
    configurable: true,
  });
  try {
    const idx = await c.ensureContent();
    assert.equal(idx, null);
    // body 同步结束的那条路径最容易把 inflight 漏清,状态会永远停在 loading
    assert.equal(c.getState(), 'error');
    assert.equal(c.getError(), '内容模块加载失败');
  } finally {
    delete require.cache[API];
  }
});

test('storage 读失败(配额满/格式坏)当没有缓存,不影响加载', async () => {
  const { hits } = installServer({ checksum: 'sum-1' });
  global.wx.getStorageSync = () => { throw new Error('storage full'); };
  global.wx.setStorageSync = () => { throw new Error('exceed storage max size'); };
  const c = freshContent();
  const idx = await c.ensureContent();
  assert.equal(c.getState(), 'ready', '缓存写不进去只是少了个优化,不该变成错误');
  assert.equal(idx.words.length, fixture.words.length);
  assert.equal(hits.full, 3);
});
