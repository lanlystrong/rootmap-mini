const test = require('node:test');
const assert = require('node:assert');
const { toISO, todayISO, addDaysISO, diffDaysISO, isDue } = require('../miniprogram/utils/date');

test('toISO 补零', () => assert.equal(toISO(new Date(2026, 8, 4)), '2026-09-04'));
test('todayISO 是 YYYY-MM-DD', () => assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/));
test('addDaysISO 跨月/跨年/负数', () => {
  assert.equal(addDaysISO('2026-02-27', 3), '2026-03-02');
  assert.equal(addDaysISO('2026-12-31', 1), '2027-01-01');
  assert.equal(addDaysISO('2026-01-01', -1), '2025-12-31');
  assert.equal(addDaysISO('2026-09-04', 0), '2026-09-04');
});
test('diffDaysISO', () => assert.equal(diffDaysISO('2026-09-04', '2026-09-10'), 6));
test('isDue 边界', () => {
  assert.ok(isDue('2026-09-04', '2026-09-04'));
  assert.ok(isDue('2026-09-03', '2026-09-04'));
  assert.ok(!isDue('2026-09-05', '2026-09-04'));
});
