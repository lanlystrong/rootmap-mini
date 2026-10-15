// server/src/db.js
const mysql = require('mysql2/promise');

// 内容表定义(词根/词缀/单词/释义/拆解/例句/音标) —— 数据库是内容的唯一真源
//
// origin 标记一行的来源,是「生成器只读别人的行」这条不变量唯一的机器可读依据:
//   hand —— 手写精选层(30 根 / 66 缀 / 201 词),原创内容,语料重生不出来,只能靠 dump 保命
//   dict —— 形态学词典层(补充词根与词缀),同样是人工维护的输入
//   gen  —— 生成层,由 generate-content.js 从语料装配,整批可重建
// hand 与 dict 是**生成器的输入**,gen 是**生成器的输出**;生成器只写 origin='gen'。
//
// seq 是**交付序**:roots/affixes 按它排分组序与学习序;words 按「根序 → 手写先行 → 族内序」
// 排,复现原 `words = [...familySpect, ...familyVis, ...]` 的全局铺法。
const CONTENT_DDL = [
  // 词根表
  `CREATE TABLE IF NOT EXISTS roots (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    root VARCHAR(32) NOT NULL,
    variants JSON NOT NULL COMMENT '词根变体列表,如 ["spect","spec"](手写部分在前,词典补充追加在后)',
    zh VARCHAR(64) NOT NULL COMMENT '中文义',
    group_name VARCHAR(64) NOT NULL COMMENT '分组',
    meaning VARCHAR(255) NULL COMMENT '详细含义',
    story TEXT NULL COMMENT '词源助记',
    origin ENUM('hand','dict','gen') NOT NULL DEFAULT 'gen',
    seq INT NOT NULL DEFAULT 0,
    word_count INT NOT NULL DEFAULT 0 COMMENT '关联单词数(由 words.root_id 聚合回填)',
    KEY idx_roots_root (root),
    KEY idx_roots_seq (seq)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // 词缀表
  `CREATE TABLE IF NOT EXISTS affixes (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    text VARCHAR(32) NOT NULL,
    type ENUM('prefix', 'suffix') NOT NULL,
    group_name VARCHAR(64) NOT NULL,
    zh VARCHAR(64) NOT NULL,
    note TEXT NULL,
    origin ENUM('hand','dict','gen') NOT NULL DEFAULT 'gen',
    seq INT NOT NULL DEFAULT 0,
    merge_into VARCHAR(64) NULL COMMENT '生成侧词典把同形词缀并成一条时指向被并入的那条 id;本行不进词典,但**仍然交付**',
    allow_single_letter TINYINT NOT NULL DEFAULT 0 COMMENT '该词缀是否允许以单字母段出现在拆解里(仅 e-)',
    KEY idx_affixes_type (type),
    KEY idx_affixes_seq (seq)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // 单词表(含音标)
  `CREATE TABLE IF NOT EXISTS words (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    word VARCHAR(64) NOT NULL,
    phonetic VARCHAR(64) NOT NULL COMMENT '音标',
    root_id VARCHAR(64) NULL COMMENT '所属词根(取自 breakdown 的 root 段 refId)',
    tags JSON NULL COMMENT '标签,如 ["cet4","高频"]',
    assoc JSON NULL COMMENT '联想(同义/反义/派生/易混/词源)',
    origin ENUM('hand','dict','gen') NOT NULL DEFAULT 'gen',
    seq INT NOT NULL DEFAULT 0 COMMENT '族内序(手写词排在各族最前)',
    KEY idx_words_word (word),
    KEY idx_words_root (root_id),
    KEY idx_words_origin (origin),
    KEY idx_words_seq (root_id, origin, seq)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // 单词释义表
  `CREATE TABLE IF NOT EXISTS word_senses (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    word_id VARCHAR(64) NOT NULL,
    seq INT NOT NULL DEFAULT 0,
    pos VARCHAR(16) NULL COMMENT '词性,如 v./n./adj.',
    zh VARCHAR(255) NOT NULL,
    en VARCHAR(512) NULL,
    KEY idx_senses_word (word_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // 单词构词拆解表
  `CREATE TABLE IF NOT EXISTS word_breakdown (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    word_id VARCHAR(64) NOT NULL,
    seq INT NOT NULL DEFAULT 0,
    part VARCHAR(64) NOT NULL COMMENT '拼写片段',
    type VARCHAR(16) NOT NULL COMMENT 'prefix/root/suffix/none',
    zh VARCHAR(64) NULL,
    ref_id VARCHAR(64) NULL COMMENT '指向 roots.id 或 affixes.id',
    KEY idx_breakdown_word (word_id),
    KEY idx_breakdown_ref (ref_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // 单词例句表
  `CREATE TABLE IF NOT EXISTS word_examples (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    word_id VARCHAR(64) NOT NULL,
    seq INT NOT NULL DEFAULT 0,
    en TEXT NOT NULL,
    zh TEXT NOT NULL,
    KEY idx_examples_word (word_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // —— 生成器的人工输入(同样只活在库里,生成器只读) ——

  // 拆解裁定表:人工逐词审校的否决结果。
  // 收录原 generate-cet4.js 的 NO_DECOMPOSE(reject)与 EXCLUDE(exclude)。
  // 两者语义不同,不可合并:exclude 是「这条语料根本不该收进来」,reject 是
  // 「收进来,但必须整词标 none,不许伪造词根」。
  // regression_group 非空的那批额外承担回归职责:它们必须不出现在交付集里
  // (原 dataset-merge ⑧ 号用例,值就是测试里的分类标签,如「root-cur 拾到计算词」)。
  `CREATE TABLE IF NOT EXISTS decompose_verdict (
    word VARCHAR(64) NOT NULL PRIMARY KEY,
    verdict ENUM('reject','exclude') NOT NULL,
    reason TEXT NOT NULL COMMENT '为什么否决 —— 审校时写下的理由,是这张表存在的全部意义',
    regression_group VARCHAR(128) NULL COMMENT '非空 = 额外钉一条「不得出现在交付集」的回归',
    KEY idx_verdict_regression (regression_group)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // 语料补丁表:原 server/scripts/patches.js —— 来源词库缺音标/例句的词,人工补齐。
  // 这是**原创内容**(手策展),语料重生不出来,和手写层同级。
  `CREATE TABLE IF NOT EXISTS word_patches (
    word_id VARCHAR(64) NOT NULL PRIMARY KEY,
    phonetic VARCHAR(64) NULL,
    example_en TEXT NULL,
    example_zh TEXT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // CET4/高中语料归档:一条语料词条一行,raw 存整条原始 JSON。
  // 不做字段级建模 —— 语料是外部输入,原样存档才能保证「换个解析器还能重跑」。
  `CREATE TABLE IF NOT EXISTS cet4_corpus (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    word VARCHAR(64) NOT NULL,
    source VARCHAR(32) NOT NULL COMMENT '语料文件来源(cet4 / gz 等)',
    raw JSON NOT NULL,
    KEY idx_corpus_word (word)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // —— 生成器的输出 ——

  // 第 1 段产物:逐词猜拆解的全量语料(原 server/data/cet4/index.js)。
  // payload 是该词条完整对象(与交付集同构),不做字段级建模。
  `CREATE TABLE IF NOT EXISTS cet4_candidates (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    word VARCHAR(64) NOT NULL,
    decomposable TINYINT NOT NULL DEFAULT 0 COMMENT '1 = 拆得动(有 root 段),0 = 整词 none',
    payload JSON NOT NULL,
    KEY idx_cand_decomposable (decomposable)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // —— 审计 ——

  // 每次导入/生成写一行,记录这一版交付集是怎么来的、对手写层做了什么叠加。
  //
  // 只留痕,**不是**权威版本。权威的 meta.version 由 loadContent() 按行数据现算 ——
  // 存起来的版本号会带来一个假象:有人用裸 SQL 改过库之后,客户端仍在读陈旧版本。
  // 所以这里不设 content_meta 那样的"当前版本表":它与本表的前两列完全重复,
  // 而重复的存储正是本项目反复吃亏的那种"两份真相"。
  //
  // 交付后的 roots.variants 是「手写 ∪ 词典」的并集 —— 并集会把「手写序是前缀」这条性质抹平,
  // 事后无法再从交付集反推。没有这张日志,那条性质就永久不可验证了。
  //
  // 只追加,不清空。读的时候一律取 `ORDER BY id DESC LIMIT 1` —— 每次生成都整批替换
  // origin='gen',所以**只有最后一行**描述当前状态,更早的行是历史。
  `CREATE TABLE IF NOT EXISTS content_merge_log (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    version CHAR(40) NOT NULL,
    built_at VARCHAR(25) NOT NULL,
    stats JSON NOT NULL COMMENT '{handWords, genWords, stories, genFamilies}',
    overrides JSON NULL COMMENT '{"root-xxx":{"variants_appended":[...]}, "affix-xx":{"zh":...,"note":...}}'
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
];

// 数据库表结构定义
const TABLE_DDL = [
  // 用户表
  `CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(64) NOT NULL UNIQUE,
    created_at VARCHAR(25) NOT NULL,
    nickname VARCHAR(64) NULL,
    avatar_url TEXT NULL,
    settings JSON DEFAULT NULL COMMENT '用户设置，如每日复习上限等'
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // 会话表
  `CREATE TABLE IF NOT EXISTS sessions (
    token CHAR(48) NOT NULL PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    created_at VARCHAR(25) NOT NULL,
    expires_at VARCHAR(25) NOT NULL,
    KEY idx_sessions_user (user_id),
    KEY idx_sessions_expires (expires_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // 事件表 - 记录用户的学习、复习等行为
  // 学习事件表 —— 服务端只当**事件桶**:原始流水,不是进度。
  // 列刻意只有 type/word_id/q/at 四项(加 user_id):复习调度(SM-2)跑在客户端
  // miniprogram/utils/srs.js,学习进度以小程序本地为唯一真源,服务端不回写、不复制一份。
  // 曾经存在的 root_id / a / correct / interval_hours 四列建好即空、零读写(唯一会写它们的
  // db.recordEvent 从未被调用),已连同 idx_events_root 一并删除 —— 见 migrateDropDeadEventColumns。
  `CREATE TABLE IF NOT EXISTS events (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    type ENUM('study', 'review') NOT NULL,
    word_id VARCHAR(64) NOT NULL,
    q TINYINT NULL COMMENT '三档自评:1 忘了 / 3 模糊 / 5 记得(study 为 NULL)',
    at VARCHAR(25) NOT NULL,
    KEY idx_events_user_at (user_id, at),
    KEY idx_events_user_type (user_id, type),
    KEY idx_events_word (word_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // 用户反馈表 —— 意见/建议/问题收集,受鉴权,落库备查。
  // 服务端只存原文与提交人,不做统计;后续看板/导出是独立特性。
  `CREATE TABLE IF NOT EXISTS feedback (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    category ENUM('suggestion','bug','other') NOT NULL DEFAULT 'other',
    content TEXT NOT NULL,
    contact VARCHAR(128) NULL COMMENT '可选联系方式(微信/邮箱),便于回访',
    created_at VARCHAR(25) NOT NULL,
    KEY idx_feedback_user (user_id),
    KEY idx_feedback_created (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // 内容表(词根/词缀/单词/释义/拆解/例句)
  ...CONTENT_DDL
];

// 初始化数据表
const INIT_DATA_SQL = [
  // 插入测试用户（仅在开发环境）
  `INSERT IGNORE INTO users (id, openid, created_at) VALUES (1, 'test_openid_123', NOW())`,

  // 插入测试会话
  `INSERT IGNORE INTO sessions (token, user_id, created_at, expires_at)
   VALUES ('test_token_123', 1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))`
];

function poolOptions(cfg) {
  return {
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    waitForConnections: true,
    connectionLimit: cfg.connectionLimit || 10,
    charset: 'utf8mb4',
    timezone: '+08:00',
  };
}

// 数据库迁移函数
async function migrateLegacyUsers(pool) {
  try {
    const [cols] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users'"
    );
    const names = (cols || []).map(c => c.COLUMN_NAME);

    // 如果是旧版数据库结构（有username列，无openid列）
    if (names.length && names.includes('username') && !names.includes('openid')) {
      console.log('检测到旧版数据库结构，开始迁移...');

      // 备份表名**只能取一次**。此前 CREATE 与 SELECT 各调一次 Date.now(),
      // 两次几乎必然不同 → 恢复语句指向一张从未建过的表,而 users 已经被 DROP,
      // 异常又被下面的 catch 吞掉 —— 这条迁移一旦触发就是永久丢用户数据。
      const backup = `users_backup_${Date.now()}`;

      // 创建临时备份表
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${backup} AS
        SELECT * FROM users
      `);

      // 删除旧表并创建新表
      await pool.query('DROP TABLE IF EXISTS events');
      await pool.query('DROP TABLE IF EXISTS sessions');
      await pool.query('DROP TABLE IF EXISTS word_progress');
      await pool.query('DROP TABLE IF EXISTS root_progress');
      await pool.query('DROP TABLE IF EXISTS error_logs');
      // 注:这三张表已从 TABLE_DDL 移除(建好即空、零读写),但这里仍要 DROP ——
      // 走这条路径的都是旧库,留着它们只会变成谁也说不清的孤儿表。
      await pool.query('DROP TABLE IF EXISTS users');

      // 重新创建表结构
      for (const ddl of TABLE_DDL) {
        await pool.query(ddl);
      }

      // 从备份恢复用户数据（迁移openid）
      await pool.query(`
        INSERT INTO users (id, openid, created_at)
        SELECT id, username, NOW() FROM ${backup}
      `);

      await pool.query(`DROP TABLE IF EXISTS ${backup}`);
      console.log('数据库迁移完成');
    }
  } catch (err) {
    // 到这里 users 可能已经被删掉了。绝不能静默继续 —— 重新抛出,
    // 让 createDb 失败、服务起不来,人来处理。备份表还在,数据没丢。
    console.error('数据库迁移失败(用户表可能已被删除,请检查 users_backup_* 备份表):', err);
    throw err;
  }
}

// 事件表 type 枚举从 learn/review/correct/wrong 收敛为 study/review,
// CREATE TABLE IF NOT EXISTS 不会改已有表,这里幂等地纠正旧库。
async function migrateEventTypeEnum(pool) {
  try {
    const [cols] = await pool.query(
      "SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='events' AND COLUMN_NAME='type'"
    );
    const cur = cols[0] && cols[0].COLUMN_TYPE;
    if (cur && cur.indexOf('learn') >= 0) {
      await pool.query("ALTER TABLE events MODIFY COLUMN type ENUM('study','review') NOT NULL");
      console.log('已纠正 events.type 枚举为 study/review');
    }
  } catch (err) {
    console.error('纠正 events.type 枚举失败:', err);
  }
}

// 删掉 events 表里建好即空、零读写的四列(root_id / a / correct / interval_hours)及 idx_events_root。
// 服务端只把事件当流水,复习调度在客户端;留着这几列只会让人以为服务端维护进度。
// 逐列判存在性 → 幂等,重跑不报错。ALTER TABLE 是 DDL(隐式提交),故不放事务。
async function migrateDropDeadEventColumns(pool) {
  const dead = ['root_id', 'a', 'correct', 'interval_hours'];
  try {
    const [cols] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='events'"
    );
    const names = (cols || []).map(c => c.COLUMN_NAME);
    for (const c of dead) {
      if (!names.includes(c)) continue;
      await pool.query(`ALTER TABLE events DROP COLUMN \`${c}\``);
      console.log(`已删除 events.${c} 列(建好即空、零读写)`);
    }
    const [idx] = await pool.query(
      "SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='events' AND INDEX_NAME='idx_events_root'"
    );
    if (idx.length) {
      await pool.query('ALTER TABLE events DROP INDEX idx_events_root');
      console.log('已删除 events.idx_events_root 索引');
    }
  } catch (err) {
    console.error('清理 events 冗余列失败:', err);
  }
}

// 为旧库补充 profile 列(nickname / avatar_url)
async function migrateProfileColumns(pool) {
  try {
    const [cols] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users'"
    );
    const names = (cols || []).map(c => c.COLUMN_NAME);
    if (!names.includes('nickname')) {
      await pool.query('ALTER TABLE users ADD COLUMN nickname VARCHAR(64) NULL');
      console.log('已为 users 表补充 nickname 列');
    }
    if (!names.includes('avatar_url')) {
      await pool.query('ALTER TABLE users ADD COLUMN avatar_url TEXT NULL');
      console.log('已为 users 表补充 avatar_url 列');
    }
  } catch (err) {
    console.error('补充 profile 列失败:', err);
  }
}

// 为旧的内容表补充 origin / seq 等列。`CREATE TABLE IF NOT EXISTS` 不会改已有表,
// 而 rootmap_1 里那 223/151/1450 行是既有数据 —— 必须原地补列,不能重建。
async function migrateContentColumns(pool) {
  const want = [
    ['roots', 'origin', "ENUM('hand','dict','gen') NOT NULL DEFAULT 'gen'"],
    ['roots', 'seq', 'INT NOT NULL DEFAULT 0'],
    ['roots', 'word_count', 'INT NOT NULL DEFAULT 0'],
    ['affixes', 'origin', "ENUM('hand','dict','gen') NOT NULL DEFAULT 'gen'"],
    ['affixes', 'seq', 'INT NOT NULL DEFAULT 0'],
    ['affixes', 'merge_into', 'VARCHAR(64) NULL'],
    ['affixes', 'allow_single_letter', 'TINYINT NOT NULL DEFAULT 0'],
    ['words', 'origin', "ENUM('hand','dict','gen') NOT NULL DEFAULT 'gen'"],
    ['words', 'seq', 'INT NOT NULL DEFAULT 0'],
  ];
  try {
    const [rows] = await pool.query(
      'SELECT TABLE_NAME t, COLUMN_NAME c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE()'
    );
    const have = new Set((rows || []).map((r) => r.t + '.' + r.c));
    for (const [table, col, type] of want) {
      if (have.has(table + '.' + col)) continue;
      await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col}\` ${type}`);
      console.log(`已为 ${table} 表补充 ${col} 列`);
    }
  } catch (err) {
    console.error('补充内容列失败:', err);
  }
}

// 创建数据库连接和初始化
async function createDb(cfg) {
  const pool = mysql.createPool(poolOptions(cfg));

  try {
    // 执行数据库迁移
    await migrateLegacyUsers(pool);

    // 创建表结构
    for (const ddl of TABLE_DDL) {
      try {
        await pool.query(ddl);
      } catch (err) {
        console.error('创建表失败:', ddl, err);
        throw err;
      }
    }

    // 为旧库补充 profile 列(建表完成后执行)
    await migrateProfileColumns(pool);

    // 为旧内容表补充 origin / seq 列(建表完成后执行)
    await migrateContentColumns(pool);

    // 纠正旧库事件表 type 枚举(建表完成后执行)
    await migrateEventTypeEnum(pool);

    // 删除 events 表建好即空的冗余列(建表完成后执行)
    await migrateDropDeadEventColumns(pool);

    // 初始化基础数据（开发环境）
    if (process.env.NODE_ENV !== 'production') {
      for (const sql of INIT_DATA_SQL) {
        try {
          await pool.query(sql);
        } catch (err) {
          console.log('初始化数据可能已存在:', err.message);
        }
      }
    }
  } catch (err) {
    console.error('数据库初始化失败:', err);
    await pool.end();
    throw err;
  }

  return {
    pool,
    // 简化的查询方法
    get: async (sql, params = []) => {
      const [rows] = await pool.execute(sql, params);
      return rows[0] || null;
    },
    all: async (sql, params = []) => {
      const [rows] = await pool.execute(sql, params);
      return rows;
    },
    run: async (sql, params = []) => {
      const [result] = await pool.execute(sql, params);
      return {
        lastInsertRowid: result.insertId,
        changes: result.affectedRows
      };
    },
    exec: async (sql) => {
      await pool.query(sql);
    },
    end: () => pool.end(),

    // 业务相关方法
    // 用户相关
    createUser: async (openid) => {
      try {
        const result = await pool.query(
          'INSERT INTO users (openid, created_at) VALUES (?, NOW())',
          [openid]
        );
        // created_at 回读库里那一行,而不是本地现拼一个 toISOString() ——
        // 后者是 UTC 串、与 NOW() 落库值差一个时区,同一个用户两次登录会拿到不同的 created_at。
        const row = await pool.query('SELECT created_at FROM users WHERE id = ?', [result[0].insertId]);
        return { id: result[0].insertId, openid, created_at: row[0][0].created_at };
      } catch (err) {
        console.error('创建用户失败:', err);
        throw err;
      }
    },

    // 会话相关
    // expiresAt 是 time.js 的 sqlAtPlusDays() 产出的本地 datetime 字面量
    // ('YYYY-MM-DD HH:MM:SS'),与校验用的 NOW() 同格式。传 Date 对象会走驱动的时区转换,
    // 传 ISO 串则与 NOW() 字典序对不上 —— 两种都会让 `expires_at > NOW()` 失去意义。
    createSession: async (userId, token, expiresAt) => {
      try {
        await pool.query(
          'INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, NOW(), ?)',
          [token, userId, expiresAt]
        );
      } catch (err) {
        console.error('创建会话失败:', err);
        throw err;
      }
    },

    // 清理已过期的会话行。借 idx_sessions_expires 走索引,登录时顺带做一次即可,
    // 不必再养一个定时任务 —— 这张表此前只增不减,过期行会无限堆积。
    purgeExpiredSessions: async () => {
      try {
        const [r] = await pool.query('DELETE FROM sessions WHERE expires_at <= NOW()');
        return r.affectedRows || 0;
      } catch (err) {
        console.error('清理过期会话失败:', err);
        return 0;
      }
    },

    deleteSession: async (token) => {
      try {
        await pool.query('DELETE FROM sessions WHERE token = ?', [token]);
      } catch (err) {
        console.error('删除会话失败:', err);
      }
    },

    getUserByToken: async (token) => {
      try {
        const [rows] = await pool.execute(`
          SELECT u.* FROM users u
          JOIN sessions s ON u.id = s.user_id
          WHERE s.token = ? AND s.expires_at > NOW()
        `, [token]);
        return rows[0] || null;
      } catch (err) {
        console.error('通过token获取用户失败:', err);
        return null;
      }
    },

    // 事件相关
    // 注:原有的 addEvent 门面已删 —— 它是 events.root_id/a/correct/interval_hours 四列的
    // 唯一写者,而 /api/events 走 eventsRouter 里自己的 5 列 INSERT,addEvent 从未被调用。
    // 四列已随 migrateDropDeadEventColumns 一并删除,留着它就成了一段必然报错的死代码。
    // 事件写入的唯一路径是 eventsRouter;读取是 statsRouter 自己的聚合 SQL。

    getEventsByUser: async (userId, type, limit = 100, offset = 0) => {
      try {
        let sql = 'SELECT * FROM events WHERE user_id = ?';
        const params = [userId];

        if (type) {
          sql += ' AND type = ?';
          params.push(type);
        }

        sql += ' ORDER BY at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await pool.execute(sql, params);
        return rows;
      } catch (err) {
        console.error('获取用户事件失败:', err);
        return [];
      }
    },

    // 进度相关:已全部删除(updateWordProgress / getWordProgress / getWordsByLevel /
    // getTodayDueWords / updateRootProgress / getRootProgress)。
    //
    // 理由:对应的 word_progress / root_progress 两张表建好即空、全仓零读写。
    // 学习进度以**小程序本地**为唯一真源,复习调度(SM-2)跑在 miniprogram/utils/srs.js,
    // 服务端既不回写也不复制一份 —— 两套调度并行只会漂移。真要跨设备续学是独立特性,
    // 不该由"表先建好、函数先写好"来假装已经存在。

  };
}

// 管理员连接（用于建库/删库）
function adminConnect(cfg) {
  return mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
  });
}

module.exports = { createDb, adminConnect, CONTENT_DDL };