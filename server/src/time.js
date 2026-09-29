// server/src/time.js — 本机联调按本地时区;跨时区不在本轮范围
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function nowAt() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function todayISO() { return nowAt().slice(0, 10); }

// MySQL datetime 字面量(空格分隔,本地时区)—— 专门给**要和 NOW() 比较**的列用。
//
// 为什么不能直接塞 Date 对象或 toISOString():'expires_at' 这类列是 VARCHAR,
// 落库后是拿字符串跟 NOW() 返回的 'YYYY-MM-DD HH:MM:SS' 做字典序比较的。
// toISOString() 产出的是 '2026-10-05T04:34:56.789Z' —— 同一时刻里 'T'(0x54) > ' '(0x20),
// 恒为真,于是过期判断在当天内永远不成立,token 会比声明的多活一整天。
// 统一用这个函数,写入的字符串与 NOW() 同格式,比较才有意义。
function sqlAt(d) {
  const t = d || new Date();
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} `
       + `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
}
function sqlAtPlusDays(days, from) {
  const t = new Date((from || new Date()).getTime() + days * 24 * 60 * 60 * 1000);
  return sqlAt(t);
}
module.exports = { nowAt, todayISO, sqlAt, sqlAtPlusDays };
