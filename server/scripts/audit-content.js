// server/scripts/audit-content.js —— 内容质检(词根/词缀/单词/例句/拆解)
//
// 用法:
//   node server/scripts/audit-content.js                            审计交付集(miniprogram/data)
//   node server/scripts/audit-content.js server/data/cet4/index.js  审计第 1 段产物(生成侧)
//
// 只读,不改任何数据。产出结构化问题清单供人工裁定;MUST_BE_ZERO 非零即退出码 1。
const path = require('path');
// 审计目标永远是「即将发布出去的那份数据」,故默认交付集而非中间产物。
// 交付集是手写精选层 + 生成层的合并,两部分都要过同一组硬红线才允许灌库。
//
// --generated:目标直接是第 1 段产物(生成侧)。同时启用「生成器契约」的严格面
// (见下方 RELAXED_ON_DELIVERY),与 scripts/validate-content.js 的 opts.generated 同义。
// --allow-unused-root=id1,id2:放行指定零命中词根。root-luc 在 CET4 语料里零命中 ——
// 它靠手写层的 lucid/illuminate/translucent/luminous 存活,审计产物时需显式放行。
const argv = process.argv.slice(2);
const GENERATED = argv.includes('--generated');
const allowArg = argv.find(a => a.startsWith('--allow-unused-root='));
const ALLOW_UNUSED = new Set(
  allowArg ? allowArg.split('=')[1].split(',').map(s => s.trim()).filter(Boolean) : []
);
const positional = argv.filter(a => !a.startsWith('--'));
const TARGET = positional.length
  ? path.resolve(positional[0])
  : path.join(__dirname, '..', '..', 'miniprogram', 'data', 'index.js');
const data = require(TARGET);

const { roots, affixes, words } = data;
const rootById = new Map(roots.map(r => [r.id, r]));
const affixById = new Map(affixes.map(a => [a.id, a]));
const wordSet = new Set(words.map(w => w.id));

const report = {};
const add = (k, v) => { (report[k] = report[k] || []).push(v); };

// ---------- 1. 词根/词缀词典自身卫生 ----------
// 1a. 变体冲突:同一字符串映射到多个词根(生成器 first-wins,后面的词根永远匹配不到)
const variantOwner = new Map();
for (const r of roots) {
  for (const v of (r.variants || [])) {
    const k = v.toLowerCase();
    if (!variantOwner.has(k)) variantOwner.set(k, []);
    variantOwner.get(k).push(r.id);
  }
}
for (const [v, ids] of variantOwner) {
  if (ids.length > 1) add('变体冲突(root)', `${v} → ${ids.join(' | ')}`);
}
// 1b. 词缀文本重复
const affixText = new Map();
for (const a of affixes) {
  const t = String(a.text || '').replace(/-/g, '').toLowerCase();
  const key = `${a.type}:${t}`;
  if (affixText.has(key)) add('词缀重复', `${key}: ${affixText.get(key)} | ${a.id}`);
  else affixText.set(key, a.id);
}
// 1c. 词根 id/root 一致性
// 注意:`root` 是词根的**显示名/词源标签**,不是匹配键——匹配只用 variants
// (如 root-sum 的显示名是 sum,匹配形式是 sume/sumpt)。故 base∉variants 不是缺陷,
// 仅作提示列出,便于人工确认该显示名确实是有意为之。
for (const r of roots) {
  if (!r.id || !r.root) add('词根缺字段', JSON.stringify(r));
  if (!(r.variants || []).length) add('词根无可匹配变体', r.id);
  if (!(r.variants || []).map(s => s.toLowerCase()).includes(String(r.root).toLowerCase()))
    add('提示:词根显示名非匹配变体', `${r.id} root=${r.root} variants=${(r.variants || []).join(',')}`);
}

// ---------- 2. 逐词结构 + 拆解不变量 ----------
const usedRoot = new Map(); // rootId -> [word]
const usedAffix = new Map();
let noneCount = 0;

for (const w of words) {
  const id = w.id;
  if (w.word !== id) add('id≠word', `${id} vs ${w.word}`);
  if (!w.phonetic) add('缺音标', id);
  if (!w.senses || !w.senses.length) add('缺释义', id);
  for (const s of (w.senses || [])) if (!s.zh) add('释义空 zh', id);
  if (!w.examples || !w.examples.length) add('缺例句', id);
  for (const e of (w.examples || [])) {
    if (!e.en || !e.en.trim()) add('例句空 en', id);
    if (!e.zh || !e.zh.trim()) add('例句空 zh', id);
  }
  if (!w.breakdown || !w.breakdown.length) { add('缺拆解', id); continue; }

  // 拼接回原词
  const joined = w.breakdown.map(b => b.part).join('').toLowerCase();
  if (joined !== id.toLowerCase()) add('拼接≠原词', `${id} → ${joined}`);

  const rootParts = w.breakdown.filter(b => b.type === 'root');
  if (rootParts.length > 1) add('多词根段', `${id} → ${w.breakdown.map(b => b.part).join('+')}`);

  for (const b of w.breakdown) {
    if (b.type === 'none') { noneCount++; continue; }
    if (b.type === 'root') {
      const r = rootById.get(b.refId);
      if (!r) { add('词根 refId 悬空', `${id} → ${b.refId}`); continue; }
      usedRoot.set(r.id, [...(usedRoot.get(r.id) || []), id]);
      const vs = (r.variants || []).map(s => s.toLowerCase());
      if (!vs.includes(b.part.toLowerCase())) add('词根段∉variants', `${id}: ${b.part} ∉ ${r.id}(${vs.join(',')})`);
    } else {
      const a = affixById.get(b.refId);
      if (!a) { add('词缀 refId 悬空', `${id} → ${b.refId}`); continue; }
      usedAffix.set(a.id, [...(usedAffix.get(a.id) || []), id]);
      if (a.type !== b.type) add('词缀 type 不符', `${id}: ${b.part} 标 ${b.type} 实为 ${a.type}`);
      const t = String(a.text || '').replace(/-/g, '').toLowerCase();
      if (t !== b.part.toLowerCase()) add('词缀段≠affix.text', `${id}: ${b.part} ≠ ${a.text}(${a.id})`);
    }
  }
}

// ---------- 3. 拆解形态抽样 ----------
// 这里曾经分层为「A.高置信误拆 / B.待复核」,但收紧 R3–R6 之后这两层已经不再有信号:
// 单字母词缀段与前缀叠用只会由**映射到真实词典条目**的合法段产生(e+mit、ad+visor+y、
// mis+under+stand、in+dis+pens+able 全部正确)。机器启发式判不出「语义是否牵强」这一层,
// 而真正的伪词源(many←man、cup←cept、easter←aster)已由结构性规则 + NO_DECOMPOSE 清除。
// 因此这里不再输出缺陷清单,只列**确定名单**供人工抽样核对词源。
// IPA 白名单:基本拉丁字母 + IPA 扩展字母(含 ʳ 等附加符号)+ 重音符号 + 常见标点。
// 不在此列的一律可能是源数据噪声(方括号、中文分号、智能引号、希腊字母 ε 等)。
const IPA_OK = /^[a-z'’ˈˌːæɑɒɔəɜɛɪʊʌθðʃʒŋɚɝɹɡʤʧʳʰʷʲˑɐʉɨɣχʁɲʎʼ\s,;:/\-()]+$/i;
for (const w of words) {
  const id = w.id;
  const bd = w.breakdown || [];
  if (bd.length === 1 && bd[0].type === 'none') continue;
  const rootPart = bd.find(b => b.type === 'root');
  const pre = bd.filter(b => b.type === 'prefix');
  const suf = bd.filter(b => b.type === 'suffix');

  // 形态标记:只用于抽样排序,不代表缺陷
  const marks = [];
  if (pre.some(b => b.part.length === 1)) marks.push('单字母前缀');
  if (suf.some(b => b.part.length === 1)) marks.push('单字母后缀');
  if (pre.length >= 2) marks.push(`前缀x${pre.length}`);
  if (rootPart && rootPart.part.length <= 2) marks.push(`词根2字母(${rootPart.part})`);
  else if (rootPart && rootPart.part.length === 3 && id.length >= 8) marks.push(`长词短根(${rootPart.part})`);
  if (!marks.length) continue;

  const line = `${id.padEnd(16)} ${bd.map(b => b.part).join('+').padEnd(26)} ${rootPart ? '【' + rootPart.zh + '】' : ''}`;
  add('待抽样复核拆解(非缺陷清单)', `${line} [${marks.join(',')}]`);
}

// ---------- 4. 词根/词缀覆盖率 ----------
// 审计目标现在是单一数据集(交付集),「零命中」不再有跨数据集误报问题:
// 交付集里每个词根都至少被 1 个词命中(这是生成期的硬门禁),命中 0 就是真死条目。
for (const r of roots) {
  if (usedRoot.has(r.id) || ALLOW_UNUSED.has(r.id)) continue;
  add('零命中词根', `${r.id} (${r.root} / ${(r.variants || []).join(',')})`);
}
if (ALLOW_UNUSED.size) add('提示:已放行的零命中词根', [...ALLOW_UNUSED].join(', '));
for (const a of affixes) if (!usedAffix.has(a.id)) add('零命中词缀', `${a.id} (${a.text})`);

// ---------- 5. 例句质量 ----------
const exen = new Map();
for (const w of words) {
  for (const e of (w.examples || [])) {
    if (!e.en) continue;
    const key = e.en.toLowerCase().trim();
    if (exen.has(key)) add('例句跨词重复', `${w.id} ↔ ${exen.get(key)}: ${e.en.slice(0, 60)}`);
    else exen.set(key, w.id);

    if (/<[a-z/]/i.test(e.en)) add('例句残留HTML', `${w.id}: ${e.en.slice(0, 60)}`);
    if (/[<>[\]{}]/.test(e.en)) add('例句异常符号', `${w.id}: ${e.en.slice(0, 60)}`);
    // 例句是否真含该词。不规则变形(stole/steal、undertook/undertake、misled/mislead)与
    // 派生词会让朴素的词干匹配产生大量误报,故放宽为「与词条共享任一 3 字子串」即算命中。
    // 这是低置信信号,只供人工抽查,不参与生成门禁。
    const low = e.en.toLowerCase();
    const grams = [];
    for (let i = 0; i + 3 <= w.id.length; i++) grams.push(w.id.slice(i, i + 3));
    if (!low.includes(w.id) && !grams.some(g => low.includes(g)))
      add('例句不含该词', `${w.id}: ${e.en.slice(0, 70)}`);
    // 源数据用 "(= …)" 表示释义改写,这类例句不是完整句,原样展示就是病句
    if (/\(=/.test(e.en)) add('例句为源数据片段', `${w.id}: ${e.en.slice(0, 70)}`);
    if (e.zh && !/[一-龥]/.test(e.zh)) add('例句译文无中文', `${w.id}: ${e.zh.slice(0, 40)}`);
  }
}

// ---------- 6. 音标 ----------
for (const w of words) {
  if (!w.phonetic) continue;
  if (!IPA_OK.test(w.phonetic)) add('音标可疑字符', `${w.id}: ${w.phonetic}`);
}

// ---------- 输出 ----------
const total = words.length;
console.log('══════════ 内容质检报告 ══════════');
console.log(`审计目标 ${TARGET}`);
console.log(`词根 ${roots.length} / 词缀 ${affixes.length} / 单词 ${total}`);
console.log(`可拆解(有真词根段) ${words.length - words.filter(w => (w.breakdown || []).every(b => b.type === 'none')).length}`);
console.log(`不可拆解(整词 none) ${words.filter(w => (w.breakdown || []).every(b => b.type === 'none')).length}`);
console.log('');
const order = Object.keys(report).sort((a, b) => report[b].length - report[a].length);
const VERBOSE = ['零命中词根', '零命中词缀', '例句跨词重复', '例句不含该词', '待抽样复核拆解(非缺陷清单)'];
for (const k of order) {
  console.log(`── ${k} (${report[k].length})`);
  const lim = VERBOSE.includes(k) ? 10 ** 9 : 25;
  report[k].slice(0, lim).forEach(x => console.log('   ' + x));
  if (report[k].length > lim) console.log(`   … 其余 ${report[k].length - lim} 条`);
  console.log('');
}

// ---------- 不变量判定(必须全部为 0) ----------
// 这些是「坏数据不许进库」的硬红线,也是 scripts/validate-content.js 语义规则的来源。
// 非零即退出码 1,可直接用作 CI/发布前门禁。
//
// RELAXED_ON_DELIVERY —— 只对**生成侧**成立的契约,审计交付集时降级为提示:
//   词缀段≠affix.text:手写层刻意用同化后的表面形做段文本(support 的段是 sup-、refId
//     指向 affix-sub;attract 的段是 at- → affix-ad;oppress 的段是 op- → affix-ob),
//     同化规则写在 affix 的 note 里。这是手写层的**设计**,不是缺陷 —— 实测 15 例
//     (sup/suc/sus→sub、at/ac/ag→ad、op→ob)全部是标准拉丁同化。
//   词缀重复:手写层刻意保留 in- 的两条同形词缀 —— 「向内/进入」与「不/非」分列,
//     段的 refId 各自指向对应那条(affix-in / affix-in-neg)。生成器的 first-wins 索引
//     容纳不下这种区分,故在产物里被 MERGED_AFFIX_IN 合并成一条。
// 审计产物时(--generated)这两条必须为 0 —— 生成器不允许出现同化段或同形词缀。
const RELAXED_ON_DELIVERY = new Set(['词缀重复', '词缀段≠affix.text']);
const MUST_BE_ZERO = [
  '变体冲突(root)', '词缀重复', '拼接≠原词', '多词根段',
  '词根 refId 悬空', '词缀 refId 悬空', '词根段∉variants', '词缀段≠affix.text',
  '词缀 type 不符', '缺音标', '缺释义', '缺例句', '例句空 en', '例句空 zh',
  '例句残留HTML', '例句异常符号', '例句为源数据片段', '例句译文无中文',
  '音标可疑字符', '零命中词根',
];
const ENFORCED = GENERATED ? MUST_BE_ZERO : MUST_BE_ZERO.filter(k => !RELAXED_ON_DELIVERY.has(k));
console.log('══════════ 不变量判定 ══════════');
for (const k of MUST_BE_ZERO) {
  const n = (report[k] || []).length;
  const relaxed = !GENERATED && RELAXED_ON_DELIVERY.has(k);
  console.log(`${n === 0 ? '✓' : relaxed ? '·' : '✗'} ${k}: ${n}${relaxed && n ? '(交付集放行,仅提示)' : ''}`);
}
const failed = ENFORCED.filter(k => (report[k] || []).length);
if (failed.length) {
  console.error(`\n✗ ${failed.length} 项不变量被破坏:${failed.join('、')}`);
  process.exit(1);
}
console.log('\n✓ 全部不变量通过');
