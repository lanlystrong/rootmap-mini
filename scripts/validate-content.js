// 纯函数:返回错误字符串数组;空数组 = 通过。CLI 见文件末尾(可传路径与 --generated)。
//
// 校验分两层:
//   结构不变量 —— 拼接、refId、字段完整性、唯一性
//   语义红线   —— 结构完全合法、但会把用户引向错误内容的数据(本次新增)
//
// 为什么要有第二层:内容条(BreakdownBar)的每一段都可点击并跳转到该词根/词缀页。
// 一个错误的引用不会报错、不会崩,只会安静地把用户带到完全错误的词族。此前生成器是
// 纯字符串最长匹配,`cup` 被拆成 【拿/取】(实为 cuppa 杯子)、`many` 被拆成 【手】
// (实为 manig),而旧校验对全量数据返回 0 错误——坏数据是静默入库的。
//
// opts(均可选):
//   generated: bool               数据由 server/scripts/generate-cet4.js 生成。为 true 时
//                                 额外强制「生成器契约」:词缀段必须与该词缀的 text 完全
//                                 一致、单字母前缀只能是 e-、同 type 同 text 的词缀只能有
//                                 一条。这三条是算法 R5/R6 的等价物,**对手写内容不适用**:
//                                 手写数据刻意用同化后的表面形式做段文本(support 的段是
//                                 sup-,refId 指向 affix-sub,同化规则写在 affix 的 note 里),
//                                 也刻意保留了 in- 的「向内/进入」与「不/非」两条同形词缀。
//   unusedRootAllow: Set<rootId>  允许「零命中」的词根。CET4 灌库时传入手写基础数据的
//                                 30 个词根:它们在 CET4 语料里可能一次都不命中,但在
//                                 另一个已发布数据集(miniprogram/data)里是活的。
const path = require('path');

function errorsFor(data, opts = {}) {
  const out = [];
  const rootSet = new Set(data.roots.map(r => r.id));
  const affixSet = new Set(data.affixes.map(a => a.id));
  const seenIds = new Set();
  data.roots.forEach(r => { if (r.id && seenIds.has(r.id)) out.push(`root id 重复: ${r.id}`); if (r.id) seenIds.add(r.id); });
  if (new Set(data.roots.map(r => r.id)).size !== data.roots.length) out.push('roots: id 非唯一');

  // ---------- 语义红线 1:词根变体跨词根冲突 ----------
  // 生成器建「变体 → 词根」索引是 first-wins:同一字符串被两个词根声明时,后者永远匹配不到,
  // 且哪一条胜出取决于数组顺序——这是静默失效,必须在数据层拦住。
  const variantOwner = new Map();
  data.roots.forEach(r => (r.variants || []).forEach(v => {
    const k = String(v).toLowerCase();
    if (!variantOwner.has(k)) variantOwner.set(k, []);
    variantOwner.get(k).push(r.id);
  }));
  variantOwner.forEach((ids, v) => { if (ids.length > 1) out.push(`词根变体冲突: "${v}" 被 ${ids.join(' | ')} 同时声明`); });

  const byId = new Map(data.words.map(w => [w.id, w]));
  const usedRoot = new Set();
  data.words.forEach(w => {
    const base = `word "${w.id}": `;
    if (!w.id) return;
    if (!w.word || !w.phonetic || !w.senses || w.senses.length < 1) out.push(base + '缺 word/phonetic/senses');
    if (!w.examples || w.examples.length < 1 || w.examples.some(e => !e.en || !e.zh)) out.push(base + 'examples 需 ≥1 条且含 en+zh');
    const concat = (w.breakdown || []).map(b => b.part).join('');
    if (concat.toLowerCase() !== String(w.word).toLowerCase()) out.push(base + `拼接不匹配: "${concat}" !== "${w.word}"`);
    const rootParts = (w.breakdown || []).filter(b => b.type === 'root');
    if (rootParts.length > 1) out.push(base + '至多 1 个词根段');
    else if (rootParts.length === 1 && !rootSet.has(rootParts[0].refId)) out.push(base + `root refId 不存在: ${rootParts[0].refId}`);
    if (rootParts.length === 1) usedRoot.add(rootParts[0].refId);
    (w.breakdown || []).forEach(b => {
      if (b.type !== 'none' && (!b.refId || !(b.type === 'root' ? rootSet : affixSet).has(b.refId)))
        out.push(base + `非法 ${b.type} 引用: ${b.refId}`);
    });

    // ---------- 语义红线 2:拆解段必须真的属于它引用的词典条目 ----------
    // 「每段都能映射到词典条目」是整个拆解功能成立的前提:否则点击跳转会 404,
    // 或跳到一条与段文本无关的词根。
    const pre = (w.breakdown || []).filter(b => b.type === 'prefix');
    const suf = (w.breakdown || []).filter(b => b.type === 'suffix');
    (w.breakdown || []).forEach(b => {
      if (b.type === 'none') return;
      if (b.type === 'root') {
        const r = (data.roots || []).find(x => x.id === b.refId);
        if (!r) return;
        const vs = (r.variants || []).map(s => String(s).toLowerCase());
        if (!vs.includes(String(b.part).toLowerCase()))
          out.push(base + `词根段 "${b.part}" 不在 ${r.id} 的 variants(${vs.join(',')})`);
      } else {
        const a = (data.affixes || []).find(x => x.id === b.refId);
        if (!a) return;
        if (a.type !== b.type) out.push(base + `段 "${b.part}" 标为 ${b.type},但 ${a.id} 是 ${a.type}`);
        // 生成器契约:segment() 只会切出 affix.text 本身,故段文本必须完全一致。
        // 手写数据不受此约束——它用同化后的表面形式(sup-/at-/ac-)指向规范词缀。
        if (opts.generated) {
          const t = String(a.text || '').replace(/-/g, '').toLowerCase();
          if (t !== String(b.part).toLowerCase()) out.push(base + `词缀段 "${b.part}" ≠ ${a.text}(${a.id})`);
        }
      }
    });

    // ---------- 语义红线 3:单字母词缀段(生成器契约) ----------
    // a-/i-/o- 这类「粘连残留字母」被当成前缀是最常见的伪拆解来源
    // (apartment → a+part+ment、avail → a+vail、age → a+ge 都属此类)。
    // 生成器 R5/R6 只放行单个 e-(ex- 的省音形,emit/erupt 等真实构词)。
    // 手写数据另有 affix-a 等条目,其取舍由内容作者负责,不在此规则内。
    if (opts.generated) {
      const singles = (w.breakdown || []).filter(b => b.type !== 'none' && b.type !== 'root' && String(b.part).length === 1);
      if (singles.length > 1) out.push(base + `单字母词缀段过多(${singles.length}):` + singles.map(b => b.part).join('+'));
      singles.filter(b => b.type === 'prefix' && b.part !== 'e')
        .forEach(b => out.push(base + `单字母前缀 "${b.part}"(仅允许 e-)`));
    }

    // ---------- 语义红线 4:例句必须是给人读的句子 ----------
    (w.examples || []).forEach(e => {
      const en = String(e.en || '');
      if (/^\s*[{[]/.test(en) || /"(GLOSS|COLLOINEXA|EXAMPLE)"\s*:/.test(en))
        out.push(base + `例句是结构化 JSON 残留: ${en.slice(0, 50)}`);
      if (/<[a-z/]/i.test(en)) out.push(base + `例句残留 HTML: ${en.slice(0, 50)}`);
      if (/\(=/.test(en)) out.push(base + `例句含源数据片段标记 "(= …)": ${en.slice(0, 50)}`);
    });

    // ---------- 语义红线 5:音标不得夹带源数据噪声 ----------
    // 方括号包裹、中文分号分隔多读音、智能引号、(for v.) 注解都会原样渲染给用户。
    if (w.phonetic && /[[\]；‘’“”]|\(for |:/.test(String(w.phonetic)))
      out.push(base + `音标含噪声字符: ${w.phonetic}`);

    const a = w.assoc || {};
    ['synonyms', 'antonyms', 'derivatives'].forEach(k => {
      (a[k] || []).forEach(id => {
        if (!byId.has(id)) out.push(base + `assoc.${k} 不存在: ${id}`);
        if (id === w.id) out.push(base + `assoc.${k} 含自身`);
      });
    });
    (a.confusing || []).forEach(c => {
      if (!byId.has(c.id)) out.push(base + `assoc.confusing 不存在: ${c.id}`);
      if (c.id === w.id) out.push(base + 'assoc.confusing 含自身');
      if (!c.diff || !c.diff.trim()) out.push(base + 'confusing 缺辨析 diff');
    });
  });

  // ---------- 语义红线 6:每个词根至少被 1 个词命中 ----------
  // 零命中的词根在应用里只会渲染出一个空的「同根词」页面,是纯死条目。
  const allow = opts.unusedRootAllow || new Set();
  data.roots.forEach(r => {
    if (!usedRoot.has(r.id) && !allow.has(r.id))
      out.push(`root 零命中: ${r.id}(没有任何词的拆解引用它,词根页会是空的)`);
  });

  // ---------- 语义红线 7:同 type 同 text 的词缀只能有一条(生成器契约) ----------
  // 两条并存时,生成器的索引会 first-wins 决定归属,拆解段显示的永远是前者
  // (in- 的否定义曾被「向内/进入」永久遮住,independent 显示成 进入+de+pend)。
  if (opts.generated) {
    const at = new Map();
    data.affixes.forEach(a => {
      const k = `${a.type}:${String(a.text || '').replace(/-/g, '').toLowerCase()}`;
      if (at.has(k)) out.push(`词缀文本重复: ${k} → ${at.get(k)} | ${a.id}`);
      else at.set(k, a.id);
    });
  }

  data.roots.forEach(r => { if (!r.id || !r.root || !r.zh || !r.variants || r.variants.length < 1 || !r.group || !r.group.trim()) out.push(`root 缺字段: ${r.id || r.root}`); });
  data.affixes.forEach(a => { if (!a.id || !a.text || (a.type !== 'prefix' && a.type !== 'suffix') || !a.group || !a.group.trim()) out.push(`affix 缺字段: ${a.id || a.text}`); });
  if (new Set(data.affixes.map(a => a.id)).size !== data.affixes.length) out.push('affixes: id 非唯一');
  if (new Set(data.words.map(w => w.id)).size !== data.words.length) out.push('words: id 非唯一');
  return out;
}

if (require.main === module) {
  // 可选参数:同一份契约要能校验三个不同对象 ——
  //   默认(无参数)                 miniprogram/data/index.js   交付集(手写精选层 + 生成层)
  //   <path>                       任意 {roots,affixes,words} 模块
  //   --generated                  套用生成器契约(校验 server/data/cet4/index.js 时用)
  //   --allow-unused-root=id1,id2  放行指定零命中词根(root-luc 在语料里零命中)
  // 例:node scripts/validate-content.js server/data/cet4/index.js --generated --allow-unused-root=root-luc
  const argv = process.argv.slice(2);
  const flags = new Set(argv.filter(a => a.startsWith('--')));
  const positional = argv.filter(a => !a.startsWith('--'));
  const allowArg = argv.find(a => a.startsWith('--allow-unused-root='));
  const opts = {
    generated: flags.has('--generated'),
    unusedRootAllow: allowArg ? new Set(allowArg.split('=')[1].split(',').map(s => s.trim()).filter(Boolean)) : undefined,
  };
  const target = positional.length
    ? path.resolve(positional[0])
    : path.join(__dirname, '..', 'miniprogram', 'data', 'index.js');
  const data = require(target);
  const errs = errorsFor(data, opts);
  if (errs.length) {
    errs.forEach(e => console.error('✗ ' + e));
    console.error(`✗ ${errs.length} 处错误 → ${target}`);
    process.exit(1);
  }
  console.log(`✓ 内容通过: ${data.roots.length} roots / ${data.affixes.length} affixes / ${data.words.length} words`);
  console.log(`  ${target}${opts.generated ? ' (生成器契约)' : ''}`);
}
module.exports = { errorsFor };
