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

// ===== 数据只来源于后端接口 =====
// 与早期版本不同:这里不写 wx.storage,也不打包内置 data/index 作为兜底。
// 内容仅在运行期内存缓存一次(会话复用,避免重复请求);离线/后端未就绪时
// getContent() 返回 null,页面应展示空/加载态,不再有任何本地数据来源。
let cached = null;
let inflight = null; // 进行中的加载 Promise,去重并发调用

// 同步读取当前生效的内容索引;冷启动、后端未就绪或离线时为 null。
function getContent() {
  return cached;
}

// 是否已就绪(内存已有从后端拉到的内容)。
function isLoaded() {
  return !!cached;
}

// 确保内容已就绪:内存已有则直接返回;否则并行拉 roots/affixes/words 填充内存。
// 任意失败(离线/后端未就绪)清空 inflight 并返回 null —— 此时无本地兜底数据。
// in-flight 去重:多次调用共享同一次网络请求,不会并发重复拉取。
async function ensureContent() {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    let api;
    try { api = require('./api'); } catch (e) { inflight = null; return null; }
    try {
      const raw = await api.fetchContent();
      if (!raw || !Array.isArray(raw.words) || !raw.words.length) { inflight = null; return null; }
      cached = buildIndex(raw);
      return cached;
    } catch (e) {
      inflight = null;
      return null; // 离线:无本地数据
    }
  })();
  return inflight;
}

module.exports = { buildIndex, getContent, ensureContent, isLoaded };
