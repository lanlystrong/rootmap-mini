function buildIndex({ roots, affixes, words }) {
  const byId = new Map(words.map(w => [w.id, w]));
  const rootWordsMap = new Map();   // rootId -> Word[]
  const affixWordsMap = new Map();  // affixId -> Word[]
  words.forEach(w => {
    const rootPart = w.breakdown.find(b => b.type === 'root');
    if (rootPart && rootPart.refId) {
      if (!rootWordsMap.has(rootPart.refId)) rootWordsMap.set(rootPart.refId, []);
      rootWordsMap.get(rootPart.refId).push(w);
    }
    w.breakdown.filter(b => (b.type === 'prefix' || b.type === 'suffix') && b.refId).forEach(b => {
      if (!affixWordsMap.has(b.refId)) affixWordsMap.set(b.refId, []);
      affixWordsMap.get(b.refId).push(w);
    });
  });
  const sortedRoots = [...roots].sort((a, b) => a.root.localeCompare(b.root));
  const searchWord = (q) => {
    const s = String(q || '').toLowerCase();
    if (!s) return [];
    return words.filter(w => w.word.toLowerCase().includes(s)).slice(0, 20);
  };
  const searchRoot = (q) => {
    const s = String(q || '').toLowerCase();
    if (!s) return [];
    return roots.filter(r => [r.root, ...(r.variants || [])].some(t => t.toLowerCase().includes(s))).slice(0, 20);
  };
  return {
    roots, affixes, words,
    byId: id => byId.get(id),
    rootWords: rid => rootWordsMap.get(rid) || [],
    affixWords: aid => affixWordsMap.get(aid) || [],
    sortedRoots, searchWord, searchRoot,
  };
}

let cached = null;
function getContent() {
  if (!cached) cached = buildIndex(require('../data/index'));
  return cached;
}

module.exports = { buildIndex, getContent };
