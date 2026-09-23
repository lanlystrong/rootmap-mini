#!/usr/bin/env node

const { adminConnect } = require('./src/db');
require('dotenv').config();

async function initDatabase() {
  const cfg = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || ''
  };

  console.log('连接到 MySQL 服务器...');

  const conn = await adminConnect(cfg);

  try {
    // 创建数据库
    await conn.query(`
      CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DATABASE || 'rootmap'}\`
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('✅ 数据库创建成功');

    // 关闭连接
    await conn.end();

    console.log('✅ 数据库初始化完成！');
    console.log('');
    console.log('现在可以启动服务器：');
    console.log('npm run dev');

  } catch (err) {
    console.error('❌ 初始化失败:', err.message);
    await conn.end();
    process.exit(1);
  }
}

initDatabase();