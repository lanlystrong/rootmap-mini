// server/src/loadEnv.js
// 零依赖的 .env 加载器。
// 背景:项目 package.json 并未安装 dotenv,而 init-db.js 旧写法 `require('dotenv').config()`
// 会在找不到模块时直接报错;server.js/app.js 也从不加载 .env,导致 WX_SECRET / MYSQL_PASSWORD
// 等生产变量始终读不到默认值。本文件替代 dotenv,且无需新增依赖。
//
// 行为约定(很重要):
//   仅当 process.env 中**不存在**该键时才写入。因此真实环境变量(如 PM2 env_production、
//   容器/Shell 注入)优先级永远高于 .env 文件——生产环境务必用真实环境变量覆盖 .env 里的
//   NODE_ENV / WX_SECRET / HOST 等。
const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  const envPath = file || path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return; // 无 .env 时静默跳过,完全依赖真实环境变量
  const text = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (!key) continue;
    let val = line.slice(eq + 1).trim();
    // 去掉成对引号(支持 "..." 与 '...')
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

module.exports = loadEnv;
// 直接 require 本模块即自动执行一次,调用方只需 `require('./src/loadEnv');` 即可生效。
loadEnv();
