// server/test/dataset-merge.test.js —— 交付数据集的保真测试(纯 Node,不连库)
//
// 这组断言的作用是把「生成器永不修改手写内容」从一句承诺变成可执行的证明。
// 参考对象是**内存构建结果**(generate-content.js 的 buildDataset),被测对象是
// **落盘后 app 真正加载的 miniprogram/data/index.js** —— 两者是同一套合并逻辑的
// 两份实现,漂移过一次(见下),所以必须逐字节对拍。
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'miniprogram', 'data');
const gen = require('../scripts/generate-content');
const { errorsFor } = require(path.join(ROOT, 'scripts', 'validate-content'));

const hand = gen.loadHand();
const product = gen.loadGen();
const built = gen.buildDataset(hand, product);
const disk = require(path.join(DATA_DIR, 'index.js'));

// 绕开 require 缓存重新读盘,拿到一份「未被任何运行时改动过」的原始快照。
// 直接 require 拿到的是同一个对象引用,deepStrictEqual 恒真,测不出任何东西。
function fresh(p) {
  const abs = require.resolve(p);
  delete require.cache[abs];
  const v = require(abs);
  delete require.cache[abs];
  return v;
}
const clone = (o) => JSON.parse(JSON.stringify(o));

test('① 每个手写词在交付集中逐字段不变(生成器只追加,不改手写)', () => {
  const byId = new Map(disk.words.map((w) => [w.id, w]));
  let n = 0;
  for (const r of hand.roots) {
    const slug = r.id.replace(/^root-/, '');
    const pristine = fresh(path.join(DATA_DIR, 'families', `family-${slug}.js`));
    for (const w of pristine) {
      const got = byId.get(w.id);
      assert.ok(got, `手写词 ${w.id} 在交付集里丢失了`);
      // 与**重新读盘**的快照比对:手写对象若被生成过程就地改写,这里会红。
      assert.deepStrictEqual(clone(got), clone(w), `手写词 ${w.id} 被改动了`);
      n++;
    }
  }
  assert.equal(n, hand.words.length);
  assert.equal(n, 201);
});

test('② 每个手写词根字段不变,且 variants 是超集、手写序在前', () => {
  const byId = new Map(disk.roots.map((r) => [r.id, r]));
  const pristine = fresh(path.join(DATA_DIR, 'roots.js'));
  for (const h of pristine) {
    const got = byId.get(h.id);
    assert.ok(got, `手写词根 ${h.id} 丢失`);
    for (const k of ['id', 'root', 'zh', 'group', 'meaning', 'story']) {
      assert.deepStrictEqual(got[k], h[k], `${h.id}.${k} 被改动`);
    }
    // variants 取并集 —— 生成词的根段可能落在手写 variants 之外(实测 41 例),
    // 取手写值会让这些词的根段悬空,取产物值又会丢掉手写序。
    assert.ok(got.variants.length >= h.variants.length, `${h.id}.variants 变短了`);
    assert.deepStrictEqual(got.variants.slice(0, h.variants.length), h.variants, `${h.id}.variants 手写序被破坏`);
    const extra = got.variants.slice(h.variants.length);
    const seen = new Set(h.variants.map((v) => String(v).toLowerCase()));
    for (const v of extra) assert.ok(!seen.has(String(v).toLowerCase()), `${h.id}.variants 出现重复追加 ${v}`);
  }
});

test('③ 每个手写词缀字段不变(唯一白名单 affix-in 的三字段)', () => {
  const WHITELIST = new Set(['zh', 'note', 'group']);
  const byId = new Map(disk.affixes.map((a) => [a.id, a]));
  const pristine = fresh(path.join(DATA_DIR, 'affixes.js'));
  for (const h of pristine) {
    const got = byId.get(h.id);
    assert.ok(got, `手写词缀 ${h.id} 丢失`);
    for (const k of Object.keys(h)) {
      if (h.id === 'affix-in' && WHITELIST.has(k)) continue; // 合并版 note 是手写版的超集
      assert.deepStrictEqual(got[k], h[k], `${h.id}.${k} 被改动`);
    }
    for (const k of Object.keys(got)) assert.ok(k in h, `${h.id} 多出字段 ${k}`);
  }
  // affix-in 覆盖的落点:必须同时含「不/非」与「向内」两义,否则 70 个否定词的 in- 段指向错义
  const ain = byId.get('affix-in');
  assert.match(ain.zh, /不/, 'affix-in 丢了否定义');
  assert.match(ain.zh, /向内/, 'affix-in 丢了方向义');
  // affix-in-neg 必须仍在:11 个手写词的 refId 指向它
  assert.ok(byId.has('affix-in-neg'), 'affix-in-neg 被合并掉了,手写词的 refId 会悬空');
});

test('④ 生成词 = 产物可拆词 − 手写 id,且逐字节等于产物', () => {
  const handIds = new Set(hand.words.map((w) => w.id));
  const expect = product.words.filter((w) => gen.isDecomposable(w) && !handIds.has(w.id)).map((w) => w.id).sort();
  const actual = built.genWords.map((w) => w.id).sort();
  assert.deepStrictEqual(actual, expect);

  const byId = new Map(disk.words.map((w) => [w.id, w]));
  const productById = new Map(product.words.map((w) => [w.id, w]));
  for (const w of built.genWords) {
    const got = byId.get(w.id);
    assert.ok(got, `生成词 ${w.id} 未进交付集`);
    const src = productById.get(w.id);
    // 生成词只允许被动过一处:补 assoc.story(且仅当词与根都没有 story 时)
    const want = clone(src);
    if (!(src.assoc || {}).story) {
      const rootId = want.breakdown.find((b) => b.type === 'root').refId;
      const rootStory = built.roots.find((r) => r.id === rootId).story;
      if (!rootStory) {
        const story = gen.buildStory(JSON.parse(JSON.stringify(src)), { story: rootStory });
        if (story) want.assoc = Object.assign({}, want.assoc, { story });
      }
    }
    assert.deepStrictEqual(clone(got), want, `生成词 ${w.id} 与产物不符`);
  }
});

test('⑤ 交付集自洽:1350 词各恰 1 个根段、refId 有效、id 唯一、零命中根为 0', () => {
  assert.equal(disk.roots.length, 213);
  assert.equal(disk.affixes.length, 151);
  assert.equal(disk.words.length, 1350);

  const rootById = new Map(disk.roots.map((r) => [r.id, r]));
  const affIds = new Set(disk.affixes.map((a) => a.id));
  const used = new Set();
  for (const w of disk.words) {
    const segs = w.breakdown.filter((b) => b.type === 'root');
    assert.equal(segs.length, 1, `${w.id} 的根段数为 ${segs.length}`);
    const r = rootById.get(segs[0].refId);
    assert.ok(r, `${w.id} 的根 ${segs[0].refId} 不存在`);
    used.add(r.id);
    const vs = (r.variants || []).map((v) => String(v).toLowerCase());
    assert.ok(vs.includes(String(segs[0].part).toLowerCase()), `${w.id} 的根段「${segs[0].part}」不在 ${r.id}.variants`);
    for (const b of w.breakdown) {
      if (b.type !== 'root' && b.refId) assert.ok(affIds.has(b.refId), `${w.id} 的词缀 ${b.refId} 不存在`);
    }
  }
  assert.equal(new Set(disk.words.map((w) => w.id)).size, disk.words.length, 'word id 有重复');
  assert.deepStrictEqual(disk.roots.filter((r) => !used.has(r.id)).map((r) => r.id), [], '存在零命中词根');
});

test('⑥ 手写层与交付集均通过校验;交付集不能用生成器契约(generated:true)', () => {
  assert.deepStrictEqual(errorsFor({ roots: hand.roots, affixes: hand.affixes, words: hand.words }), []);
  assert.deepStrictEqual(errorsFor(disk), []);
  // 反向断言:交付集套用生成器契约会被 in- 的两条同形词缀触发 —— 这正是 seed.js
  // 与 generate-content.js Pass C 都刻意不传 generated:true 的原因。哪天有人「顺手」
  // 加上了,这条会红,提醒他为什么不能加。
  assert.ok(errorsFor(disk, { generated: true }).length > 0, '交付集竟能通过生成器契约?契约的用意需要复核');
});

test('⑦ 落盘 index.js 与内存构建逐字节一致(两份合并实现不许漂移)', () => {
  const handIds = new Set(hand.roots.map((r) => r.id));
  assert.deepStrictEqual(clone(disk.roots), clone(built.roots));
  assert.deepStrictEqual(clone(disk.affixes), clone(built.affixes));
  assert.deepStrictEqual(clone(disk.words), clone(built.words));
  assert.equal(disk.roots.length, handIds.size + product.roots.length - handIds.size);
});

// ⑧ 人审闸门:逐词审校否决掉的伪拆解,一个都不许回到交付集。
//
// 这一条是 1196 → 1350 那次扩词的**核心产物**:扩词放松了「每段都能映射到词典条目」
// 这条不变量(R7 吸收有界残段、R8 吸收同根背书词的任意残段),实测伪词源率 35%。
// 审校结论落在 generate-cet4.js 的 NO_DECOMPOSE 里,但**断言要打在交付集上**——
// 黑名单可以被重构/改名/合并,「这些词不该出现在用户面前」这个事实不能变。
//
// 名单只放"有代表性且曾经真的错过"的词,不做全量镜像:全量镜像会让测试变成黑名单的
// 抄本,黑名单一改测试必红,反而没人敢改。这里只钉住每一类错误各一个样本。
test('⑧ 审校否决的伪拆解不得出现在交付集', () => {
  const ids = new Set(disk.words.map((w) => w.id));
  const rejected = {
    // 短变体切进无关词干(R7 的 2 字母残段那支,伪词源率最高)
    'root-cur 拾到计算词': ['count', 'counter', 'discount', 'could', 'cough', 'court'],
    'root-cad 拾到箱子/投掷': ['cash', 'cast', 'forecast'],
    'root-lig 拾到「光」': ['light', 'delight', 'lightly', 'diligent'],
    'root-stan 拾到日耳曼固有词': ['stack', 'staff', 'stain', 'stair', 'stake', 'stamp', 'start'],
    'root-cre 拾到膏油/爬行': ['cream', 'creep'],
    'root-fer 拾到「迟」': ['late', 'lately', 'latin', 'later', 'latest'],
    'root-sess 拾到「边」': ['side', 'inside', 'outside', 'beside'],
    'root-vis 拾到 dividere': ['divide', 'division', 'subdivision', 'devise'],
    // 归属给了同形的另一个词根
    'root-civ 拾到 ciere(召唤)': ['cite', 'excite', 'recite'],
    'root-temp(时间)拾到 temptare': ['attempt', 'tempt', 'temptation', 'contempt', 'temple'],
    'root-medi(中间)拾到 mederi(治疗)': ['medical', 'medicine', 'remedy', 'medal'],
    'root-ver(真)拾到别的词': ['cover', 'forever', 'several'],
    'root-sens(感觉)拾到 esse(是)': ['present', 'absent', 'presently'],
    // 本次修掉的「既有」伪拆解(原黑名单只抓了 10 个)
    'root-cid 拾到 cadere(落)': ['accidental', 'coincidence', 'incidence'],
    'root-cent 拾到 canere/decere': ['accent', 'decent', 'recent'],
    'root-mit 拾到 miser/missan': ['miserable', 'missing'],
  };
  const unexpected = [];
  for (const [why, list] of Object.entries(rejected)) {
    for (const id of list) if (ids.has(id)) unexpected.push(`${id}(${why})`);
  }
  assert.deepStrictEqual(unexpected, [], '审校否决过的伪拆解又回到交付集了');
});

// ⑨ none 段必须拼得回整词 —— 交付集里每个 none 残段都要够短到「不该显示」,
// 否则 BreakdownBar 的窄隙渲染会把单词显示成半截(曾真实发生:generalization 只剩 "gener")。
// 长残段本身可以是**正确**的(词典未收的派生后缀 -ation/-ology/-ific,如 generalization
// = gener + alization),所以这里不禁止长残段,只要求:凡是超过可见阈值的,组件必须显示它。
test('⑨ none 残段的长度上限与可见性契约', () => {
  const MAX_RESIDUE = 9;          // generate-cet4.js 的 MAX_REL_RESIDUE
  const VISIBLE_MAX = 2;          // BreakdownBar 的 RESIDUE_VISIBLE_MAX
  let longest = 0;
  for (const w of disk.words) {
    // 拆解条必须拼得回原词(S5 的视觉版)
    assert.equal(w.breakdown.map((b) => b.part).join(''), w.word, `${w.id} 的拆解段拼不回原词`);
    for (const b of w.breakdown) {
      if (b.type !== 'none') continue;
      assert.ok(b.part.length >= 1, `${w.id} 有空残段`);
      assert.ok(b.part.length <= MAX_RESIDUE, `${w.id} 的残段「${b.part}」超过 ${MAX_RESIDUE} 字母`);
      longest = Math.max(longest, b.part.length);
    }
  }
  assert.ok(longest > VISIBLE_MAX, '语料里应当存在长残段;若不再有,请一并简化 BreakdownBar 的分支');

  // 组件侧:长残段必须以文字渲染(而不是 8rpx 窄隙),且不可点。
  let captured = null;
  global.Component = (def) => { captured = def; };
  const comp = path.join(ROOT, 'miniprogram', 'components', 'BreakdownBar', 'index.js');
  delete require.cache[require.resolve(comp)];
  require(comp);
  delete global.Component;
  assert.ok(captured && captured.methods && captured.methods.derive, '未能取到 BreakdownBar.derive');
  const segs = captured.methods.derive([
    { part: 'gener', type: 'root', zh: '生', refId: 'root-gen' },
    { part: 'alization', type: 'none' },
    { part: 'e', type: 'none' },
  ]);
  assert.equal(segs[1].text, 'alization', '长残段没被渲染成文字(拆解条会显示成半截单词)');
  assert.equal(segs[1].cls, 'bp-none');
  assert.equal(segs[1].ref, undefined, '残段不应可点');
  assert.equal(segs[2].gap, true, '短残段应保持窄隙(手写层的静音 e)');
  assert.equal(segs[2].text, '');
  assert.equal(segs[0].cls, 'bp-root');
});

// ⑩ 黑名单必须"响" —— NO_DECOMPOSE 曾经是个纯装饰:68 条里 0 条是规则本来会收的词,
// 也就是说它一条都没在起作用。R7/R8 之后它成了最大的正确性闸门(绝大多数条目都是
// 「规则本来会收下、人审否决掉」的词)。这个数字一旦变化,说明拆解规则被改动过,
// 必须重新逐词审校 —— 用一条测试把这件事变成必须响的警报。
test('⑩ 黑名单压力:规则本会收下的词条数不得无告警地变化', () => {
  const g = require('../scripts/generate-cet4');
  const { rulesAccepted, relClaimed } = g.blacklistPressure();
  // 这两个数字 = 审校工作量。改动 R3–R8 任何规则都会让它们变,届时必须重跑审校。
  // 实测(1350 词那一版,共 251 条):222 条「规则本会收」+ 6 条「R8 本会认领」,
  // 其余是防回归冗余 —— 它们的派生源已被否决,所以自己也不触发规则(如 installation←install)。
  assert.equal(rulesAccepted, 222, '规则本会收下的黑名单词条数变了 → 拆解规则被改动,需重新审校');
  assert.equal(relClaimed, 6, '会被 R8 同根背书认领的黑名单词条数变了 → 需重新审校');
});

// ⑪ require generate-cet4 不得有副作用(它曾把 main() 写在模块作用域,
// 一次误 require 就把 2.4 MB 的产物重写了一遍,且无人察觉)。
test('⑪ require 第 1 段生成器不产生副作用', () => {
  const fs = require('fs');
  const out = path.join(ROOT, 'server', 'data', 'cet4', 'index.js');
  const before = fs.statSync(out);
  delete require.cache[require.resolve('../scripts/generate-cet4')];
  require('../scripts/generate-cet4');
  const after = fs.statSync(out);
  assert.equal(after.mtimeMs, before.mtimeMs, 'require 生成了产物:main() 又跑在模块作用域上了');
});

// ⑫ 不编造词源:story 只能由**带 zh 的段**拼成,none 残段必须被静默跳过。
//
// buildStory 是唯一一处「生成文本」的地方,也是「绝不编造词源」这条底线的落点。
// R7/R8 新引入的 none 残段没有 zh,若哪天实现改成「拿残段字母当词素解释」,
// 就会凭空造出词源(如 audi+o 说成「o = 某某」)。这里把底线变成可执行的断言。
// 1 字母残段不查:静音 e 从不入 story,而 'e(' 会命中 de(/re(/pre( 的尾巴。
test('⑫ story 不得给 none 残段编造义项', () => {
  const handIds = new Set(hand.words.map((w) => w.id));
  const genWords = disk.words.filter((w) => !handIds.has(w.id));
  assert.equal(genWords.length, 1149);

  const offenders = [];
  let withNone = 0;
  for (const w of genWords) {
    for (const b of w.breakdown) {
      if (b.type !== 'none') continue;
      withNone++;
      assert.ok(!b.zh, `${w.id} 的 none 残段「${b.part}」竟带 zh:残段的义项没有来源`);
    }
    const story = (w.assoc || {}).story || '';
    if (!story) continue;
    for (const b of w.breakdown) {
      if (b.type !== 'none' || String(b.part).length < 2) continue;
      if (story.includes(b.part + '(') || story.includes(b.part + '（')) {
        offenders.push(`${w.id} 给残段「${b.part}」编了义项:${story.slice(0, 60)}`);
      }
    }
    // story 必须至少有一个带 zh 的段做来源,否则整句无从谈起
    if (!w.breakdown.some((b) => b.type !== 'none' && b.zh)) {
      offenders.push(`${w.id} 有 story 但没有任何带 zh 的段:${story.slice(0, 60)}`);
    }
  }
  assert.ok(withNone > 0, '语料里应当有含 none 残段的生成词;若不再有,请一并简化本条');
  assert.deepStrictEqual(offenders, [], '生成器给 none 残段编造了词源');
});
