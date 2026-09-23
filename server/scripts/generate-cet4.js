// server/scripts/generate-cet4.js —— 第 1 段流水线:从 kajweb/dict 的 CET4 JSONL 生成全量内容
//
// 用法:
//   node server/scripts/generate-cet4.js
//
// 产出:
//   server/data/cet4/index.js  —— module.exports = {roots, affixes, words}(与 miniprogram/data/index 同构)
//   server/data/cet4/gaps.json —— 缺音标 / 缺例句 的词清单(供 P2 补齐后写回 patches)
//
// ⚠ 这只是流水线的**第 1 段**。它产出的是「逐词猜拆解」的全量语料(5554 词里 4238 词拆不动,
// 整词标记 none),不是交付给小程序的数据集。第 2 段 server/scripts/generate-content.js 把
// 这份产物**倒过来以词根为中心**重新装配(只收拆得动的词、按词根分族、与手写精选层合并),
// 才得到 miniprogram/data 的交付集。两段之间不能互相 require。
//
// 拆解算法:小写最长匹配。前缀(可回溯分词) + 词根变体 + 后缀(可回溯分词),
// 三者必须恰好拼回整词;拆不动的词标记为「不可拆解」(none 段),不伪造词根。
// 保证「拼接===词」,且每词至多 1 个真词根段。
const fs = require('fs');
const path = require('path');
const morph = require('../src/morphology');
const patches = require('./patches');
// 仅用于放行「零命中」的手写层词根(产物以手写层为基底,语料不一定命中它们),不参与拆解。
const baseRoots = require('../../miniprogram/data/roots');
const { errorsFor } = require('../../scripts/validate-content');

const RAW_DIR = path.join(__dirname, '..', 'data', 'raw-cet4');
const OUT_DIR = path.join(__dirname, '..', 'data', 'cet4');
const FILES = [
  // 四级(CET4)3 档 + 高中(GaoZhong)3 档:完整四级大纲 = 四级新增词 + 高中基础词。
  // 高中档补齐 run/university/telephone/the 等四级大纲内的基础词。
  'CET4_1.json', 'CET4_2.json', 'CET4_3.json',
  'GaoZhong_2.json', 'GaoZhong_3.json', 'GaoZhongluan_2.json',
];

// 高频阈值:wordRank 前 N 名标记为「高频」
const HIGH_FREQ_RANK = 1500;

// 数据源清理:剔除拼写错误、纯缩写、已淘汰/冗余的英式变体(标准写法均已在库中)。
const EXCLUDE = new Set([
  // 拼写错误(正确写法已存在)
  'reservior', // → reservoir
  'behavious', // → behaviour
  // 纯缩写(非独立词汇,不应作为四级大纲词条)
  'cd', 'dr', 'dvd', 'hur', 'pm', 'tv', 'un',
  // 已淘汰/冗余英式变体(标准写法已存在)
  'waggon', // → wagon
  'connexion', // → connection
  'whilst', // → while
  'gramme', // → gram
]);

// 同形异源词:字符串会误拆成某个真词根,但词源无关,应整词标记 none(而非错拆)。
// 黑名单比删词根更精确——既保住词根的正确拆解,又不让这些词被"碰巧"误拆。
const NO_DECOMPOSE = new Set([
  'forty',                 // ← fort(强),实为 four + ty
  'deliberate', 'deliberately', // ← liber(自由),实为 libra(天平)「权衡」
  'fuss', 'fussy',         // ← fus(倾倒),拟声词
  'accident', 'incident',  // ← cid(切),实为 cad(落)
  'acre',                  // ← cre(生长),实为 ager(田地)
  'abandon',               // ← don(给予),实为 à bandon(听任)
  'famine',                // ← fam(说),实为 fames(饥饿)
  'sister',                // ← sist(站),实为 swésōr(姐妹)

  // —— 结构规则(R3/R4/R5/R6)挡不住的语义伪拆:结构合法但词源无关,人工逐条裁定 ——
  // 短词根在无关词内部命中
  'many',                          // ← man(手),实为 manig
  'very',                          // ← ver(真),实为 verus 经古法语 verai
  'city',                          // ← cit(市民/城),与 civitas 派生关系牵强
  'tiny',                          // ← tin(持/握,←ten),实为 tyne
  'stay',                          // ← sta(站),实为 estai 经古法语
  'miss',                          // 整词,非 mis(送)+s
  'put',                           // 整词,古英语 putian,与 putare(思考)无关
  'seventy',                       // ← vent(来),实为 seven + ty
  // e- 前缀粘连残留字母(e 并非 ex- 的省音形)
  'even', 'evening',               // ← ven(来)
  'ever', 'every', 'everything',   // ← ver(真)
  'eleven', 'eleventh',            // ← lev(举起)
  'easter',                        // ← aster(星),实为 Eostre
  'economic', 'economical', 'economy', 'ecology', // ← eco(oikos 家)被拆成 e+co
  // 双前缀伪拆(第二段不是真前缀)
  'discover', 'discovery',         // dis + cover(覆盖),非 dis+co+ver
  'recover', 'recovery',           // re + cover
  'uncover',                       // un + cover
  'individual',                    // in + divid + ual
  'inevitable',                    // in + evit + able
  'impermanent', 'impermanency',   // ← man(手),实为 manere(停留)
  'represent', 'representative',   // re + present(present = pre+esse,非 sent 感觉)
  'combination',                   // ← bi(二)当词缀,实为 combinare
  'agreement', 'disagreement',     // agree + ment,非 ag+re+e
  'deeply',                        // deep + ly,非 de+e+ply
  // pos+s 拆错
  'possible', 'impossible', 'possession',

  // —— 「整词/派生词恰好撞上同形词根」:该词根真实存在,但这个词来自另一个同形词 ——
  // 触发条件是 R4 允许「整词即词根段」,于是日常词被安上了完全无关的词根义。
  'cord', 'cordless',              // ← cor(心),实为 chorda(绳)
  'leg',                           // ← lex(法律),实为古诺斯语 leggr(腿)
  'elegant',                       // ← leg(法律),实为 eligere(挑选)
  'liter',                         // ← littera(文字),实为 litra(容量单位)
  'log',                           // ← logos(说/学科),实为古诺斯语 lág(原木)
  'man', 'manly', 'postman', 'superman', // ← manus(手),实为 mann(人)
  'permanent',                     // ← man(手),实为 manere(停留)
  'path',                          // ← pathos(感受),实为古英语 pæþ(路)
  'passage', 'compass', 'surpass', // ← pati(忍受),实为 passus(步)
  'salt', 'salty',                 // ← salire(跳),实为 sal(盐)
  'ten', 'often',                  // ← tenere(持),实为 tīen(十)/of + tīen

  // —— 交付集里既有的伪拆解:本次扩词(R7/R8)之前必须先清掉 ——
  // 不清就会被 R8 的同根背书放大成一整族(consultancy/consultation 都会挂到 salt 下)。
  // 机制与上面完全一样:一个短而「滥交」的变体落在无关词内部。
  // 注:accurate 无法「改挂 root-cure」——变体 cur 已由 root-cur 声明,
  // 跨根共享变体会触发校验红线,且会让 curb/curve/curtain 变成新的误命中。故只能整词回退。
  'consult', 'consultant', 'consultation', 'consultancy', // ← sult(跳,salire),实为 con + sulere(商议)
  'consider', 'considerate', 'considering', 'considerable', 'considerably', 'consideration',
  // ↑ ← sid(坐,sedere),实为 com + sidus(观星)
  'besides',                       // ← sid(坐),实为古英语 be sīdan(在旁边)
  'accurate', 'accuracy', 'accurately', // ← cur(跑,currere),实为 accuratus ← cura(用心)
  'survey',                        // ← vey(运送,vehere),实为 super + videre(看)

  // ═══ 本次扩词(R7 有界残段 / R8 同根背书)的逐词审校结果 ═══
  // 362 个候选逐词过了一遍,否决 125 个(35%)。否决的机制高度一致:一个 3 字母的
  // 高频变体(sta / cou / mar / lig / tin / cit / lat …)落在**无关词的词干内部**,
  // 结构完全合法、词源完全无关。这正是「短变体滥交」——与上面黑名单同一个病根。
  // 根因在 server/src/morphology.js 的 extraRoots 变体表(如 root-cur 收了 'cou'),
  // 修变体表比堆黑名单更根治,但会波及全部 213 个根,留作后续单独处理。

  // —— 变体切进了词干内部:root 段不是该词真正的词根语素 ——
  'install', 'installation', 'installment', 'stale', // in+stall(畜栏/位置),真语素是 stall 不是 sta
  'account', 'count', 'counter', 'discount',   // ← cou(跑),实为 computare(计算)
  'cough',                                      // 拟声词
  'could',                                      // ← cou,实为古英语 cunnan
  'court',                                      // ← cou,实为 cohors(庭院)
  'curb', 'curl', 'curve', 'curse',             // ← cur(跑),实为 curvus(弯)/crispus/OE cursian
  'beancurd',                                   // curd 与 currere 无关
  'decade',                                     // ← cad(落),实为希腊 deka(十)
  'seminar',                                    // ← min(小),实为 semen(种子)
  'modem',                                      // mo(dulator)-dem(odulator) 缩合词
  'pop',                                        // popular 的缩略
  // —— 词源属于另一个(同形或近形)词根 ——
  'stack', 'staff', 'stain', 'stainless', 'stair', 'stake', 'stamp', 'stare', 'start',
  // ↑ 都是日耳曼语固有词(stakkr/stabaz/tingere/stǣger/staca/stamp-/star-/styrtan),与 stare 无关
  'find', 'finding',                            // ← fin(界限),实为古英语 findan
  'fight',                                      // ← fac(做),实为古英语 feohtan
  'march', 'mark', 'remark', 'remarkable',      // ← mar(海),实为 *mark-(边界)
  'marry', 'married', 'marriage',               // ← mar(海),实为 maritus(丈夫)
  'distinct', 'distinction', 'distinctive', 'distinguish', 'distinguished',
  // ↑ ← tin(持),实为 distinguere ← stinguere(刺)
  'tent',                                       // ← ten(持),实为 tendere(伸)/tentorium
  'cite', 'excite', 'excitement', 'recite',     // ← cit(市民),实为 ciere(召唤)
  'exciting',                                   // 同上(既有词)
  'equip', 'equipment',                         // ← equ(相等),实为古诺斯 skipa(装备)
  'unique',                                     // ← equ(相等),实为 unus(一)
  'delight', 'delighted', 'delightful', 'light', 'lighten', 'lightly',
  // ↑ ← lig(绑),实为 delectare(吸引)/古英语 lēoht(光)
  'diligent',                                   // ← lig(绑),实为 diligere ← legere(选)
  'advice', 'device',                           // ← vic(征服)/vis(看),实为 dividere(分)
  'province', 'vice',                           // ← vic(征服),实为 provincia / vitium
  'undivided', 'divide', 'division', 'subdivision', 'devise', // ← vis/vide(看),实为 dividere(分)
  'cream', 'creep',                             // ← cre(生长),实为 chrisma(膏油)/OE creopan
  'secret',                                     // ← cre(生长),实为 secernere(筛分)
  'interfere',                                  // ← fer(带),实为 ferire(打击)
  'late', 'lately', 'latin', 'later', 'latest', // ← lat(fer 的过去分词),实为 OE læt(迟)/Latium
  'pond',                                       // ← pon(放),实为 pondo(重量)
  'improve', 'improvement',                     // ← prob(证明),实为 prou(利益)← prodesse
  'attempt', 'tempt', 'temptation', 'tempting', 'contempt', 'temple',
  // ↑ ← temp(时间),实为 temptare(试)/templum(神庙)—— 与 tempus 无关
  'cash', 'cast', 'forecast',                   // ← cas(落),实为 capsa(箱)/古诺斯 kasta(投)
  'mind', 'mine', 'miner', 'mineral',           // ← min(小),实为 gemynd(思)/古法 mine(矿)
  'prominent',                                  // ← min(小),实为 prominere(突出)
  'place', 'replace', 'replacement',            // ← plac(愉悦),实为 platea(广场)
  'lock',                                       // ← loc(地方),实为古英语 loc(锁)
  'motto',                                      // ← mot(动),实为 muttum(咕哝)
  'senate', 'senator',                          // ← nat(出生),实为 senex(老人)
  'beside', 'inside', 'outside', 'side',        // ← sid(坐),实为古英语 sīde(边)
  'revenge', 'seventeen', 'seventh',            // ← ven(来),实为 vindicare / seven
  'invite', 'invitation',                       // ← vit(活),实为 invitare(来源不明)
  'polite',                                     // ← polit(城邦),实为 politus ← polire(打磨)
  'surgeon', 'surgery',                         // ← surg(升起),实为希腊 kheirourgia(手工)
  'vase', 'vast',                               // ← vas(走?)/vad,实为 vas(容器)/vastus(空旷)
  'forth',                                      // ← fort(强),实为古英语 forð(向前)
  'luck', 'lucky',                              // ← luc(光),实为中古荷兰 gheluc(运气)
  'mist',                                       // ← mit(送),实为古英语 mist(雾)
  'more', 'moreover',                           // ← mor(死),实为古英语 māra(更多)
  'tight', 'tighten',                           // ← tig(接触),实为古诺斯 þéttr(紧密)
  'severe',                                     // ← ver(真),实为 severus(严厉)
  'annoy',                                      // ← ann(年),实为 inodiare ← odium(恨)
  'eastern',                                    // ← aster(星),实为 east + ern
  'incentive',                                  // ← cent(百),实为 incinere ← canere(唱)
  'dock',                                       // ← doc(教),实为中古荷兰 dokke(船坞)
  'duck',                                       // ← duc(引导),实为古英语 duce(鸭)
  'insult',                                     // ← insul(岛),实为 insultare ← saltare(跳)
  'level',                                      // ← lev(举起),实为 libella(小天平)← libra
  'mute',                                       // ← mut(改变),实为 mutus(哑)
  'negro',                                      // ← neg(否定),实为 niger(黑)
  'numb',                                       // ← num(数),实为古英语 numen(麻木)
  'panda',                                      // 尼泊尔语动物名
  'voice',                                      // ← vect(运送),实为 vocem ← vocare(叫)
  // —— 既有交付集里的伪拆解(同批审校发现,原 10 条之外)——
  'accent', 'decent', 'recent', 'center',       // ← cent(百),实为 canere(唱)/decere/recens/centrum
  'accidental', 'coincidence', 'incidence',     // ← cid(切),实为 cadere(落)
  'dignity',                                    // ← gn(认识),实为 dignus(值得)
  'figure',                                     // ← fac(做),实为 fingere(塑造)
  'comedy', 'medal', 'medical', 'medication', 'medicine', 'remedy',
  // ↑ ← medi(中间),实为 komos(狂欢)/metallum(金属)/mederi(治疗)
  'miserable', 'missing',                       // ← mit(送),实为 miser(可怜)/古英语 missan
  'moral',                                      // ← mort(死),实为 mos/moris(习俗)
  'apple', 'multiple',                          // ← plen(满),实为 æppel / multiplex ← plicare(折)
  'absent', 'present', 'presentation', 'presently', // ← sent(感觉),实为 esse(是)
  'tiger',                                      // ← tang(接触),实为希腊 tigris
  'tentative',                                  // ← tend(伸),实为 tentare(试)
  'interval',                                   // ← val(价值),实为 intervallum ← vallum(栅栏)
  'seven',                                      // ← ven(来),实为古英语 seofon(七)
  'cover', 'forever', 'several',                // ← ver(真),实为 cooperire/for+ever/separalis
]);

// ---------- 词典索引 ----------
// 词根变体 → 词根(base 词根优先,extra 不覆盖)
const rootByVariant = new Map();
for (const r of morph.roots) {
  for (const v of r.variants || []) {
    const k = v.toLowerCase();
    if (!rootByVariant.has(k)) rootByVariant.set(k, r);
  }
}
const morphRootIds = new Set(morph.roots.map(r => r.id));
const rootById = new Map(morph.roots.map(r => [r.id, r]));

// 词缀 → 前缀/后缀(去掉连字符,小写)
const prefixes = [];
const suffixes = [];
for (const a of morph.affixes) {
  const t = String(a.text || '').replace(/-/g, '').toLowerCase();
  if (!t) continue;
  if (a.type === 'prefix') prefixes.push({ t, a });
  else if (a.type === 'suffix') suffixes.push({ t, a });
}
// 最长优先(回溯分词在词短时几乎线性,最长优先保证贪婪也正确)
prefixes.sort((x, y) => y.t.length - x.t.length);
suffixes.sort((x, y) => y.t.length - x.t.length);

// ---------- 分词(回溯 + memo) ----------
// items: {t, a};返回 [{part, affix}] 覆盖 s,或 null
function segment(s, items) {
  const memo = new Map();
  function rec(i) {
    if (i === s.length) return [];
    if (memo.has(i)) return memo.get(i);
    for (const it of items) {
      if (s.startsWith(it.t, i)) {
        const rest = rec(i + it.t.length);
        if (rest) {
          const res = [{ part: it.t, affix: it.a }, ...rest];
          memo.set(i, res);
          return res;
        }
      }
    }
    memo.set(i, null);
    return null;
  }
  return rec(0);
}

// ---------- 构词拆解(精度优先) ----------
// 语料固定(5554 个四级词),用「结构性规则 + NO_DECOMPOSE 黑名单」共同兜底。
// 原则:宁可整词标 none,也不产出伪词源——拆解段在前端可点击并跳转到词根页,
// 一个错误的词根会把用户引向完全错误的词族,比不给拆解伤害更大。
const MIN_ROOT_VARIANT = 3; // R3:2 字母变体(bi/it/ge)在无关词内部误命中率极高
const MAX_SINGLE_LETTER = 1; // R5:单字母词缀段至多 1 个(-y 合法;pos+s+es+s 不合法)
// R6:单字母前缀只放行 e-(ex- 的省音形,emit/erupt 等);a- 误命中太多(apartment/avail/age)。
const SINGLE_LETTER_PREFIX_ALLOW = new Set(['affix-e']);
// R7:词根段右侧残段的上限。残段短到这个程度,才允许整段吸收为 none 段。
// 取值依据是**实测的伪词源率**,不是拍脑袋:残段越长,越可能吃掉真正的词干字母。
// 审校实测(362 个候选逐词过):残段 ≥2 字母时约 2/3 是伪拆解(could/cash/cream/
// light/stake… 全是「短变体切进无关词干」),只有「静音 e」那支是真赢(~80% 正确)。
// 上限仍保留 2(而非 1),是因为 2 字母残段里的真例(stage/state 一类)可以由
// NO_DECOMPOSE 逐个兜住,反之收紧到 1 会一并丢掉这些真例。
const MAX_RESIDUE = 2;
// R8 残段上限。R8 的根归属由词典自己的「同根」声明背书,残段可以放开;
// 9 是实测同根背书候选的最大残段长度(仅作防御闸门,限制日后漂移)。
const MAX_REL_RESIDUE = 9;

// 后侧残段(suffix 侧)的装配计划。返回段数组(词缀段带 affix,吸收段不带),或 null。
//   1) 整个残段能拆成已知后缀        → 用拆解结果
//   2) 开头是 e、其后的部分能拆成后缀 → e 吸收为 none 段(静音 e,与手写层 revise→re+vis+e 同构)
//   3) 残段长度 ≤ limit              → 整段吸收为 none 段
// 注意 2) 不是「静音 e 并回词根」:词根段保持是 variants 里的原串,被吸收的只是词根**之后**的 e。
function tailPlan(s, limit) {
  const suffixSinglesOk = (segs) => segs.filter(p => p.part.length === 1).length <= MAX_SINGLE_LETTER;
  if (!s) return [];
  const direct = segment(s, suffixes);
  if (direct && suffixSinglesOk(direct)) return direct;
  if (s[0] === 'e') {
    const rest = segment(s.slice(1), suffixes);
    if (rest && suffixSinglesOk(rest)) return [{ part: 'e' }, ...rest];
  }
  if (s.length <= limit) return [{ part: s }];
  return null;
}

// 前缀侧残段:结构与 R7 之前一致(不吸收 —— 开头的残段会直接改变词根之前那截的观感)。
function prefixPlan(s) {
  if (!s) return [];
  const segs = segment(s, prefixes);
  if (segs === null) return null;
  const singles = segs.filter(p => p.part.length === 1);
  if (singles.length > MAX_SINGLE_LETTER) return null;
  if (singles.some(p => !SINGLE_LETTER_PREFIX_ALLOW.has(p.affix.id))) return null;
  return segs;
}

// 返回 breakdown(数组)或 null
function decompose(word) {
  const w = word.toLowerCase();
  const cands = [];
  for (const [variant, root] of rootByVariant) {
    if (variant.length < MIN_ROOT_VARIANT) continue; // R3
    let idx = w.indexOf(variant);
    while (idx !== -1) {
      cands.push({ variant, root, start: idx, end: idx + variant.length });
      idx = w.indexOf(variant, idx + 1);
    }
  }
  // 词根越长越优先,同长取更靠前(自然序)
  cands.sort((a, b) => (b.variant.length - a.variant.length) || (a.start - b.start));

  for (const c of cands) {
    // R4:整词即词根段时,变体必须就是该词根的 base 形式(cup≠cept、city≠civ,故不拆)
    if (c.start === 0 && c.end === w.length && c.variant !== String(c.root.root).toLowerCase()) continue;

    const preSeg = prefixPlan(w.slice(0, c.start));
    if (preSeg === null) continue;

    // R7:后侧残段允许有界吸收(见 tailPlan)
    const postPlan = tailPlan(w.slice(c.end), MAX_RESIDUE);
    if (postPlan === null) continue;

    return assemble(preSeg, { part: w.slice(c.start, c.end), root: c.root }, postPlan);
  }
  return null;
}

// 把三段计划拼成 breakdown。affix 为空的段是吸收段(none),不带 zh/refId。
function assemble(preSeg, rootSeg, postSeg) {
  const parts = [];
  for (const p of preSeg) {
    parts.push(p.affix
      ? { part: p.part, type: 'prefix', zh: p.affix.zh || null, refId: p.affix.id }
      : { part: p.part, type: 'none' });
  }
  parts.push({ part: rootSeg.part, type: 'root', zh: rootSeg.root.zh, refId: rootSeg.root.id });
  for (const p of postSeg) {
    parts.push(p.affix
      ? { part: p.part, type: 'suffix', zh: p.affix.zh || null, refId: p.affix.id }
      : { part: p.part, type: 'none' });
  }
  return parts;
}
// ---------- R8:词典同根背书 ----------
// 语料每个词条自带 relWord(desc 恒为「同根」),是词典自己对「哪些词同根」的声明。
// 用它给「含某个真词根变体、但按结构规则拆不动」的词定根:根归属来自同根声明而非
// 「词里含这个串」,因此残段可以整段吸收为 none(见 MAX_REL_RESIDUE)。
// 但背书并不充分 —— 词典把 consultancy 也列为 consult 的同根词。所以 R8 的产出
// 同样只是**候选**,要过 NO_DECOMPOSE 那道人审闸门。
const REL_CONFLICT = Symbol('rel-conflict');

function relWordsOf(c) {
  const rw = c.relWord;
  if (!rw || rw.desc !== '同根') return [];
  const out = [];
  for (const g of rw.rels || []) {
    for (const x of (g && g.words) || []) {
      const hwd = String(x.hwd || '').toLowerCase().trim();
      if (/^[a-z]+$/.test(hwd)) out.push(hwd);
    }
  }
  return out;
}

// 只在「词根变体最长匹配」这一点上和 decompose() 一致,其余全部放开为 none 吸收。
function decomposeByRel(word, root) {
  if (!root) return null;
  const w = String(word).toLowerCase();
  let best = null;
  for (const v of root.variants || []) {
    const t = String(v).toLowerCase();
    if (t.length < MIN_ROOT_VARIANT) continue;
    const i = w.indexOf(t);
    if (i === -1) continue;
    if (!best || t.length > best.t.length || (t.length === best.t.length && i < best.i)) best = { t, i };
  }
  if (!best) return null;
  if (w.slice(0, best.i).length > MAX_REL_RESIDUE) return null;
  if (w.slice(best.i + best.t.length).length > MAX_REL_RESIDUE) return null;

  const preSeg = prefixPlan(w.slice(0, best.i)) || [{ part: w.slice(0, best.i) }];
  const postSeg = tailPlan(w.slice(best.i + best.t.length), MAX_REL_RESIDUE);
  if (postSeg === null) return null;
  return assemble(preSeg, { part: best.t, root }, postSeg);
}

// 同根背书索引:候选词 → 词根 id(被两个以上词根声明时作废)。
function buildRelClaims(entries, rulesBd, opts = {}) {
  const skipBlacklist = opts.skipBlacklist !== false; // 默认跳过人审否决过的候选
  const corpusIds = new Set(entries.map(e => e.hw));
  const claims = new Map();
  for (const e of entries) {
    const bd = rulesBd.get(e.hw);
    if (!bd) continue;
    const rootSeg = bd.find(p => p.type === 'root');
    if (!rootSeg) continue;
    const root = rootById.get(rootSeg.refId);
    if (!root) continue;
    for (const x of relWordsOf(e.c)) {
      // 只收「语料里本来就有词条」(内容自足)且「现在拆不动」(不覆盖既有结果)的词
      if (x === e.hw || !corpusIds.has(x) || rulesBd.get(x)) continue;
      if (skipBlacklist && NO_DECOMPOSE.has(x)) continue;
      const prev = claims.get(x);
      if (prev === undefined) claims.set(x, root.id);
      else if (prev !== root.id) claims.set(x, REL_CONFLICT); // 归属有争议 → 作废
    }
  }
  return claims;
}

// 黑名单压力:NO_DECOMPOSE 里有多少条是「拆解规则本来会收下」的词。
//
// 这个数字就是人审的工作量,也是「黑名单到底有没有在承重」的度量。历史教训:扩词之前
// 68 条黑名单里 **0 条**是规则会收的词 —— 它当时纯属文档,一条都没在起作用,所以
// 「命中即回退」的写法看起来是防线,实际是空转。R7/R8 之后它成了全流水线最大的
// 正确性闸门。这个计数一旦变化就说明拆解规则被改过,必须重新逐词审校 ——
// dataset-merge.test.js 的 ⑩ 把它钉成了必须响的警报。
function blacklistPressure() {
  const entries = loadRaw();
  const rawBd = new Map();
  const rulesAccepted = [];
  for (const e of entries) {
    const bd = decompose(e.hw);
    rawBd.set(e.hw, bd);
    if (bd && NO_DECOMPOSE.has(e.hw)) rulesAccepted.push(e.hw);
  }
  // R8 侧要问的是「假如没有黑名单,它会不会被认领」,所以这里不跳黑名单
  const gated = new Map();
  for (const [id, bd] of rawBd) gated.set(id, bd && !NO_DECOMPOSE.has(id) ? bd : null);
  const claims = buildRelClaims(entries, gated, { skipBlacklist: false });
  const relClaimed = [];
  for (const id of NO_DECOMPOSE) {
    const c = claims.get(id);
    if (c && c !== REL_CONFLICT) relClaimed.push(id);
  }
  return {
    rulesAccepted: rulesAccepted.length, relClaimed: relClaimed.length,
    rulesAcceptedIds: rulesAccepted, relClaimedIds: relClaimed,
  };
}

// ---------- 数据读取 ----------
function stripTags(s) {
  return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// 源数据在句子里夹带两类「附带说明」,直接渲染就是病句:
//   "(= …)"  —— 给前面短语的释义改写,如 "altered beyond recognition (= changed very much)"
//   "[…]"    —— 同义替换/补充,如 "The hen sits in the hencoop [henroost]."
// 去掉后再清理标点前的悬挂空格。剩余部分过短(不足 4 词)的会在下游被丢弃。
function cleanExample(s) {
  return stripTags(s)
    .replace(/\(\s*=[^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/^[.,;:!?\s]+/, '') // 去掉说明后可能留下前导标点
    .trim();
}

function loadRaw() {
  const seen = new Map(); // headWord(lower) -> {hw, rank, content}
  for (const f of FILES) {
    const p = path.join(RAW_DIR, f);
    const text = fs.readFileSync(p, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim()) continue;
      let o;
      try { o = JSON.parse(line); } catch { continue; }
      const hw = (o.headWord || '').toLowerCase().trim();
      if (!/^[a-z]+$/.test(hw)) continue; // 跳过含连字符/空格/撇号等非纯字母条目
      if (EXCLUDE.has(hw)) continue; // 跳过需清理的词条(拼写错误/纯缩写/冗余变体)
      const c = (o.content && o.content.word && o.content.word.content) || {};
      const rank = Number(o.wordRank) || Number.MAX_SAFE_INTEGER;
      const cand = { hw, rank, c };
      const prev = seen.get(hw);
      if (!prev || entryScore(cand) > entryScore(prev)) seen.set(hw, cand);
    }
  }
  return [...seen.values()];
}

function entryScore(e) {
  const c = e.c;
  let s = 0;
  if (phoneticOf(c)) s += 1000;
  s += (c.trans || []).length * 10;
  s += (c.sentence && c.sentence.sentences ? c.sentence.sentences.length : 0);
  return s;
}

// 源词库的音标写法很杂:多读音用中文分号连接("ˈædvəkeɪt；-et")、方括号包裹("[ˈvɜ:rtʃuəl]")、
// 智能引号、"(for v.)" 之类注解、旧式长度符号 ":" 而非 IPA 的 "ː",还夹带零宽字符。
// 这里统一规范化,否则这些噪声会原样渲染给用户。
function normalizePhonetic(raw) {
  return String(raw || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // 零宽字符
    .replace(/[‘’‛′]/g, "'") // 智能单引号 → 音节重音符
    .replace(/[“”]/g, '"')
    .replace(/ε/g, 'ɛ') // 源数据混入希腊字母 ε,统一为 IPA 的 ɛ
    .replace(/[[\]]/g, '') // 包裹用的方括号
    .replace(/\([^)]*\)/g, ' ') // "(for v.)" 之类注解
    .replace(/:/g, 'ː') // 旧式长度符号 → IPA ː
    .replace(/\s+/g, ' ')
    .trim();
}

function phoneticOf(c) {
  const raw = (c.usphone || c.ukphone || c.phone || '').toString();
  // Youdao 用 "a; b" / "a, b" / "a；b" 分隔多个读音,且可能带前导逗号(如 ",ækə'demik")。
  // 取第一个非空变体。
  const parts = normalizePhonetic(raw).split(/[;,；，]/).map(s => s.trim()).filter(Boolean);
  return parts[0] || '';
}

// 源词库中少数条目的 sContent 不是句子而是结构化 JSON(如 {"GLOSS":[...],"COLLOINEXA":[...]}),
// stripTags() 只去 HTML 标签、认不出 JSON,会把裸 JSON 当成例句直接渲染给用户。
function isStructuredBlob(s) {
  const t = String(s || '').trim();
  return /^[{[]/.test(t) || /"(GLOSS|COLLOINEXA|EXAMPLE)"\s*:/.test(t);
}

// ---------- 主流程 ----------
function build() {
  const entries = loadRaw();

  const roots = morph.roots; // 仅真词根(含 base + extra),不再合成「整词当根」
  const words = [];
  const missingPhonetic = [];
  const missingExample = [];
  let realCount = 0;
  let noRootCount = 0;
  let rulesCount = 0; // 结构规则(R3–R7)拆出的
  let relCount = 0;   // R8 同根背书补出的

  // 拆解第一遍:结构性规则(R3–R7)。黑名单在此收口,于是被否掉的词既不会进产物,
  // 也不会作为 R8 的同根背书来源(consult 不能给 consultancy 背书)。
  const rulesBd = new Map();
  for (const e of entries) {
    const bd = decompose(e.hw);
    rulesBd.set(e.hw, bd && !NO_DECOMPOSE.has(e.hw) ? bd : null);
  }
  // 拆解第二遍:R8 词典同根背书,只补第一遍没拆出来的词
  const relClaims = buildRelClaims(entries, rulesBd);

  for (const e of entries) {
    const c = e.c;
    const id = e.hw;

    // 音标(缺失的用 patches 补齐)
    let phonetic = phoneticOf(c);
    if (!phonetic) phonetic = patches.phonetics[id] || '';
    if (!phonetic) missingPhonetic.push(id);

    // 释义
    const senses = (c.trans || [])
      .map(t => ({ pos: String(t.pos || '').trim(), zh: String(t.tranCn || '').trim(), en: null }))
      .filter(s => s.zh);

    // 例句(去 <b>、要求 en+zh 齐全,最多取 2 条;缺失的用 patches 补齐)
    const seenEx = new Set();
    let exs = (c.sentence && c.sentence.sentences ? c.sentence.sentences : [])
      .filter(s => s.sContent && s.sCn)
      .map(s => ({ en: cleanExample(s.sContent), zh: String(s.sCn).trim() }))
      .filter(e => !isStructuredBlob(e.en)) // 裸 JSON 不能当例句渲染,过滤后回落到 patches
      // 去掉附带说明后只剩标点/单词残渣的例句丢弃(如 "(= we have done what we intended to do ) .")
      // 注意:不能按「词数 ≥N」过滤——源数据里大量例句本就是短语("an empty bottle")。
      .filter(e => /[A-Za-z]/.test(e.en) && e.en.split(/\s+/).filter(Boolean).length >= 2)
      .filter(e => { // 同一个词的两条源例句可能一模一样,去重避免重复展示同一句
        const k = e.en.toLowerCase();
        if (!k || seenEx.has(k)) return false;
        seenEx.add(k);
        return true;
      })
      .slice(0, 2);
    if (exs.length === 0 && patches.examples[id]) exs = [patches.examples[id]];
    if (exs.length === 0) missingExample.push(id);

    // 标签
    const tags = ['cet4'];
    if (e.rank <= HIGH_FREQ_RANK) tags.push('高频');

    // 拆解:先看结构规则,再落到 R8 同根背书
    const byRel = relClaims.get(id);
    const byRules = rulesBd.get(id) || null;
    const byRelBd = byRules ? null
      : (byRel && byRel !== REL_CONFLICT ? decomposeByRel(id, rootById.get(byRel)) : null);
    let breakdown = byRules || byRelBd;
    if (breakdown) {
      realCount++;
      if (byRules) rulesCount++; else relCount++;
    } else {
      // 无真词根:整词标记为「不可拆解」段(none),不伪造词根
      noRootCount++;
      breakdown = [{ part: id, type: 'none' }];
    }

    words.push({
      id,
      word: id,
      phonetic,
      senses,
      breakdown,
      tags,
      examples: exs,
      assoc: {},
    });
  }

  return { roots, affixes: morph.affixes, words, missingPhonetic, missingExample, realCount, noRootCount, rulesCount, relCount };
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const data = build();

  // 契约断言:产物必须满足生成器契约(词缀段文本与词典一致、单字母前缀只能是 e-、
  // 同 type 同 text 的词缀唯一)。这一步把「拆解算法的输出」钉在 scripts/validate-content.js
  // 定义的红线上,算法改动若破坏契约会在这里就失败,而不是等到装配或灌库。
  // unusedRootAllow 放行手写层的词根:它们进得了产物是因为 morphology 以手写层为基底,
  // 但 CET4 语料可能一次都不命中(root-luc 就靠手写层的 lucid/illuminate 存活)。
  // 这不是产物的缺陷,故在此放行;装配阶段 generate-content.js 的 Pass B 同样放行。
  const handRootIds = new Set(
    (Array.isArray(baseRoots) ? baseRoots : baseRoots.roots || []).map(r => r.id)
  );
  const contractErrs = errorsFor(
    { roots: data.roots, affixes: data.affixes, words: data.words },
    { generated: true, unusedRootAllow: handRootIds }
  );
  if (contractErrs.length) {
    console.error('❌ 生成失败:产物不满足生成器契约,请检查拆解算法与形态学词典');
    contractErrs.slice(0, 30).forEach(e => console.error('   ' + e));
    if (contractErrs.length > 30) console.error(`   …另有 ${contractErrs.length - 30} 处`);
    process.exit(1);
  }

  // 不变量硬门槛:仍有缺音标/缺例句的词,直接失败并列出,禁止静默落库。
  if (data.missingPhonetic.length || data.missingExample.length) {
    console.error('❌ 生成失败:存在缺口词,请补齐 patches.js');
    if (data.missingPhonetic.length) console.error('   缺音标: ' + data.missingPhonetic.join(', '));
    if (data.missingExample.length) console.error('   缺例句: ' + data.missingExample.join(', '));
    process.exit(1);
  }

  const total = data.words.length;
  const pct = total ? (100 * data.realCount / total).toFixed(1) : '0';

  // 写 index.js(紧凑 JSON)
  const js = 'module.exports = ' + JSON.stringify({
    roots: data.roots,
    affixes: data.affixes,
    words: data.words,
  });
  fs.writeFileSync(path.join(OUT_DIR, 'index.js'), js + ';\n');

  // 写缺口清单(供 P2 补齐)
  fs.writeFileSync(path.join(OUT_DIR, 'gaps.json'), JSON.stringify({
    missingPhonetic: data.missingPhonetic,
    missingExample: data.missingExample,
  }, null, 2) + '\n');

  console.log('📚 CET4 全量内容生成完成');
  console.log(`   单词 words:           ${total}`);
  console.log(`   词根 roots:           ${data.roots.length}(纯真词根)`);
  console.log(`   词缀 affixes:         ${data.affixes.length}`);
  console.log(`   真词根拆解:           ${data.realCount}(${pct}%)`);
  console.log(`       其中 结构规则 R3–R7: ${data.rulesCount}`);
  console.log(`            同根背书 R8:    ${data.relCount}`);
  console.log(`   无词根(none 段):      ${data.noRootCount}`);
  console.log(`   缺音标:               ${data.missingPhonetic.length}`);
  console.log(`   缺例句:               ${data.missingExample.length}`);
  console.log(`   产出: server/data/cet4/index.js`);
}

// 只有直接执行时才跑流水线。require 本模块(诊断脚本/测试)不会产生副作用 ——
// 早先这里是裸的 main(),一次误 require 就把 server/data/cet4/index.js 重写了一遍。
if (require.main === module) main();

module.exports = {
  build, main, decompose, decomposeByRel, buildRelClaims, relWordsOf, assemble,
  prefixPlan, tailPlan, rootByVariant, rootById, blacklistPressure,
  MAX_RESIDUE, MAX_REL_RESIDUE, MIN_ROOT_VARIANT, MAX_SINGLE_LETTER,
  SINGLE_LETTER_PREFIX_ALLOW, NO_DECOMPOSE, EXCLUDE,
};
