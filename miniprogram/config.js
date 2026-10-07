// miniprogram/config.js — 运行环境配置(上线前改这里)
//
// 微信小程序硬性要求:
//   1) request 域名必须是 HTTPS(不能是 http);
//   2) 必须是已在微信公众平台「开发管理 → 服务器域名」中配置的已备案域名;
//   3) 不能使用 IP 地址或 localhost。
// 因此下列 BASE_URL 在域名申请通过后,改为 https://你的备案域名 即可,无需改动其他代码。
// (服务端 TLS/HTTPS 由前置 nginx 反代提供,见 server/AUDIT-GOLIVE.md 的部署示例。)
const BASE_URL = 'https://www.infoq.online'; // TODO(上线):替换为 https://你的备案域名

module.exports = { BASE_URL };
