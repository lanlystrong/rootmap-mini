// server/scripts/generate-content.js —— 第 2 段流水线:词根优先装配交付数据集
//
// 用法:
//   node server/scripts/generate-content.js           生成并写盘
//   node server/scripts/generate-content.js --check   只构建+校验+与磁盘逐字节比对,不写盘(CI/pre-commit)
//
// 输入(全部只读):
//   miniprogram/data/{roots.js, affixes.js, families/family-*.js}   手写精选层(morphology 的基底)
//   server/data/cet4/index.js                                      第 1 段产物(5554 词)
// 输出:
//   miniprogram/data/generated/{roots.js, affixes.js, index.js, family-*.js}   生成层
//   miniprogram/data/index.js                                                  交付集入口(合并两层)
//
// 为什么要做这个装配:第 1 段是「逐词猜拆解」(5554 词里只有 1316 词拆得动,其余 4238 词是
// 整词 none),交付集要的是**以词根为中心**的数据 —— 只收拆得动的词,按词根分族。
//
// 三条不可动摇的约束:
//   1. 生成器**只写** generated/ 与 index.js,**只读**手写层 —— 手写内容不可能被构建破坏。
//   2. 手写条目整条优先:37 个重叠词的手写拆解与产物不同(如 manufacture 手写归 root-man、
//      产物归 root-fac),必须整条覆盖,不能逐字段合并。
//   3. 词根 variants 必须取并集(见 mergeRoots 注释),否则 41 个生成词的根段会落在
//      variants 之外,校验红线 2 直接失败。
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { errorsFor } = require('../../scripts/validate-content');

const ROOT = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'miniprogram', 'data');
const GEN_DIR = path.join(DATA_DIR, 'generated');
const HAND_FAMILY_DIR = path.join(DATA_DIR, 'families');
const CET4_PATH = path.join(__dirname, '..', 'data', 'cet4', 'index.js');

// 包体硬门禁:主包上限 2 MB,数据超此值即 fail loud,禁止静默把包顶到上限。
const MAX_DATA_BYTES = 1_500_000;
const STORY_PREFIX = '构词:';
const GEN_HEADER = '// 由 server/scripts/generate-content.js 生成,请勿手改;手写内容见 ../roots.js ../affixes.js ../families/';

// 唯一一处手写字段覆盖(必须显式常量化 —— 见文件头约束 2 的例外说明)
const AFFIX_FIELD_OVERRIDES = { 'affix-in': ['zh', 'note', 'group'] };
const TYPE_LABEL = { prefix: '前缀', suffix: '后缀' };

// ---------- 输入 ----------

function loadHand() {
  const roots = require(path.join(DATA_DIR, 'roots.js'));
  const affixes = require(path.join(DATA_DIR, 'affixes.js'));
  const files = fs.readdirSync(HAND_FAMILY_DIR).filter((f) => /^family-.*\.js$/.test(f));
  const bySlug = new Map(files.map((f) => [f.replace(/^family-|\.js$/g, ''), f]));

  const families = [];
  const words = [];
  for (const r of roots) {
    const slug = r.id.replace(/^root-/, '');
    const f = bySlug.get(slug);
    if (!f) throw new Error(`手写层缺族文件: family-${slug}.js(词根 ${r.id} 无词)`);
    bySlug.delete(slug);
    const ws = require(path.join(HAND_FAMILY_DIR, f));
    // 族文件与其词根 id 必须一一对应 —— 否则下面的「按根分桶」会把手写词挪到别的族
    for (const w of ws) {
      const seg = (w.breakdown || []).find((b) => b.type === 'root');
      if (!seg || seg.refId !== r.id) {
        throw new Error(`手写层族文件与词根不符: ${w.id} 在 family-${slug}.js,但根段是 ${seg && seg.refId}`);
      }
    }
    families.push(ws);
    words.push(...ws);
  }
  if (bySlug.size) throw new Error('手写层有多余族文件(无对应词根): ' + [...bySlug.values()].join(', '));

  const rootById = new Map(roots.map((r) => [r.id, r]));
  return { roots, affixes, families, words, rootById };
}

function loadGen() {
  const d = require(CET4_PATH);
  return { roots: d.roots, affixes: d.affixes, words: d.words };
}

// ---------- 合并 ----------

// 词根:手写字段(id/root/zh/group/meaning/story)全胜,**variants 取并集**。
// 并集不是可选优化:产物在 32 组 (根,变体) 上比手写层多出变体(root-pos 需要
// pose/posit/pound、root-vis 需要 view/vide/vise/visor、root-cept 需要 cap/capt…),
// 若取手写 variants,41 个生成词的根段会落在 variants 之外 → 校验红线 2 失败。
function mergeRoots(handRoots, genRoots) {
  const genById = new Map(genRoots.map((r) => [r.id, r]));
  const handIds = new Set(handRoots.map((r) => r.id));
  const merged = handRoots.map((h) => {
    const g = genById.get(h.id);
    if (!g) return h;
    const seen = new Set((h.variants || []).map((v) => String(v).toLowerCase()));
    const extra = (g.variants || []).filter((v) => !seen.has(String(v).toLowerCase()));
    return extra.length ? { ...h, variants: [...h.variants, ...extra] } : h;
  });
  return merged.concat(genRoots.filter((g) => !handIds.has(g.id)));
}

// 词缀:手写字段全胜,唯一例外 affix-in —— 第 1 段把「向内/进入」与「不/非」合并成一条
// (morphology.js 的 MERGED_AFFIX_IN),其 note 是手写版的超集。若让手写版胜出,70 个
// 生成否定词(inadequate/incredible/insecure/innocent…)的 in- 段会指向只有方向义的词缀。
// affix-in-neg 保留在手写层(11 个手写词的 refId 指向它),不会因合并而悬空。
function mergeAffixes(handAffixes, genAffixes) {
  const genById = new Map(genAffixes.map((a) => [a.id, a]));
  const handIds = new Set(handAffixes.map((a) => a.id));
  const merged = handAffixes.map((h) => {
    const keys = AFFIX_FIELD_OVERRIDES[h.id];
    const g = genById.get(h.id);
    if (!keys || !g) return h;
    const out = { ...h };
    for (const k of keys) if (g[k] != null) out[k] = g[k];
    return out;
  });
  return merged.concat(genAffixes.filter((g) => !handIds.has(g.id)));
}

function isDecomposable(w) {
  return (w.breakdown || []).some((b) => b.type === 'root');
}

// 构词说明:只由**词典已有的段 zh** 与**词条自己的首义项**拼成,不含任何「源自拉丁语…」
// 式词源叙述 —— 语料里没有词源信息,编造词源正是上一轮花大力气清除的伪知识。
// 静音 e 之类 none 段不参与(显示成「e(—)」是噪声)。
function buildStory(word, root) {
  if ((word.assoc || {}).story || (root && root.story)) return null;
  const segs = (word.breakdown || []).filter((b) => b.type !== 'none');
  if (!segs.length) return null;
  const parts = segs.map((b) => `${b.part}(${b.zh || TYPE_LABEL[b.type] || b.type})`);
  const first = String(((word.senses || [])[0] || {}).zh || '').split(/[;；,，、]/)[0].trim();
  return STORY_PREFIX + parts.join(' + ') + (first ? ' → ' + first : '');
}

// 族内生成词排序:①高频优先 ②拆解段数少者优先(构词简单先学)③词短优先 ④字典序兜底。
// ④ 保证全序 —— 输出必须逐字节可复现。
function wordComparator(a, b) {
  const fa = (a.tags || []).includes('高频') ? 0 : 1;
  const fb = (b.tags || []).includes('高频') ? 0 : 1;
  if (fa !== fb) return fa - fb;
  const sa = (a.breakdown || []).filter((x) => x.type !== 'none').length;
  const sb = (b.breakdown || []).filter((x) => x.type !== 'none').length;
  if (sa !== sb) return sa - sb;
  if (a.word.length !== b.word.length) return a.word.length - b.word.length;
  return a.word.localeCompare(b.word);
}

// 纯函数:不碰文件系统(幂等性可测的前提)
function buildDataset(hand, gen) {
  const roots = mergeRoots(hand.roots, gen.roots);
  const affixes = mergeAffixes(hand.affixes, gen.affixes);
  const rootById = new Map(roots.map((r) => [r.id, r]));

  const handIds = new Set(hand.words.map((w) => w.id));
  const genWords = gen.words.filter((w) => isDecomposable(w) && !handIds.has(w.id));

  const groups = new Map(); // rootId -> Word[]
  const push = (w) => {
    const seg = (w.breakdown || []).find((b) => b.type === 'root');
    const rid = seg && seg.refId;
    if (!rid || !rootById.has(rid)) throw new Error(`词的根段无效: ${w.id} → ${rid}`);
    if (!groups.has(rid)) groups.set(rid, []);
    groups.get(rid).push(w);
  };

  // 手写词按 roots.js 序(即族文件序);生成词追加在同族手写词之后。
  // 排序只算一次并同时驱动「展平用的 groups」与「写族文件用的 genByRoot」—— 两处若各排各的,
  // 落盘族文件与内存结果顺序就会不一致(曾真实发生:self-check 抓到)。
  const genSorted = genWords.slice().sort(wordComparator);
  for (const fam of hand.families) for (const w of fam) push(w);
  let storyCount = 0;
  for (const w of genSorted) {
    const seg = w.breakdown.find((b) => b.type === 'root');
    const story = buildStory(w, rootById.get(seg.refId));
    if (story) {
      w.assoc = { ...(w.assoc || {}), story };
      storyCount++;
    }
    push(w);
  }

  // 按交付词根顺序展平 —— 数组序即族内学习顺序
  const words = [];
  const genByRoot = new Map();
  for (const r of roots) {
    const g = groups.get(r.id);
    if (g) words.push(...g);
  }
  for (const w of genSorted) {
    const rid = w.breakdown.find((b) => b.type === 'root').refId;
    if (!genByRoot.has(rid)) genByRoot.set(rid, []);
    genByRoot.get(rid).push(w);
  }

  return {
    roots,
    affixes,
    words,
    genWords,
    genByRoot,
    handIds,
    stats: {
      handWords: hand.words.length,
      genWords: genWords.length,
      stories: storyCount,
      genFamilies: [...genByRoot.keys()].length,
    },
  };
}

// ---------- 校验(三道 pass,规则代码零改动) ----------

function validateOrThrow(hand, gen, built) {
  const errs = [];

  // Pass A —— 手写层自身契约
  const a = errorsFor({ roots: hand.roots, affixes: hand.affixes, words: hand.words });
  if (a.length) errs.push(['A 手写层', a]);

  // Pass B —— 生成器契约(产物层 + 复制后的生成侧切片两个时刻)
  const sliced = { roots: gen.roots, affixes: gen.affixes, words: built.genWords };
  const bOpts = { generated: true, unusedRootAllow: new Set(hand.roots.map((r) => r.id)) };
  const b1 = errorsFor({ roots: gen.roots, affixes: gen.affixes, words: gen.words }, bOpts);
  if (b1.length) errs.push(['B 产物层', b1]);
  const b2 = errorsFor(sliced, bOpts);
  if (b2.length) errs.push(['B 生成侧切片', b2]);

  // Pass C —— 交付集通用红线。**不带 generated**:交付集混入手写条目,而手写层刻意使用
  // 同化表面形(sup-/at-/ac-)并刻意保留 in- 的两条同形词缀,套用生成器契约会大面积误报。
  const c = errorsFor({ roots: built.roots, affixes: built.affixes, words: built.words });
  if (c.length) errs.push(['C 交付集', c]);

  if (errs.length) {
    console.error('✗ 校验失败,拒绝写盘:');
    for (const [name, list] of errs) {
      console.error(`  [${name}] ${list.length} 处`);
      list.slice(0, 30).forEach((e) => console.error('    ' + e));
    }
    process.exit(1);
  }
}

// ---------- 产出 ----------

function sha1(s) {
  return crypto.createHash('sha1').update(s).digest('hex');
}

function arrFile(header, name, items) {
  return header + '\nconst ' + name + ' = [\n' + items.map((x) => JSON.stringify(x) + ',').join('\n') + '\n];\nmodule.exports = ' + name + ';\n';
}

function emit(built, hand, gen) {
  const files = new Map(); // relPath(相对 miniprogram/data) -> content
  const header = GEN_HEADER + '\n// 输入指纹: 手写层 ' + sha1(JSON.stringify(hand.words)) + ' / 产物 ' + sha1(JSON.stringify(gen.words));

  // 根与词缀**全量**写入,不做「只写非重叠项」的瘦身。index.js 的合并要拿产物版本去查
  // 每一个手写条目(取 variants 并集、取 affix-in 的合并版 note),查不到就会静默退化成
  // 手写版本 —— 实测正是这个瘦身让 41 个词的根段落在 variants 之外、70 个否定词的 in-
  // 段指向只有方向义的词缀。重叠的 30 根 / 66 缀只多约 12 KB,换合并逻辑不依赖写入顺序。
  files.set('generated/roots.js', arrFile(header, 'roots', gen.roots));
  files.set('generated/affixes.js', arrFile(header, 'affixes', gen.affixes));

  // 生成族:只装生成词;根上没有生成词就不产文件
  const genSlugs = [];
  for (const r of built.roots) {
    const ws = built.genByRoot.get(r.id);
    if (!ws || !ws.length) continue;
    const slug = r.id.replace(/^root-/, '');
    genSlugs.push(slug);
    files.set('generated/family-' + slug + '.js', arrFile(header, 'words', ws));
  }

  // 生成层汇总
  const reqs = genSlugs.map((s) => "  require('./family-" + s + "'),").join('\n');
  files.set('generated/index.js', header
    + "\nconst roots = require('./roots');\nconst affixes = require('./affixes');\n"
    + 'const words = [\n' + reqs + '\n].reduce((a, b) => a.concat(b), []);\n\n'
    + 'module.exports = { roots, affixes, words };\n');

  // 交付集入口:合并两层
  const handReqs = hand.roots.map((r) => {
    const slug = r.id.replace(/^root-/, '');
    return "const family" + slug.replace(/(^|-)(\w)/g, (m, a, b) => b.toUpperCase()) + " = require('./families/family-" + slug + "');";
  }).join('\n');
  const handSpread = hand.roots.map((r) => {
    const slug = r.id.replace(/^root-/, '');
    return '  family' + slug.replace(/(^|-)(\w)/g, (m, a, b) => b.toUpperCase()) + ',';
  }).join('\n');

  files.set('index.js', [
    '// miniprogram/data/index.js —— 交付数据集入口(手写精选层 + 生成层)',
    '// ⚠ 本文件由 server/scripts/generate-content.js 生成,请勿手改。',
    '//   手写内容改 roots.js / affixes.js / families/family-*.js;',
    '//   生成内容改 server/scripts/generate-content.js 后重跑。',
    "const handRoots = require('./roots');",
    "const handAffixes = require('./affixes');",
    "const gen = require('./generated');",
    handReqs,
    '',
    '// 词根:手写字段全胜,variants 取并集 —— 生成词的根段可能落在手写 variants 之外',
    '// (实测 41 例:visor/view/vide(vis)、cap/capt(cept)、pose/posit(pos)…)。',
    'const genRootById = new Map(gen.roots.map((r) => [r.id, r]));',
    'const handRootIds = new Set(handRoots.map((r) => r.id));',
    'const roots = handRoots.map((h) => {',
    '  const g = genRootById.get(h.id);',
    '  if (!g) return h;',
    '  const seen = new Set((h.variants || []).map((v) => String(v).toLowerCase()));',
    '  const extra = (g.variants || []).filter((v) => !seen.has(String(v).toLowerCase()));',
    '  return extra.length ? Object.assign({}, h, { variants: h.variants.concat(extra) }) : h;',
    '}).concat(gen.roots.filter((g) => !handRootIds.has(g.id)));',
    '',
    '// 词缀:手写字段全胜,唯一例外 affix-in(合并版 note 是手写版的超集,覆盖 in- 的两义)。',
    "const AFFIX_OVERRIDE = { 'affix-in': ['zh', 'note', 'group'] };",
    'const genAffixById = new Map(gen.affixes.map((a) => [a.id, a]));',
    'const handAffixIds = new Set(handAffixes.map((a) => a.id));',
    'const affixes = handAffixes.map((h) => {',
    '  const g = genAffixById.get(h.id);',
    '  const keys = AFFIX_OVERRIDE[h.id];',
    '  if (!g || !keys) return h;',
    '  const out = Object.assign({}, h);',
    '  keys.forEach((k) => { if (g[k] != null) out[k] = g[k]; });',
    '  return out;',
    '}).concat(gen.affixes.filter((a) => !handAffixIds.has(a.id)));',
    '',
    '// 单词:手写优先整条覆盖(37 个重叠词的拆解与生成不同),再按词根顺序展平。',
    'const handFamilies = [',
    handSpread,
    '];',
    'const rootById = new Map(roots.map((r) => [r.id, r]));',
    'const groups = new Map();',
    'const seen = new Set();',
    'function add(w) {',
    '  if (seen.has(w.id)) return;',
    '  seen.add(w.id);',
    '  const seg = (w.breakdown || []).find((b) => b.type === \'root\');',
    '  const rid = seg && seg.refId;',
    '  // 根段解析不到就抛错,绝不静默丢词。丢弃会让数据集「看起来仍然自洽」——',
    '  // 校验看到的是一个更小但合规的集合,于是坏数据照样入库;而用户本地的 SRS 进度',
    '  // 按 wordId 索引,少一个词就多一份孤儿进度。宁可加载即失败。',
    '  if (!rid || !rootById.has(rid)) {',
    '    throw new Error(\'内容数据损坏:\' + w.id + \' 的词根段 \' + rid + \' 不在 roots 中;请重跑 npm run generate:content\');',
    '  }',
    '  if (!groups.has(rid)) groups.set(rid, []);',
    '  groups.get(rid).push(w);',
    '}',
    'for (const fam of handFamilies) for (const w of fam) add(w);',
    'for (const w of gen.words) add(w);',
    'const words = [];',
    'for (const r of roots) { const g = groups.get(r.id); if (g) words.push.apply(words, g); }',
    '',
    'module.exports = { roots, affixes, words };',
    '',
  ].join('\n'));

  return files;
}

// 交付集自检:require **落盘后的** index.js —— app 真正加载的那个入口 —— 并断言它与
// buildDataset 的内存结果逐字节一致。
//
// 为什么必须有这一步:合并逻辑存在两份实现(本文件的 mergeRoots/mergeAffixes,与写进
// index.js 的运行时合并)。Pass C 只校验前者,后者在林运行时才生效,二者漂移时三道门禁
// 全是绿的。实测就发生过:generated/ 曾只写非重叠条目,index.js 查不到产物侧的 root-vis
// 与 affix-in,变体并集与 affix-in 覆盖双双静默失效 —— 41 个词的根段落在 variants 之外、
// 70 个否定词的 in- 段指向只有方向义的词缀,而校验全绿。
function verifyDelivery(built) {
  const idx = require(path.join(DATA_DIR, 'index.js'));
  const errs = [];
  for (const k of ['roots', 'affixes', 'words']) {
    const a = JSON.stringify(idx[k]);
    const b = JSON.stringify(built[k]);
    if (a !== b) errs.push(`${k}: 落盘 index.js 与内存构建结果不一致(长度 ${idx[k].length} vs ${built[k].length})`);
  }

  const rootById = new Map(idx.roots.map((r) => [r.id, r]));
  const affIds = new Set(idx.affixes.map((a) => a.id));
  const used = new Set();
  for (const w of idx.words) {
    const seg = w.breakdown.filter((b) => b.type === 'root');
    if (seg.length !== 1) { errs.push(`${w.id}: 根段 ${seg.length} 个(应为 1)`); continue; }
    const r = rootById.get(seg[0].refId);
    if (!r) { errs.push(`${w.id}: 根 ${seg[0].refId} 不存在`); continue; }
    used.add(r.id);
    const vs = (r.variants || []).map((v) => String(v).toLowerCase());
    if (!vs.includes(String(seg[0].part).toLowerCase())) errs.push(`${w.id}: 根段「${seg[0].part}」不在 ${r.id}.variants`);
    for (const b of w.breakdown) {
      if (b.type !== 'root' && b.refId && !affIds.has(b.refId)) errs.push(`${w.id}: 词缀 ${b.refId} 不存在`);
    }
  }
  for (const r of idx.roots) if (!used.has(r.id)) errs.push(`零命中词根 ${r.id}`);

  if (errs.length) {
    console.error(`✗ 交付集自检失败(${errs.length} 处),index.js 与生成器结果不一致:`);
    errs.slice(0, 20).forEach((e) => console.error('  ' + e));
    process.exit(1);
  }
}

// ---------- 主流程 ----------

function main() {
  const check = process.argv.includes('--check');
  const hand = loadHand();
  const gen = loadGen();
  const built = buildDataset(hand, gen);
  validateOrThrow(hand, gen, built);
  const files = emit(built, hand, gen);

  const budget = [...files.entries()].reduce((s, [p, c]) => s + Buffer.byteLength(c), 0);
  if (budget > MAX_DATA_BYTES) {
    console.error(`✗ 数据体积 ${budget} B 超上限 ${MAX_DATA_BYTES} B(小程序主包 2 MB)`);
    process.exit(1);
  }

  const drift = [];
  for (const [rel, content] of files) {
    const abs = path.join(DATA_DIR, rel);
    let cur = null;
    try { cur = fs.readFileSync(abs, 'utf8'); } catch { /* 缺失 */ }
    if (cur !== content) drift.push(rel);
  }
  const existing = fs.existsSync(GEN_DIR) ? fs.readdirSync(GEN_DIR).filter((f) => /^family-.*\.js$/.test(f)) : [];
  for (const f of existing) if (!files.has('generated/' + f)) drift.push('generated/' + f + ' (多余)');

  if (check) {
    if (drift.length) {
      console.error(`✗ 交付集与生成结果不一致(${drift.length} 个文件):`);
      drift.slice(0, 20).forEach((f) => console.error('  ' + f));
      console.error('  请重跑 node server/scripts/generate-content.js');
      process.exit(1);
    }
    console.log('✓ --check 通过:磁盘交付集与生成结果逐字节一致');
    verifyDelivery(built);
    return;
  }

  fs.mkdirSync(GEN_DIR, { recursive: true });
  for (const [rel, content] of files) fs.writeFileSync(path.join(DATA_DIR, rel), content, 'utf8');
  // 清掉本次未产出的生成族(整目录是生成物,安全)
  for (const f of existing) if (!files.has('generated/' + f)) fs.unlinkSync(path.join(GEN_DIR, f));
  verifyDelivery(built);

  const s = built.stats;
  console.log('📚 交付数据集生成完成(词根优先装配)');
  console.log(`   词根 roots:            ${built.roots.length}(手写 ${hand.roots.length} + 生成 ${built.roots.length - hand.roots.length})`);
  console.log(`   词缀 affixes:          ${built.affixes.length}(手写 ${hand.affixes.length} + 生成 ${built.affixes.length - hand.affixes.length})`);
  console.log(`   单词 words:            ${built.words.length}(手写 ${s.handWords} + 生成 ${s.genWords})`);
  console.log(`   生成族文件:            ${s.genFamilies}`);
  console.log(`   构词说明 assoc.story:  ${s.stories}`);
  console.log(`   数据体积:              ${budget} B / 上限 ${MAX_DATA_BYTES} B`);
  if (drift.length) console.log(`   (本次改写了 ${drift.length} 个文件)`);
}

if (require.main === module) main();

module.exports = { loadHand, loadGen, mergeRoots, mergeAffixes, isDecomposable, buildStory, wordComparator, buildDataset, validateOrThrow, emit, verifyDelivery };
