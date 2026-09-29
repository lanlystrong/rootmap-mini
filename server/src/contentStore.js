// server/src/contentStore.js —— 数据库 ↔ 内容对象 的**唯一**映射层
//
// 读和写都只在这里定义。这么做的理由不是「好看」,而是本项目最贵的一类历史 bug:
// 同一套合并/装配逻辑存在两份实现,各自都自洽,然后在统计数字对不上的时候才被发现
// (41 个词的根段落在 variants 之外、70 个否定词指错 in-)。搬进数据库后这件事换了张脸
// ——写侧是 SQL、读侧也是 SQL,失败模式变成漏 ORDER BY、JSON 列按键重排、NULL vs 空串、
// 非 STRICT 模式静默截断 —— 但要命的性质一模一样:**无声**。
//
// 所以校验的做法是「写进去,再用**生产读者本身**读回来,深比较」。拿一份仿制读者去比,
// 等于把老毛病换件衣服重犯。
const crypto = require('node:crypto');

// MySQL 的 JSON 列会重排对象键(语义不变)。凡是要比较或哈希 JSON 字段的地方,
// 都必须先按键序规范化,否则会把「键序不同、内容相同」误报成数据不一致(实测曾误报 16 处)。
const sortKeys = (v) => (Array.isArray(v) ? v.map(sortKeys)
  : v && typeof v === 'object'
    ? Object.keys(v).sort().reduce((o, k) => { o[k] = sortKeys(v[k]); return o; }, {})
    : v);
const canon = (v) => JSON.stringify(sortKeys(v === undefined ? null : v));

// 解析 MySQL 的 JSON 列:mysql2 有时给对象、有时给字符串,空值三种写法都要收。
function json(v, dflt) {
  if (v === null || v === undefined || v === '') return dflt;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return dflt; }
}

// ---------- 读:交付集 ----------
// 顺序是**交付序**,必须逐一复现,否则 /words 的响应与旧的文件版不一致:
//   词根/词缀 —— 按 seq(手写层在前,词典层追加在后)
//   单词      —— 按「词根 seq → 手写先行 → 族内 seq」
// 单词的全局铺法原来由 index.js 的 `for (const r of roots) push(...groups.get(r.id))` 决定,
// 而族内是「手写族先 add,生成层后 add」,所以手写词天然排在各族最前。
async function readDataset(conn) {
  const [rootRows] = await conn.query('SELECT * FROM roots ORDER BY seq, id');
  const [affixRows] = await conn.query('SELECT * FROM affixes ORDER BY seq, id');
  const [wordRows] = await conn.query('SELECT * FROM words');
  const [senseRows] = await conn.query('SELECT * FROM word_senses ORDER BY word_id, seq');
  const [bdRows] = await conn.query('SELECT * FROM word_breakdown ORDER BY word_id, seq');
  const [exRows] = await conn.query('SELECT * FROM word_examples ORDER BY word_id, seq');

  const roots = rootRows.map((r) => {
    const o = { id: r.id, root: r.root, variants: json(r.variants, []), zh: r.zh, group: r.group_name, wordCount: r.word_count || 0 };
    // 可选字段:交付集里「没有」与「空串」是两回事(validate-content 在若干处分得很清),
    // 所以这里按「库里是 NULL 就不带这个键」还原,而不是补成 '' 或 null。
    if (r.meaning !== null) o.meaning = r.meaning;
    if (r.story !== null) o.story = r.story;
    return o;
  });

  const affixes = affixRows.map((a) => {
    const o = { id: a.id, text: a.text, type: a.type, group: a.group_name, zh: a.zh };
    if (a.note !== null) o.note = a.note;
    return o;
  });

  const groupBy = (rows) => {
    const m = new Map();
    for (const r of rows) {
      if (!m.has(r.word_id)) m.set(r.word_id, []);
      m.get(r.word_id).push(r);
    }
    return m;
  };
  const sG = groupBy(senseRows), bG = groupBy(bdRows), eG = groupBy(exRows);

  const rootSeq = new Map(rootRows.map((r, i) => [r.id, i]));
  const ordered = wordRows.slice().sort((a, b) => {
    const ra = rootSeq.has(a.root_id) ? rootSeq.get(a.root_id) : Number.MAX_SAFE_INTEGER;
    const rb = rootSeq.has(b.root_id) ? rootSeq.get(b.root_id) : Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    const oa = a.origin === 'hand' ? 0 : 1, ob = b.origin === 'hand' ? 0 : 1;
    if (oa !== ob) return oa - ob;
    return a.seq - b.seq;
  });

  const words = ordered.map((w) => {
    const senses = (sG.get(w.id) || []).map((s) => {
      const o = {};
      if (s.pos !== null) o.pos = s.pos;
      o.zh = s.zh;
      o.en = s.en === null ? null : s.en;
      return o;
    });
    const breakdown = (bG.get(w.id) || []).map((b) => {
      const o = { part: b.part, type: b.type };
      if (b.zh !== null) o.zh = b.zh;
      if (b.ref_id !== null) o.refId = b.ref_id;
      return o;
    });
    return {
      id: w.id,
      word: w.word,
      phonetic: w.phonetic,
      senses,
      breakdown,
      tags: json(w.tags, []),
      examples: (eG.get(w.id) || []).map((e) => ({ en: e.en, zh: e.zh })),
      assoc: json(w.assoc, {}),
    };
  });

  return { roots, affixes, words };
}

// ---------- 读:生成器的人工输入 ----------
// 词典 = 手写层 + 词典层,但**并掉 merge_into 指向别处的行**(同形词缀只留一条)。
// 交付集里那两条都在 —— 交付与词典对 in- 的处理不同是**有意的**,见 server/README.md。
async function readLexicon(conn) {
  const [rootRows] = await conn.query(
    "SELECT * FROM roots WHERE origin IN ('hand','dict') ORDER BY seq, id");
  const [affixRows] = await conn.query(
    "SELECT * FROM affixes WHERE origin IN ('hand','dict') ORDER BY seq, id");
  return {
    roots: rootRows.map((r) => ({
      id: r.id, root: r.root, variants: json(r.variants, []), zh: r.zh, group: r.group_name,
      meaning: r.meaning, story: r.story,
    })),
    affixes: affixRows.filter((a) => !a.merge_into).map((a) => ({
      id: a.id, text: a.text, type: a.type, group: a.group_name, zh: a.zh, note: a.note,
      origin: a.origin, mergeInto: a.merge_into, allowSingleLetter: !!a.allow_single_letter,
    })),
  };
}

// 裁定表:word -> { verdict, reason, regressionGroup }
async function readVerdicts(conn) {
  const [rows] = await conn.query('SELECT * FROM decompose_verdict');
  const m = new Map();
  for (const r of rows) {
    m.set(r.word, { verdict: r.verdict, reason: r.reason, regressionGroup: r.regression_group });
  }
  return m;
}

// 补丁表,还原成原来 patches.js 的 { phonetics, examples } 形状(消费端一行不用改)
async function readPatches(conn) {
  const [rows] = await conn.query('SELECT * FROM word_patches');
  const phonetics = {}, examples = {};
  for (const r of rows) {
    if (r.phonetic) phonetics[r.word_id] = r.phonetic;
    if (r.example_en && r.example_zh) examples[r.word_id] = { en: r.example_en, zh: r.example_zh };
  }
  return { phonetics, examples };
}

// 语料:整条原始 JSON 取回,不做字段级还原 —— 它是外部输入,原样进来原样出去。
async function readCorpus(conn) {
  const [rows] = await conn.query('SELECT * FROM cet4_corpus ORDER BY id');
  return rows.map((r) => ({ id: r.id, word: r.word, source: r.source, raw: json(r.raw, {}) }));
}

// 第 1 段产物:逐词猜拆解的词对象
async function readCandidates(conn) {
  const [rows] = await conn.query('SELECT * FROM cet4_candidates ORDER BY id');
  return rows.map((r) => json(r.payload, null)).filter(Boolean);
}

// ---------- 写:第 1 段产物 ----------
async function writeCandidates(conn, words) {
  await conn.beginTransaction();
  try {
    await conn.query('DELETE FROM cet4_candidates');
    for (const w of words) {
      const decomposable = (w.breakdown || []).some((b) => b.type === 'root') ? 1 : 0;
      await conn.query(
        'INSERT INTO cet4_candidates (id, word, decomposable, payload) VALUES (?,?,?,?)',
        [w.id, w.word, decomposable, JSON.stringify(w)]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  }
}

// ---------- 校验与指纹 ----------
// 内容版本:按**行数据**现算,不存计数器。
//
// 原实现只哈希 id 列表 —— 改释义、音标、例句都不变,拿它做缓存失效判断是错的。
// 现算的代价是每次启动做一次全量哈希(1450 词,约 10 毫秒),换来的是:有人用裸 SQL
// 改过库,客户端也不会读到陈旧内容。
function contentVersion(dataset) {
  const payload = {
    roots: dataset.roots.map((r) => [r.id, r.root, r.variants, r.zh, r.group, r.meaning ?? null, r.story ?? null]),
    affixes: dataset.affixes.map((a) => [a.id, a.text, a.type, a.group, a.zh, a.note ?? null]),
    words: dataset.words.map((w) => [w.id, w.word, w.phonetic, w.senses, w.breakdown, w.tags, w.examples, w.assoc]),
  };
  return crypto.createHash('sha1').update(canon(payload)).digest('hex');
}

// 手写层指纹。生成器写库前后各取一次,不等就回滚 ——
// 这是「生成器只读手写层」这条不变量的**可执行**版本。
//
// 为什么不用数据库触发器:手写层的日常维护方式就是直接写 SQL(见 README 的编辑路径),
// 触发器会连人一起挡在门外。放在生成器一侧,挡的是唯一需要挡的那个动作。
//
// 列名一律显式写,绝不用 `SELECT *`。踩过的坑值得记下来:
// word_senses / word_breakdown / word_examples 各有一个自增代理键 id,而「整批替换」
// 是删了重插 —— 于是每次导入 id 都变(实测 6186 → 8055),逻辑内容却一字未动。
// `SELECT *` 会把它算进指纹,后果不是"有点吵",而是**守卫每次都误报**:
// 生成器写完一读,指纹必变 → 每次生成都 ROLLBACK。一个永远拦路的守卫等于没有守卫,
// 而且它会以「生成器坏了」的面目出现,让人去查生成逻辑,查到的是指纹。
// 所以这里比的是**内容**,代理键不是内容。
const FINGERPRINT_SQL = [
  ['roots', "SELECT id, root, variants, zh, group_name, meaning, story, seq "
    + "FROM roots WHERE origin='hand' ORDER BY id"],
  ['affixes', "SELECT id, text, type, group_name, zh, note, seq, merge_into, allow_single_letter "
    + "FROM affixes WHERE origin='hand' ORDER BY id"],
  ['words', "SELECT id, word, phonetic, root_id, tags, assoc, seq "
    + "FROM words WHERE origin='hand' ORDER BY id"],
  ['senses', "SELECT s.word_id, s.seq, s.pos, s.zh, s.en FROM word_senses s JOIN words w ON w.id=s.word_id "
    + "WHERE w.origin='hand' ORDER BY s.word_id, s.seq"],
  ['breakdown', "SELECT b.word_id, b.seq, b.part, b.type, b.zh, b.ref_id FROM word_breakdown b JOIN words w ON w.id=b.word_id "
    + "WHERE w.origin='hand' ORDER BY b.word_id, b.seq"],
  ['examples', "SELECT e.word_id, e.seq, e.en, e.zh FROM word_examples e JOIN words w ON w.id=e.word_id "
    + "WHERE w.origin='hand' ORDER BY e.word_id, e.seq"],
];

async function handFingerprint(conn) {
  const parts = [];
  for (const [label, sql] of FINGERPRINT_SQL) {
    const [rows] = await conn.query(sql);
    parts.push(label + ':' + canon(rows));
  }
  return crypto.createHash('sha1').update(parts.join('\n')).digest('hex');
}

// ---------- 比较:写进去的 vs 读回来的 ----------
// 交付集的逐字段比较器。**只能有一份** —— 比较逻辑出现两份,「两边各自自洽、结论相反」
// 这种最贵的老毛病就会原地复活。content:import、生成器的 verifyRoundTrip、
// 第 3 层的 check-dataset 都调它。
//
// 比较口径是**线上会发出的东西**,所以标量也一律走 canon:
//   · 键序不同、内容相同 → 不算差异(MySQL 的 JSON 列会重排键,实测曾误报 16 处)
//   · 缺键 / undefined / null → **不算差异**(JSON.stringify 三者都发成同一结果)
//   · NULL 与 ''            → **算差异**(发出来一个是 null、一个是空串,客户端分得清)
// 最后一条正是本改造要盯的失败模式之一,不能被规范化顺手抹掉。
const FIELDS = {
  roots: ['root', 'variants', 'zh', 'group', 'meaning', 'story'],
  affixes: ['text', 'type', 'group', 'zh', 'note'],
  words: ['word', 'phonetic', 'senses', 'breakdown', 'tags', 'examples', 'assoc'],
};

function diffDataset(want, got, opts = {}) {
  const limit = opts.limit === undefined ? 25 : opts.limit;
  // 交付集的顺序是内容的一部分(词根分组序、族内词序),默认比。
  // 只有「顺序对消费方不产生影响、且这个前提被单独断言钉住」时才关掉它 ——
  // 关掉顺序比较而不钉前提,就是在把检查改松。
  const compareOrder = opts.compareOrder !== false;
  const out = [];
  const push = (m) => { if (out.length < limit) out.push(m); };

  for (const coll of ['roots', 'affixes', 'words']) {
    const wById = new Map((want[coll] || []).map((x) => [x.id, x]));
    const gById = new Map((got[coll] || []).map((x) => [x.id, x]));

    for (const id of wById.keys()) if (!gById.has(id)) push(`${coll} 丢失:${id}`);
    for (const id of gById.keys()) if (!wById.has(id)) push(`${coll} 多出:${id}`);

    for (const [id, w] of wById) {
      const g = gById.get(id);
      if (!g) continue;
      for (const f of FIELDS[coll]) {
        const a = canon(w[f]), b = canon(g[f]);
        if (a !== b) {
          push(`${coll} ${id} 字段 ${f} 不一致:\n      写入 ${a}\n      读回 ${b}`);
        }
      }
    }

    // 顺序也是交付内容的一部分(词根分组序、族内词序都靠它),单独比一遍。
    if (!compareOrder) continue;
    const wOrder = (want[coll] || []).map((x) => x.id);
    const gOrder = (got[coll] || []).map((x) => x.id);
    if (wOrder.length === gOrder.length) {
      for (let i = 0; i < wOrder.length; i++) {
        if (wOrder[i] !== gOrder[i]) {
          push(`${coll} 顺序错位:第 ${i} 位应为 ${wOrder[i]},实为 ${gOrder[i]}`);
          break;
        }
      }
    }
  }
  return out;
}

async function countByOrigin(conn) {
  const out = {};
  for (const t of ['roots', 'affixes', 'words']) {
    const [rows] = await conn.query(`SELECT origin, COUNT(*) n FROM \`${t}\` GROUP BY origin`);
    out[t] = Object.fromEntries(rows.map((r) => [r.origin, r.n]));
  }
  return out;
}

module.exports = {
  readDataset, readLexicon, readVerdicts, readPatches, readCorpus, readCandidates,
  writeCandidates, contentVersion, handFingerprint, countByOrigin, diffDataset,
  canon, sortKeys, json,
};
