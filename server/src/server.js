const path = require('node:path');
const { createApp } = require('./app');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'rootmap.db');
const HOST = process.env.HOST || '127.0.0.1'; // 默认仅回环;需对外暴露时设 HOST=0.0.0.0
const PORT = Number(process.env.PORT) || 3000;
const { app } = createApp({ dbPath: DB_PATH });
app.listen(PORT, HOST, () => console.log(`[rootmap-server] listening on http://127.0.0.1:${PORT} (db: ${DB_PATH})`));
