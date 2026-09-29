// 逐字段核对:交付集 vs 数据库。目的是找出「源里有、库里没有」的任何数据。
//
// 重点防两件事:
//   1. MySQL 非严格模式下的静默截断(超长 VARCHAR 不报错,直接截掉)—— 逐字段比对能抓到;
//   2. seed 之后出现孤儿行/空外键 —— 会让人数对不上,且报告里看不出来。
//
//   npm run verify:db                       # 默认库 rootmap_1(与 seed/server 一致)
//   MYSQL_DATABASE=rootmap npm run verify:db # 用环境变量覆盖目标库
//
// 用法:先 npm run seed,再跑它。退出码非 0 表示源与库不一致。
const mysql = require('mysql2/promise');
const idx = require('../../miniprogram/data/index');

// MySQL 的 JSON 列会重排对象键序(语义不变)。比较 JSON 字段时必须先规范化,
// 否则会把「键序不同、内容相同」误报成数据丢失 —— 实测会误报 16 处。
const sortKeys = (v) => (Array.isArray(v) ? v.map(sortKeys)
  : v && typeof v === 'object' ? Object.keys(v).sort().reduce((o, k) => { o[k] = sortKeys(v[k]); return o; }, {})
    : v);
const canon = (v) => {
  if (v == null || v === '') return null;
  let o = v;
  if (typeof v === 'string') { try { o = JSON.parse(v); } catch { return v; } }
  // 丢弃 undefined 值:JSON 不可序列化 undefined,`{story:undefined}` 与 `{}` 语义等价,
  // 否则会误报「源 {} ≠ 库 null」(生成层无 story 的词就是这种空 assoc)。
  if (o && typeof o === 'object' && !Array.isArray(o)) {
    const clean = {};
    for (const k of Object.keys(o)) if (o[k] !== undefined) clean[k] = o[k];
    o = clean;
  }
  if (o == null || (typeof o === 'object' && !Object.keys(o).length)) return null;
  return JSON.stringify(sortKeys(o));
};

function dbConfig() {
  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '123456',
    database: process.env.MYSQL_DATABASE || 'rootmap_1',
    charset: 'utf8mb4',
  };
}

(async () => {
  const cfg = dbConfig();
  const c = await mysql.createConnection(cfg);
  const miss = [];

  console.log(`核对目标库:${cfg.database}(${cfg.host}:${cfg.port})`);
  const [[{ sql_mode }]] = await c.query('SELECT @@sql_mode AS sql_mode');
  console.log(`sql_mode 含 STRICT:${/STRICT/.test(sql_mode)}(非 STRICT 时超长值会被静默截断,下面的逐字段比对是唯一的防线)`);
  console.log();

  // ---- roots ----
  const [roots] = await c.query('SELECT * FROM roots');
  const rById = new Map(roots.map((r) => [r.id, r]));
  let n = 0;
  for (const r of idx.roots) {
    const d = rById.get(r.id);
    if (!d) { miss.push(`root 缺失 ${r.id}`); continue; }
    const pairs = [
      ['root', r.root, d.root], ['zh', r.zh, d.zh], ['group', r.group, d.group_name],
      ['meaning', r.meaning || null, d.meaning], ['story', r.story || null, d.story],
      ['variants', canon(r.variants), canon(d.variants)],
    ];
    for (const [k, a, b] of pairs) {
      if (String(a ?? '') !== String(b ?? '')) miss.push(`root ${r.id}.${k}\n    源: ${String(a).slice(0, 90)}\n    库: ${String(b).slice(0, 90)}`);
    }
    n++;
  }
  console.log(`roots   源 ${idx.roots.length} / 库 ${roots.length} / 核对 ${n}`);

  // ---- affixes ----
  const [affixes] = await c.query('SELECT * FROM affixes');
  const aById = new Map(affixes.map((a) => [a.id, a]));
  n = 0;
  for (const a of idx.affixes) {
    const d = aById.get(a.id);
    if (!d) { miss.push(`affix 缺失 ${a.id}`); continue; }
    for (const [k, x, y] of [['text', a.text, d.text], ['type', a.type, d.type], ['group', a.group, d.group_name], ['zh', a.zh, d.zh], ['note', a.note || null, d.note]]) {
      if (String(x ?? '') !== String(y ?? '')) miss.push(`affix ${a.id}.${k}\n    源: ${String(x).slice(0, 90)}\n    库: ${String(y).slice(0, 90)}`);
    }
    n++;
  }
  console.log(`affixes 源 ${idx.affixes.length} / 库 ${affixes.length} / 核对 ${n}`);

  // ---- words (+ senses / breakdown / examples)----
  const [words] = await c.query('SELECT * FROM words');
  const [senses] = await c.query('SELECT * FROM word_senses ORDER BY word_id, seq');
  const [bds] = await c.query('SELECT * FROM word_breakdown ORDER BY word_id, seq');
  const [exs] = await c.query('SELECT * FROM word_examples ORDER BY word_id, seq');
  const wById = new Map(words.map((w) => [w.id, w]));
  const groupBy = (rows) => { const m = new Map(); for (const r of rows) { if (!m.has(r.word_id)) m.set(r.word_id, []); m.get(r.word_id).push(r); } return m; };
  const sG = groupBy(senses), bG = groupBy(bds), eG = groupBy(exs);

  n = 0;
  let maxField = { name: '', len: 0 };
  for (const w of idx.words) {
    const d = wById.get(w.id);
    if (!d) { miss.push(`word 缺失 ${w.id}`); continue; }
    const rootPart = w.breakdown.find((b) => b.type === 'root');
    for (const [k, x, y] of [
      ['word', w.word, d.word], ['phonetic', w.phonetic, d.phonetic],
      ['root_id', rootPart && rootPart.refId, d.root_id],
      ['tags', canon(w.tags), canon(d.tags)],
      ['assoc', canon(w.assoc), canon(d.assoc)],
    ]) {
      if (String(x ?? '') !== String(y ?? '')) miss.push(`word ${w.id}.${k}\n    源: ${String(x).slice(0, 90)}\n    库: ${String(y).slice(0, 90)}`);
    }
    for (const s of w.senses || []) { if ((s.zh || '').length > maxField.len) maxField = { name: 'senses.zh', len: (s.zh || '').length }; }
    if ((d.assoc || '').length > maxField.len) maxField = { name: 'words.assoc', len: (d.assoc || '').length };
    if ((d.story || '').length > maxField.len) maxField = { name: 'words.story', len: (d.story || '').length };

    // 子表逐行
    const S = sG.get(w.id) || [], B = bG.get(w.id) || [], E = eG.get(w.id) || [];
    if (S.length !== (w.senses || []).length) miss.push(`word ${w.id} senses 行数 ${S.length} ≠ ${w.senses.length}`);
    if (B.length !== w.breakdown.length) miss.push(`word ${w.id} breakdown 行数 ${B.length} ≠ ${w.breakdown.length}`);
    if (E.length !== (w.examples || []).length) miss.push(`word ${w.id} examples 行数 ${E.length} ≠ ${(w.examples || []).length}`);
    (w.senses || []).forEach((s, i) => {
      const r = S[i]; if (!r) return;
      if ((s.zh || '') !== (r.zh || '')) miss.push(`word ${w.id} sense[${i}].zh\n    源: ${(s.zh || '').slice(0, 90)}\n    库: ${(r.zh || '').slice(0, 90)}`);
      if ((s.en || '') !== (r.en || '')) miss.push(`word ${w.id} sense[${i}].en 不符`);
    });
    w.breakdown.forEach((b, i) => {
      const r = B[i]; if (!r) return;
      for (const [k, x, y] of [['part', b.part, r.part], ['type', b.type, r.type], ['zh', b.zh || null, r.zh], ['refId', b.refId || null, r.ref_id]]) {
        if (String(x ?? '') !== String(y ?? '')) miss.push(`word ${w.id} breakdown[${i}].${k}: 源 ${x} ≠ 库 ${y}`);
      }
    });
    (w.examples || []).forEach((e, i) => {
      const r = E[i]; if (!r) return;
      if (e.en !== r.en) miss.push(`word ${w.id} example[${i}].en\n    源: ${(e.en || '').slice(0, 90)}\n    库: ${(r.en || '').slice(0, 90)}`);
      if (e.zh !== r.zh) miss.push(`word ${w.id} example[${i}].zh\n    源: ${(e.zh || '').slice(0, 90)}\n    库: ${(r.zh || '').slice(0, 90)}`);
    });
    n++;
  }
  console.log(`words   源 ${idx.words.length} / 库 ${words.length} / 核对 ${n}`);
  console.log(`子表    源 senses ${idx.words.reduce((a, w) => a + w.senses.length, 0)} / 库 ${senses.length}`);
  console.log(`       源 breakdown ${idx.words.reduce((a, w) => a + w.breakdown.length, 0)} / 库 ${bds.length}`);
  console.log(`       源 examples ${idx.words.reduce((a, w) => a + (w.examples || []).length, 0)} / 库 ${exs.length}`);
  console.log();

  // ---- 引用完整性:孤儿行与空外键 ----
  // 这三类问题不会让上面的逐字段比对变红(源里没有对应行,循环就跳过了),
  // 但会让「已学/总数」这类统计对不上,所以单独查。
  const integrity = [
    ['words.root_id IS NULL', 'SELECT COUNT(*) n FROM words WHERE root_id IS NULL'],
    ['word_senses 孤儿', 'SELECT COUNT(*) n FROM word_senses s LEFT JOIN words w ON w.id=s.word_id WHERE w.id IS NULL'],
    ['word_breakdown 孤儿', 'SELECT COUNT(*) n FROM word_breakdown b LEFT JOIN words w ON w.id=b.word_id WHERE w.id IS NULL'],
    ['word_examples 孤儿', 'SELECT COUNT(*) n FROM word_examples e LEFT JOIN words w ON w.id=e.word_id WHERE w.id IS NULL'],
    ['零命中词根', 'SELECT COUNT(*) n FROM roots r LEFT JOIN words w ON w.root_id=r.id WHERE w.id IS NULL'],
  ];
  console.log('引用完整性:');
  for (const [label, sql] of integrity) {
    const [[{ n: cnt }]] = await c.query(sql);
    console.log(`  ${cnt === 0 ? '✓' : '✗'} ${label}: ${cnt}`);
    if (cnt !== 0) miss.push(`${label} = ${cnt}(应为 0)`);
  }
  console.log();

  // ---- 列类型:是否有被截断的风险 ----
  const [cols] = await c.query(
    `SELECT TABLE_NAME t, COLUMN_NAME c, COLUMN_TYPE ty FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA=? AND TABLE_NAME IN ('roots','affixes','words') ORDER BY t,c`, [cfg.database]);
  console.log(`列类型(最长实测值 ${maxField.name} = ${maxField.len} 字符):`);
  for (const r of cols) console.log(`  ${r.t}.${r.c}: ${r.ty}`);
  console.log();

  if (miss.length) {
    console.log(`❌ 发现 ${miss.length} 处不一致:`);
    miss.slice(0, 25).forEach((m) => console.log('  - ' + m));
    if (miss.length > 25) console.log(`  …另有 ${miss.length - 25} 处`);
    process.exitCode = 1;
  } else {
    console.log('✅ 逐字段核对通过:源里的每个字段库里都有,且值完全一致(无截断、无丢失、无孤儿)');
  }
  await c.end();
})().catch((e) => { console.error(e); process.exit(1); });
