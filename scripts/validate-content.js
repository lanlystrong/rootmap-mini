// 纯函数:返回错误字符串数组;空数组 = 通过。CLI 在 require.main 时读取 miniprogram/data/index.js。
function errorsFor(data) {
  const out = [];
  const rootSet = new Set(data.roots.map(r => r.id));
  const affixSet = new Set(data.affixes.map(a => a.id));
  const seenIds = new Set();
  data.roots.forEach(r => { if (r.id && seenIds.has(r.id)) out.push(`root id 重复: ${r.id}`); if (r.id) seenIds.add(r.id); });
  if (new Set(data.roots.map(r => r.id)).size !== data.roots.length) out.push('roots: id 非唯一');

  const byId = new Map(data.words.map(w => [w.id, w]));
  data.words.forEach(w => {
    const base = `word "${w.id}": `;
    if (!w.id) return;
    if (!w.word || !w.phonetic || !w.senses || w.senses.length < 1) out.push(base + '缺 word/phonetic/senses');
    if (!w.examples || w.examples.length < 1 || w.examples.some(e => !e.en || !e.zh)) out.push(base + 'examples 需 ≥1 条且含 en+zh');
    const concat = (w.breakdown || []).map(b => b.part).join('');
    if (concat.toLowerCase() !== String(w.word).toLowerCase()) out.push(base + `拼接不匹配: "${concat}" !== "${w.word}"`);
    const rootParts = (w.breakdown || []).filter(b => b.type === 'root');
    if (rootParts.length !== 1) out.push(base + '必须恰有 1 个词根段');
    else if (!rootSet.has(rootParts[0].refId)) out.push(base + `root refId 不存在: ${rootParts[0].refId}`);
    (w.breakdown || []).forEach(b => {
      if (b.type !== 'none' && (!b.refId || !(b.type === 'root' ? rootSet : affixSet).has(b.refId)))
        out.push(base + `非法 ${b.type} 引用: ${b.refId}`);
    });
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
  data.roots.forEach(r => { if (!r.id || !r.root || !r.zh || !r.variants || r.variants.length < 1 || !r.group || !r.group.trim()) out.push(`root 缺字段: ${r.id || r.root}`); });
  data.affixes.forEach(a => { if (!a.id || !a.text || (a.type !== 'prefix' && a.type !== 'suffix') || !a.group || !a.group.trim()) out.push(`affix 缺字段: ${a.id || a.text}`); });
  return out;
}

if (require.main === module) {
  const data = require('../miniprogram/data/index.js');
  const errs = errorsFor(data);
  if (errs.length) { errs.forEach(e => console.error('✗ ' + e)); console.error(`✗ ${errs.length} 处错误`); process.exit(1); }
  console.log(`✓ 内容通过: ${data.roots.length} roots / ${data.affixes.length} affixes / ${data.words.length} words`);
}
module.exports = { errorsFor };
