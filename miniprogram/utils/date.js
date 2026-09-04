function pad(n) { return n < 10 ? '0' + n : '' + n; }
function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function todayISO() { return toISO(new Date()); }
function addDaysISO(iso, days) {
  const [y, m, dd] = iso.split('-').map(Number);
  return toISO(new Date(y, m - 1, dd + days));
}
function diffDaysISO(aISO, bISO) {
  const [y1, m1, d1] = aISO.split('-').map(Number);
  const [y2, m2, d2] = bISO.split('-').map(Number);
  return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000);
}
function isDue(iso, today) { return iso <= today; }
module.exports = { toISO, todayISO, addDaysISO, diffDaysISO, isDue };
