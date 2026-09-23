// server/scripts/content-export.js —— 整库导出到仓库外
//
// 存在的理由只有一条,而且是最重的一条:**手写层(201 词 / 30 根 / 66 缀 + 音标例句)
// 是原创内容,任何流水线都重生不出来。** 它现在只活在 MySQL 里,所以这个 dump 就是它
// 唯一的保险。库里同时还有词典层、审查裁定、补丁表与 37 MB 语料 —— 备份的范围因此
// 从「备份交付集」变成了「备份整个项目」。
//
// 两条硬规则:
//   1. **拒绝写进 git worktree。** 写进去就不是备份:仓库丢了 dump 一起丢,而且 40 MB
//      的 SQL 进 git 会把仓库搞成没人愿意 clone 的样子。除非显式 --force。
//   2. **导出后立刻自检。** 一份没人验证过能不能还原的 dump 会给人一种虚假的安全感,
//      而这正好是最需要真实感的地方。所以默认检查「完整性标记 + 每张表都在 + 行数清单」。
//
// 用法:
//   node scripts/content-export.js                      # 默认 rootmap_1 → D:\rootmap-backup
//   node scripts/content-export.js --out E:\backup
//   ROOTMAP_BACKUP_DIR=E:\backup node scripts/content-export.js
//
// 数据库跑在 Docker 里(本机没装 mysql 客户端)时自动走 `docker exec mysqldump`,
// 并**打印实际走的是哪条通道** —— 还原的时候你会想知道这份 dump 是谁产的。
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const mysql = require('mysql2/promise');
const { dbConfig, guardDbName } = require('../src/dbConfig');

// 内容表 + 审计表。缺任何一张都说明 dump 不完整。
const EXPECT_TABLES = [
  'roots', 'affixes', 'words', 'word_senses', 'word_breakdown', 'word_examples',
  'decompose_verdict', 'word_patches', 'cet4_corpus', 'cet4_candidates', 'content_merge_log',
];

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}
const flag = (name) => process.argv.includes(name);

function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function worktreeRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

// 目标路径落在仓库里 → 拒绝。比较前都 resolve + 小写:Windows 盘符与分隔符写法太杂,
// 靠字符串前缀比会漏掉 `d:\` 与 `D:/` 这种同一位置的两种写法。
function guardOutsideRepo(outDir, force) {
  const root = worktreeRoot();
  const abs = path.resolve(outDir);
  if (force || !root) return abs;
  const a = abs.toLowerCase(), r = path.resolve(root).toLowerCase();
  if (a === r || a.startsWith(r + path.sep)) {
    console.error(`❌ 拒绝导出到仓库内:${abs}`);
    console.error(`   仓库根:${root}`);
    console.error('   写进仓库的 dump 不是备份 —— 仓库丢了它一起丢,而且 40 MB 的 SQL 会污染 git。');
    console.error('   改用一个仓库外的路径(--out / ROOTMAP_BACKUP_DIR),或确实要这样请加 --force。');
    process.exit(1);
  }
  return abs;
}

// 找一条能用的 mysqldump。返回 {label, run(args, opts)}。
// 本机没有 mysql 客户端、但数据库跑在 Docker 里是很正常的一种部署,所以两条路都要走通。
function pickDumpTool(container) {
  try {
    execFileSync('mysqldump', ['--version'], { stdio: 'ignore' });
    return {
      label: '本机 mysqldump',
      run: (args, opts) => execFileSync('mysqldump', args, opts),
    };
  } catch { /* 本机没有,试容器 */ }

  try {
    execFileSync('docker', ['exec', container, 'mysqldump', '--version'], { stdio: 'ignore' });
    return {
      label: `docker exec ${container}`,
      run: (args, opts) => {
        // docker exec **不会**把宿主的环境变量带进容器,必须显式 -e。
        // 这里用 `-e MYSQL_PWD`(只给名字、不给值):docker 客户端从自己的环境里取值转发,
        // 于是密码既进得了容器,又不出现在宿主的 ps 输出里。
        // 踩过的坑:不带 -e 时容器里的 mysqldump 会以「无密码」连接,报 1045 Access denied,
        // 而错误信息看着像密码错了 —— 实际是压根没传过去。
        const names = Object.keys(opts.env || {}).filter((k) => k.startsWith('MYSQL_'));
        const envArgs = names.flatMap((k) => ['-e', k]);
        // dump 的内容从 stdout 出,cet4_corpus 就有 ~40 MB,所以 maxBuffer 要足够大
        return execFileSync('docker', ['exec', ...envArgs, container, 'mysqldump', ...args], opts);
      },
    };
  } catch { /* 也没有 */ }

  return null;
}

async function main() {
  const cfg = dbConfig();
  const name = guardDbName('导出', { db: arg('--db', cfg.database), allowDb: flag('--allow-db') });
  cfg.database = name;

  const outDir = guardOutsideRepo(
    arg('--out', process.env.ROOTMAP_BACKUP_DIR || 'D:\\rootmap-backup'), flag('--force'));
  fs.mkdirSync(outDir, { recursive: true });

  // 先连库:既是连通性检查,也用来取行数清单 —— 没有清单的 dump 事后无法判断是否完整。
  const conn = await mysql.createConnection(cfg);
  const counts = {};
  const hand = { roots: 0, affixes: 0, words: 0 };
  try {
    const [tables] = await conn.query(
      'SELECT TABLE_NAME AS t FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() ORDER BY TABLE_NAME');
    const present = tables.map((r) => r.t);
    if (!present.length) {
      console.error(`❌ 库「${name}」里一张表都没有 —— 没有可导出的内容。库名对吗?`);
      process.exit(1);
    }
    const missing = EXPECT_TABLES.filter((t) => !present.includes(t));
    if (missing.length) {
      console.error(`❌ 库「${name}」缺少内容表:${missing.join(', ')}`);
      console.error('   这不像一个装过内容的库。先跑 npm run content:import。');
      process.exit(1);
    }
    for (const t of present) {
      const [[r]] = await conn.query(`SELECT COUNT(*) n FROM \`${t}\``);
      counts[t] = r.n;
    }
    for (const t of ['roots', 'affixes', 'words']) {
      const [[r]] = await conn.query(`SELECT COUNT(*) n FROM \`${t}\` WHERE origin='hand'`);
      hand[t] = r.n;
    }
  } finally {
    await conn.end();
  }

  const tool = pickDumpTool(arg('--container', process.env.MYSQL_CONTAINER || 'mysql'));
  if (!tool) {
    console.error('❌ 找不到 mysqldump:本机 PATH 里没有,`docker exec <容器> mysqldump` 也跑不通。');
    console.error('   装 MySQL 客户端,或用 --container / MYSQL_CONTAINER 指定数据库所在容器名。');
    process.exit(1);
  }

  const file = path.join(outDir, `${name}-${stamp()}.sql`);
  console.log(`目标库:${name}(${cfg.host}:${cfg.port})`);
  console.log(`导出通道:${tool.label}`);
  console.log(`输出:${file}`);

  // 密码走 MYSQL_PWD 而不是 -p<pw>:命令行参数会出现在 ps 输出里,而且 mysql 客户端
  // 每次都会为此打印一行警告,混在 dump 的 stderr 里很难看。
  const args = [
    `-h${cfg.host}`, `-P${cfg.port}`, `-u${cfg.user}`,
    '--single-transaction', '--default-character-set=utf8mb4',
    '--routines', '--events', '--triggers',
    cfg.database,
  ];
  let sql;
  try {
    sql = tool.run(args, {
      encoding: 'utf8', maxBuffer: 1024 * 1024 * 512,
      env: { ...process.env, MYSQL_PWD: cfg.password },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    console.error('❌ 导出失败:');
    console.error('   ' + String(err.stderr || err.message).trim());
    process.exit(1);
  }
  fs.writeFileSync(file, sql);

  const bytes = fs.statSync(file).size;
  const mb = (bytes / 1048576).toFixed(1);

  // ---- 自检 ----
  // 检查的是**可还原性**,不是"文件存在":一份被截断的 dump 在文件管理器里看起来完全正常。
  if (!flag('--no-verify')) {
    const errs = [];
    // 1) mysqldump 在正常结束时才写这行,截断的 dump 一定没有它
    if (!/-- Dump completed on /.test(sql.slice(-4096))) {
      errs.push('结尾没有 "Dump completed" 标记 —— dump 很可能被截断了(--max_allowed_packet? 磁盘空间?)');
    }
    // 2) 每张表都要有建表语句
    for (const t of EXPECT_TABLES) {
      if (!sql.includes(`CREATE TABLE \`${t}\``)) errs.push(`dump 里没有 ${t} 的建表语句`);
    }
    // 3) 行数清单:内容表逐张核对 INSERT 的痕迹(只对非空表检查,空表本来就没有 INSERT)
    for (const [t, n] of Object.entries(counts)) {
      if (n > 0 && !new RegExp(`INSERT INTO \`${t}\``).test(sql)) {
        errs.push(`${t} 库里有 ${n} 行,dump 里却没有任何 INSERT`);
      }
    }
    if (errs.length) {
      console.error(`\n❌ 自检未通过(${errs.length} 处),这份 dump **不可信**,请勿据它删除任何东西:`);
      errs.forEach((e) => console.error('   ' + e));
      process.exit(1);
    }
    console.log('  ✓ 自检通过:完整性标记在、11 张表的建表语句齐、非空表都有 INSERT');
  }

  // 行数清单与"最新一份"指针 —— 还原演练(Phase 2 第 12 步)靠它判断还原是否完整。
  const sidecar = {
    database: name, exported_at: new Date().toISOString(), tool: tool.label,
    bytes, counts, hand,
  };
  fs.writeFileSync(file.replace(/\.sql$/, '.counts.json'), JSON.stringify(sidecar, null, 2));
  fs.writeFileSync(path.join(outDir, 'latest.json'), JSON.stringify({
    sql: path.basename(file), counts: path.basename(file).replace(/\.sql$/, '.counts.json'), database: name,
  }, null, 2));

  console.log(`\n✅ 已写出 ${file}(${mb} MB)`);
  console.log(`   手写层(重生不出来的那部分):${hand.words} 词 / ${hand.roots} 根 / ${hand.affixes} 缀`);
  console.log(`   这是它唯一的保险 —— 库名笔误、误指向空库都会永久毁掉它,而流水线重生不出来。`);
  console.log(`   请把 ${outDir} 复制到本机之外(网盘/另一块盘),并按 README 的节奏定期重跑。`);
}

main().catch((err) => {
  console.error('\n❌ 导出失败:');
  console.error('   ' + (err && err.message ? err.message : err));
  process.exit(1);
});
