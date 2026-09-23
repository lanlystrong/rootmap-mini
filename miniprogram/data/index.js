// miniprogram/data/index.js —— 交付数据集入口(手写精选层 + 生成层)
// ⚠ 本文件由 server/scripts/generate-content.js 生成,请勿手改。
//   手写内容改 roots.js / affixes.js / families/family-*.js;
//   生成内容改 server/scripts/generate-content.js 后重跑。
const handRoots = require('./roots');
const handAffixes = require('./affixes');
const gen = require('./generated');
const familySpect = require('./families/family-spect');
const familyVis = require('./families/family-vis');
const familyDict = require('./families/family-dict');
const familyScrib = require('./families/family-scrib');
const familyPort = require('./families/family-port');
const familyDuc = require('./families/family-duc');
const familyMit = require('./families/family-mit');
const familyStruct = require('./families/family-struct');
const familyTract = require('./families/family-tract');
const familyVert = require('./families/family-vert');
const familyForm = require('./families/family-form');
const familyPress = require('./families/family-press');
const familyGrad = require('./families/family-grad');
const familyCed = require('./families/family-ced');
const familyPend = require('./families/family-pend');
const familyPos = require('./families/family-pos');
const familyTend = require('./families/family-tend');
const familyCept = require('./families/family-cept');
const familyVen = require('./families/family-ven');
const familyPel = require('./families/family-pel');
const familyVal = require('./families/family-val');
const familyPhon = require('./families/family-phon');
const familyGraph = require('./families/family-graph');
const familyLog = require('./families/family-log');
const familyLuc = require('./families/family-luc');
const familyMan = require('./families/family-man');
const familyMob = require('./families/family-mob');
const familyNov = require('./families/family-nov');
const familyNorm = require('./families/family-norm');
const familyNumer = require('./families/family-numer');

// 词根:手写字段全胜,variants 取并集 —— 生成词的根段可能落在手写 variants 之外
// (实测 41 例:visor/view/vide(vis)、cap/capt(cept)、pose/posit(pos)…)。
const genRootById = new Map(gen.roots.map((r) => [r.id, r]));
const handRootIds = new Set(handRoots.map((r) => r.id));
const roots = handRoots.map((h) => {
  const g = genRootById.get(h.id);
  if (!g) return h;
  const seen = new Set((h.variants || []).map((v) => String(v).toLowerCase()));
  const extra = (g.variants || []).filter((v) => !seen.has(String(v).toLowerCase()));
  return extra.length ? Object.assign({}, h, { variants: h.variants.concat(extra) }) : h;
}).concat(gen.roots.filter((g) => !handRootIds.has(g.id)));

// 词缀:手写字段全胜,唯一例外 affix-in(合并版 note 是手写版的超集,覆盖 in- 的两义)。
const AFFIX_OVERRIDE = { 'affix-in': ['zh', 'note', 'group'] };
const genAffixById = new Map(gen.affixes.map((a) => [a.id, a]));
const handAffixIds = new Set(handAffixes.map((a) => a.id));
const affixes = handAffixes.map((h) => {
  const g = genAffixById.get(h.id);
  const keys = AFFIX_OVERRIDE[h.id];
  if (!g || !keys) return h;
  const out = Object.assign({}, h);
  keys.forEach((k) => { if (g[k] != null) out[k] = g[k]; });
  return out;
}).concat(gen.affixes.filter((a) => !handAffixIds.has(a.id)));

// 单词:手写优先整条覆盖(37 个重叠词的拆解与生成不同),再按词根顺序展平。
const handFamilies = [
  familySpect,
  familyVis,
  familyDict,
  familyScrib,
  familyPort,
  familyDuc,
  familyMit,
  familyStruct,
  familyTract,
  familyVert,
  familyForm,
  familyPress,
  familyGrad,
  familyCed,
  familyPend,
  familyPos,
  familyTend,
  familyCept,
  familyVen,
  familyPel,
  familyVal,
  familyPhon,
  familyGraph,
  familyLog,
  familyLuc,
  familyMan,
  familyMob,
  familyNov,
  familyNorm,
  familyNumer,
];
const rootById = new Map(roots.map((r) => [r.id, r]));
const groups = new Map();
const seen = new Set();
function add(w) {
  if (seen.has(w.id)) return;
  seen.add(w.id);
  const seg = (w.breakdown || []).find((b) => b.type === 'root');
  const rid = seg && seg.refId;
  // 根段解析不到就抛错,绝不静默丢词。丢弃会让数据集「看起来仍然自洽」——
  // 校验看到的是一个更小但合规的集合,于是坏数据照样入库;而用户本地的 SRS 进度
  // 按 wordId 索引,少一个词就多一份孤儿进度。宁可加载即失败。
  if (!rid || !rootById.has(rid)) {
    throw new Error('内容数据损坏:' + w.id + ' 的词根段 ' + rid + ' 不在 roots 中;请重跑 npm run generate:content');
  }
  if (!groups.has(rid)) groups.set(rid, []);
  groups.get(rid).push(w);
}
for (const fam of handFamilies) for (const w of fam) add(w);
for (const w of gen.words) add(w);
const words = [];
for (const r of roots) { const g = groups.get(r.id); if (g) words.push.apply(words, g); }

module.exports = { roots, affixes, words };
