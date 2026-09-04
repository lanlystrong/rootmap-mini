const { addDaysISO } = require('./date');
const EF_MIN = 1.3, EF0 = 2.5;
const Q_FORGOT = 1, Q_HAZY = 3, Q_GOOD = 5;

function clampEF(ef) { return Math.max(EF_MIN, Math.round(ef * 100) / 100); }

function initialStudyState(todayISO) {
  return { ef: EF0, intervalDays: 1, reps: 1, dueDate: addDaysISO(todayISO, 1) };
}

function review(prev, q, todayISO) {
  let { ef, intervalDays, reps } = prev;
  if (q < 3) {                       // 忘了
    reps = 0; intervalDays = 1; ef = clampEF(ef - 0.2);
  } else {                           // 记得 / 模糊
    reps += 1;
    if (reps === 1) intervalDays = 1;
    else if (reps === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * ef);   // ef 为更新前值
    const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
    ef = clampEF(ef + delta);
  }
  return { ef, intervalDays, reps, dueDate: addDaysISO(todayISO, intervalDays) };
}

module.exports = { EF_MIN, EF0, Q_FORGOT, Q_HAZY, Q_GOOD, initialStudyState, review };
