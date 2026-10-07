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
// 与早期版本不同:这里**不打包内置 data/index**。内容真源永远是服务端 MySQL。
// wx.storage 里存的是**上次从服务端下载、且用 checksum 验证过**的一份副本,
// 只作缓存:每次冷启动都先问 /api/content/meta 的 checksum,对得上就用缓存直接开跑
// (省掉 871 KB 的重复下载),对不上就重下。所以服务端改了词条,客户端不会用到旧内容。
//
// 状态机(页面据此渲染「加载中 / 出错了,点这重试 / 正常」):
//   idle    还没开始拉
//   loading 正在拉
//   ready   有内容了
//   error   拉失败,lastErr 有原因
//
// 为什么要有这层:ensureContent 内部自己 catch 并返回 null,**永远不 reject**。
// 早前六个页面写的是 `ensureContent().then(...).catch(()=>{})` —— 那个 catch 是死代码,
// 于是失败被彻底吞掉:首页渲染成「已学 0/0」,单词页连 wx:if/wx:elif 都不匹配、整页空白。
// 用户看到的和"新用户零进度"一模一样,既不知道出了事,也没法重试。
let cached = null;
let inflight = null; // 进行中的加载 Promise,去重并发调用
let lastErr = '';    // 失败原因(给用户看的人话,不是 err.message)
const listeners = new Set();

const KEY_CACHE = 'rm_content_v1'; // 本地内容副本的 storage key
// 副本实测约 0.85 MB(交付集 223 根 / 151 缀 / 1450 词),微信 storage 上限 10 MB,
// 余量够用。写失败(配额满/被系统清理)已在 writeCache 里兜住,只是退回到
// 「每次冷启动都全量下载」,不影响正确性。

// 读本地副本。任何异常(存储被清、配额满、格式不认识)都当"没有缓存" ——
// 缓存只是优化,读不到就该走网络,不该在这里抛给页面。
function readCache() {
  try {
    if (typeof wx === 'undefined') return null;
    const c = wx.getStorageSync(KEY_CACHE);
    if (!c || typeof c !== 'object' || !c.data) return null;
    if (!Array.isArray(c.data.words) || !c.data.words.length) return null;
    return c;
  } catch (e) {
    return null;
  }
}

function writeCache(raw, checksum) {
  try {
    if (typeof wx === 'undefined') return;
    // checksum 存空 = 下次必然重下(宁可多下也不能拿没验证过的内容当真的)。
    wx.setStorageSync(KEY_CACHE, { v: 1, checksum: checksum || '', savedAt: Date.now(), data: raw });
  } catch (e) {
    /* 配额满:内存里照常用,只是下次冷启动又得全量下载。 */
  }
}

// 把底层错误翻成用户能看懂的一句话。分不清"没网"和"服务器炸了"就没法给出有用的提示。
function describe(e) {
  if (!e) return '内容为空';
  if (e.offline) return '连不上服务器,请检查网络';
  if (e.code === 'timeout') return '请求超时,请检查网络后重试';
  if (e.code === 'rate_limit_exceeded') return '请求太频繁,请稍后再试';
  if (e.status >= 500) return '服务器出错了,请稍后再试';
  return e.message || e.code || '内容加载失败';
}

function emit() {
  for (const fn of listeners) {
    try { fn(); } catch (err) { /* 监听器自己抛错不该拖垮加载 */ }
  }
}

function getState() {
  if (cached) return 'ready';
  if (inflight) return 'loading';
  return lastErr ? 'error' : 'idle';
}

function getError() { return lastErr; }

// 订阅状态变化,返回退订函数。页面用它把「加载中/出错」同步到自己的 data。
function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function getContent() {
  return cached;
}

function isLoaded() {
  return !!cached;
}

// 确保内容已就绪。in-flight 去重:多次调用共享同一次网络请求。
//
// 顺序:
//   1. 有本地副本 → 先问 checksum。相同就直接开跑;问不到(断网)也先跑起来,
//      副本是上次验证过的,总比给用户一个空白页强。
//   2. checksum 不同 / 没有副本 → 拉全量,并顺手记住服务端 checksum。
//   3. 全量也失败、但本地有副本 → 退回副本,不算错误(离线可用)。
//   4. 全量失败且无副本 → error 态,页面渲染重试入口。
function ensureContent() {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  lastErr = '';
  emit(); // 切到 loading

  const p = (async () => {
    let api;
    try {
      api = require('./api');
    } catch (e) {
      lastErr = '内容模块加载失败';
      return null;
    }

    const hit = readCache();
    let meta = null;
    if (hit) {
      try { meta = await api.contentMeta(); } catch (e) { meta = null; }
      if (!meta || (hit.checksum && meta.checksum === hit.checksum)) {
        // 问不到 checksum = 大概率离线;副本上次验过,先让用户用上。
        cached = buildIndex(hit.data);
        lastErr = '';
        return cached;
      }
      // checksum 对不上 → 服务端内容已变,继续往下走全量。
    }

    // 没副本时 meta 与全量并发发,别为拿 checksum 单独多等一个 RTT。
    const metaP = meta ? Promise.resolve(meta) : api.contentMeta().catch(() => null);
    try {
      const raw = await api.fetchContent();
      if (!raw || !Array.isArray(raw.words) || !raw.words.length) {
        if (hit) { cached = buildIndex(hit.data); lastErr = ''; return cached; }
        lastErr = '服务器返回了空词库';
        return null;
      }
      cached = buildIndex(raw);
      lastErr = '';
      const m = await metaP;
      writeCache(raw, m ? m.checksum : '');
      return cached;
    } catch (e) {
      if (hit) { // 离线优先:宁可给旧内容,也不要空白页
        cached = buildIndex(hit.data);
        lastErr = '';
        return cached;
      }
      lastErr = describe(e);
      return null;
    }
  })();

  inflight = p;
  // 统一在这里清 inflight 并通知页面。放在外面而不是 body 里,是因为 body 可能
  // **同步**就结束(require('./api') 抛错那条),那时 `inflight = null` 会被后面
  // 的 `inflight = p` 覆盖掉 —— 状态就永远卡在 'loading',页面再也等不到重试。
  p.then(() => {
    if (inflight === p) {
      inflight = null;
      emit();
    }
  });
  return p;
}

// 手动重试。必须先清掉 inflight:否则上一次失败时它已被置 null,但如果上一次还在飞,
// 用户的重试会被静默合并进那次注定失败的请求里,点了没反应。
function retry() {
  if (inflight) return inflight;
  lastErr = '';
  emit();
  return ensureContent();
}

// 把加载态绑到一个 Page 上:统一维护 contentState/contentErr/contentReady 三个字段,
// 页面只需在 wxml 顶部放 <content-gate> 并给正文容器加 wx:if="{{contentReady}}"。
// onReady 在「从不可用变为可用」的那一刻回调一次 —— 页面拿它做重入刷新(等价于
// 老代码里 `ensureContent().then(() => { if (isLoaded()) this.onShow(); })`)。
//
// 自动挂 onUnload 退订:Tab 页切走不销毁,但非 Tab 页(navigateTo 进来的详情页)
// 退出会,漏退订就是往 listeners 里漏一个闭包。
function attachTo(page, onReady) {
  const sync = () => {
    const ready = !!cached;
    const wasReady = !!page.data.contentReady;
    page.setData({ contentState: getState(), contentErr: getError(), contentReady: ready });
    if (ready && !wasReady && onReady) onReady.call(page);
  };
  sync();
  const off = onChange(sync);
  const orig = page.onUnload;
  page.onUnload = function (...args) {
    off();
    if (orig) return orig.apply(this, args);
  };
  return off;
}

module.exports = { buildIndex, getContent, ensureContent, isLoaded, getState, getError, onChange, retry, attachTo };

