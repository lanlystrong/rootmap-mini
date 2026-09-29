require('./src/loadEnv'); // 尽早加载 .env(仅补充缺失键,不覆盖真实环境变量)
const { createApp } = require('./app');
const { buildCode2Session } = require('./authRouter');

const dbConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '123456',
  database: process.env.MYSQL_DATABASE || 'rootmap_1',
};
// 微信静默登录配置:appid 默认取已配置的小程序 appid;secret 须由环境变量注入。
const wxConfig = {
  appid: process.env.WX_APPID || 'wx6b8dc2aa64bc240e',
  secret: process.env.WX_SECRET || '',
};
const wx = { code2session: buildCode2Session(wxConfig) };
const HOST = process.env.HOST || '127.0.0.1'; // 默认仅回环;需对外暴露时设 HOST=0.0.0.0
const PORT = Number(process.env.PORT) || 3000;

async function main() {
  const { app } = await createApp({ dbConfig, wx });
  app.listen(PORT, HOST, () => console.log(
    `[rootmap-server] listening on http://127.0.0.1:${PORT} (mysql: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}; wx.appid=${wxConfig.appid})`
  ));
}
main().catch((err) => { console.error(err); process.exit(1); });
