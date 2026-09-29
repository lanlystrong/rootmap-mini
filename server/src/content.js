// server/src/content.js —— 运行时内容(词根/词缀/单词)的真源与索引
//
// 真源是 **MySQL**。`data/index.js` 是内容流水线的构建产物,只在这两种情况下用:
//   1. 启动时 MySQL 读不到内容(库空/连不上/被拖库脚本清过)—— 降级兜底,会打告警;
//   2. 生成器/导入脚本自己要用文件。
// 换句话说,改内容只要改库 + 等一次重载(默认 60s),不用重新生成文件、不用重启。
//
// 关键结构:createContent() 返回的是一个**可变的 holder**,loadContentFromDb 在它身上
// 原地重算索引。app.js 把这个对象按引用交给 contentRouter / eventsRouter / statsRouter,
// 所以重载时不必重建路由 —— 下游闭包读的是 holder.words,不是某次调用捕获的局部变量。
const crypto = require('node:crypto');
const { readDataset } = require('./contentStore');

// 规范化后再哈希:键序无关,且**覆盖全部内容**(词根/词缀/单词的释义、音标、例句、构词等)。
// 这样任何内容变更(即便不改 id)都会得到新的 checksum,客户端据此重新拉取。
const sortKeys = (v) => (Array.isArray(v) ? v.map(sortKeys)
  : v && typeof v === 'object'
    ? Object.keys(v).sort().reduce((o, k) => { o[k] = sortKeys(v[k]); return o; }, {})
    : v);

function checksumOf(roots, affixes, words) {
  return crypto.createHash('sha1')
    .update(JSON.stringify(sortKeys({ roots, affixes, words }))).digest('hex');
}

// 空 holder。字段齐全、索引为空,任何时刻都能安全调用。
function createContent() {
  return {
    roots: [], affixes: [], words: [],
    wordSet: new Set(), wordRootMap: new Map(), rootById: new Map(), affixById: new Map(),
    meta: null,
  };
}

// 把一份 {roots, affixes, words} 装进 holder,并就地重算全部索引。
// 就地而非返回新对象,是热重载能生效的前提。
function applyDataset(holder, dataset) {
  const { roots = [], affixes = [], words = [] } = dataset || {};

  holder.roots = roots;
  holder.affixes = affixes;
  holder.words = words;
  holder.wordSet = new Set(words.map((w) => w.id));

  const wordRootMap = new Map();
  for (const w of words) {
    const rp = (w.breakdown || []).find((b) => b.type === 'root');
    if (rp && rp.refId) wordRootMap.set(w.id, rp.refId);
  }
  holder.wordRootMap = wordRootMap;
  holder.rootById = new Map(roots.map((r) => [r.id, r]));
  holder.affixById = new Map(affixes.map((a) => [a.id, a]));

  holder.meta = {
    name: 'rootmap',
    counts: { roots: roots.length, affixes: affixes.length, words: words.length },
    checksum: checksumOf(roots, affixes, words),
    version: '1.0.0',
  };

  // 下面这些方法只挂在**首次**创建时,内部一律读 holder.* —— 不捕获 roots/words 局部变量,
  // 否则重载后 rootWords() 还会返回旧内容。
  if (!holder.byWord) {
    holder.byWord = (id) => holder.wordSet.has(id) ? holder.words.find((w) => w.id === id) : undefined;
    holder.byRoot = (id) => holder.rootById.get(id);
    holder.byAffix = (id) => holder.affixById.get(id);
    holder.rootWords = (rootId) => holder.words.filter((w) => holder.wordRootMap.get(w.id) === rootId);
    holder.affixWords = (affixId) => holder.words.filter(
      (w) => (w.breakdown || []).some((b) => (b.type === 'prefix' || b.type === 'suffix') && b.refId === affixId)
    );
    holder.rootOfWord = (id) => holder.wordRootMap.get(id);
  }
  return holder;
}

// 从 MySQL 读全量内容(实测 223 根 /151 缀 /1450 词 约 200ms)。
async function loadContentFromDb(pool, holder) {
  return applyDataset(holder, await readDataset(pool));
}

// 降级路径:从构建产物读。**不是第二个真源** —— 只在 DB 读不到时兜底,且必打告警。
function loadContentFromFile(holder) {
  // 延后到函数内 require:让"连库都失败"这件事不至于再多一个同步失败点。
  const index = require('../../miniprogram/data/index');
  return applyDataset(holder, index);
}

// 兼容旧调用点(测试等):返回已装好文件的 holder。
function loadContent() { return loadContentFromFile(createContent()); }

module.exports = { createContent, applyDataset, loadContentFromDb, loadContentFromFile, loadContent };
