// server/src/content.js
const crypto = require('node:crypto');
const index = require('../../miniprogram/data/index'); // {roots, affixes, words}

function loadContent() {
  const roots = index.roots, affixes = index.affixes, words = index.words;
  const wordSet = new Set(words.map(w => w.id));
  const wordRootMap = new Map();
  for (const w of words) {
    const rp = w.breakdown.find(b => b.type === 'root');
    if (rp && rp.refId) wordRootMap.set(w.id, rp.refId);
  }
  const checksum = crypto.createHash('sha1')
    .update(JSON.stringify({
      roots: roots.map(r => r.id), affixes: affixes.map(a => a.id),
      words: words.map(w => w.id),
    })).digest('hex');
  const rootById = new Map(roots.map(r => [r.id, r]));
  const affixById = new Map(affixes.map(a => [a.id, a]));
  const rootWords = (rootId) =>
    words.filter(w => wordRootMap.get(w.id) === rootId);
  const affixWords = (affixId) =>
    words.filter(w => w.breakdown.some(b => (b.type === 'prefix' || b.type === 'suffix') && b.refId === affixId));
  return {
    roots, affixes, words, wordSet, wordRootMap,
    meta: { name: 'rootmap', counts: { roots: roots.length, affixes: affixes.length, words: words.length }, checksum, version: '0.1.0' },
    byWord: (id) => wordSet.has(id) ? words.find(w => w.id === id) : undefined,
    byRoot: (id) => rootById.get(id),
    byAffix: (id) => affixById.get(id),
    rootWords, affixWords, rootOfWord: (id) => wordRootMap.get(id),
  };
}
module.exports = { loadContent };
