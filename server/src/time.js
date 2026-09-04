// server/src/time.js — 本机联调按本地时区;跨时区不在本轮范围
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function nowAt() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function todayISO() { return nowAt().slice(0, 10); }
module.exports = { nowAt, todayISO };
