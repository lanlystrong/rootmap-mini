// server/src/db.js
const mysql = require('mysql2/promise');

// 逐条 DDL:MySQL 无 CREATE INDEX IF NOT EXISTS,索引内联进建表语句。
const TABLE_DDL = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    pass_hash CHAR(128) NOT NULL,
    salt CHAR(32) NOT NULL,
    created_at VARCHAR(25) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token CHAR(48) NOT NULL PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    created_at VARCHAR(25) NOT NULL,
    expires_at VARCHAR(25) NOT NULL,
    KEY idx_sessions_user (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS events (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    type VARCHAR(10) NOT NULL,
    word_id VARCHAR(64) NOT NULL,
    q TINYINT NULL,
    at VARCHAR(25) NOT NULL,
    KEY idx_events_user_at (user_id, at),
    KEY idx_events_user_type (user_id, type)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
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
  };
}

// 异步数据门面:把 mysql2 的 [rows,fields] 归一成 get/all/run/exec,供 router 以 await 使用。
async function createDb(cfg) {
  const pool = mysql.createPool(poolOptions(cfg));
  for (const ddl of TABLE_DDL) await pool.query(ddl);
  return {
    pool,
    get: async (sql, params = []) => (await pool.execute(sql, params))[0][0],
    all: async (sql, params = []) => (await pool.execute(sql, params))[0],
    run: async (sql, params = []) => {
      const [res] = await pool.execute(sql, params);
      return { lastInsertRowid: res.insertId, changes: res.affectedRows };
    },
    exec: async (sql) => { await pool.query(sql); },
    end: () => pool.end(),
  };
}

// 无 database 的连接,供测试建/删库(应用代码不使用)。
function adminConnect(cfg) {
  return mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
  });
}

module.exports = { createDb, adminConnect };
