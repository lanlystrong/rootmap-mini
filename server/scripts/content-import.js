// server/scripts/content-import.js —— 【一次性 / 可重放】把 bootstrap 包灌进数据库
//
// 这是「内容从仓库文件搬进数据库」的**唯一**入口。它读的是 _extract-bootstrap.js
// 抽出来的自包含包(默认在仓库外),所以它**不依赖仓库里那些即将被删掉的文件** ——
// 包一旦生成,源文件就可以退休了。
//
// 为什么是「整份交付集一次灌完」而不是分三层灌:
//   交付集 = 手写层 + 词典层 + 生成层合并后的结果,而合并发生在 index.js 里。
//   重新推导一遍合并 = 又写一份「第二实现」,正是本项目最贵的历史 bug。
//   所以行的值直接取合并结果,origin 只按 id 集合归属打标签 —— 分类,不是重算。
//
// 用法:
//   node scripts/content-import.js                     # 默认 rootmap_1 + 默认包路径
//   node scripts/content-import.js --dry-run           # 只报告,不写库
//   node scripts/content-import.js --db rootmap --allow-db
//   ROOTMAP_BACKUP_DIR=E:\backup node scripts/content-import.js
//
// 幂等:可重复跑,每次把 6 张内容表 + 裁定表 + 补丁表 + 语料整批替换成包里的状态。
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { seedContent } = require('../src/seedContent');
const { dbConfig, guardDbName } = require('../src/dbConfig');
const { CONTENT_DDL } = require('../src/db');
const store = require('../src/contentStore');

const ROOT_FIELDS = ['text', 'type', 'group', 'zh', 'note'];

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}
const flag = (name) => process.argv.includes(name);

function bundlePath() {
  const dir = process.env.ROOTMAP_BACKUP_DIR || arg('--bundle-dir', 'D:\\rootmap-backup');
  return arg('--bundle', path.join(dir, 'bootstrap', 'content-bundle.json'));
}

function loadBundle(file) {
  if (!fs.existsSync(file)) {
    console.error(`❌ 找不到内容包:${file}`);
    console.error('   先跑一次 node scripts/_extract-bootstrap.js(它必须在源文件被删之前跑,只能跑一次)。');
    process.exit(1);
  }
  const b = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const k of ['delivered', 'origin', 'dict', 'verdicts', 'patches', 'corpus']) {
    if (!b[k]) { console.error(`❌ 内容包缺少字段「${k}」,可能是不完整或过期的包:${file}`); process.exit(1); }
  }
  return b;
}

// 交付集行 → 带 origin 的行。**只分类,不重算。**
// 分类依据是 id 集合,不是文件名、不是数组位置 —— id 集合是 index.js 里那次合并留下的
// 唯一可核对的痕迹(手写层的文件已按 id 列出,生成层的就是"交付集减去手写层")。
function tagOrigins(b) {
  const handRoots = new Set(b.origin.handRootIds);
  const handAffixes = new Set(b.origin.handAffixIds);
  const handWords = new Set(b.origin.handWordIds);
  const mergeInto = b.dict.affixMergeInto || {};
  const allowSingle = new Set(b.dict.allowSingleLetter || []);

  const roots = b.delivered.roots.map((r) => Object.assign({}, r, {
    origin: handRoots.has(r.id) ? 'hand' : 'dict',
  }));
  const affixes = b.delivered.affixes.map((a) => Object.assign({}, a, {
    origin: handAffixes.has(a.id) ? 'hand' : 'dict',
    mergeInto: mergeInto[a.id] || null,
    allowSingleLetter: allowSingle.has(a.id),
  }));
  const words = b.delivered.words.map((w) => Object.assign({}, w, {
    origin: handWords.has(w.id) ? 'hand' : 'gen',
  }));
  return { roots, affixes, words };
}

// 分类的**独立交叉验证**:extraRoots(由 morphology.js 自己算出来的词典层)
// 必须恰好等于「交付集减去手写层」。两条推导路径互不相干 —— 一条从 morphology.js 出发,
// 一条从 index.js 的合并结果出发;它们对上,才说明 origin 标签没有贴错。
// 一旦错位,后面「生成器只读 hand/dict」这条不变量就是建立在错的行上的。
function crossCheck(b) {
  const errs = [];
  const check = (label, dictIds, handIds, delivered) => {
    const expected = new Set(delivered.map((x) => x.id).filter((id) => !handIds.has(id)));
    const actual = new Set(dictIds);
    const onlyDict = [...actual].filter((id) => !expected.has(id));
    const onlyDelivered = [...expected].filter((id) => !actual.has(id));
    if (onlyDict.length || onlyDelivered.length) {
      errs.push(`${label}:词典层多 ${onlyDict.length} 条(${onlyDict.slice(0, 5).join(',') || '—'}),`
        + `少 ${onlyDelivered.length} 条(${onlyDelivered.slice(0, 5).join(',') || '—'})`);
    }
  };
  check('roots', b.dict.roots.map((r) => r.id), new Set(b.origin.handRootIds), b.delivered.roots);
  check('affixes', b.dict.affixes.map((a) => a.id), new Set(b.origin.handAffixIds), b.delivered.affixes);
  return errs;
}

// 合并改过什么 —— 从数据里**推**出来,不誊写 index.js 的 AFFIX_OVERRIDE 常量。
// 交付集里只剩合并后的值,所以这份记录是「手写序是前缀」「affix-in 的释义来自词典层」
// 这两条性质唯一的存证(测试 ②③ 靠它)。
function mergeOverrides(b) {
  const out = {};

  const rawRootById = new Map(b.hand.rawRoots.map((r) => [r.id, r]));
  for (const d of b.delivered.roots) {
    const raw = rawRootById.get(d.id);
    if (!raw) continue;
    const rawV = raw.variants || [];
    const delV = d.variants || [];
    if (delV.length === rawV.length) continue;
    // 手写序必须是交付序的**前缀**,否则「合并」这个词就不成立了 —— 宁可在这里炸,
    // 也不要留一条自己都解释不清的行。
    for (let i = 0; i < rawV.length; i++) {
      if (String(delV[i]).toLowerCase() !== String(rawV[i]).toLowerCase()) {
        throw new Error(`root ${d.id} 的交付 variants 不是手写 variants 的前缀:`
          + `第 ${i} 位 手写=${rawV[i]} 交付=${delV[i]}`);
      }
    }
    out[d.id] = { variants_appended: delV.slice(rawV.length), variants_raw: rawV };
  }

  const rawAffixById = new Map(b.hand.rawAffixes.map((a) => [a.id, a]));
  for (const d of b.delivered.affixes) {
    const raw = rawAffixById.get(d.id);
    if (!raw) continue;
    const changed = {};
    for (const k of ROOT_FIELDS) {
      const before = raw[k] === undefined ? null : raw[k];
      const after = d[k] === undefined ? null : d[k];
      if (store.canon(before) !== store.canon(after)) changed[k] = { before, after };
    }
    if (Object.keys(changed).length) out[d.id] = Object.assign(out[d.id] || {}, changed);
  }
  return out;
}

// 批量插入。语料 1.7 万行逐条 INSERT 在单事务里太慢,按批走。
async function insertRows(conn, table, cols, rows, batch = 200) {
  const ph = '(' + cols.map(() => '?').join(',') + ')';
  for (let i = 0; i < rows.length; i += batch) {
    const chunk = rows.slice(i, i + batch);
    await conn.query(
      `INSERT INTO \`${table}\` (${cols.map((c) => `\`${c}\``).join(',')}) VALUES `
      + chunk.map(() => ph).join(','),
      chunk.flat()
    );
  }
}

// 词典的**行序**为什么可以不比 —— 这不是感觉,是可以证明的两条:
//   1) rootByVariant 是 first-wins 的 Map:只有当同一个变体同时挂在两个根上,顺序才影响结果;
//   2) prefixes/suffixes 按长度降序做**稳定**排序,segment() 在每个位置逐个尝试 ——
//      同一位置上能同时匹配的两项必须文本相同;文本不同、长度相同的两项不可能同时匹配。
//      所以只有当同一 type 下出现同形(text 相同)的两项时,顺序才影响结果。
// 今天两条前提都成立(实测 0 例),而这正是 affix-in / affix-in-neg 之所以要被**合并**的原因
// —— 合并就是为了消掉同形。所以顺序不比,改为把前提本身钉成断言:
// 一旦有人加进同形词缀或跨根重名变体,这里立刻报错,而那时顺序就真的重要了。
// (position 比较对这类变化是**看不见的** —— 它只会在别处造成一个说不清的拆解差异。)
function assertOrderIrrelevant(lex) {
  const errs = [];

  const affixKey = (a) => `${a.type} ${String(a.text || '').replace(/-/g, '').toLowerCase()}`;
  const byAffix = new Map();
  for (const a of lex.affixes) {
    const k = affixKey(a);
    if (!byAffix.has(k)) byAffix.set(k, []);
    byAffix.get(k).push(a.id);
  }
  for (const [k, ids] of byAffix) {
    if (ids.length > 1) errs.push(`同形词缀「${k}」:${ids.join(', ')} —— 顺序开始影响拆解结果`);
  }

  const byVariant = new Map();
  for (const r of lex.roots) {
    for (const v of r.variants || []) {
      const k = String(v).toLowerCase();
      if (!byVariant.has(k)) byVariant.set(k, new Set());
      byVariant.get(k).add(r.id);
    }
  }
  for (const [k, ids] of byVariant) {
    if (ids.size > 1) errs.push(`变体「${k}」同时挂在 ${[...ids].join(', ')} 上 —— first-wins 开始有歧义`);
  }

  return errs;
}

function countsOf(rows, key) {
  return rows.reduce((o, r) => { o[r[key]] = (o[r[key]] || 0) + 1; return o; }, {});
}

async function main() {
  const file = bundlePath();
  const dryRun = flag('--dry-run');
  const b = loadBundle(file);

  console.log(`内容包:${file}`);
  console.log(`  抽取于 ${b.generated_at}(${b.source})`);

  const errs = crossCheck(b);
  if (errs.length) {
    console.error('❌ 内容包自相矛盾,origin 标签不可信,已中止:');
    errs.forEach((e) => console.error('   ' + e));
    process.exit(1);
  }
  console.log('  ✓ 词典层 = 交付集 − 手写层(两条独立推导对上)');

  const dataset = tagOrigins(b);
  const rc = countsOf(dataset.roots, 'origin');
  const ac = countsOf(dataset.affixes, 'origin');
  const wc = countsOf(dataset.words, 'origin');
  console.log(`  交付集 roots=${dataset.roots.length}(hand ${rc.hand || 0} / dict ${rc.dict || 0})`
    + ` affixes=${dataset.affixes.length}(hand ${ac.hand || 0} / dict ${ac.dict || 0})`
    + ` words=${dataset.words.length}(hand ${wc.hand || 0} / gen ${wc.gen || 0})`);
  console.log(`  裁定表=${b.verdicts.length} 补丁表=${b.patches.length} 语料=${b.corpus.length}`);

  const overrides = mergeOverrides(b);
  console.log(`  合并留痕 ${Object.keys(overrides).length} 条(手写层被合并改过的字段)`);

  if (dryRun) {
    console.log('\n--dry-run:未写库。');
    return;
  }

  const cfg = dbConfig();
  const name = guardDbName('导入内容', { db: arg('--db', cfg.database), allowDb: flag('--allow-db') });
  cfg.database = name;
  console.log(`\n目标库:${name}(${cfg.host}:${cfg.port})`);

  const conn = await mysql.createConnection(cfg);
  try {
    // 建表必须在事务外:DDL 隐式提交,mysql2 的嵌套事务会静默提交外层。
    for (const ddl of CONTENT_DDL) await conn.query(ddl);

    const before = await store.handFingerprint(conn);
    await conn.beginTransaction();
    try {
      const counts = await seedContent(conn, dataset, {
        origin: 'gen', replace: ['hand', 'dict', 'gen'], transaction: false,
      });

      await conn.query('DELETE FROM decompose_verdict');
      await insertRows(conn, 'decompose_verdict',
        ['word', 'verdict', 'reason', 'regression_group'],
        b.verdicts.map((v) => [v.word, v.verdict, v.reason, v.regression_group || null]));

      await conn.query('DELETE FROM word_patches');
      await insertRows(conn, 'word_patches',
        ['word_id', 'phonetic', 'example_en', 'example_zh'],
        b.patches.map((p) => [p.word_id, p.phonetic, p.example_en, p.example_zh]));

      await conn.query('DELETE FROM cet4_corpus');
      await insertRows(conn, 'cet4_corpus', ['id', 'word', 'source', 'raw'],
        b.corpus.map((c) => [c.id, c.word, c.source, JSON.stringify(c.raw)]), 100);

      // 审计行:这一版交付集是怎么来的、对手写层做了什么叠加。
      await conn.query(
        'INSERT INTO content_merge_log (version, built_at, stats, overrides) VALUES (?,?,?,?)',
        [
          store.contentVersion(dataset),
          new Date().toISOString(),
          JSON.stringify({
            handRoots: rc.hand || 0, dictRoots: rc.dict || 0,
            handAffixes: ac.hand || 0, dictAffixes: ac.dict || 0,
            handWords: wc.hand || 0, genWords: wc.gen || 0,
            verdicts: b.verdicts.length, patches: b.patches.length, corpus: b.corpus.length,
            source: 'bootstrap-import',
          }),
          JSON.stringify(overrides),
        ]
      );

      await conn.commit();
      console.log(`  写入 6 张内容表 ${JSON.stringify(counts)}`);

      // 快照要放在提交后:提交前读到的还是事务内的视图,而库里原本是空的。
      // 这里比的是「导入前的手写层」与「导入后的手写层」—— 导入本来就该改变它
      // (第一次是从无到有),所以这一条只作记录,不作断言。
      const after = await store.handFingerprint(conn);
      if (before !== after) console.log('  (手写层指纹已变化:本次导入写入了手写层)');
    } catch (err) {
      await conn.rollback();
      throw err;
    }

    // ---- 自检:用**生产读者本身**把库读回来,和包里的交付集逐字段比 ----
    // 这一条是这次迁移的定心丸:数据源从文件换成了库,交付内容一个字都不能动。
    // 拿仿制读者去比等于把老毛病换件衣服重犯,所以这里用的就是 readDataset。
    const got = await store.readDataset(conn);
    const diffs = store.diffDataset(dataset, got);
    if (diffs.length) {
      console.error(`\n❌ 回读校验未通过(${diffs.length} 处,最多显示 25 处):`);
      diffs.forEach((d) => console.error('   ' + d));
      process.exit(1);
    }
    console.log('  ✓ 回读校验通过:库里的交付集与包逐字段一致(含顺序)');

    // ---- 词典层等价:读回来必须正好是 morphology.js 原来喂给生成器的那份 ----
    // 这条现在能跑,是因为 morphology.js 还在;Phase 3 它变成工厂、词典由库传入之后,
    // 这条自然变成同义反复,届时删掉。
    const lex = await store.readLexicon(conn);
    const morph = require('../src/morphology');
    const lexDiffs = store.diffDataset(
      { roots: morph.roots, affixes: morph.affixes, words: [] },
      { roots: lex.roots, affixes: lex.affixes, words: [] },
      { compareOrder: false }
    );
    const orderErrs = assertOrderIrrelevant(lex);
    if (lexDiffs.length || orderErrs.length) {
      console.error(`\n❌ 词典层不等价(${lexDiffs.length + orderErrs.length} 处):`);
      lexDiffs.forEach((d) => console.error('   ' + d));
      orderErrs.forEach((e) => console.error('   ' + e));
      process.exit(1);
    }
    console.log(`  ✓ 词典层等价:${lex.roots.length} 根 / ${lex.affixes.length} 缀`
      + '(内容逐字段一致;行序不影响生成结果 —— 同形词缀 0 组、跨根重名变体 0 例)');

    const org = await store.countByOrigin(conn);
    console.log(`\n✅ 导入完成。库中:${JSON.stringify(org)}`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('\n❌ 导入失败,数据库已回滚到导入前状态:');
  console.error('   ' + (err && err.message ? err.message : err));
  process.exit(1);
});
