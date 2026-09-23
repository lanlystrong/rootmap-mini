// server/src/dbConfig.js —— 目标库的唯一解析处
//
// 原先 seed.js 与 verify-db.js 各抄了一份 dbConfig()。两份还能忍,四份就不能了,
// 而且这里还要放一条**指向错库**的守卫,而守卫要成立就必须只有一处解析。
//
// 为什么这条守卫值得写:`.env.example` 里写的是 MYSQL_DATABASE=rootmap,而 server.js /
// seed.js / verify-db.js 的内建默认值都是 rootmap_1。一个字的笔误就能让生成器对着一个
// **空库**写出一份完整、合法、全 origin='gen' 的 1350 词交付集 —— 校验全绿、数量看着
// 也对,只是手写层"消失"了。而手写层是原创内容,重生不出来。这不是多疑,是构造性的。

const DEFAULT_DB = 'rootmap_1';

// 内容流水线允许碰的库。改这个列表要走环境变量,不给"顺手加一个"留下空间。
function allowedDbs() {
  return (process.env.ROOTMAP_ALLOWED_CONTENT_DBS || 'rootmap_1,rootmap')
    .split(',').map((s) => s.trim()).filter(Boolean);
}

function dbConfig(over = {}) {
  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '123456',
    database: process.env.MYSQL_DATABASE || DEFAULT_DB,
    charset: 'utf8mb4',
    ...over,
  };
}

// 库名不在白名单、且没显式放行 → 直接退出。
// 返回真正的库名(允许调用方覆盖后必须走这里,不能自己拼)。
function guardDbName(action, { db, allowDb = false, allowed } = {}) {
  const name = db || dbConfig().database;
  const list = allowed || allowedDbs();
  if (allowDb || list.includes(name)) return name;
  console.error(`❌ 拒绝${action}:目标库是「${name}」,不在允许列表 [${list.join(', ')}] 内。`);
  console.error('   这条守卫防的是一个字的笔误 —— 对着空库跑生成器会写出一份完整、合法、');
  console.error('   全 origin=\'gen\' 的交付集,校验全绿,而手写层(原创内容、重生不出来)看起来"消失"了。');
  console.error(`   确认无误请显式加 --allow-db,或设 ROOTMAP_ALLOWED_CONTENT_DBS=${name}。`);
  process.exit(1);
}

module.exports = { dbConfig, guardDbName, allowedDbs, DEFAULT_DB };
