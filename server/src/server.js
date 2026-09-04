const path = require('node:path');
const { createApp } = require('./app');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'rootmap.db');
const PORT = Number(process.env.PORT) || 3000;
const { app } = createApp({ dbPath: DB_PATH });
app.listen(PORT, () => console.log(`[rootmap-server] listening on http://127.0.0.1:${PORT} (db: ${DB_PATH})`));
