// server/scripts/_extract-bootstrap.js —— 【一次性】把仓库里的内容抽成一个自包含的 JSON 包
//
// 存在的理由:本次改造要把内容从「仓库里的 JS 文件」搬进「数据库里的行」。搬完之后
// 那些文件会被删除,所以必须**在删之前**先把它们抽成一个包,供 content-import.js 灌库。
// 这是整个迁移里唯一有先后依赖的一次性动作 —— 包一旦生成,源文件就可以退休了。
//
// 用法:
//   node scripts/_extract-bootstrap.js --out D:\rootmap-backup\bootstrap
//
// 产出(在仓库外):
//   <out>/content-bundle.json   手写层 + 词典层 + 裁定表 + 补丁表 + 语料
//
// 抽取方式刻意选得「尽量不靠手工抄」:
//   · 手写层 / 语料:直接 require 原始模块
//   · 词典层:morphology.js 里的 extraRoots 等并未导出,故用 vm 在**补上 baseRoots/
//     baseAffixes 之后**执行原文件本身 —— 数据由原代码算出来,不是我誊一遍。
//   · 裁定表:NO_DECOMPOSE / EXCLUDE 的逐条理由写在行尾注释里,require 拿不到,
//     只能解析源码文本。注释约定:「//」后的内容归本行所有;整行没有词、只有注释的
//     (续行的「// ↑ ...」)归上一组。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..', '..');

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}

// ---------- 1. 手写层 ----------
function readHand() {
  const rawRoots = require(path.join(REPO, 'miniprogram/data/roots'));
  const rawAffixes = require(path.join(REPO, 'miniprogram/data/affixes'));
  const gen = require(path.join(REPO, 'miniprogram/data/generated'));
  const index = require(path.join(REPO, 'miniprogram/data/index'));

  // 手写词 = 交付集里的词 减去 生成层的词。用 id 集合做差,不靠文件名推断。
  const genWordIds = new Set(gen.words.map((w) => w.id));
  const handWordIds = index.words.filter((w) => !genWordIds.has(w.id)).map((w) => w.id);

  return {
    // 交付集:合并结果本身。入库时**用它**做行的值,不重新推导一遍合并
    // —— 重新推导就又是一份「第二实现」。origin 靠 id 集合归属判定。
    delivered: { roots: index.roots, affixes: index.affixes, words: index.words },
    handRootIds: rawRoots.map((r) => r.id),
    handAffixIds: rawAffixes.map((a) => a.id),
    handWordIds,
    // 手写层的**原始**值(未经合并)。只用于记录 content_merge_log 的 overrides:
    // 交付后 variants 是并集、affix-in 的 zh/note/group 取自词典层,这两条「合并做过什么」
    // 的性质只能靠原始值事后验证 —— 交付集里已经看不出来了。
    rawHand: {
      roots: rawRoots.map((r) => ({ id: r.id, variants: r.variants || [] })),
      affixes: rawAffixes,
    },
    genIds: { roots: gen.roots.map((r) => r.id), affixes: gen.affixes.map((a) => a.id) },
    _raw: { roots: rawRoots, affixes: rawAffixes },
  };
}

// ---------- 2. 词典层(执行 morphology.js 本身,只把 require 换成注入) ----------
function readMorphology(hand) {
  const src = fs.readFileSync(path.join(REPO, 'server/src/morphology.js'), 'utf8')
    .replace(/^const baseRoots = require\(.*$/m, '')
    .replace(/^const baseAffixes = require\(.*$/m, '')
    .replace(/^module\.exports = \{[\s\S]*?\};$/m,
      'module.exports = { extraRoots, extraAffixes, baseVariantExtras, MERGED_AFFIX_IN, enrichedBaseRoots, mergedBaseAffixes };');
  const prelude = 'const baseRoots = ' + JSON.stringify(hand._raw.roots) + ';\n'
    + 'const baseAffixes = ' + JSON.stringify(hand._raw.affixes) + ';\n';
  const mod = { exports: {} };
  vm.runInNewContext(prelude + src, { module: mod, exports: mod.exports, console }, { filename: 'morphology.js' });
  return mod.exports;
}

// 被合并掉的手写词缀 → 幸存的行。**算出来,不写死**:
// morphology.js 的 mergedBaseAffixes = baseAffixes 去掉 in-/in-neg 两条,再并回一条 MERGED_AFFIX_IN。
// 凡「在手写基底里、却不在合并结果里」的 id 就是被并掉的,按 text 找它并进了谁。
// 今天只有 affix-in-neg → affix-in 一条;写成通用规则是因为这条对应关系一旦写死,
// 日后 morphology.js 再并任何一条,两边就悄悄分叉了 —— 正是本项目最贵的那类 bug。
function readAffixMergeInto(morph, rawAffixes) {
  const survived = new Set(morph.mergedBaseAffixes.map((a) => a.id));
  const byText = new Map(morph.mergedBaseAffixes.map((a) => [a.text, a.id]));
  const out = {};
  for (const a of rawAffixes) {
    if (survived.has(a.id)) continue;
    const into = byText.get(a.text);
    if (!into) throw new Error(`手写词缀 ${a.id}(${a.text})在合并结果里没有对应行 —— 它去哪儿了?`);
    out[a.id] = into;
  }
  return out;
}

// ---------- 3. 裁定表(只能用源码文本,理由在注释里) ----------
function parseVerdictBlock(src, decl) {
  const lines = src.split(/\r?\n/);
  const start = lines.findIndex((l) => l.includes(decl));
  if (start < 0) throw new Error('找不到 ' + decl);
  let end = start;
  while (end < lines.length && !/^\s*\]\);?\s*$/.test(lines[end])) end++;

  const out = [];
  let lastGroup = null;
  let pendingComment = [];
  for (let i = start + 1; i < end; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) {           // 纯注释行:只可能是续写,绝不贡献词
      pendingComment.push(trimmed.replace(/^\/\/\s*/, ''));
      continue;
    }
    const comment = line.match(/\/\/\s*(.*)$/);
    // 先砍掉注释再找词 —— 注释里也会出现引号(如 "如 root-cur 收了 'cou'"),
    // 不砍就会把它当成一条裁定读进来。
    const code = line.replace(/\/\/.*$/, '');
    const words = [...code.matchAll(/'([^']+)'/g)].map((m) => m[1]);
    if (!words.length) continue;
    let reason = '';
    if (comment) {
      const c = comment[1].trim();
      // 「// ↑ ...」是对上一行的补充说明,归上一组
      if (/^↑/.test(c) && lastGroup) {
        lastGroup.reason = (lastGroup.reason ? lastGroup.reason + ' ' : '') + c.replace(/^↑\s*/, '');
        continue;
      }
      reason = c;
    }
    lastGroup = { words, reason: (pendingComment.join(' ') + ' ' + reason).trim() };
    pendingComment = [];
    out.push(lastGroup);
  }
  return out;
}

function readVerdicts() {
  const src = fs.readFileSync(path.join(REPO, 'server/scripts/generate-cet4.js'), 'utf8');
  const rows = new Map();
  for (const g of parseVerdictBlock(src, 'const NO_DECOMPOSE = new Set([')) {
    for (const word of g.words) rows.set(word, { word, verdict: 'reject', reason: g.reason || '(审校否决,未逐条注明理由)' });
  }
  for (const g of parseVerdictBlock(src, 'const EXCLUDE = new Set([')) {
    for (const word of g.words) rows.set(word, { word, verdict: 'exclude', reason: g.reason || '(数据源清理,未逐条注明理由)' });
  }

  // 原 dataset-merge.test.js ⑧ 的分类清单 —— 不是新增裁定,只是给已有判定贴上分类标签。
  const testSrc = fs.readFileSync(path.join(REPO, 'server/test/dataset-merge.test.js'), 'utf8');
  const block = testSrc.slice(testSrc.indexOf('const rejected = {'));
  const body = block.slice(0, block.indexOf('\n  };'));
  for (const m of body.matchAll(/'([^']+)':\s*\[([^\]]*)\]/g)) {
    const group = m[1];
    for (const w of [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1])) {
      const row = rows.get(w);
      if (!row) throw new Error(`回归清单里的 ${w} 不在裁定表里 —— 先补裁定,别让它悬空`);
      row.regression_group = group;
    }
  }
  return [...rows.values()];
}

// ---------- 4. 补丁表 ----------
function readPatches() {
  const p = require('./patches');
  const ids = new Set([...Object.keys(p.phonetics || {}), ...Object.keys(p.examples || {})]);
  return [...ids].map((id) => {
    const ex = (p.examples || {})[id] || {};
    return {
      word_id: id,
      phonetic: (p.phonetics || {})[id] || null,
      example_en: ex.en || null,
      example_zh: ex.zh || null,
    };
  });
}

// ---------- 4b. 单字母前缀白名单 ----------
// R6 的放行名单,今天只有 affix-e。同样从源码文本解析并自检 —— 写死的话,
// 日后规则一改,库里就留着一份过期的放行名单,而且没有任何症状。
function readSingleLetterAllow() {
  const src = fs.readFileSync(path.join(REPO, 'server/scripts/generate-cet4.js'), 'utf8');
  const m = src.match(/const SINGLE_LETTER_PREFIX_ALLOW = new Set\(\[([^\]]*)\]\)/);
  if (!m) throw new Error('找不到 SINGLE_LETTER_PREFIX_ALLOW');
  const ids = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  const live = require(path.join(REPO, 'server/scripts/generate-cet4.js')).SINGLE_LETTER_PREFIX_ALLOW;
  const parsed = new Set(ids);
  const extra = [...parsed].filter((i) => !live.has(i));
  const miss = [...live].filter((i) => !parsed.has(i));
  if (extra.length || miss.length) {
    throw new Error(`SINGLE_LETTER_PREFIX_ALLOW 解析与源码不一致 —— 多:${extra.join(',') || '无'} 少:${miss.join(',') || '无'}`);
  }
  console.log(`  ✓ SINGLE_LETTER_PREFIX_ALLOW 解析与源码一致(${live.size} 条)`);
  return ids;
}

// ---------- 5. 语料 ----------
// 原样存档**每一行**(JSONL),不做 headWord 去重、不套 /^[a-z]+$/ 与 EXCLUDE 过滤 ——
// 那些是第 1 段的读入口径(见 generate-cet4.js 的 loadRaw),属于代码,不是数据。
// 存档只要做到「拿它重跑第 1 段,结果一字不差」,所以必须存得比消费端更宽。
// 主键用「文件#行号」而不是 headWord:同一词条在多个分册里重复出现是常态,
// 按词去重就永久丢掉了另一半,而 loadRaw 的择优规则没准哪天会改。
function readCorpus() {
  const dir = path.join(REPO, 'server/data/raw-cet4');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const out = [];
  for (const f of files) {
    const src = f.replace(/\.json$/, '');
    const lines = fs.readFileSync(path.join(dir, f), 'utf8').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      let raw;
      try { raw = JSON.parse(line); } catch { continue; } // loadRaw 也是直接 continue
      const word = String(raw.headWord || '').toLowerCase().trim();
      if (!word) continue;
      out.push({ id: src + '#' + i, word, source: src, raw });
    }
  }
  return out;
}

function main() {
  const out = arg('--out', 'D:\\rootmap-backup\\bootstrap');
  fs.mkdirSync(out, { recursive: true });

  console.log('读取手写层…');
  const hand = readHand();
  console.log('  交付集 roots=' + hand.delivered.roots.length
    + ' affixes=' + hand.delivered.affixes.length
    + ' words=' + hand.delivered.words.length);
  console.log('  其中手写 roots=' + hand.handRootIds.length
    + ' affixes=' + hand.handAffixIds.length
    + ' words=' + hand.handWordIds.length);
  console.log('  生成层 roots=' + hand.genIds.roots.length
    + ' affixes=' + hand.genIds.affixes.length
    + ' words=' + (hand.delivered.words.length - hand.handWordIds.length));

  console.log('读取词典层(执行 morphology.js 本体)…');
  const morph = readMorphology(hand);
  console.log('  extraRoots=' + morph.extraRoots.length + ' extraAffixes=' + morph.extraAffixes.length
    + ' variantExtras=' + Object.keys(morph.baseVariantExtras).length);
  const affixMergeInto = readAffixMergeInto(morph, hand._raw.affixes);
  console.log('  merge_into=' + JSON.stringify(affixMergeInto));

  console.log('解析裁定表…');
  const verdicts = readVerdicts();
  const byVerdict = verdicts.reduce((o, v) => { o[v.verdict] = (o[v.verdict] || 0) + 1; return o; }, {});
  console.log('  reject=' + (byVerdict.reject || 0) + ' exclude=' + (byVerdict.exclude || 0)
    + ' 带回归标签=' + verdicts.filter((v) => v.regression_group).length);

  // 自检:解析出来的集合必须与模块里那个 Set **一字不差**。
  // 解析源码文本是有风险的(注释里也会出现引号),所以不能只看数量对不对 —— 要比集合。
  {
    const live = require(path.join(REPO, 'server/scripts/generate-cet4.js'));
    for (const [name, set, verdict] of [['NO_DECOMPOSE', live.NO_DECOMPOSE, 'reject'], ['EXCLUDE', live.EXCLUDE, 'exclude']]) {
      const parsed = new Set(verdicts.filter((v) => v.verdict === verdict).map((v) => v.word));
      const extra = [...parsed].filter((w) => !set.has(w));
      const miss = [...set].filter((w) => !parsed.has(w));
      if (extra.length || miss.length) {
        throw new Error(`${name} 解析结果与源码不一致 —— 多:${extra.join(',') || '无'} 少:${miss.join(',') || '无'}`);
      }
      console.log(`  ✓ ${name} 解析与源码一致(${set.size} 条)`);
    }
  }

  console.log('读取单字母前缀白名单…');
  const allowSingleLetter = readSingleLetterAllow();

  console.log('读取补丁表…');
  const patches = readPatches();
  console.log('  patches=' + patches.length);

  console.log('读取语料…');
  const corpus = readCorpus();
  console.log('  corpus=' + corpus.length);

  const bundle = {
    generated_at: new Date().toISOString(),
    source: 'repo files @ pre-DB-migration',
    // 交付集整份:行值以它为准(合并结果本身,不再推导一遍)。
    delivered: hand.delivered,
    // origin 归属:靠 id 集合,不靠文件名。
    origin: {
      handRootIds: hand.handRootIds,
      handAffixIds: hand.handAffixIds,
      handWordIds: hand.handWordIds,
    },
    hand: {
      // 手写层的原值(合并前)。index.js 的 AFFIX_OVERRIDE 只对 affix-in 覆盖了 zh/note/group,
      // 覆盖前后的两份值都必须留档 —— 交付集里只剩覆盖后的,「合并改过什么」事后无从验证。
      rawRoots: hand.rawHand.roots,
      rawAffixes: hand.rawHand.affixes,
    },
    dict: {
      roots: morph.extraRoots,
      affixes: morph.extraAffixes,
      variantExtras: morph.baseVariantExtras,
      affixMergeInto,
      allowSingleLetter,
    },
    verdicts,
    patches,
    corpus,
  };
  const file = path.join(out, 'content-bundle.json');
  fs.writeFileSync(file, JSON.stringify(bundle));
  const mb = (fs.statSync(file).size / 1048576).toFixed(1);
  console.log('\n✅ 已写出 ' + file + '(' + mb + ' MB)');
}

main();
