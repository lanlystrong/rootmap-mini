// server/src/seed.js —— 内容数据初始化(词根/词缀/单词/释义/拆解/例句/音标)
//
// 以 miniprogram/data 为唯一真源,把内容落进 MySQL 的归一化表:
//   roots / affixes / words / word_senses / word_breakdown / word_examples
//
// 用法:
//   npm run seed                       # 默认库 rootmap_1(与 server.js 一致)
//   MYSQL_DATABASE=rootmap npm run seed # 用环境变量覆盖目标库
//
// 幂等:先清空 6 张内容表再重灌(重置为数据源当前状态),不影响 users/sessions/events 等业务表。
const mysql = require('mysql2/promise');
const path = require('path');
const { seedContent } = require('./seedContent');
const { errorsFor } = require(path.join(__dirname, '..', '..', 'scripts', 'validate-content'));

// index.js 在根段解析不到时会抛错(见 generate-content.js 里写出的合并入口)。
// 这里是「数据在装配阶段就被改坏」的兜底:给出可操作的提示,而不是把栈直接甩给使用者。
let index;
try {
  index = require('../../miniprogram/data/index');
} catch (err) {
  console.error('❌ 内容数据无法加载,已中止入库,数据库未做任何改动:');
  console.error('   ' + err.message);
  console.error('   若 generated/ 或 index.js 被手改过,请重跑 npm run generate:content 还原。');
  process.exit(1);
}

// 入库前门禁:内容不合契约就**在连库之前**退出,不留下「删了旧数据、新数据又插了一半」的库。
// seedContent 把「DELETE 6 张表 + INSERT」放在一个事务里,所以失败本身不会写坏库 —— 但一旦
// 读到坏数据就已经白跑一趟;更重要的是坏数据会静静地发布出去。
//
// 这里**不传 `generated: true`**:交付集是手写精选层 + 生成层的合并,而手写层刻意使用
// 同化表面形(sup-/at-/ac-)、刻意保留 in- 的两条同形词缀(方向义 affix-in 与否定义
// affix-in-neg),这两点都会被生成器契约判为违规。生成侧的契约由 generate-content.js 的
// Pass B 在装配时保证,不该在这里重复施加。
function validateOrExit() {
  const errs = errorsFor(index);
  if (errs.length) {
    console.error(`❌ 内容校验未通过(${errs.length} 处),已中止入库,数据库未做任何改动:`);
    errs.slice(0, 30).forEach((e) => console.error('   ' + e));
    if (errs.length > 30) console.error(`   …另有 ${errs.length - 30} 处`);
    console.error('   修复后重跑 npm run seed;若手写层有误请改 miniprogram/data/{roots,affixes,families/},');
    console.error('   若生成层有误请改 server/scripts/generate-content.js 后重跑 npm run generate:content。');
    process.exit(1);
  }
}

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

async function main() {
  validateOrExit();
  const cfg = dbConfig();
  const conn = await mysql.createConnection(cfg);
  try {
    const c = await seedContent(conn, index);
    console.log('✅ 内容数据初始化完成 → 数据库 `' + cfg.database + '`');
    console.log(`   词根 roots:        ${c.roots}`);
    console.log(`   词缀 affixes:      ${c.affixes}`);
    console.log(`   单词 words:        ${c.words}`);
    console.log(`   释义 word_senses:  ${c.senses}`);
    console.log(`   拆解 word_breakdown: ${c.breakdown}`);
    console.log(`   例句 word_examples: ${c.examples}`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('❌ 初始化失败:', err.message);
  process.exit(1);
});
