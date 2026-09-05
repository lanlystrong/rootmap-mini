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

  // 按 group 字段聚类;组序按首次出现,组内保持原序。缺 group 的兜底进「其他」。
  const groupBy = (list) => {
    const groups = [];
    const index = new Map();
    list.forEach(item => {
      const key = item.group || '其他';
      if (!index.has(key)) {
        const g = { key, label: key, items: [] };
        index.set(key, g);
        groups.push(g);
      }
      index.get(key).items.push(item);
    });
    return groups;
  };
  const groupedRoots = () => groupBy(roots);
  // 前后缀:按 type 拆「前缀/后缀」两大区块,各自内部再按 group 子分组。
  const affixSections = () => [
    { type: 'prefix', label: '前缀', groups: groupBy(affixes.filter(a => a.type === 'prefix')) },
    { type: 'suffix', label: '后缀', groups: groupBy(affixes.filter(a => a.type === 'suffix')) },
  ];

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
    sortedRoots, groupedRoots, affixSections, searchWord, searchRoot,
  };
}

let cached = null;
function getContent() {
  if (!cached) cached = buildIndex(require('../data/index'));
  return cached;
}

module.exports = { buildIndex, getContent };
