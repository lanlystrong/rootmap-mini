const { createApp } = require('./app');

const dbConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'rootmap',
};
const HOST = process.env.HOST || '127.0.0.1'; // 默认仅回环;需对外暴露时设 HOST=0.0.0.0
const PORT = Number(process.env.PORT) || 3000;

async function main() {
  const { app } = await createApp({ dbConfig });
  app.listen(PORT, HOST, () => console.log(
    `[rootmap-server] listening on http://127.0.0.1:${PORT} (mysql: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database})`
  ));
}
main().catch((err) => { console.error(err); process.exit(1); });
