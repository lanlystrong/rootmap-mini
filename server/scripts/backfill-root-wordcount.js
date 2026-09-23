// server/scripts/backfill-root-wordcount.js —— 把「词根关联的单词数量」回填进数据库
//
// 背景:roots 表此前没有 word_count 字段,seedContent 写 roots 时(roots 先于 words 写入)
// 无从知道每条词根关联多少单词,所以「词根关联的单词数」从未落库。
// 关联数的权威来源是 words.root_id(它由 breakdown 的 root 段 refId 写入)。
//
// 本脚本幂等,可重复跑:
//   1. 若 roots 没有 word_count 列,先 ALTER 补上(与 db.js 的 CONTENT_DDL / migrate 一致);
//   2. 用一条 LEFT JOIN + 聚合的 UPDATE 把每个词根的关联单词数写进 word_count;
//   3. 做一致性校验(Σword_count == root_id 非空的单词数);
//   4. 抽样打印关联单词数最多的几个词根。
//
// 用法:
//   node scripts/backfill-root-wordcount.js                # 默认库 rootmap_1
//   MYSQL_DATABASE=rootmap node scripts/backfill-root-wordcount.js
//   node scripts/backfill-root-wordcount.js --db rootmap --allow-db
const mysql = require('mysql2/promise');
const { dbConfig, guardDbName } = require('../src/dbConfig');

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}
const flag = (name) => process.argv.includes(name);

(async () => {
  const cfg = dbConfig();
  const name = guardDbName('回填词根关联单词数', { db: arg('--db', cfg.database), allowDb: flag('--allow-db') });
  cfg.database = name;

  const conn = await mysql.createConnection(cfg);
  try {
    console.log(`目标库:${name}(${cfg.host}:${cfg.port})`);

    // 1. 确保列存在(MySQL 不支持 ADD COLUMN IF NOT EXISTS,先查 information_schema)
    const [[{ cnt }]] = await conn.query(
      "SELECT COUNT(*) cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='roots' AND COLUMN_NAME='word_count'"
    );
    if (!cnt) {
      await conn.query(
        "ALTER TABLE roots ADD COLUMN word_count INT NOT NULL DEFAULT 0 COMMENT '关联单词数(由 words.root_id 聚合回填)'"
      );
      console.log('✓ 已为 roots 表新增 word_count 列');
    } else {
      console.log('· roots.word_count 列已存在,跳过建列');
    }

    // 2. 回填:LEFT JOIN 聚合,无关联单词的词根计 0
    const [res] = await conn.query(
      'UPDATE roots r LEFT JOIN ('
      + 'SELECT root_id, COUNT(*) AS c FROM words WHERE root_id IS NOT NULL GROUP BY root_id'
      + ') g ON g.root_id = r.id SET r.word_count = COALESCE(g.c, 0)'
    );
    console.log(`✓ 已更新 roots.word_count,影响行数=${res.affectedRows}`);

    // 3. 一致性校验
    const [[{ roots }]] = await conn.query('SELECT COUNT(*) roots FROM roots');
    const [[{ withWords }]] = await conn.query('SELECT COUNT(*) withWords FROM roots WHERE word_count > 0');
    const [[{ total }]] = await conn.query('SELECT COUNT(*) total FROM words WHERE root_id IS NOT NULL');
    const [[{ nullRoot }]] = await conn.query('SELECT COUNT(*) nullRoot FROM words WHERE root_id IS NULL');
    const [[{ sum }]] = await conn.query('SELECT COALESCE(SUM(word_count), 0) sum FROM roots');

    console.log(`  词根总数=${roots}, 有单词的词根=${withWords}`);
    console.log(`  单词 root_id 非空=${total}, root_id 为空=${nullRoot}`);
    console.log(`  Σword_count=${sum}`);
    // SUM() 在 mysql2 下返回字符串,COUNT() 返回数字,用 Number() 归一后再比,避免误报。
    if (Number(sum) === Number(total)) {
      console.log('  ✓ 一致性校验通过:Σword_count == 有词根归属的单词数');
    } else {
      console.error(`  ⚠ 不一致! Σword_count(${sum}) ≠ root_id 非空单词数(${total})`);
      process.exitCode = 1;
    }

    // 4. 抽样 TOP5
    const [top] = await conn.query('SELECT id, root, word_count FROM roots ORDER BY word_count DESC LIMIT 5');
    console.log('  关联单词数 TOP5:');
    top.forEach((r) => console.log(`    ${r.id} (${r.root}): ${r.word_count}`));

    // 5. 总词根数(用户要的"词根数量")
    console.log(`\n✅ 完成。词根数量=${roots},已为每条词根写入关联单词数。`);
  } finally {
    await conn.end();
  }
})().catch((e) => {
  console.error('\n❌ 回填失败:', e.message);
  process.exit(1);
});
